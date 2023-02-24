import { AzureMonitorPluginQuery } from '../AzureMonitorPluginQuery';
import { AzureConnection } from '../azure_connection/AzureConnection';
import { AzureCostAnalysisResultsParser } from './AzureCostAnalysisResultsParser';
import { doBackendRequest } from '../../app/utils';

type AzureScopeType = 'ManagementGroup' | 'Subscription' | 'ResourceGroup';

interface AzureCostAnalysisGrouping {
  type: string;
  name: string;
}

interface AzureCostAnalysisFilter {
  FilterType: string;
  Name: string;
  Operator: string;
  Values: string[];
}

export interface AzureCostQueryStructure {
  alias: string;
  scope: AzureScopeType;
  managementGroupId: string;
  subscriptionId: string;
  subscriptionName?: string;
  resourceGroupName: string;
  granularity: string;
  grouping: AzureCostAnalysisGrouping[];
  filters: AzureCostAnalysisFilter[];
  filter?: any;
}

export const DEFAULT_COST_QUERY: AzureCostQueryStructure = {
  alias: '',
  scope: 'Subscription',
  managementGroupId: '',
  subscriptionId: '',
  subscriptionName: '',
  resourceGroupName: '',
  granularity: 'Daily',
  grouping: [{ type: 'None', name: 'None' }],
  filters: [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }],
};

export const ACA_SUPPORTED_FILTER_TYPES: any[] = [
  { value: 'None', label: 'None' },
  { value: 'Dimensions', label: 'Dimensions' },
  { value: 'Tags', label: 'Tags' },
];

export class AzureCostQueryDataParam {
  type: string;
  timeframe: string;
  timePeriod: { from: string; to: string };
  dataSet: any;
  constructor(range: any, dataSet: any) {
    this.type = 'ActualCost';
    this.timeframe = 'Custom';
    this.timePeriod = {
      from: new Date(range.from).toISOString(),
      to: new Date(range.to).toISOString(),
    };
    this.dataSet = dataSet;
  }
}

export class AzureCostAnalysisQuery extends AzureMonitorPluginQuery {
  granularity: string;
  query: any;
  data: AzureCostQueryDataParam;
  scope: string;
  rawquery: AzureCostQueryStructure;
  constructor(refId = '', options: any, item: any, templateSrv: any) {
    super(refId, options);
    this.scope = templateSrv.replace(`/subscriptions/${item.subscriptionId}`, options.scopedVars);
    this.granularity = templateSrv.replace(item.granularity || 'Monthly', options.scopedVars);
    this.rawquery = item;
    this.rawquery.alias = templateSrv.replace(this.rawquery.alias, options.scopedVars);
    if (this.rawquery.scope === 'Subscription') {
      this.scope = templateSrv.replace(`/subscriptions/${item.subscriptionId}`, options.scopedVars);
    } else if (this.rawquery.scope === 'ManagementGroup') {
      this.scope = templateSrv.replace(`/providers/Microsoft.Management/managementGroups/${item.managementGroupId}`, options.scopedVars);
    } else if (this.rawquery.scope === 'ResourceGroup') {
      this.scope = templateSrv.replace(`/subscriptions/${item.subscriptionId}/resourceGroups/${item.resourceGroupName}`, options.scopedVars);
    }
    let grouping = [];
    grouping = item.grouping && item.grouping.length > 0 ? item.grouping : [{ type: 'Dimension', name: 'ServiceName' }];
    this.data = new AzureCostQueryDataParam(options.range, {
      granularity: this.granularity,
      aggregation: {
        totalCost: { name: 'PreTaxCost', function: 'Sum' },
        totalCostUSD: { name: 'PreTaxCostUSD', function: 'Sum' },
      },
      sorting: [{ direction: 'ascending', name: 'UsageDate' }],
      grouping: grouping,
    });
    if (grouping && grouping.length > 0 && grouping[0].type === 'None') {
      delete this.data.dataSet.grouping;
    }
    item.filters = item.filters
      .filter((f: AzureCostAnalysisFilter) => f && f.FilterType !== 'None')
      .map((f: AzureCostAnalysisFilter) => {
        f.Values = f.Values.map(v => v.trim());
        return f;
      });
    if (item.filters && item.filters.length > 0 && item.filters[0].FilterType !== 'None') {
      if (item.filters.length === 1) {
        const filteritem: any = {};
        filteritem[item.filters[0].FilterType] = item.filters[0];
        delete filteritem[item.filters[0].FilterType].FilterType;
        this.data.dataSet.filter = filteritem;
      } else if (item.filters.length > 0) {
        const filter: any = { And: [] };
        item.filters.forEach((filterItem: AzureCostAnalysisFilter) => {
          const filteritem: any = {};
          filteritem[filterItem.FilterType] = filterItem;
          delete filteritem[filterItem.FilterType].FilterType;
          filter.And.push(filteritem);
        });
        this.data.dataSet.filter = filter;
      }
    } else if (item.filter) {
      this.data.dataSet.filter = item.filter;
    }
  }
}

export class AzureCostAnalysisDataSource {
  private url: string;
  private baseUrl: string;

  /** @ngInject */
  constructor(private azureConnection: AzureConnection, private templateSrv: any) {
    this.url = this.azureConnection.instanceSettings.url;
    this.baseUrl = `/` + this.azureConnection.instanceSettings.jsonData.cloudName;
  }

  private async doCostRequest(query: AzureCostAnalysisQuery, maxRetries = 1) {
    const requestObject: any = {
      data: query.data,
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      url: this.url + this.baseUrl + query.scope + `/providers/Microsoft.CostManagement/query?api-version=2019-11-01&$top=10000`,
    };
    return doBackendRequest(requestObject, maxRetries);
  }

  private doQueries(queries: AzureCostAnalysisQuery[]) {
    return queries.map(query => {
      return this.doCostRequest(query)
        .then((result: any) => {
          return { result, query };
        })
        .catch((error: any) => {
          throw { error, query };
        });
    });
  }

  async query(options: any) {
    const queries: AzureCostAnalysisQuery[] = options.targets
      .filter((item: any) => {
        const aca: AzureCostAnalysisQuery = item.azureCostAnalysis;
        return item.hide !== true && aca;
      })
      .map((target: any) => {
        const item: AzureCostAnalysisQuery = target.azureCostAnalysis;
        const queryOption = new AzureCostAnalysisQuery(target.refId, options, item, this.templateSrv);
        return queryOption;
      });
    if (!queries || queries.length === 0) {
      return;
    }
    const promises = this.doQueries(queries);
    return Promise.all(promises).then((results: any) => {
      const responseParser = new AzureCostAnalysisResultsParser(results);
      return responseParser.output;
    });
  }

  metricFindQuery(query: string) {
    return undefined;
  }
}

export { AzureCostAnalysisQueryEditor } from './AzureCostAnalysisQueryEditor';
