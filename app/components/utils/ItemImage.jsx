import React from 'react';
import PropTypes from 'prop-types';
import MdLocalRestaurant from 'react-icons/lib/md/local-restaurant';

const ItemImage = (props) => {
  if (!props.id) return null;
  return (<object data={`/static/thumbnails/${props.id}.jpg`} type="image/jpg"><MdLocalRestaurant size={96} /></object>);
};

ItemImage.propTypes = {
  id: PropTypes.string,
};


ItemImage.defaultProps = {
  id: null,
};

export default ItemImage;