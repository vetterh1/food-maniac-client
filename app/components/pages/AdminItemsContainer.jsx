/* eslint-disable react/forbid-prop-types */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Container, Row, Table } from 'reactstrap';
import Alert from 'react-s-alert';
import AdminOneItem from './AdminOneItem';
import AdminItemModal from './AdminItemModal';
import AddItemContainer from '../pages/AddItemContainer';
import * as itemsActions from '../../actions/itemsActions';


class AdminItemsContainer extends React.Component {
  static propTypes = {
    // Injected by redux-store connect:
    items: PropTypes.object.isRequired, // load the object and not just the array (in the object) to get redux info (isSaving...)
    kinds: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
  };

  constructor(props) {
    super(props);

    this.alert = null;

    this.state = {
      currentItem: null,
      currentKind: null,
      currentCategory: null,
      currentNbAggregateMarks: null,
      modalEditItemOpened: false,
      modalAddItemOpened: false,
    };
  }


  //
  // Alerting (for various actions: update, delete,...)
  //

  onStartUpdating = () => {
    this._nowStartUpdating = new Date().getTime();
    this.alert = Alert.info('Updating...');
  }

  onEndUpdatingOK = () => {
    const durationUpdating = new Date().getTime() - this._nowStartUpdating;
    this.alert = Alert.success(`Updated! (duration=${durationUpdating}ms)`);
  }

  onEndUpdatingFailed = (errorMessage) => {
    const durationUpdating = new Date().getTime() - this._nowStartUpdating;
    this.alert = Alert.error(`Error while updating (error=${errorMessage}, duration=${durationUpdating}ms)`);
  }


  onStartDeleting = () => {
    this._nowStartDeleting = new Date().getTime();
    this.alert = Alert.info('Deleting...');
  }

  onEndDeletingOK = () => {
    const duration = new Date().getTime() - this._nowStartDeleting;
    this.alert = Alert.success(`Item deleted! (duration=${duration}ms)`);
  }

  onEndDeletingFailed = (errorMessage) => {
    const duration = new Date().getTime() - this._nowStartDeleting;
    this.alert = Alert.error(`Error while deleting (error=${errorMessage}, duration=${duration}ms)`);
  }

  onStartBackupingOrphans = () => {
    this._nowStartackupingOrphans = new Date().getTime();
    this.alert = Alert.info('Updating orphan marks...');
  }

  onEndBackupingOrphansOK = (nbOrphans) => {
    const duration = new Date().getTime() - this._nowStartackupingOrphans;
    this.alert = Alert.success(`Orphan marks are now linked to new item! (nb orphans: ${nbOrphans} - duration=${duration}ms)`);
  }

  onEndBackupingOrphansFailed = (errorMessage) => {
    const duration = new Date().getTime() - this._nowStartackupingOrphans;
    this.alert = Alert.error(`Error while relinking orphan marks (error=${errorMessage}, duration=${duration}ms)`);
  }




  //
  // Props update, here just for Alerting changes (from redux actions)
  //

  componentWillReceiveProps(nextProps) {
    console.log('AdminItemsContainer.componentWillReceiveProps - (nextProps, crtProps): ', nextProps, this.props);

    if (!nextProps || !nextProps.items || !this.props.items ) return;

    // End of updating? (status update switches from true to false)
    if (this.props.items.isUpdating === true && nextProps.items.isUpdating === false) {
      if (nextProps.items.error === null) this.onEndUpdatingOK();
      else this.onEndUpdatingFailed(nextProps.items.error);
    }

    // End of deleting? (status delete switches from true to false)
    if (this.props.items.isDeleting === true && nextProps.items.isDeleting === false) {
      if (nextProps.items.error === null) this.onEndDeletingOK();
      else this.onEndDeletingFailed(nextProps.items.error);
    }
    // End of backuping orphans? (status delete switches from true to false)
    if (this.props.items.isBackupingOrphans === true && nextProps.items.isBackupingOrphans === false) {
      if (nextProps.items.error === null) this.onEndBackupingOrphansOK(nextProps.items.nbOrphansBackedUp);
      else this.onEndBackupingOrphansFailed(nextProps.items.error);
    }
  }






  onItemClick(item, kind, category) {
    const currentItem = Object.assign({}, item);
    const currentKind = Object.assign({}, kind);
    const currentCategory = Object.assign({}, category);
    console.log('AdminItemsContainer.onItemClick - currentItem, currentKind, currentCategory =', currentItem, currentKind, currentCategory);

    // Retreive the number of aggregate marks associated with this item
    // async method --> change the state only when answer received
    // (that state change will display the modal)
    fetch(`${process.env.GATEWAY}/api/markAggregates/count?conditions={"item":"${currentItem.id}"}`)
      .then(response => response.json())
      .then(json => this.setState({ modalEditItemOpened: true, currentItem, currentKind, currentCategory, currentNbAggregateMarks: json.count }))
      .catch(() => this.setState({ modalEditItemOpened: true, currentItem, currentKind, currentCategory, currentNbAggregateMarks: -1 }));
  }


  onUpdateModal(newState) {
    this.setState({ modalEditItemOpened: false });
    console.log('AdminItemsContainer.onUpdateModal - newState =', newState);
    if (!Object.keys(newState).length) this.alert = Alert.info('nothing to update...');
    this.onStartUpdating();
    const { dispatch } = this.props;  // Injected by react-redux
    const action = itemsActions.updateItem(this.state.currentItem.id, newState);
    dispatch(action);
  }

  onDeleteModal(backupItemId) {
    this.setState({ modalEditItemOpened: false });
    console.log('AdminItemsContainer.onDeleteModal - backupItemId =', backupItemId);
    this.onStartDeleting();
    const { dispatch } = this.props;  // Injected by react-redux
    dispatch(itemsActions.deleteItem(this.state.currentItem.id, backupItemId))
    .then(() => {
      this.onStartBackupingOrphans();
      return dispatch(itemsActions.backupOrphans(this.state.currentItem.id, backupItemId));
    });
  }

  onCancelModal() {
    this.setState({ modalEditItemOpened: false });
  }

  onRequestAddItem() {
    this.setState({ modalAddItemOpened: true });
  }

  onCloseModalAddItem() {
    this.setState({ modalAddItemOpened: false });
  }


  render() {
    console.log('AdminItemsContainer.render - currentItem, currentKind, currentCategory = ', this.state.currentItem, this.state.currentKind, this.state.currentCategory);
    if (!this.props.items.items || !this.props.kinds || !this.props.categories) return null;

    return (
      <div>
        <Container fluid>

          <Row className="mt-3">
            <Button color="link" onClick={this.onRequestAddItem.bind(this)} size="md">Add new item...</Button>
          </Row>

          <Row className="mt-3">
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Id</th>
                  <th>Kind</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {this.props.items.items.map((item, index) => {
                  const kind = this.props.kinds.find((oneKind) => { return oneKind.id === item.kind; });
                  const category = this.props.categories.find((oneCategory) => { return oneCategory.id === item.category; });
                  return (<AdminOneItem item={item} index={index} key={item._id} kind={kind} category={category} onClick={this.onItemClick.bind(this)} />);
                })}
              </tbody>
            </Table>
          </Row>
        </Container>
        { (this.state.currentItem && this.state.currentKind && this.state.currentCategory) &&
          <AdminItemModal
            open={this.state.modalEditItemOpened}
            item={this.state.currentItem}
            kind={this.state.currentKind}
            category={this.state.currentCategory}
            items={this.props.items.items}
            kinds={this.props.kinds}
            nbAggregateMarks={this.state.currentNbAggregateMarks}
            categories={this.props.categories}
            onUpdate={this.onUpdateModal.bind(this)}
            onDelete={this.onDeleteModal.bind(this)}
            onCancel={this.onCancelModal.bind(this)}
          />
        }
        <AddItemContainer
          open={this.state.modalAddItemOpened}
          onClose={this.onCloseModalAddItem.bind(this)}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    kinds: state.kinds.kinds,
    categories: state.categories.categories,
    items: state.items, // load the object and not just the array (in the object) to get redux info (isSaving...)
  };
};

export default connect(mapStateToProps)(AdminItemsContainer);
