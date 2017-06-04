/* eslint-disable react/forbid-prop-types */

import * as log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, FormGroup, Input } from 'reactstrap';
import RatingStarsRow from '../utils/RatingStarsRow';
import SimpleListOrDropdown from '../utils/SimpleListOrDropdown';
import SelectItemPlus from '../utils/SelectItemPlus';
import { loglevelServerSend } from '../../utils/loglevel-serverSend';

const logRateForm = log.getLogger('logRateForm');
loglevelServerSend(logRateForm); // a setLevel() MUST be run AFTER this!
logRateForm.setLevel('debug');

const styles = {
  form: {
    // width: 300,
    // margin: '20 auto',
    // padding: 20,
  },
};

class RateForm extends React.Component {
  static propTypes = {
    kinds: PropTypes.object.isRequired,
    categories: PropTypes.object.isRequired,
    items: PropTypes.object.isRequired,
    places: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this._refSelectItemPlus = null;

    this.defaultState = {
      // unique key for the form --> used for reset form
      keyForm: Date.now(),

      item: null,
      markOverall: null,
      markFood: null,
      markPlace: null,
      markValue: null,
      markStaff: null,

      comment: '',
    };

    this.state = {
      location: props.places && props.places.places.length > 0 ? props.places.places[0].id : undefined,

      // Empty marks, kind, categories & items:
      ...this.defaultState,
    };
    // console.log('RateForm constructor (props, initial state): ', props, this.state);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps) return;
    let needUpdate = false;
    const updState = {};

    // console.log('componentWillReceiveProps items (length & 1st) crt --> : ',
    //  !this.state.items || this.state.items.length <= 0 ? 'null or empty' : this.state.items.length, this.state.items[0]);

    // console.log('componentWillReceiveProps items (length & 1st) --> next: ',
    //  !nextProps.items || nextProps.items.length <= 0 ? 'null or empty' : nextProps.items.length, nextProps.items[0]);

    // Prepare the default location selection if necessary
    if (nextProps.places && nextProps.places.places.length > 0 && (!this.state.location || this.state.location === '')) {
      // console.log(`componentWillReceiveProps update default place to ${nextProps.places.places[0].id}`);
      updState.location = nextProps.places.places[0].id;
      needUpdate = true;
    } // else console.log('componentWillReceiveProps NO update default place');

    // Launch the state update
    if (needUpdate) { this.setState(updState); }
  }


  onSubmit(event) {
    event.preventDefault();

    const returnValue = {
      item: this.state.item,
      location: this.state.location,
      markOverall: this.state.markOverall,
      markFood: this.state.markFood,
      markValue: this.state.markValue,
      markPlace: this.state.markPlace,
      markStaff: this.state.markStaff,
      comment: this.state.comment,
    };
    window.scrollTo(0, 0);
    this.props.onSubmit(returnValue);
  }

  onChangeItem(item) {
    if (this.state.item === item) return;
    this.setState({ item });
  }


  onChangeLocation(event) {
    if (this.state.location === event.target.value) return;
    this.setState({ location: event.target.value });
  }


  onChangeMarkOverall(mark) {
    if (!mark || this.state.markOverall === mark) return;
    this.setState({ markOverall: parseInt(mark, 10) });
  }

  onChangeMarkFood(mark) {
    if (!mark || this.state.markFood === mark) return;
    this.setState({ markFood: parseInt(mark, 10) });
  }

  onChangeMarkValue(mark) {
    if (!mark || this.state.markValue === mark) return;
    this.setState({ markValue: parseInt(mark, 10) });
  }

  onChangeMarkPlace(mark) {
    if (!mark || this.state.markPlace === mark) return;
    this.setState({ markPlace: parseInt(mark, 10) });
  }

  onChangeMarkStaff(mark) {
    if (!mark || this.state.markStaff === mark) return;
    this.setState({ markStaff: parseInt(mark, 10) });
  }

  onChangeComment(event) {
    if (this.state.comment === event.target.value) return;
    this.setState({ comment: event.target.value });
  }

  resetForm() {
    // Reset the form & clear the image
    this.setState(Object.assign({
      // Reset default location to the 1st one in the list
      location: this.props.places && this.props.places.places && this.props.places.places.length > 0 ? this.props.places.places[0].id : null,
    },
    // Erase marks & reset kind, categories & items:
    this.defaultState,
    ));
    this._refSelectItemPlus.reset();
    this.refReset.blur();
    window.scrollTo(0, 0);
  }

  render() {
    logRateForm.debug(`render RateForm: (item=${this.state.item}, location=${this.state.location})`);
    const formReadyForSubmit = this.state.item && this.state.location && this.state.markOverall;
    return (
      <div style={styles.form}>
        <h3 className="mb-4">Rate your plate!</h3>
        <Form onSubmit={this.onSubmit.bind(this)}>
          <SelectItemPlus
            title="What?"
            kinds={this.props.kinds.kinds}
            categories={this.props.categories.categories}
            items={this.props.items.items}
            onChange={this.onChangeItem.bind(this)}
            ref={(r) => { this._refSelectItemPlus = r; }} // used to reset the 3 dropdowns
          />
          <FormGroup>
            <h5 className="mt-2 mb-3">Where?</h5>
            <FormGroup row>
              <Col xs={12} lg={12} >
                <SimpleListOrDropdown items={this.props.places.places} selectedOption={this.state.location} onChange={this.onChangeLocation.bind(this)} dropdown />
              </Col>
            </FormGroup>
          </FormGroup>

          <FormGroup>
            <h5 className="mt-2 mb-3">Marks</h5>
            <RatingStarsRow name="markOverall" label="Overall" initialRate={this.state.markOverall} onChange={this.onChangeMarkOverall.bind(this)} mandatoryWarning size={30} />
            <RatingStarsRow name="markFood" label="Food" initialRate={this.state.markFood} onChange={this.onChangeMarkFood.bind(this)} />
            <RatingStarsRow name="markValue" label="Value" initialRate={this.state.markValue} onChange={this.onChangeMarkValue.bind(this)} />
            <RatingStarsRow name="markPlace" label="Place" initialRate={this.state.markPlace} onChange={this.onChangeMarkPlace.bind(this)} />
            <RatingStarsRow name="markStaff" label="Staff" initialRate={this.state.markStaff} onChange={this.onChangeMarkStaff.bind(this)} />
          </FormGroup>

          <FormGroup>
            <h5 className="mt-2 mb-3">Comment?</h5>
            <Input type="textarea" value={this.state.comment} onChange={this.onChangeComment.bind(this)} />
          </FormGroup>

          <FormGroup className="mt-2">
            <Button type="submit" size="md" disabled={!formReadyForSubmit}>Add</Button>
            <Button color="link" onClick={this.resetForm.bind(this)} size="md" getRef={(ref) => { this.refReset = ref; }}>Reset</Button>
          </FormGroup>
        </Form>
      </div>
    );
  }
}

export default RateForm;
