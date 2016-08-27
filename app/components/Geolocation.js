import React, { Component } from 'react';

const GeolocationDisplay = (props) => 
  <div>
    <div className="geolocation_display {props.real ? geolocation_display_ok : geolocation_display_ko}">
      Latitude: {props.latitude ? props.latitude : "unknown"}<br />
      Longitude: {props.longitude ? props.longitude : "unknown"}<br /> 
      {/* Real: {props.real?"true":"false"} */}
    </div>
    <div className="geolocation_statistics">
      Statistics:
      <ul>
        <li>Nb refreshes: {props.nbRefreshes}</li>
        <li>Nb different positions: {props.nbDiffs}</li>
        <li>Nb real positions: {props.nbReal}</li>
        <li>Nb estimated positions: {props.nbEstimated}</li>
      </ul>
    </div>
  </div>;





export default React.createClass({

  watchID: (null: ?number),

  getInitialState: function() {
    return {
      position: {latitude: null, longitude: null, real: false },
      statistics: { nbRefreshes: 0, nbDiffs: 0, nbReal: 0, nbEstimated: 0 }
    };
  },

  noPosition: function() {
    let position = this.state.position;
    let statistics = this.state.statistics;
    position.real = false;
    if( position.latitude != null && position.longitude != null )
      statistics.nbEstimated++;
    this.setState({
      position: position, 
      statistics: statistics
    });
  },

  componentDidMount: function() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let statistics = this.state.statistics;
        statistics.nbReal++;
        this.setState({
          position: {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude, 
            real: true 
          }, 
          statistics: statistics
        });
      },
      (error) => noPosition(),
      {enableHighAccuracy: true, timeout: 3000, maximumAge: 30000}
    );
    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        let current = {
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude, 
          real: true
        };
        let statistics = this.state.statistics;
        statistics.nbRefreshes++;
        statistics.nbReal++;
        if( current.latitude != this.state.position.latitude || 
            current.longitude != this.state.position.longitude ){
          statistics.nbDiffs++;
        }
        this.setState({ 
          position: current, 
          statistics: statistics
        });
      },
      (error) => noPosition()
    );
  },

  componentWillUnmount: function() {
    navigator.geolocation.clearWatch(this.watchID);
  },

  render () {
    let displayLatitude = Math.round(this.state.position.latitude * 10000) / 10000;
    let displayLongitude = Math.round(this.state.position.longitude * 10000) / 10000;
    return (
      <GeolocationDisplay 
        latitude={displayLatitude} 
        longitude={displayLongitude} 
        real={this.state.position.real}
        nbRefreshes={this.state.statistics.nbRefreshes} 
        nbDiffs={this.state.statistics.nbDiffs} 
        nbReal={this.state.statistics.nbReal} 
        nbEstimated={this.state.statistics.nbEstimated} />
    );
  }
});
