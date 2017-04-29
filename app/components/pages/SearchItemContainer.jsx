import * as log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
// import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Alert, Container, Row, Table } from 'reactstrap';
import SearchItemForm from './SearchItemForm';
// import stringifyOnce from '../../utils/stringifyOnce';

require('es6-promise').polyfill();
require('isomorphic-fetch');

const logSearchItemContainer = log.getLogger('logSearchItemContainer');
logSearchItemContainer.setLevel('debug');
logSearchItemContainer.warn('--> entering SearchItemContainer.jsx');

// To round to the next 0.5: (Math.round(rating * 2) / 2).toFixed(1)
function roundTo0dot5(n) { return n ? (Math.round(n * 2) / 2).toFixed(1) : null; }

const ListOneMark = (props) => {
  const { markAggregate } = props;
  return (
    <tr>
      <th scope="row">{markAggregate.place.name}</th>
      <td>{roundTo0dot5(markAggregate.markOverall)}</td>
      <td>{roundTo0dot5(markAggregate.markFood)}</td>
      <td>{roundTo0dot5(markAggregate.markPlace)}</td>
      <td>{roundTo0dot5(markAggregate.markStaff)}</td>
      <td>{markAggregate.nbMarksOverall}</td>
    </tr>
  );
};

ListOneMark.propTypes = {
  index: PropTypes.number.isRequired,
  markAggregate: PropTypes.object.isRequired,
};




class SearchItemContainer extends React.Component {
  static propTypes = {
    coordinates: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.values = null;
    this.submitForm = this.submitForm.bind(this);
    this.onSearchItemError = this.onSearchItemError.bind(this);
    this._childComponent = null;

    this.state = {
      markAggregates: [],
      // alertStatus possible values:
      // -  0: no alerts
      //  - searching alerts:  1: searching, 2: searching OK, 3: no results,
      //                      -1: searching KO, -2: SearchItem error
      alertStatus: 0,
      alertMessage: '',
    };
  }

  onStartSearching = () => {
    this._nowStartSaving = new Date().getTime();
    this.setState({ alertStatus: 1, alertColor: 'info', alertMessage: 'Searching...' });
    window.scrollTo(0, 0);
  }

  onEndSearchingOK = () => {
    const durationSaving = new Date().getTime() - this._nowStartSaving;
    this.setState({ alertStatus: 2, alertColor: 'success', alertMessage: `Searching done! (duration=${durationSaving}ms)` });
    setTimeout(() => { this.setState({ alertStatus: 0 }); }, 3000);

    // Tell the child to reset
    // if (this._childComponent) this._childComponent.resetForm();
  }

  onEndSearchingNoResults = () => {
    const durationSaving = new Date().getTime() - this._nowStartSaving;
    this.setState({ alertStatus: 3, alertColor: 'warning', alertMessage: `No results found (duration=${durationSaving}ms)` });
  }


  onEndSearchingFailed = (errorMessage) => {
    const durationSaving = new Date().getTime() - this._nowStartSaving;
    this.setState({ alertStatus: -1, alertColor: 'danger', alertMessage: `Error while searching (error=${errorMessage}, duration=${durationSaving}ms)` });
  }


  onSearchItemError = (errorMessage) => {
    this.setState({ alertStatus: -2, alertColor: 'danger', alertMessage: `Error while constructing items list (error=${errorMessage})` });
  }



  submitForm(values) {
    this.onStartSearching();
    this.values = values;
    this.FindMarks()
    .catch((error) => { logSearchItemContainer.error('submitForm caught exception: ', error.message); });
  }


  FindMarks() {
    // Return a new promise.
    return new Promise((resolve, reject) => {
      logSearchItemContainer.warn('{ SearchItemContainer.FindMarks');
      // logSearchItemContainer.warn(`SearchItemContainer.FindMarks - this.props.coordinates:\n\n${stringifyOnce(this.props.coordinates, null, 2)}`);

      fetch(`/api/markAggregates/itemId/${this.values.item}/maxDistance/${this.values.searchDistance}/lat/${this.props.coordinates.latitude}/lng/${this.props.coordinates.longitude}`)
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
          if (jsonResponse.markAggregates.length > 0) this.onEndSearchingOK();
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
    return (
      <div>
        <Container fluid>
          {this.state.alertStatus !== 0 && <Alert color={this.state.alertColor}>{this.state.alertMessage}</Alert>}
          <SearchItemForm ref={(r) => { this._childComponent = r; }} onSubmit={this.submitForm} onSearchItemError={this.onSearchItemError} />

          <Row>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Overall</th>
                  <th>Food</th>
                  <th>Place</th>
                  <th>Staff</th>
                  <th># Reviews</th>
                </tr>
              </thead>
              <tbody>
                {this.state.markAggregates && this.state.markAggregates.map((markAggregate, index) => { return (<ListOneMark markAggregate={markAggregate} index={index} key={markAggregate._id} />); })}
              </tbody>
            </Table>
          </Row>
        </Container>
      </div>
    );
  }
}




const mapStateToProps = (state) => { return { coordinates: state.coordinates }; };

// SearchItemContainer = reduxForm({ form: 'SearchItem' })(SearchItemContainer); // DecoSearchItem the form component
SearchItemContainer = connect(mapStateToProps)(SearchItemContainer);
export default SearchItemContainer;
