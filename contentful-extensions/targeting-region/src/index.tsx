import * as React from 'react';
import { render } from 'react-dom';
import {
  DisplayText,
  SectionHeading,
  FieldGroup,
  RadioButtonField,
  Select,
  Option,
  Typography
} from '@contentful/forma-36-react-components';
import { init, EditorExtensionSDK } from 'contentful-ui-extensions-sdk';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-fcss';
import './index.css';

interface AppProps {
  sdk: EditorExtensionSDK;
}

interface AppState {
  chooseRegion: boolean;
  region?: string;
}

const REGIONS = [
  ["BR", "Brazil"],
  ["CA", "Canada"],
  ["CN", "China"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["GB", "UK"],
  ["IT", "Italy"],
  ["PL", "Poland"],
  ["RU", "Russia"],
  ["US", "USA"]
];

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      region: props.sdk.entry.fields.region.getValue(),
      chooseRegion: props.sdk.entry.fields.chooseRegion.getValue() || false
    };
  }

  onRegionChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.sdk.entry.fields.region.setValue(event.target.value);
  };

  onChooseRegionChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chooseRegion = event.target.value === 'yes';
    this.setState({ chooseRegion });
    this.props.sdk.entry.fields.chooseRegion.setValue(chooseRegion);
  };

  renderRegions() {
    return (
      <Select
        id="optionSelect"
        name="regionSelect"
        onChange={this.onRegionChangeHandler}
      >
        {REGIONS.map(([code, name]) => <Option value={code}>{name}</Option>)}
      </Select>
    );
  }

  render() {
    return (
      <div className="f36-margin--l">
        <Typography>
          <DisplayText>Choose a region</DisplayText>
          <SectionHeading>Has targeting?</SectionHeading>
          <FieldGroup row={true}>
            <RadioButtonField
              labelText="Yes"
              checked={this.state.chooseRegion}
              value="yes"
              onChange={this.onChooseRegionChangeHandler}
              name="regionOption"
              id="yesCheckbox"
            />
            <RadioButtonField
              labelText="No"
              checked={!this.state.chooseRegion}
              value="no"
              onChange={this.onChooseRegionChangeHandler}
              name="regionOption"
              id="noCheckbox"
            />
          </FieldGroup>
        </Typography>
        {this.state.chooseRegion && (
          <Typography>
            <SectionHeading>Region</SectionHeading>
            {this.renderRegions()}
          </Typography>
        )}
      </div>
    );
  }
}

init(sdk => {
  render(<App sdk={sdk as EditorExtensionSDK} />, document.getElementById('root'));
});
