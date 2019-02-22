/* eslint-disable react/forbid-prop-types */

import * as log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';
import Alert from 'react-s-alert';
import 'isomorphic-fetch';
// import { polyfill } from 'es6-promise';
import { MdStarHalf } from 'react-icons/md';
import SearchItemForm from './SearchItemForm';
import ListOneMarkContainer from './ListOneMarkContainer';
import SimulateLocationContainer from '../pages/SimulateLocationContainer';
import { loglevelServerSend } from '../../utils/loglevel-serverSend';

const logSearchItemContainer = log.getLogger('logSearchItemContainer');
loglevelServerSend(logSearchItemContainer); // a setLevel() MUST be run AFTER this!
logSearchItemContainer.setLevel('debug');
logSearchItemContainer.debug('--> entering SearchItemContainer.jsx');


class SearchItemContainer extends React.Component {
  static propTypes = {
    // Injected by redux-store connect:
    coordinates: PropTypes.shape({
      error: PropTypes.number,
      latitude: PropTypes.number,
      longitude: PropTypes.number,
      simulated: PropTypes.boolean,
      real: PropTypes.boolean,
      changed: PropTypes.boolean,
      changedReal: PropTypes.boolean,
      nbRefreshes: PropTypes.number,
      nbDiffs: PropTypes.number,
      nbReal: PropTypes.number,
      nbEstimated: PropTypes.number,
      nbClose: PropTypes.number,
      latitude_save: PropTypes.number,
      longitude_save: PropTypes.number,
    }).isRequired,
    kinds: PropTypes.object.isRequired,
    categories: PropTypes.object.isRequired,
    items: PropTypes.array.isRequired,
    locale: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.values = null;

    this._childComponent = null;

    this.state = {
      markAggregates: null, // Results
      modalSimulateLocation: false,
      googleMapId: null,
      distance: 0,
    };

    this.alert = null;
  }



  onStartSearching = () => {
    this._nowStartSaving = new Date().getTime();
    const msg = this.context.intl.formatMessage({ id: 'messages.search.start' });
    this.alert = Alert.info(msg);
  }

  onEndSearchingOK = (nbItems) => {
    const duration = new Date().getTime() - this._nowStartSaving;
    const msg = this.context.intl.formatMessage({ id: 'messages.search.success' }, { nbItems, duration });
    if (this.alert) Alert.update(this.alert, msg, 'success');
    else this.alert = Alert.success(msg);
  }

  onEndSearchingNoResults = () => {
    const duration = new Date().getTime() - this._nowStartSaving;
    const msg = this.context.intl.formatMessage({ id: 'messages.search.noresults' }, { duration });
    if (this.alert) Alert.update(this.alert, msg, 'warning');
    else this.alert = Alert.warning(msg);
  }


  onEndSearchingFailed = (errorMessage) => {
    const duration = new Date().getTime() - this._nowStartSaving;
    const msg = this.context.intl.formatMessage({ id: 'messages.search.error' }, { errorMessage, duration });
    if (this.alert) Alert.update(this.alert, msg, 'error');
    else this.alert = Alert.error(msg);
  }


  onRequestSimulateLocation() {
    this.setState({ modalSimulateLocation: true });
  }

  onCloseModalSimulateLocation() {
    this.setState({ modalSimulateLocation: false });
  }



  onSubmit(values) {
    this.onStartSearching();
    this.values = values;
    this.FindMarks()
    .catch((error) => { logSearchItemContainer.error('submitForm caught exception: ', error.message); });
  }

  resetForm() {
    // Clear the results list
    this.setState({ markAggregates: null });
  }

  FindMarks() {
    // Return a new promise.
    return new Promise((resolve, reject) => {
      logSearchItemContainer.warn('{ SearchItemContainer.FindMarks');
      // logSearchItemContainer.warn(`SearchItemContainer.FindMarks - this.props.coordinates:\n\n${stringifyOnce(this.props.coordinates, null, 2)}`);

      const item = this.values.item ? this.values.item : 'all';
      fetch(`${process.env.HOST}/api/markAggregates/itemId/${item}/maxDistance/${this.values.distance}/lat/${this.props.coordinates.latitude}/lng/${this.props.coordinates.longitude}`)
      .then((response) => {
        if (response.status >= 400) {
          this.onEndSearchingFailed(response.status);
          const error = new Error(`Bad response from server: ${response.status} (request: /api/markAggregates/itemId/...)`);
          error.name = 'ErrorCaught';
          throw (error);
        } else {
          return response.json();
        }
      }).then((jsonResponse) => {
        if (!jsonResponse || jsonResponse.error) {
          this.onEndSearchingFailed('02');
          const error = new Error('fetch OK but returned nothing or an error (request: /api/markAggregates/itemId/...)');
          error.name = 'ErrorCaught';
          throw (error);
        }
        if (!jsonResponse.markAggregates) {
          this.onEndSearchingFailed('03');
          const error = new Error('jsonResponse.markAggregates undefined (request: /api/markAggregates/itemId/...)');
          error.name = 'ErrorCaught';
          throw (error);
        }
        if (jsonResponse.markAggregates.length >= 0) {
          this.setState({ markAggregates: jsonResponse.markAggregates });
          if (jsonResponse.markAggregates.length > 0) this.onEndSearchingOK(jsonResponse.markAggregates.length);
          else this.onEndSearchingNoResults();
        }
      }).catch((error) => {
        if (error.name !== 'ErrorCaught') this.onEndSearchingFailed('04');
        reject(error);
      });
      logSearchItemContainer.warn('} SearchItemContainer.FindMarks');
    });
  }


  render() {
    console.log('Render SearchItemContainer');

    return (
      <div>
        <Container fluid>
          <SearchItemForm
            locale={this.props.locale}
            ref={(r) => { this._childComponent = r; }}
            kinds={this.props.kinds}
            categories={this.props.categories}
            items={this.props.items}
            onSubmit={this.onSubmit.bind(this)}
            resetForm={this.resetForm.bind(this)}
            onRequestSimulateLocation={this.onRequestSimulateLocation.bind(this)}
          />

          {this.state.markAggregates &&
            <div className="standard-container mt-5">
              <h5
                className="mb-4"
              >
                <MdStarHalf size={24} className="mr-2" />
                <FormattedMessage id="core.results" />
                :
              </h5>
              {this.state.markAggregates.map((markAggregate) => {
                return (<ListOneMarkContainer
                  locale={this.props.locale}
                  markAggregate={markAggregate}
                  key={markAggregate._id}
                />);
              })
              }
            </div>
          }
          <SimulateLocationContainer
            open={this.state.modalSimulateLocation}
            onClose={this.onCloseModalSimulateLocation.bind(this)}
          />
        </Container>
      </div>
    );
  }
}

SearchItemContainer.contextTypes = { intl: PropTypes.object.isRequired };


const mapStateToProps = (state) => {
  console.log('***************************** SearchItemContainer.mapStateToProps: state=', state);
  return {
    coordinates: state.coordinates,
    kinds: state.kinds,
    categories: state.categories,
    items: state.items.items,
    locale: state.languageInfo.locale,
  };
};

export default connect(mapStateToProps)(SearchItemContainer);
