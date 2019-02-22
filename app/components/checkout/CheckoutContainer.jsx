/* eslint-disable no-class-assign */
/* eslint-disable react/forbid-prop-types */

import * as log from 'loglevel';
import React from 'react';
import PropTypes from 'prop-types';
import ChechoutForm from './CheckoutForm';
import CheckoutConfirmForm from './CheckoutConfirmForm';

class CheckoutContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      editMode: true,
      amount: 0,
      orderId: '',
      hash: null,
      sendingToOgone: false,
    };
  }


  onCancel() {
    this.setState({ editMode: true });
    this.props.onClose();
  }

  onBack() {
    this.setState({ editMode: true });
  }

  onReset() {
    this.setState({ editMode: true });
  }


  onContinue(data) {
    this.setState({ editMode: false, amount: data.amount, orderId: data.orderId });

    // Call Server to get the hash
    fetch(`${process.env.GATEWAY}/util/computeHash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ PSPID: 'VETTERH1', AMOUNT: data.amount, CURRENCY: 'EUR', ORDERID: data.orderId }),
    })
      .then(response => response.json())
      .then(json => this.setState({ hash: json.hashResult }))
      .catch(() => this.setState({ hash: null }));    
  }






  render() {
    return (
      <div>
        <ChechoutForm
          ref={(r) => { this._childComponent = r; }}
          onContinue={this.onContinue.bind(this)}
          onReset={this.onReset.bind(this)}
          editMode={this.state.editMode}
        />      
        { !this.state.editMode && this.state.hash && 
          <CheckoutConfirmForm
            pspid='VETTERH1'
            amount={this.state.amount}
            currency='EUR'
            orderId={this.state.orderId}
            shasign={this.state.hash}
            onBack={this.onBack.bind(this)}
            /> }
      </div>
    );
  }

}

export default CheckoutContainer;
