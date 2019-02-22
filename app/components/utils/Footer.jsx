import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button, Col, Container, Label, Row } from 'reactstrap';
import { MdInfoOutline } from 'react-icons/md';
import { MdBugReport } from 'react-icons/md';
import { loglevelStartServerTimer } from '../../utils/loglevel-serverSend';

const divStyle = {
  color: 'grey',
  fontSize: '0.5rem',
  padding: '1em 1em',
};

// const Version = () => <div style={divStyle}><br />Version: {process.env.NODE_ENV}  -  Git branch: {process.env.GIT_BRANCH} - Git version: {process.env.NPM_VERSION} - Last commit comment: {process.env.GIT_LAST_COMMIT_COMMENT}  -  Last commit date: {process.env.GIT_LAST_COMMIT_DATE} - <a href="/logs/show?limit=200&level=1&minutes=30" target="_blank" rel="noopener noreferrer">Error logs</a> - <a href="/logs/show?limit=1000&level=5&minutes=1" target="_blank" rel="noopener noreferrer">Full logs (1mn)</a> - <a onClick={loglevelStartServerTimer(30000)}>Send logs to server (30sec)</a></div>;

class Footer extends React.Component {
  onAbout = () => {
    loglevelStartServerTimer(60000);
  }

  startServerLogging = () => {
    loglevelStartServerTimer(60000);
  }

  render() {
    const hostname = window && window.location && window.location.hostname;
    return (
      <Container fluid>
        <div className="form-block element-with-transition" style={{ marginTop: '10rem' }} >
          <h6 className="mb-3 d-sm-none ">
            <MdBugReport size={24} className="mr-2" />
            <FormattedMessage id="core.debug-info" />
          </h6>
          <Row>
            <Col sm={2} className="pr-0 d-none d-sm-block">
              <Row style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="homepage-feature-icon">
                  <MdBugReport size={32} />
                </div>
              </Row>
              <Row style={{ display: 'flex', justifyContent: 'center' }} className="mt-2">
                <Label size="s">
                  <FormattedMessage id="core.debug-info" />
                </Label>
              </Row>
            </Col>
            <Col xs={12} sm={7} l={9}>
              <Row style={divStyle}>
                <Col xs={12} className="">
                  Version: {process.env.NODE_ENV}
                </Col>
                <Col xs={12} className="">
                  Git branch: {process.env.GIT_BRANCH}
                </Col>
                <Col xs={12} className="">
                  Git version: {process.env.NPM_VERSION}
                </Col>
                <Col xs={12} className="">
                  Last commit comment: {process.env.GIT_LAST_COMMIT_COMMENT}
                </Col>
                <Col xs={12} className="">
                  Last commit date: {process.env.GIT_LAST_COMMIT_DATE}
                </Col>
                <Col xs={12} className="">
                  Hostname: {hostname} / Gateway: {process.env.GATEWAY}
                </Col>
                <Col xs={12} className="">
                  <a href={process.env.GATEWAY + "/logs/show?limit=200&level=1&minutes=30"} target="_blank" rel="noopener noreferrer">Error logs</a>
                </Col>
                <Col xs={12} className="">
                  <a href={process.env.GATEWAY + "/logs/show?limit=1000&level=5&minutes=1"} target="_blank" rel="noopener noreferrer">Full logs (1mn)</a>
                </Col>
                <Col xs={12} className="">
                  <a onClick={this.startServerLogging.bind(this)} role="button">Start logging to server (1mn)</a>
                </Col>
              </Row>
            </Col>
            <Col xs={12} sm={3} l={1}>
              <Link  style={{textDecoration: 'none'}} to="/about">
                <Button
                  block
                  color="secondary"
                  size="sm"
                >
                  <MdInfoOutline className="mr-2" size={24} />
                  <FormattedMessage id="core.about" />
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </Container>
    );
  }
}

export default Footer;
