/* eslint-disable class-methods-use-this */

import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import { Button } from 'reactstrap';
import MdStarHalf from 'react-icons/lib/md/star-half';
import MdLocalRestaurant from 'react-icons/lib/md/local-restaurant';
import MdLocationSearching from 'react-icons/lib/md/location-searching';
import Auth from '../../auth/Auth';

class MainPageContent extends React.Component {


  onLogin() {
    const auth = new Auth();
    auth.login();
  }

  render() {
    return (
      <div>
        <div className="jumbotron">
          <div className="container">
            <h1 className="display-6"><FormattedMessage id="messages.welcome.main" /></h1>
            <p><FormattedMessage id="messages.welcome.blob" /></p>
            <Button color="primary" size="md" onClick={this.onLogin.bind(this)}>
              <FormattedMessage id="login.login_signin" />
            </Button>

          </div>
        </div>
        <div className="homepage-container">
          <div className="homepage-feature-items">
            <div className="homepage-feature-item">
              <Link to="/rate" className="" style={{ textDecoration: 'none' }}>
                <div className="homepage-feature-icon"><MdStarHalf size={64} /></div>
                <h5 className="homepage-feature-title"><FormattedMessage id="core.rate" /></h5>
                <div className="homepage-feature-detail">
                  <p><FormattedMessage id="messages.rate.blob" /></p>
                </div>
              </Link>
            </div>
            <div className="homepage-feature-item">
              <Link to="/searchItem" className="" style={{ textDecoration: 'none' }}>
                <div className="homepage-feature-icon"><MdLocationSearching size={64} /></div>
                <h5 className="homepage-feature-title"><FormattedMessage id="core.search" /></h5>
                <div className="homepage-feature-detail">
                  <p><FormattedMessage id="messages.search.blob" /></p>
                </div>
              </Link>
            </div>
            <div className="homepage-feature-item">
              <Link to="/searchItem" className="" style={{ textDecoration: 'none' }}>
                <div className="homepage-feature-icon"><MdLocalRestaurant size={64} /></div>
                <h5 className="homepage-feature-title"><FormattedMessage id="core.discover" /></h5>
                <div className="homepage-feature-detail">
                  <p><FormattedMessage id="messages.discover.blob" /></p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainPageContent;