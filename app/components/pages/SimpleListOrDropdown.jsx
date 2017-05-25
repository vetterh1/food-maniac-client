/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import ReactStrapInput from '../utils/ReactStrapInput';


const ListOneItem = props => (
  <li>{props.item.name}</li>
);

ListOneItem.propTypes = {
  item: PropTypes.object.isRequired,
};



const SimpleListOrDropdown = props => (
  <div>
    { !props.dropdown &&
      <ul>
        {props.items.map((item, index) => (
          <ListOneItem index={index} item={item} key={item.id} />
        ))}
      </ul>
    }
    { props.dropdown &&
      <ReactStrapInput selectedOption={props.selectedOption} onChange={props.onChange} size="md">
        {props.items && props.items.map((item) => { return (<option key={item.id} value={item.id}>{item.name}</option>); })}
      </ReactStrapInput>
    }
  </div>
);

SimpleListOrDropdown.propTypes = {
  dropdown: PropTypes.bool.isRequired,
  items: PropTypes.array.isRequired,
  selectedOption: React.PropTypes.string,
  onChange: PropTypes.func,
};

SimpleListOrDropdown.defaultProps = {
  dropdown: false,
  selectedOption: '',
  onChange: null,
};


export default SimpleListOrDropdown;

//        {props.items && props.items.map((item) => { console.log('SimpleListOrDropdown item (id, name): ', item.id, item.name); return (<option key={item.id} value={item.id}>{item.name}</option>); })}