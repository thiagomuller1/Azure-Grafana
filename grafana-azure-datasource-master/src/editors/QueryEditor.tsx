import { defaults } from 'lodash';
import React, { PureComponent } from 'react';
import { QueryEditorProps, DataQuery, SelectableValue, Select } from './../grafana';
import { Datasource } from './../datasource';
import * as CONFIG from './../config';
import {
  AzureResourceGraphQueryEditor,
  AzureResourceGraphQueryStructure,
  DEFAULT_RESOURCE_GRAPH_QUERY,
} from './../azure/resource_graph/ResourceGraph';
import { AzureCostAnalysisQueryEditor, AzureCostQueryStructure, DEFAULT_COST_QUERY } from './../azure/azure_costanalysis/AzureCostAnalysis';
import { AppinsightsQueryEditor, AppinsightsQueryStructure, DEFAULT_AI_QUERY } from './../azure/application_insights/ApplicationInsights';
import { LogAnalyticsQueryEditor, LAQueryStructure, DEFAULT_LA_QUERY } from './../azure/log_analytics/LogAnalytics';
import {
  AzureServiceHealthQueryEditor,
  ServiceHealthQueryStructure,
  DEFAULT_SERVICE_HEALTH_QUERY,
} from './../azure/azure_service_health/ServiceHealth';

const supportedAzureServices = CONFIG.supportedServices as SelectableValue[];

export interface AzureMonitorQuery extends DataQuery {
  queryType?: string;
  azureResourceGraph?: AzureResourceGraphQueryStructure;
  azureAppInsights?: AppinsightsQueryStructure;
  azureLogAnalytics?: LAQueryStructure;
  azureCostAnalysis?: AzureCostQueryStructure;
  azureServiceHealth?: ServiceHealthQueryStructure;
}

type Props = QueryEditorProps<Datasource, AzureMonitorQuery>;

interface State {}

export class AzureMonitorQueryEditor extends PureComponent<Props, State> {
  state: State = {};
  onServiceTypeChange = (service: SelectableValue) => {
    const { query, onChange } = this.props;
    onChange({ ...query, queryType: service.value });
  };
  render() {
    const query = defaults(this.props.query, {
      azureResourceGraph: defaults(this.props.query.azureResourceGraph, DEFAULT_RESOURCE_GRAPH_QUERY),
      azureAppInsights: defaults(this.props.query.azureAppInsights, DEFAULT_AI_QUERY),
      azureLogAnalytics: defaults(this.props.query.azureAppInsights, DEFAULT_LA_QUERY),
      azureCostAnalysis: defaults(this.props.query.azureCostAnalysis, DEFAULT_COST_QUERY),
      azureServiceHealth: defaults(this.props.query.azureServiceHealth, DEFAULT_SERVICE_HEALTH_QUERY),
    });
    let QueryEditor;
    switch (query.queryType) {
      case CONFIG.AzureResourceGraph:
        QueryEditor = <AzureResourceGraphQueryEditor onChange={this.props.onChange} query={query} datasource={this.props.datasource} />;
        break;
      case CONFIG.AzureApplicationInsights:
        QueryEditor = <AppinsightsQueryEditor onChange={this.props.onChange} query={query} datasource={this.props.datasource} />;
        break;
      case CONFIG.AzureLogAnalytics:
        QueryEditor = <LogAnalyticsQueryEditor onChange={this.props.onChange} query={query} datasource={this.props.datasource} />;
        break;
      case CONFIG.AzureCostAnalysis:
        QueryEditor = <AzureCostAnalysisQueryEditor onChange={this.props.onChange} query={query} datasource={this.props.datasource} />;
        break;
      case CONFIG.AzureServiceHealth:
        QueryEditor = <AzureServiceHealthQueryEditor onChange={this.props.onChange} query={query} datasource={this.props.datasource} />;
        break;
      default:
        break;
    }
    return (
      <div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <label className="gf-form-label width-12" title="Service Type">
              Service
            </label>
            <Select
              className="width-24"
              value={supportedAzureServices.find((service: any) => service.value === query.queryType)}
              options={supportedAzureServices}
              defaultValue={query.queryType}
              onChange={this.onServiceTypeChange}
            />
          </div>
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">{QueryEditor}</div>
        </div>
      </div>
    );
  }
}
