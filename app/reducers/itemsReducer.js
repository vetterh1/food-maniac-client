import * as c from '../utils/constants';

const initialState = { // define initial state - an empty items list
  items: [],
  isFetching: false,
  isSaving: false,
  isUpdating: false,
  isDeleting: false,
  isBackupingOrphans: false,
  isValid: true,
  error: null,
};

const itemsReducer = (state = initialState, action) => {
  switch (action.type) {

  //
  // Fetch items from Server to Redux store (in Action)
  //

  case c.REQUEST_ITEMS: return Object.assign({}, state, { isFetching: true, isValid: false, error: null });
  case c.RECEIVE_ITEMS: return Object.assign({}, state, { isFetching: false, isValid: true, error: null, items: action.items });
  case c.ERROR_REQUESTING_ITEMS: return Object.assign({}, state, { isFetching: false, isValid: false, error: action.error, items: [] });


  //
  // Save item to Server (in Action) and update Redux store with new item (in Reducer)
  //

  case c.REQUEST_SAVE_ITEM: return Object.assign({}, state, { isSaving: true, error: null });
  case c.SAVE_ITEM_OK: {
    // Add the new item to the redux store so we don't need to reload from server to access it
    const newItems = [action.item, ...state.items];
    const newState = { ...state, isSaving: false, error: null, items: newItems, defaultItem: action.item.id };
    console.log('itemsReducer (SAVE_ITEM_OK) - newState=', newState);
    return newState;
  }
  case c.SAVE_ITEM_KO: return Object.assign({}, state, { isSaving: false, error: action.error });


  //
  // Update item to Server (in Action) and update Redux store with updated item (in Reducer)
  //

  case c.REQUEST_UPDATE_ITEM: return Object.assign({}, state, { isUpdating: true, error: null });
  case c.UPDATE_ITEM_OK: {
    // Update the item in the redux store so we don't need to reload from server to have its update state
    const newItems = state.items.map((item) => { return (item.id === action.item.id) ? action.item : item; });
    const newState = { ...state, isUpdating: false, error: null, items: newItems };
    console.log('itemsReducer (UPDATE_ITEM_OK) - newState=', newState);
    return newState;
  }
  case c.UPDATE_ITEM_KO: return Object.assign({}, state, { isUpdating: false, error: action.error });


  //
  // Delete item on Server (in Action) and update Redux store by deleting the item (in Reducer)
  // Then update all the marks previously attached the removed item
  // and attach them to a backup item
  //

  case c.REQUEST_DELETE_ITEM: return Object.assign({}, state, { isDeleting: true, error: null });
  case c.DELETE_ITEM_OK: {
    // Deletes the item in the redux store so we don't need to reload from server to have a list without it
    const newItems = state.items.filter((item) => { /* console.log('map:', item.id, action.id); */ return item.id !== action.id; });
    const newState = { ...state, isDeleting: false, error: null, items: newItems };
    console.log('itemsReducer (DELETE_ITEM_OK) - id, newState=', action.id, newState);
    return newState;
  }
  case c.DELETE_ITEM_KO: return Object.assign({}, state, { isDeleting: false, error: action.error });


  //
  // Set the default item in the dropdown list
  // Used in rating: rated item is set as default
  // (only for current session, so server saving!)
  //

  case c.REQUEST_SET_DEFAULT_ITEM: return Object.assign({}, state, { defaultItem: action.id });




  case c.REQUEST_BACKUP_ORPHANS: return Object.assign({}, state, { isBackupingOrphans: true, error: null });
  case c.BACKUP_ORPHANS_OK: return Object.assign({}, state, { isBackupingOrphans: false, nbOrphansBackedUp: action.nbOrphansBackedUp, error: null });
  case c.BACKUP_ORPHANS_KO: return Object.assign({}, state, { isBackupingOrphans: false, error: action.error });

  default: return state;
  }
};

export default itemsReducer;