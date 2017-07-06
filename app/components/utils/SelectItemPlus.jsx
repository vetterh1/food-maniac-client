/* eslint-disable react/forbid-prop-types */

import * as log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
import { MatchMediaHOC } from 'react-match-media';
import { Button, Card, CardTitle, Col, Collapse, Label, Modal, ModalHeader, ModalBody, Row } from 'reactstrap';
import MdFilterList from 'react-icons/lib/md/filter-list';
import MdPlaylistAdd from 'react-icons/lib/md/playlist-add';
// import MdLocalRestaurant from 'react-icons/lib/md/local-restaurant';
import MdRoomService from 'react-icons/lib/md/room-service';
import SimpleListOrDropdown from '../utils/SimpleListOrDropdown';
import { loglevelServerSend } from '../../utils/loglevel-serverSend';

const logSelectItemPlus = log.getLogger('logSelectItemPlus');
loglevelServerSend(logSelectItemPlus); // a setLevel() MUST be run AFTER this!
logSelectItemPlus.setLevel('debug');

const CollapseOnLargeScreens = MatchMediaHOC(Collapse, '(min-width: 576px)');
const ModalOnSmallScreens = MatchMediaHOC(Modal, '(max-width: 575px)');


class SelectItemPlus extends React.Component {
  static propTypes = {
    title: PropTypes.string,
    hideItem: PropTypes.bool,
    onAddItem: PropTypes.func,
    kinds: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    items: PropTypes.array,
    defaultItem: PropTypes.string,
    onChangeKind: PropTypes.func,
    onChangeCategory: PropTypes.func,
    onChangeItem: PropTypes.func,
    categoryPlaceHolder: PropTypes.string,
    kindPlaceHolder: PropTypes.string,
    itemPlaceHolder: PropTypes.string,
  }

  constructor(props) {
    super(props);

    this.defaultState = {
      // Selected Kind & Category:
      kind: '',
      category: '',
      item: this.props.defaultItem || '',
      collapseFilters: false,
    };

    this.state = {
      // Items received from redux-store
      // and stored in state as it's altered by kind & category filters
      fullItemsList: props.items,
      filteredItemsList: props.items,

      // Empty marks, kind, categories & items:
      ...this.defaultState,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps) return;

    // Check if full item list has changed. If yes: update it & reset default item
    if (nextProps.items && nextProps.items.length > 0 && nextProps.items !== this.state.fullItemsList) {
      this.setState({
        fullItemsList: nextProps.items,
        filteredItemsList: nextProps.items,
        item: nextProps.defaultItem || '',
      });
      // If default item, tell parent about it so it can enable the Submit btn
      if (nextProps.defaultItem) {
        this.props.onChangeItem(nextProps.defaultItem);
      }
    }
  }


  onChangeKind(event) {
    if (this.state.kind === event.target.value) return;
    this.setState({ kind: event.target.value, filteredItemsList: this.getVisibleItems(event.target.value, this.state.category) });
    if (this.props.onChangeKind) this.props.onChangeKind(event.target.value);
  }

  onChangeCategory(event) {
    if (this.state.category === event.target.value) return;
    this.setState({ category: event.target.value, filteredItemsList: this.getVisibleItems(this.state.kind, event.target.value) });
    if (this.props.onChangeCategory) this.props.onChangeCategory(event.target.value);
  }

  onChangeItem(event) {
    if (this.state.item === event.target.value) return;
    this.setState({ item: event.target.value });
    if (this.props.onChangeItem) this.props.onChangeItem(event.target.value);
  }


  // return the filtered list
  getVisibleItems(kind, category) {
    return this.state.fullItemsList.filter((item) => {
      const kindCondition = (kind && kind !== undefined && kind !== '' ? item.kind === kind : true);
      const categoryCondition = (category && category !== undefined && category !== '' ? item.category === category : true);
      return kindCondition && categoryCondition;
    });
  }


  toggleFilters() {
    this.setState({ collapseFilters: !this.state.collapseFilters });
  }


  // Reset the 3 dropdowns:
  reset() {
    this.setState(Object.assign({
      // Reset with full list of items,
      fullItemsList: this.props.items,
      filteredItemsList: this.props.items,
    },
    // Reset selected category, kind & item:
    this.defaultState,
    ));
  }


  renderFiltersBody(showCloseButton = true) {
    return (
      <div>
        <Row>
          <Col xs={12} sm={3} md={2} >
            <Label size="md">Category</Label>
          </Col>
          <Col xs={12} sm={9} md={10} >
            <SimpleListOrDropdown
              items={this.props.categories}
              dropdownPlaceholder={this.props.categoryPlaceHolder}
              selectedOption={this.state.category}
              onChange={this.onChangeCategory.bind(this)}
              dropdown
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={3} md={2} >
            <Label size="md">Kind</Label>
          </Col>
          <Col xs={12} sm={9} md={10} >
            <SimpleListOrDropdown
              items={this.props.kinds}
              dropdownPlaceholder={this.props.kindPlaceHolder}
              selectedOption={this.state.kind}
              onChange={this.onChangeKind.bind(this)}
              dropdown
            />
          </Col>
        </Row>
        { showCloseButton &&
          <Row>
            <Col style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button color="primary" size="md" onClick={this.toggleFilters.bind(this)}>Close</Button>
            </Col>
          </Row>
        }
      </div>
    );
  }


  render() {
    logSelectItemPlus.debug(`render SelectItemPlus: (category=${this.state.category}, kind=${this.state.kind}, item=${this.state.item}`);
    return (
      <div>
        {this.props.title && <h5 className="mb-3"><MdRoomService size={24} className="mr-2 hidden-sm-up" /> {this.props.title}</h5>}

        {!this.props.hideItem &&
          <Row className="form-block" noGutters>
            <Col sm={2}>
              <Row style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="homepage-feature-icon hidden-xs-down"><MdRoomService size={48} /></div>
              </Row>
              <Row style={{ display: 'flex', justifyContent: 'center' }}>
                <Label size="md" className="hidden-xs-down">Item</Label>
              </Row>
            </Col>
            <Col xs={12} sm={10}>
              <Row>
                <Col xs={12} className="">
                  <SimpleListOrDropdown
                    items={this.state.filteredItemsList}
                    dropdownPlaceholder={this.props.itemPlaceHolder}
                    selectedOption={this.state.item}
                    onChange={this.onChangeItem.bind(this)}
                    dropdown
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={6} sm={4} className="">
                  <Button block color="secondary" size="sm" onClick={this.toggleFilters.bind(this)}><MdFilterList className="mr-2" size={24} /> Filters</Button>
                </Col>
                {this.props.onAddItem &&
                  <Col xs={6} sm={4} >
                    <Button block color="secondary" size="sm" onClick={this.props.onAddItem}><MdPlaylistAdd className="mr-2" size={24} /> Add</Button>
                  </Col>
                }
              </Row>
              <CollapseOnLargeScreens isOpen={this.state.collapseFilters}>
                <Row>
                  <Col xs={12} sm={10} className="pl-0 pt-4" >
                    <Card block>
                      <CardTitle className="mb-4">Filter items</CardTitle>
                      {this.renderFiltersBody()}
                    </Card>
                  </Col>
                </Row>
              </CollapseOnLargeScreens>
              <ModalOnSmallScreens className="hidden-md-up" isOpen={this.state.collapseFilters} toggle={this.toggleFilters.bind(this)}>
                <ModalHeader toggle={this.toggleFilters.bind(this)}>Filter items</ModalHeader>
                <ModalBody>
                  {this.renderFiltersBody()}
                </ModalBody>
              </ModalOnSmallScreens>
            </Col>
          </Row>
        }

        {this.props.hideItem &&
          <div>
            {this.renderFiltersBody(false)}
          </div>
        }


      </div>
    );
  }
}




SelectItemPlus.defaultProps = {
  title: null,
  hideItem: false,
  onAddItem: null,
  onChangeKind: null,
  onChangeCategory: null,
  onChangeItem: null,
  items: [],
  defaultItem: null,
  categoryPlaceHolder: 'All',
  kindPlaceHolder: 'All',
  itemPlaceHolder: 'Select an item...',
};


export default SelectItemPlus;
