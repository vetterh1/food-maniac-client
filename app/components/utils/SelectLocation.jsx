/* global google */

import React, { /* Component */ } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field } from 'redux-form';
import { Col, FormGroup } from 'reactstrap';
import * as log from 'loglevel';
import Geolocation from '../utils/Geolocation';
import ReactFormInput from '../utils/ReactFormInput';
import * as PlacesActions from '../../actions/PlacesActions';

const logSelectLocation = log.getLogger('loggerSelectLocation');
logSelectLocation.setLevel('trace');
logSelectLocation.error('--> entering SelectLocation.jsx');

const Listing = ({ places }) => {
  logSelectLocation.error('   {   Listing.render (lr)');
  logSelectLocation.error('          (lr) nb places: ', places.length);
  if (places.length > 0) logSelectLocation.error('          (lr) 1st places: ', places[0].name);

//  <AvField type="select" name="category" label="Category" size="lg">

  const result = (
    <Field name="location" component={ReactFormInput} type="select" size="md">
      {places && places.map((p) => { return (<option key={p.id} value={p.id}>{p.name}</option>); })}
    </Field>
  );

  logSelectLocation.error('   }   Listing.render');
  return result;
};



class SelectLocation extends React.Component {

  constructor() {
    super();

    this.state = {
      places: [],
      nbRenders: 0,
    };
  }



  // 2nd to receive store changes
  componentWillReceiveProps(nextProps) {
    logSelectLocation.error('{   SelectLocation.componentWillReceiveProps (sl-cwrp)');
    logSelectLocation.error('       (sl-cwrp) nextProps: ', nextProps);

    if (!nextProps) {
      logSelectLocation.error('}   SelectLocation.componentWillReceiveProps: nextProps null !!!');
      return;
    }

    if (!nextProps.coordinates) {
      logSelectLocation.error('}   SelectLocation.componentWillReceiveProps: coordinates null !!!');
      return;
    }

    if (!nextProps.coordinates.latitude || !nextProps.coordinates.longitude) {
      logSelectLocation.error('}   SelectLocation.componentWillReceiveProps: lat or long null !!!');
      return;
    }

    if (!nextProps.coordinates.changed) {
      logSelectLocation.error('}   SelectLocation.componentWillReceiveProps: no change in coordinates');
      return;
    }

    const nbRenders = this.state.nbRenders + 1;
    this.setState({ nbRenders });

    const currentLatLng = new google.maps.LatLng(nextProps.coordinates.latitude, nextProps.coordinates.longitude);

    const map = new google.maps.Map(document.getElementById('map'), {
      center: currentLatLng,
      zoom: 15,
    });

    logSelectLocation.error('       (sl-cwrp) currentLatLng : ', currentLatLng);
    const request = {
      location: currentLatLng,
      // radius: '100',
      types: ['restaurant'],
      rankBy: google.maps.places.RankBy.DISTANCE,
    };

    const service = new google.maps.places.PlacesService(map);

    service.nearbySearch(request, (results, status, pagination) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        logSelectLocation.error('          (sl-cwrp) nearby nb results: ', results.length);
        if (results.length > 0) logSelectLocation.error('          (sl-cwrp) nearby 1st results', results[0].name);
        this.pagination = pagination;
        this.setState({
          places: results,
          hasNextPage: pagination.hasNextPage,
          currentLatLng,
        });

        // Save places in redux store
        const { dispatch } = this.props;  // Injected by react-redux
        const action = PlacesActions.setCurrentPlaces(results);
        dispatch(action);
      } else {
        logSelectLocation.error('          (sl-cwrp) nearby search error : ', status);
      }
    });

    logSelectLocation.error('}   SelectLocation.componentWillReceiveProps');
  }




  render() {
    logSelectLocation.error('{   SelectLocation.render (slr)');
    logSelectLocation.error('       (slr) state:', this.state);
    logSelectLocation.error('       (slr) props:', this.props);

    const result = (
      <div>
        <div id="map" className="hidden-xs-up" />
        <FormGroup row className="no-gutters">
          <Col xs={11}>
            <Listing
              places={this.state.places}
            />
          </Col>
          <Col xs={1}>
            <Geolocation />
          </Col>
        </FormGroup>
      </div>
    );
    logSelectLocation.error('}   SelectLocation.render');
    return result;
  }
}



SelectLocation.propTypes = {
  coordinates: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      real: PropTypes.boolean,
      changed: PropTypes.boolean,
      changedReal: PropTypes.boolean,
      nbRefreshes: PropTypes.number,
      nbDiffs: PropTypes.number,
      nbReal: PropTypes.number,
      nbEstimated: PropTypes.number,
      nbClose: PropTypes.number,
    }).isRequired,
};


// 1st to receive store changes
// Role of mapStateToProps: transform the "interesting" part of the store state
// into some props that will be received by componentWillReceiveProps
const mapStateToProps = (state) => {
  logSelectLocation.error('mapStateToProps');
  return { coordinates: state.coordinates };
};

export default connect(mapStateToProps)(SelectLocation);
