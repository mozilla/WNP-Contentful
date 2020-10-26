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
  chooseVersion: boolean;
  version?: string;
}

const ALL_VERSIONS = "All versions";
const VERSIONS = [ALL_VERSIONS, "80", "81", "82", "83", "84", "85", "86"];

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      version: props.sdk.entry.fields.version.getValue(),
      chooseVersion: props.sdk.entry.fields.chooseVersion.getValue() || false
    };
  }

  onVersionChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.sdk.entry.fields.version.setValue(event.target.value);
  };

  onChooseVersionChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chooseVersion = event.target.value === 'yes';
    if (!chooseVersion) {
      const version = ALL_VERSIONS;
      this.setState({ version });
      this.props.sdk.entry.fields.version.setValue(ALL_VERSIONS);
    }
    this.setState({ chooseVersion });
    this.props.sdk.entry.fields.chooseVersion.setValue(chooseVersion);
  };

  renderVersions() {
    return (
      <Select
        id="optionSelect"
        name="versionSelect"
        onChange={this.onVersionChangeHandler}
      >
        {VERSIONS.map(version => <Option value={version}>{version}</Option>)}
      </Select>
    );
  }

  render() {
    return (
      <div className="f36-margin--l">
        <Typography>
          <DisplayText>Choose a Firefox version</DisplayText>
          <SectionHeading>Has targeting?</SectionHeading>
          <FieldGroup row={true}>
            <RadioButtonField
              labelText="Yes"
              checked={this.state.chooseVersion}
              value="yes"
              onChange={this.onChooseVersionChangeHandler}
              name="versionOption"
              id="yesCheckbox"
            />
            <RadioButtonField
              labelText="No"
              checked={!this.state.chooseVersion}
              value="no"
              onChange={this.onChooseVersionChangeHandler}
              name="versionOption"
              id="noCheckbox"
            />
          </FieldGroup>
        </Typography>
        {this.state.chooseVersion && (
          <Typography>
            <SectionHeading>Version</SectionHeading>
            {this.renderVersions()}
          </Typography>
        )}
      </div>
    );
  }
}

init(sdk => {
  render(<App sdk={sdk as EditorExtensionSDK} />, document.getElementById('root'));
});

/**
 * By default, iframe of the extension is fully reloaded on every save of a source file.
 * If you want to use HMR (hot module reload) instead of full reload, uncomment the following lines
 */
// if (module.hot) {
//   module.hot.accept();
// }
