import { defaults } from 'lodash';
import React, { PureComponent, ChangeEvent } from 'react';
import { SelectableValue, Select } from '../../grafana';
import { AzureConnection } from './../azure_connection/AzureConnection';
import { AzureSubscription } from './../azure_subscription/AzureSubscription';
import { AzureCostQueryStructure } from './AzureCostAnalysis';

const Scopes: SelectableValue[] = [
  { value: 'ManagementGroup', label: 'Management Group' },
  { value: 'Subscription', label: 'Subscription' },
  { value: 'ResourceGroup', label: 'ResourceGroup' },
];
const GranularityLevels: SelectableValue[] = [
  { value: 'None', label: 'None' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Monthly', label: 'Monthly' },
];
const GroupingTypes: SelectableValue[] = [
  { value: 'None', label: 'None' },
  { value: 'Dimension', label: 'Dimension' },
  { value: 'TagKey', label: 'Tag' },
];
const GroupingDimensions: SelectableValue[] = [
  { value: 'ResourceId', label: 'Resource' },
  { value: 'ResourceType', label: 'Resource Type' },
  { value: 'ResourceLocation', label: 'Resource Location' },
  { value: 'ResourceGroupName', label: 'Resource Group Name' },
  { value: 'ServiceName', label: 'Service Name' },
  { value: 'ServiceTier', label: 'Service Tier' },
  { value: 'Meter', label: 'Meter' },
  { value: 'MeterCategory', label: 'Meter Category' },
  { value: 'MeterSubCategory', label: 'Meter SubCategory' },
  { value: 'PricingModel', label: 'Pricing Model' },
  { value: 'PublisherType', label: 'Publisher Type' },
  { value: 'ChargeType', label: 'Charge Type' },
  { value: 'SubscriptionId', label: 'Subscription ID' },
  { value: 'SubscriptionName', label: 'Subscription Name' },
];
const FilterTypes: SelectableValue[] = [
  { value: 'None', label: 'None' },
  { value: 'Dimensions', label: 'Dimensions' },
  { value: 'Tags', label: 'Tags' },
];
const FilterOperators: SelectableValue[] = [{ value: 'In', label: 'In' }];

class AzureCostAnalysisSubscriptionIdQuery extends PureComponent<any, any> {
  state: any = defaults(this.state, { AzureSubscriptions: [] });
  onACASubscriptionIDChange = (event: SelectableValue) => {
    const acaSubscriptionId = event.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: AzureCostQueryStructure = query.azureCostAnalysis;
    azCostAnalysis.subscriptionId = acaSubscriptionId;
    azCostAnalysis.subscriptionName = event.label;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAScopeChange = (scope: SelectableValue) => {
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.scope = scope.value;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAManagementGroupNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const MGGroupName = event.target.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.managementGroupId = MGGroupName;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAResourceGroupNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const ResourceGroupName = event.target.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.resourceGroupName = ResourceGroupName;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  componentWillMount() {
    if (this.state.AzureSubscriptions.length === 0) {
      const az: AzureConnection = new AzureConnection(this.props.datasource.instanceSettings);
      az.getSubscriptions().then((res: AzureSubscription[]) => {
        this.setState({
          AzureSubscriptions: res.map(r => {
            return { value: r.subscriptionId, label: r.name } as SelectableValue;
          }),
        });
      });
    }
  }
  render() {
    const { query } = this.props;
    let ScopeId;
    let SubscriptionScopeId = <div></div>;
    if (query.azureCostAnalysis.scope === 'ResourceGroup') {
      SubscriptionScopeId = (
        <div className="gf-form gf-form--grow">
          <label className="gf-form-label width-12" title="Resource Group Name">
            Resource Group
          </label>
          <input
            className="gf-form-input width-24"
            type="text"
            value={query.azureCostAnalysis.resourceGroupName}
            placeholder="Resource Group Name"
            title="Resource Group Name"
            onChange={this.onACAResourceGroupNameChange}
          ></input>
        </div>
      );
    }
    if (query.azureCostAnalysis.scope === 'Subscription' || query.azureCostAnalysis.scope === 'ResourceGroup') {
      ScopeId = (
        <div>
          <div className="gf-form-inline">
            <div className="gf-form">
              <div className="gf-form gf-form--grow">
                <label className="gf-form-label width-12" title="Subscription">
                  Subscription
                </label>
                <Select
                  className="width-24"
                  value={
                    this.state.AzureSubscriptions.find((gran: any) => gran.value === query.azureCostAnalysis.subscriptionId) || {
                      label: query.azureCostAnalysis.subscriptionId,
                      value: query.azureCostAnalysis.subscriptionId,
                    }
                  }
                  allowCustomValue
                  options={this.state.AzureSubscriptions}
                  defaultValue={query.azureCostAnalysis.subscriptionId}
                  onChange={this.onACASubscriptionIDChange}
                />
              </div>
              {SubscriptionScopeId}
            </div>
          </div>
        </div>
      );
    } else if (query.azureCostAnalysis.scope === 'ManagementGroup') {
      ScopeId = (
        <div>
          <div className="gf-form-inline">
            <div className="gf-form">
              <div className="gf-form gf-form--grow">
                <label className="gf-form-label width-12" title="Management Group ID">
                  Management group ID
                </label>
                <input
                  className="gf-form-input width-24"
                  type="text"
                  value={query.azureCostAnalysis.managementGroupId}
                  placeholder="Management Group ID"
                  title="Management Group ID"
                  onChange={this.onACAManagementGroupNameChange}
                ></input>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <div className="gf-form gf-form--grow">
              <label className="gf-form-label width-12" title="Scope">
                Scope
              </label>
              <Select
                className="width-24"
                value={Scopes.find((gran: any) => gran.value === query.azureCostAnalysis.scope)}
                options={Scopes}
                defaultValue={query.azureCostAnalysis.scope}
                onChange={this.onACAScopeChange}
              />
            </div>
          </div>
        </div>
        <div>{ScopeId}</div>
      </div>
    );
  }
}
class AzureCostAnalysisGranularityQuery extends PureComponent<any> {
  onACAGranularityChange = (gran: SelectableValue) => {
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.granularity = gran.value;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  render() {
    const { query } = this.props;
    return (
      <div className="gf-form-inline">
        <div className="gf-form">
          <div className="gf-form gf-form--grow">
            <label className="gf-form-label width-12" title="Granularity">
              Granularity
            </label>
            <Select
              className="width-24"
              value={GranularityLevels.find((gran: any) => gran.value === query.azureCostAnalysis.granularity)}
              options={GranularityLevels}
              defaultValue={query.azureCostAnalysis.granularity}
              onChange={this.onACAGranularityChange}
            />
          </div>
        </div>
      </div>
    );
  }
}
class AzureCostAnalysisGroupingQuery extends PureComponent<any> {
  onACAGroupingTypeChange = (groupingType: SelectableValue) => {
    const groupType = groupingType.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.grouping = azCostAnalysis.grouping || { type: 'Dimension', name: 'ServiceName' };
    azCostAnalysis.grouping[0].type = groupType;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAGroupingNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const groupingName = event.target.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.grouping = azCostAnalysis.grouping || { type: 'Dimension', name: 'ServiceName' };
    azCostAnalysis.grouping[0].name = groupingName;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAGroupingNameChangeDimension = (event: SelectableValue) => {
    const groupingName = event.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.grouping = azCostAnalysis.grouping || { type: 'Dimension', name: 'ServiceName' };
    azCostAnalysis.grouping[0].name = groupingName;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  render() {
    const { query } = this.props;
    let GroupingNameField;
    if (query.azureCostAnalysis.grouping[0].type === 'TagKey') {
      GroupingNameField = (
        <div>
          <div className="gf-form">
            <div className="gf-form gf-form--grow">
              <label className="gf-form-label width-12" title="Tag Name">
                Tag Name
              </label>
              <input
                className="gf-form-input width-12"
                type="text"
                onChange={this.onACAGroupingNameChange}
                value={query.azureCostAnalysis.grouping[0].name}
                placeholder="Tag Name"
                title="Tag Name"
              ></input>
            </div>
          </div>
        </div>
      );
    } else if (query.azureCostAnalysis.grouping[0].type === 'Dimension') {
      GroupingNameField = (
        <span>
          <Select
            className="width-12"
            value={GroupingDimensions.find((gran: any) => gran.value === query.azureCostAnalysis.grouping[0].name)}
            options={GroupingDimensions}
            defaultValue={query.azureCostAnalysis.grouping[0].name}
            onChange={this.onACAGroupingNameChangeDimension}
          />
        </span>
      );
    } else {
      GroupingNameField = <div></div>;
    }
    return (
      <div className="gf-form-inline">
        <div className="gf-form">
          <div className="gf-form gf-form--grow">
            <label className="gf-form-label width-12" title="Group By">
              Group By
            </label>
            <Select
              className="width-12"
              value={GroupingTypes.find((gran: any) => gran.value === query.azureCostAnalysis.grouping[0].type)}
              options={GroupingTypes}
              defaultValue={query.azureCostAnalysis.grouping[0].type}
              onChange={this.onACAGroupingTypeChange}
            />
            <span>{GroupingNameField}</span>
          </div>
        </div>
      </div>
    );
  }
}
class AzureCostAnalysisFilterQuery extends PureComponent<any> {
  onACAFilterAdd = () => {
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.filters = azCostAnalysis.filters || [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }];
    azCostAnalysis.filters.push({ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] });
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAFilterRemove = (index: number) => {
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.filters = azCostAnalysis.filters || [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }];
    azCostAnalysis.filters.splice(index, 1);
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAFilterTypeChange = (event: SelectableValue, index: number) => {
    const filterType = event.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.filters = azCostAnalysis.filters || [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }];
    azCostAnalysis.filters[index].FilterType = filterType;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAFilterNameChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const filterName = event.target.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.filters = azCostAnalysis.filters || [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }];
    azCostAnalysis.filters[index].Name = filterName;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAFilterNameChangeDimension = (event: SelectableValue, index: number) => {
    const filterName = event.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.filters = azCostAnalysis.filters || [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }];
    azCostAnalysis.filters[index].Name = filterName;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAFilterOperatorChange = (event: SelectableValue, index: number) => {
    const operatorName = event.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.filters = azCostAnalysis.filters || [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }];
    azCostAnalysis.filters[index].Operator = operatorName;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  onACAFilterValueChange = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const valueName = event.target.value;
    const { query, onChange } = this.props;
    const azCostAnalysis: any = query.azureCostAnalysis;
    azCostAnalysis.filters = azCostAnalysis.filters || [{ FilterType: 'None', Name: 'None', Operator: 'In', Values: [] }];
    azCostAnalysis.filters[index].Values = valueName.split(',');
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  render() {
    const { query } = this.props;
    return (
      <div>
        {query.azureCostAnalysis.filters.length === 0 ? (
          <div className="gf-form-inline">
            <div className="gf-form">
              <div className="gf-form gf-form--grow">
                <label className="gf-form-label width-12" title="Filter">
                  Filter
                </label>
              </div>
            </div>
            <div className="gf-form">
              <div className="gf-form gf-form--grow">
                <span className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={this.onACAFilterAdd}>
                  Add Filter
                </span>
              </div>
            </div>
          </div>
        ) : null}
        {query.azureCostAnalysis.filters.map((filter: any, index: number) => (
          <div className="gf-form-inline">
            <div className="gf-form">
              <div className="gf-form gf-form--grow">
                <label className="gf-form-label width-12" title="Filter">
                  Filter {index + 1}
                </label>
              </div>
            </div>
            <div className="gf-form">
              <div className="gf-form gf-form--grow">
                <Select
                  className="width-12"
                  value={FilterTypes.find((gran: any) => gran.value === filter.FilterType)}
                  options={FilterTypes}
                  defaultValue={filter.FilterType}
                  onChange={e => this.onACAFilterTypeChange(e, index)}
                />
              </div>
            </div>
            <div>
              {filter.FilterType === 'None' ? (
                <span>
                  <div className="gf-form">
                    <div className="gf-form gf-form--grow">
                      <span className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={this.onACAFilterAdd}>
                        +
                      </span>
                      <span className="btn btn-danger btn-small" style={{ margin: '5px' }} onClick={() => this.onACAFilterRemove(index)}>
                        x
                      </span>
                    </div>
                  </div>
                </span>
              ) : null}
              {filter.FilterType === 'Dimensions' ? (
                <span>
                  <div className="gf-form">
                    <div className="gf-form gf-form--grow">
                      <Select
                        className="width-12"
                        value={GroupingDimensions.find((fil: any) => fil.value === filter.Name)}
                        options={GroupingDimensions}
                        defaultValue={filter.Name}
                        onChange={e => this.onACAFilterNameChangeDimension(e, index)}
                      />
                    </div>
                    <div className="gf-form gf-form--grow">
                      <Select
                        className="width-12"
                        value={FilterOperators.find((op: any) => op.value === filter.Operator)}
                        options={FilterOperators}
                        defaultValue={filter.Operator}
                        onChange={e => this.onACAFilterOperatorChange(e, index)}
                      />
                    </div>
                    <div className="gf-form gf-form--grow">
                      <input
                        type="text"
                        className="gf-form-input width-12"
                        title="Values; Comma separated"
                        placeholder="Values"
                        value={filter.Values.join(',')}
                        onChange={e => this.onACAFilterValueChange(e, index)}
                      ></input>
                    </div>
                    <div className="gf-form gf-form--grow">
                      <span className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={this.onACAFilterAdd}>
                        +
                      </span>
                      <span className="btn btn-danger btn-small" style={{ margin: '5px' }} onClick={() => this.onACAFilterRemove(index)}>
                        x
                      </span>
                    </div>
                  </div>
                </span>
              ) : null}
              {filter.FilterType === 'Tags' ? (
                <span>
                  <div className="gf-form">
                    <div className="gf-form gf-form--grow">
                      <input
                        type="text"
                        className="gf-form-input width-12"
                        title="Tag Name"
                        placeholder="Tag Name"
                        value={filter.Name}
                        onChange={e => this.onACAFilterNameChange(e, index)}
                      ></input>
                    </div>
                    <div className="gf-form gf-form--grow">
                      <Select
                        className="width-12"
                        value={FilterOperators.find((op: any) => op.value === filter.Operator)}
                        options={FilterOperators}
                        defaultValue={filter.Operator}
                        onChange={e => this.onACAFilterOperatorChange(e, index)}
                      />
                    </div>
                    <div className="gf-form gf-form--grow">
                      <input
                        type="text"
                        className="gf-form-input width-12"
                        title="Tags; Comma separated"
                        placeholder="Tags"
                        value={filter.Values.join(',')}
                        onChange={e => this.onACAFilterValueChange(e, index)}
                      ></input>
                    </div>
                    <div className="gf-form gf-form--grow">
                      <span className="btn btn-success btn-small" style={{ margin: '5px' }} onClick={this.onACAFilterAdd}>
                        +
                      </span>
                      <span className="btn btn-danger btn-small" style={{ margin: '5px' }} onClick={() => this.onACAFilterRemove(index)}>
                        x
                      </span>
                    </div>
                  </div>
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
class AzureCostAnalysisAliasQuery extends PureComponent<any> {
  onACAAliasChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { query, onChange } = this.props;
    const azCostAnalysis: AzureCostQueryStructure = query.azureCostAnalysis;
    azCostAnalysis.alias = event.target.value;
    onChange({ ...query, azureCostAnalysis: azCostAnalysis });
  };
  render() {
    const { query } = this.props;
    return (
      <div className="gf-form-inline">
        <div className="gf-form">
          <div className="gf-form gf-form--grow">
            <label className="gf-form-label width-12" title="Leave blank for default. Or refer as {{default}} for default value">
              Alias
            </label>
            <input className="gf-form-input width-24" value={query.azureCostAnalysis.alias} onChange={this.onACAAliasChange} type="text" />
          </div>
        </div>
      </div>
    );
  }
}

export class AzureCostAnalysisQueryEditor extends PureComponent<any> {
  render() {
    const { query, onChange, datasource } = this.props;
    return (
      <div>
        <AzureCostAnalysisSubscriptionIdQuery query={query} onChange={onChange} datasource={datasource}></AzureCostAnalysisSubscriptionIdQuery>
        <AzureCostAnalysisGranularityQuery query={query} onChange={onChange}></AzureCostAnalysisGranularityQuery>
        <AzureCostAnalysisGroupingQuery query={query} onChange={onChange}></AzureCostAnalysisGroupingQuery>
        <AzureCostAnalysisFilterQuery query={query} onChange={onChange}></AzureCostAnalysisFilterQuery>
        <AzureCostAnalysisAliasQuery query={query} onChange={onChange}></AzureCostAnalysisAliasQuery>
      </div>
    );
  }
}
