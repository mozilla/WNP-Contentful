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
  chooseLocale: boolean;
  // ["locale" | "languageCode"]
  localeType?: string;
  value?: string;
}

const LOCALES = [
  "de",
  "en-CA",
  "en-US",
  "en-GB",
  "es-ES",
  "fr",
  "it",
  "pl",
  "pt-BR",
  "ru",
  "zh-CN"
];

const LANGUAGES = [
  "en",
  "es",
  "de",
  "fr",
  "it",
  "jp",
  "pl",
  "pt",
  "ru",
  "zh"
]

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);

    this.state = {
      chooseLocale: props.sdk.entry.fields.chooseLocale.getValue() || false,
      localeType: props.sdk.entry.fields.localeType.getValue() || "locale",
      value: props.sdk.entry.fields.value.getValue()
    };
  }

  onChooseLocaleChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chooseLocale = event.target.value === 'yes';
    this.setState({ chooseLocale });
    this.props.sdk.entry.fields.chooseLocale.setValue(chooseLocale);
  };

  onLocaleTypeChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const localeType = event.target.value;
    this.setState({ localeType });
    this.props.sdk.entry.fields.localeType.setValue(localeType);
  };


  onValueChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.props.sdk.entry.fields.value.setValue(event.target.value);
  };

  renderLocales() {
    return (
      <Select
        id="optionSelect"
        name="localeSelect"
        onChange={this.onValueChangeHandler}
      >
        {
          this.state.localeType === "locale" ?
            LOCALES.map(locale => <Option value={locale}>{locale}</Option>)
            : LANGUAGES.map(language => <Option value={language}>{language}</Option>)
        }
      </Select>
    );
  }

  render() {
    return (
      <div className="f36-margin--l">
        <Typography>
          <DisplayText>Choose a locale</DisplayText>
          <SectionHeading>Has targeting?</SectionHeading>
          <FieldGroup row={true}>
            <RadioButtonField
              labelText="Yes"
              checked={this.state.chooseLocale}
              value="yes"
              onChange={this.onChooseLocaleChangeHandler}
              name="localeOption"
              id="yesCheckbox"
            />
            <RadioButtonField
              labelText="No"
              checked={!this.state.chooseLocale}
              value="no"
              onChange={this.onChooseLocaleChangeHandler}
              name="localeOption"
              id="noCheckbox"
            />
          </FieldGroup>
        </Typography>
        {this.state.chooseLocale && (
          <Typography>
            <FieldGroup row={true}>
              <Select
                id="localeTypeSelect"
                name="localeTypeSelect"
                onChange={this.onLocaleTypeChangeHandler}
              >
                <Option value="locale">locale</Option>
                <Option value="language">language</Option>
              </Select>
              {this.renderLocales()}
            </FieldGroup>
          </Typography>
        )}
      </div>
    );
  }
}

init(sdk => {
  render(<App sdk={sdk as EditorExtensionSDK} />, document.getElementById('root'));
});
