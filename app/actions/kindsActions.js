import * as c from '../utils/constants';

function requestKinds() { return { type: c.REQUEST_KINDS }; }

function receiveKinds(json) { return { type: c.RECEIVE_KINDS, kinds: json.kinds }; }

// function receiveKinds(json) {
//   // Add the All to the list
//   const kinds = [{ _id: 0, name: 'All' }, ...json.kinds];
//   return {
//     type: c.RECEIVE_KINDS,
//     kinds,
//   };
// }

function errorRequestingKinds(message) { return { type: c.ERROR_REQUESTING_KINDS, error: message }; }

export function fetchKinds() { // eslint-disable-line import/prefer-default-export
  return (dispatch) => {
    dispatch(requestKinds()); // advertise we are starting a server request
    return fetch(`${process.env.GATEWAY}/api/kinds`)
      .then(response => response.json())
      .then(json => dispatch(receiveKinds(json)))
      .catch(error => dispatch(errorRequestingKinds(error.message)));
  };
}
