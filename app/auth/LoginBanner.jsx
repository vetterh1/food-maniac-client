/* eslint-disable react/prefer-stateless-function */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["responseFacebook"] }] */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button } from 'reactstrap';
import Auth from './Auth';
import Profile from './Profile';

class LoginBanner extends React.Component {
  static propTypes = {
    auth: PropTypes.instanceOf(Auth).isRequired,
    showWelcomeBlob: PropTypes.bool,
  }

  onLogin() {
    this.props.auth.login();
  }

  render() {
    const { isAuthenticated } = this.props.auth;
    if (isAuthenticated()) {
      return null;
      // return (
      //   <div className="jumbotron">
      //     <div className="container">
      //       <Profile auth={this.props.auth} />
      //     </div>
      //   </div>
      // );
    }
    return (
      <div className="jumbotron">
        <div className="container">
          <h1 className="display-6"><FormattedMessage id="messages.welcome.main" /></h1>
          <p><FormattedMessage id={this.props.showWelcomeBlob ? 'messages.welcome.blob' : 'login.ask'} /></p>
          <Button color="primary" size="md" onClick={this.onLogin.bind(this)}>
            <FormattedMessage id="login.login_signin" />
          </Button>
        </div>
      </div>
    );
  }
}
LoginBanner.defaultProps = { showWelcomeBlob: false };
export default LoginBanner;
