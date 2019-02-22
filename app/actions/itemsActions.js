import * as c from '../utils/constants';


//
// Fetch items from Server to Redux store (in Action)
//

// "private" actions, meaning called by other actions below
function _requestItems() { return { type: c.REQUEST_ITEMS }; }
function _receiveItems(json) { return { type: c.RECEIVE_ITEMS, items: json.items }; }
function _errorRequestingItems(message) { return { type: c.ERROR_REQUESTING_ITEMS, error: message }; }

export function fetchItems() { // eslint-disable-line import/prefer-default-export
  return (dispatch) => {
    dispatch(_requestItems()); // advertise we are starting a server request
    return fetch(`${process.env.HOST}/api/items`)
      .then(response => response.json())
      .then(json => dispatch(_receiveItems(json)))
      .catch(error => dispatch(_errorRequestingItems(error.message)));
  };
}


//
// Save item to Server (in Action) and update Redux store with new item (in Reducer)
//

function _requestSaveItem() { return { type: c.REQUEST_SAVE_ITEM }; }
function _successSavingItem(item) { return { type: c.SAVE_ITEM_OK, item }; }
function _errorSavingItem(message) { return { type: c.SAVE_ITEM_KO, error: message }; }

export function saveItem(item) { // eslint-disable-line import/prefer-default-export
  return (dispatch) => {
    dispatch(_requestSaveItem()); // advertise we are starting a server request
    console.log('Action saveItem() - item:', item);
    return fetch(`${process.env.HOST}/api/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item }, null, 4),
    })
      .then((response) => {
        console.log('fetch result: ', response);
        if (response && response.ok) {
          // returns the item given by the server (async)
          response.json()
          .then((json) => { dispatch(_successSavingItem(json.item)); });
          return;
        }
        // this.onEndSavingFailed('01');
        const error = new Error('fetch OK but returned nothing or an error (request: post /api/items');
        error.name = 'ErrorCaught';
        throw (error);
      })
      .catch((error) => {
        // if (error.name !== 'ErrorCaught') this.onEndSavingFailed('02');
        // logAddItemContainer.error(error.message);
        dispatch(_errorSavingItem(error.message));
      });
  };
}



//
// Update item to Server (in Action) and update Redux store with updated item (in Reducer)
//

function _requestUpdateItem() { return { type: c.REQUEST_UPDATE_ITEM }; }
function _successUpdatingItem(item) { return { type: c.UPDATE_ITEM_OK, item }; }
function _errorUpdatingItem(message) { return { type: c.UPDATE_ITEM_KO, error: message }; }

export function updateItem(id, updates) { // eslint-disable-line import/prefer-default-export
  return (dispatch) => {
    dispatch(_requestUpdateItem()); // advertise we are starting a server request
    console.log('Action updateItem() - item:', id, JSON.stringify({ item: updates }, null, 4));
    return fetch(`${process.env.HOST}/api/items/id/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ item: updates }, null, 4),
    })
      .then((response) => {
        console.log('fetch result: ', response);
        if (response && response.ok) {
          // returns the item given by the server (async)
          response.json()
          .then((json) => { dispatch(_successUpdatingItem(json.item)); });
          return;
        }
        // this.onEndSavingFailed('01');
        const error = new Error('fetch OK but returned nothing or an error (request: post /api/items/id/id');
        error.name = 'ErrorCaught';
        throw (error);
      })
      .catch((error) => {
        // if (error.name !== 'ErrorCaught') this.onEndSavingFailed('02');
        // logAddItemContainer.error(error.message);
        dispatch(_errorUpdatingItem(error.message));
      });
  };
}



//
// Delete item on Server (in Action) and update Redux store by deleting the item (in Reducer)
// Then update all the marks previously attached the removed item
// and attach them to a backup item
//

function _requestDeleteItem() { return { type: c.REQUEST_DELETE_ITEM }; }
function _successDeletingItem(id) { return { type: c.DELETE_ITEM_OK, id }; }
function _errorDeletingItem(message) { return { type: c.DELETE_ITEM_KO, error: message }; }
function _requestBackupingOrphans() { return { type: c.REQUEST_BACKUP_ORPHANS }; }
function _successBackupingOrphans(nbOrphansBackedUp) { return { type: c.BACKUP_ORPHANS_OK, nbOrphansBackedUp }; }
function _errorBackupingOrphans(message) { return { type: c.BACKUP_ORPHANS_OK, error: message }; }



//
// Set the default item in the dropdown list
// Used in rating: rated item is set as default
// (only for current session, so server saving!)
//

export function requestSetDefaultItem(id) { return { type: c.REQUEST_SET_DEFAULT_ITEM, id }; }





// Once the item is deleted,
// we can updating all the marks that were previously attached to this item
// and changed their items to the backupItemId
export function backupOrphans(id, backupItemId) { // eslint-disable-line import/prefer-default-export
  return (dispatch) => {
    dispatch(_requestBackupingOrphans()); // advertise we are starting a server request
    console.log('Action backupOrphans() - id, backupItemId:', id, backupItemId);
    return fetch(`${process.env.HOST}/api/markAggregates/bulkUpdates?conditions={"item": "${id}"}&changes={"$set":{"item":"${backupItemId}"}}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        console.log('bulkUpdates result: ', response);
        if (response && response.ok) {
          // returns the item given by the server (async)
          response.json()
          .then((json) => { dispatch(_successBackupingOrphans(json.nbOrphansBackedUp)); });
          return;
        }
        // this.onEndSavingFailed('01');
        const error = new Error('fetch OK but returned nothing or an error (request: post /api/markAggregates/bulkUpdates');
        error.name = 'ErrorCaught';
        throw (error);
      })
      .catch((error) => {
        // if (error.name !== 'ErrorCaught') this.onEndSavingFailed('02');
        // logAddItemContainer.error(error.message);
        dispatch(_errorBackupingOrphans(error.message));
      });
  };
}

export function deleteItem(id, backupItemId) { // eslint-disable-line import/prefer-default-export
  return (dispatch) => {
    dispatch(_requestDeleteItem()); // advertise we are starting a server request
    console.log('Action deleteItem() - item, backupItemId:', id, backupItemId);
    return fetch(`${process.env.HOST}/api/items/id/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        console.log('delete result: ', response);
        if (response && response.ok) {
          // returns the item given by the server (async)
          dispatch(_successDeletingItem(id));
        }
        // this.onEndSavingFailed('01');
        const error = new Error('fetch OK but returned nothing or an error (request: delete /api/items/id/id');
        error.name = 'ErrorCaught';
        throw (error);
      })
      .catch((error) => {
        // if (error.name !== 'ErrorCaught') this.onEndSavingFailed('02');
        // logAddItemContainer.error(error.message);
        dispatch(_errorDeletingItem(error.message));
      });
  };
}
