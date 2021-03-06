/* eslint-disable class-methods-use-this */
/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { MdBuild } from 'react-icons/md'; // Tools
import { MdBrush } from 'react-icons/md'; // FO
import { MdDns } from 'react-icons/md'; // BO
import { MdEdit } from 'react-icons/md'; // Techniques
import { MdSchool } from 'react-icons/md'; // Title
import { MdPayment } from 'react-icons/md'; // CMS

/*
FO --> ES6, React, Redux, Flex, Auth0
BO --> NodeJS, Express, Nginx, Mongo, Mongoose
Tools --> Webpack, Tests (Mocha, Jest), Eslint, Google APIs
Techniques --> multi-device layouts, Promises, TDD, Webpack optimizations
*/

class About extends React.Component {
  render() {
    return (
      <div>
        <div className="homepage-container">
          <div className="homepage-feature-items" style={{ maxWidth: '100rem' }}>
            <h5 className="mb-3">
              <MdSchool size={24} className="mr-2" />
              <FormattedMessage id="about.title" />
            </h5>
            <p>
              <FormattedMessage id="about.sub_title" />
              <a href="https://www.linkedin.com/in/lvetter/" target="_blank" rel="noopener noreferrer">Laurent Vetterhoeffer</a>
            </p>
          </div>
        </div>
        <div className="homepage-container">
          <div className="homepage-feature-items" style={{ maxWidth: '100rem' }}>
            <div className="homepage-feature-item mt-5">
              <div className="homepage-feature-icon"><MdBrush size={48} /></div>
              <h5 className="homepage-feature-title"><FormattedMessage id="about.front" /></h5>
              <div className="homepage-feature-detail">
                <p><FormattedMessage id="about.front.blob" /></p>
              </div>
            </div>
            <div className="homepage-feature-item mt-5">
              <div className="homepage-feature-icon"><MdDns size={48} /></div>
              <h5 className="homepage-feature-title"><FormattedMessage id="about.back" /></h5>
              <div className="homepage-feature-detail">
                <p><FormattedMessage id="about.back.blob" /></p>
              </div>
            </div>
            <div className="homepage-feature-item mt-5">
              <div className="homepage-feature-icon"><MdBuild size={48} /></div>
              <h5 className="homepage-feature-title"><FormattedMessage id="about.tools" /></h5>
              <div className="homepage-feature-detail">
                <p><FormattedMessage id="about.tools.blob" /></p>
              </div>
            </div>
            <div className="homepage-feature-item mt-5">
              <div className="homepage-feature-icon"><MdEdit size={48} /></div>
              <h5 className="homepage-feature-title"><FormattedMessage id="about.techniques" /></h5>
              <div className="homepage-feature-detail">
                <p><FormattedMessage id="about.techniques.blob" /></p>
              </div>
            </div>
            <div className="homepage-feature-item mt-5">
              <div className="homepage-feature-icon"><MdPayment size={48} /></div>
              <h5 className="homepage-feature-title"><FormattedMessage id="about.cms" /></h5>
              <div className="homepage-feature-detail">
                <p><FormattedMessage id="about.cms.blob" /></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default About;