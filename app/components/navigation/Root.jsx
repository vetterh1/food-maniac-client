/* eslint-disable react/forbid-prop-types */

import * as log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Router, Route } from 'react-router-dom';
// Older solution: Import bootstrap directly from cdn in index.html. no need for npm install bootstrap either!
import 'bootstrap/dist/css/bootstrap.min.css';
import { IntlProvider } from 'react-intl';
import { loglevelServerSend } from '../../utils/loglevel-serverSend';
import localeData from '../../locales/data.json';
import App from '../pages/App';
import history from '../navigation/history'


const logRoot = log.getLogger('logRoot');
loglevelServerSend(logRoot); // a setLevel() MUST be run AFTER this!
logRoot.setLevel('debug');
logRoot.debug('--> entering Root.jsx');


class Root extends React.Component {
  constructor() {
    super();
    this.toggle = this.i18nLoad.bind(this);

    this.state = {
      locale: '',
      messages: [],
    };
  }

  // -------------------  i18n  ---------------------

  componentWillMount() {
    // 1st load and data already present in redux store
    // (loaded in index.jsx)
    this.i18nLoad(this.props.languageInfo);
  }

  componentWillReceiveProps(nextProps) {
    // Change language?
    if (nextProps &&
        nextProps.languageInfo &&
        nextProps.languageInfo.locale &&
        nextProps.languageInfo.locale !==
          this.props.languageInfo.locale) {
      this.i18nLoad(nextProps.languageInfo);
    }
  }

  // Retrieves messages for the current local (passed in parameters)
  // Set in the state, available to render(), can be passed to children
  i18nLoad(languageInfo) {
    if (!languageInfo) return;
    this.setState({
      locale: languageInfo.locale,
      messages: localeData[languageInfo.locale],
    });
  }


  render() {
    if (!this.props.languageInfo) return null;
    return (
      <IntlProvider
        locale={this.state.locale}
        messages={this.state.messages}
      >
        <Router history={history}>
          <Route path="/" component={props => <App {...props} />} />
        </Router>
      </IntlProvider>
    );
  }
}


Root.propTypes = {
  languageInfo: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return { languageInfo: state.languageInfo };
};

export default connect(mapStateToProps)(Root);