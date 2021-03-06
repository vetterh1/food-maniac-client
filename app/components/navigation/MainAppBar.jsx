/* eslint-disable react/prefer-stateless-function */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import RetreiveLocations from '../utils/RetreiveLocations';
import LanguageChoice from '../utils/LanguageChoice';
import { changeLanguage } from '../../actions/languageInfoActions';
import Auth from '../../auth/Auth';
import LoginInBar from '../../auth/LoginInBar';

class MainAppBar extends React.Component {
  static propTypes = {
    location: PropTypes.object,
    auth: PropTypes.instanceOf(Auth).isRequired,
    languageInfo: PropTypes.shape({
      list: PropTypes.array,
      locale: PropTypes.string,
    }).isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.toggle = this.toggle.bind(this);
    this.resetOpenState = this.resetOpenState.bind(this);
    this.handleChangeLanguage = this.handleChangeLanguage.bind(this);

    this.state = {
      route: window.location.pathname,
      isOpen: false,
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  }


  handleChangeLanguage(locale) {
    // Save new language selection in redux store
    const { dispatch } = this.props; // Injected by react-redux
    const action = changeLanguage(locale);
    dispatch(action);
  }


  resetOpenState() {
    this.setState({
      isOpen: false,
    });
  }


  render() {
    const onMainPage = this.props.location.pathname === '/';
    const { isOpen } = this.state;

    return (
      <Navbar
        color="dark"
        dark
        expand="sm"
      >
        <NavbarBrand
          tag={Link}
          to="/"
          onClick={this.resetOpenState}
        >
          Food Maniac!
        </NavbarBrand>
        <NavbarToggler
          onClick={this.toggle}
        />
        <Collapse
          isOpen={isOpen}
          navbar
        >
          <Nav
            className="ml-auto"
            navbar
          >
            {!onMainPage &&
            <NavItem>
              <NavLink
                tag={Link}
                to="/rate"
                onClick={this.resetOpenState}
              >
                &gt;&nbsp;
                <FormattedMessage id="item.rate.short" />
              </NavLink>
            </NavItem>}
            {!onMainPage &&
            <NavItem>
              <NavLink
                tag={Link}
                to="/search"
                onClick={this.resetOpenState}
              >
                &gt;&nbsp;
                <FormattedMessage id="item.search.short" />
              </NavLink>
            </NavItem>}
            {this.props.languageInfo.list.map((oneLanguage, index) => (
              <NavItem key={oneLanguage}>
                <LanguageChoice
                  selected={oneLanguage === this.props.languageInfo.locale}
                  index={index}
                  locale={oneLanguage}
                  onClick={this.handleChangeLanguage}
                />
              </NavItem>
            ), this)}
            <NavItem>
              <RetreiveLocations />
            </NavItem>
            <LoginInBar auth={this.props.auth} />
          </Nav>
        </Collapse>
      </Navbar>
    );
  }
}


// 1st to receive store changes
// Role of mapStateToProps: transform the "interesting" part of the store state
// into some props that will be received by componentWillReceiveProps
const mapStateToProps = (state) => {
  return { languageInfo: state.languageInfo };
};

export default connect(mapStateToProps)(MainAppBar);