/* eslint-disable jsx-a11y/href-no-hash */
/* eslint-disable jsx-a11y/img-has-alt */
/* eslint-disable no-class-assign */
/* eslint-disable react/forbid-prop-types */

import * as log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Container } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import Alert from 'react-s-alert';
import 'es6-promise/auto';
import 'isomorphic-fetch';
import RateForm from './RateForm';
import AddItemContainer from '../pages/AddItemContainer';
import SimulateLocationContainer from '../pages/SimulateLocationContainer';
import stringifyOnce from '../../utils/stringifyOnce';
import { loglevelServerSend } from '../../utils/loglevel-serverSend';
import * as itemsActions from '../../actions/itemsActions';
import * as placesActions from '../../actions/PlacesActions';
import Auth from '../../auth/Auth';
import LoginBanner from '../../auth/LoginBanner';


const logRateContainer = log.getLogger('logRateContainer');
loglevelServerSend(logRateContainer); // a setLevel() MUST be run AFTER this!
logRateContainer.setLevel('debug');
logRateContainer.debug('--> entering RateContainer.jsx');


class RateContainer extends React.Component {
  static propTypes = {
    // Injected by redux-store connect:
    auth: PropTypes.instanceOf(Auth).isRequired,
    kinds: PropTypes.object.isRequired,
    categories: PropTypes.object.isRequired,
    items: PropTypes.object.isRequired,
    places: PropTypes.object.isRequired,
    locale: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.values = null;

    this._childComponent = null;

    this.alert = null;

    this.state = {
      modalAddItemOpened: false,
      modalSimulateLocation: false,
    };
  }



  onLogin() {
    this.props.auth.login();
  }

  onStartSaving = () => {
    this._nowStartSaving = new Date().getTime();
    const msg = this.context.intl.formatMessage({ id: 'messages.save.start' });
    this.alert = Alert.info(msg);
  }

  onEndSavingOK = () => {
    const duration = new Date().getTime() - this._nowStartSaving;
    const msg = this.context.intl.formatMessage({ id: 'messages.save.success' }, { duration });
    if (this.alert) Alert.update(this.alert, msg, 'success');
    else this.alert = Alert.success(msg);

    // Tell the child to reset
    // CAUTION! only works because the form is the immediate child
    // ...because it does NOT use redux not redux-form
    // if this CHANGES, this should be replaced by a dispatch or a reset action
    // ex: dispatch(reset('AddItemForm'));
    if (this._childComponent) this._childComponent.resetForm();
  }

  onEndSavingFailed = (errorMessage) => {
    const duration = new Date().getTime() - this._nowStartSaving;
    const msg = this.context.intl.formatMessage({ id: 'messages.save.error' }, { errorMessage, duration });
    if (this.alert) Alert.update(this.alert, msg, 'error');
    else this.alert = Alert.error(msg);
  }

  onSubmit(values) {
    this.onStartSaving();
    this.values = values;
    this.save();
  }

  onRequestAddItem() {
    this.setState({ modalAddItemOpened: true });
  }

  onCloseModalAddItem() {
    this.setState({ modalAddItemOpened: false });
  }

  onRequestSimulateLocation() {
    this.setState({ modalSimulateLocation: true });
  }

  onCloseModalSimulateLocation() {
    this.setState({ modalSimulateLocation: false });
  }

  onChangeLocationType(locationType) {
    // Remove any default item (set by Add Item)
    const { dispatch } = this.props; // Injected by react-redux
    const action = placesActions.setLocationType(locationType);
    dispatch(action);
  }

  save() {
    logRateContainer.debug(`RateContainer.save - values:\n\n${stringifyOnce(this.values, null, 2)}`);
    this.saveLocation()
      .then(this.saveMarks.bind(this))
      .then(this.saveDone.bind(this))
      .catch((error) => {
        logRateContainer.error('RateContainer.save failed: ', error);
        this.onEndSavingFailed('01');
      });
  }

  saveLocation() {
    // Return a new promise.
    logRateContainer.debug('this 1:', this);
    const selfLocal = this;
    return new Promise((resolve, reject) => {
      logRateContainer.debug('{ RateContainer.saveLocation');
      // logRateContainer.debug(`RateContainer.saveLocation - this.props:\n\n${stringifyOnce(this.props, null, 2)}`);

      const placeSelected = selfLocal.props.places.places.find((place) => { return place.id === selfLocal.values.location; });
      if (!placeSelected) throw new Error(`saveLocation - Could not find this location: ${selfLocal.values.location}`);
      // logRateContainer.debug('placeSelected.geometry: ', placeSelected.geometry);
      // logRateContainer.debug('placeSelected.geometry.location.lat(): ', placeSelected.geometry.location.lat());
      // logRateContainer.debug(`RateContainer.saveLocation - placeSelected.geometry.location:\n\n${stringifyOnce(placeSelected.geometry.location, null, 2)}`);
      const place = {
        name: placeSelected.nameWithoutDistance,
        googleMapId: selfLocal.values.location,
        googlePhotoUrl: placeSelected.googlePhotoUrl,
        location: {
          type: 'Point',
          coordinates: [placeSelected.geometry.location.lng(), placeSelected.geometry.location.lat()],
        },
      };
      logRateContainer.debug(`RateContainer.saveLocation - place:\n\n${JSON.stringify({ place })}`);

      fetch('/api/places/addOrUpdatePlaceByGoogleMapId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ place }),
      })
        .then((response) => {
          logRateContainer.debug('   fetch result: ', JSON.stringify(response));
          if (response.ok) {
            logRateContainer.debug('   fetch operation OK');
            // returns the (async) response from server: the saved location (with id)
            resolve(response.json());
          } else {
            // returns the error given by the server (async)
            response.json()
              .then((error) => { throw new Error(error.message); });
          }
        })
        .catch((error) => {
          reject(Error(error.message));
        });
      logRateContainer.debug('} RateContainer.saveLocation');
    });
  }




  saveMarks(savedLocation) {
    logRateContainer.debug(`RateContainer.saveMarks - savedLocation:\n\n${stringifyOnce(savedLocation, null, 2)}`);

    // Every time a user logs in, we send his Auth0 id to the server.
    // in exchange, the server sends back the mongo db user id so we can send it in the rating calls
    const userDbId = localStorage.getItem('userDbId');
    logRateContainer.debug(`userDbId: ${userDbId}`);

    const idLocation = savedLocation.place.id;
    const lat = savedLocation.place.location.coordinates[0];
    const lng = savedLocation.place.location.coordinates[1];
    const selfLocal = this;

    // Return a new promise.
    return new Promise((resolve, reject) => {
      logRateContainer.debug('{ RateContainer.saveMarks');

      const markIndividual = {
        item: selfLocal.values.item,
        place: idLocation,
        user: userDbId,
        markOverall: selfLocal.values.markOverall,
        markFood: selfLocal.values.markFood,
        markValue: selfLocal.values.markValue,
        markPlace: selfLocal.values.markPlace,
        markStaff: selfLocal.values.markStaff,
        comment: selfLocal.values.comment,
        location: {
          type: 'Point',
          coordinates: [lat, lng],
        },
      };
      logRateContainer.debug('   markIndividual: ', markIndividual);

      fetch('/api/markIndividuals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markIndividual }),
      })
        .then((response) => {
          logRateContainer.debug('   fetch result: ', response);
          if (response.ok) {
            logRateContainer.debug('   fetch operation OK');
            // returns the (async) response from server: the saved markIndividual (with id)
            resolve(response.json());
          } else {
            // returns the error given by the server (async)
            response.json()
              .then((error) => { throw new Error(error.message); });
          }
        })
        .catch((error) => {
          reject(Error(error.message));
        });
      logRateContainer.debug('} RateContainer.saveMarks');
    });
  }


  saveDone(savedMark) {
    logRateContainer.debug(`saveDone - markIndividual saved: ${stringifyOnce(savedMark, null, 2)}`);

    // Remove any default item (set by Add Item)
    const { dispatch } = this.props; // Injected by react-redux
    const action = itemsActions.requestSetDefaultItem(null);
    dispatch(action);

    this.onEndSavingOK();
  }



  render() {
    const { isAuthenticated } = this.props.auth;
    if (!isAuthenticated()) return (<LoginBanner auth={this.props.auth} />);

    return (
      <Container fluid>
        <RateForm
          locale={this.props.locale}
          ref={(r) => { this._childComponent = r; }}
          kinds={this.props.kinds}
          categories={this.props.categories}
          items={this.props.items}
          places={this.props.places}
          onSubmit={this.onSubmit.bind(this)}
          onRequestAddItem={this.onRequestAddItem.bind(this)}
          onRequestSimulateLocation={this.onRequestSimulateLocation.bind(this)}
          onChangeLocationType={this.onChangeLocationType.bind(this)}
        />
        <AddItemContainer
          open={this.state.modalAddItemOpened}
          onClose={this.onCloseModalAddItem.bind(this)}
        />
        <SimulateLocationContainer
          open={this.state.modalSimulateLocation}
          onClose={this.onCloseModalSimulateLocation.bind(this)}
        />
      </Container>
    );
  }
}

RateContainer.contextTypes = { intl: PropTypes.object.isRequired };


const mapStateToProps = (state) => {
  // Add the All to the Kind & Category lists
  const placesWithDistance = state.places.places.map((place) => { return { ...place, nameWithoutDistance: place.name, name: `${place.name} (${place.distanceFormated})` }; });
  return {
    places: { places: placesWithDistance },
    kinds: state.kinds,
    categories: state.categories,
    items: state.items,
    locale: state.languageInfo.locale,
  };
};

RateContainer = connect(mapStateToProps)(RateContainer);
export default RateContainer;
