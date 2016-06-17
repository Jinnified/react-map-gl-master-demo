// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
'use strict';

var assign = require('object-assign');
var React = require('react');
var d3 = require('d3');
var window = require('global/window');
var alphaify = require('alphaify');
var transform = require('svg-transform');
var Immutable = require('immutable');
var r = require('r-dom');
var cot = require('coordtransform');
var turf = require('turf');
var L = require('leaflet');
var _ = require('lodash');
var async = require('async');
const EventEmitter = require('events');

var MapGL = require('../../src/index.js');
var CanvasOverlay = require('../../src/overlays/canvas.react');
var SVGOverlay = require('../../src/overlays/svg.react');

// San Francisco
const location = require('./../data/cities.json')[2];
const locations = require('./../data/dawenxi_od.json');
// const locations = require('./../data/taxi.json');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

var wiggle = (function _wiggle() {
  var normal = d3.random.normal();
  return function __wiggle(scale) {
    return normal() * scale;
  };
}());

const OverlayExample = React.createClass({
  displayName: 'OverlayExample',

  PropTypes: {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  },

  getInitialState() {
    return { 
      viewport: {
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: 10.8,
        startDragLngLat: null,
        isDragging: false,
        interactive: false
      },
      locations: this._csvToLocations(locations)
    }
  },

  componentDidMount(){
    console.log('this.state.opt', this.state.opt)
    var canvasMap = document.getElementsByClassName('mapboxgl-canvas')[0];
    var map = MapGL.map;
    var viewport = assign({}, this.state.viewport, this.props);

    // console.log('locations', this.state.locations);

    canvasMap.addEventListener('click', (e) => {
      let opt = this.state.opt;
      let amount = 0;
      opt.ctx.clearRect(0, 0, opt.width, opt.height);
      // opt.ctx.strokeStyle = alphaify('#1FBAD6', 0.2);
      opt.ctx.strokeStyle = alphaify('#FFA500', 0.5);
      opt.ctx.lineWidth = 3;
      let pointLatlng = map.unproject([e.clientX, e.clientY]);

      console.log('pointLatlng', pointLatlng);

      let clickedPoint = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [pointLatlng.lat, pointLatlng.lng]
        },
        'properties': {
          'name': 'Null Island'
        }
      };
      
      let oneMileOut = turf.buffer(clickedPoint, 1, 'miles'); //buffer

      _.each(locations, (d)=>{
        let comparator = {
          'type': 'Feature',
          'geometry': {
              'type': 'Point',
              'coordinates': [d['start_lat'], d['start_lon']]
          },
          'properties': {
            'name': 'comparator'
          }
        };

        if(turf.inside(comparator, oneMileOut)) {
          // console.log('in d', d);
          var p1 = opt.project([d['start_lon'], d['start_lat']]);
          // opt.ctx.beginPath();
          var p2 = opt.project([d['stop_lon'], d['stop_lat']]);
          // console.log('p2', p2);
          setTimeout(()=>{
            drawLine();
          }, 30);
        }
        
        function drawLine() {
          amount += 0.05 //duration
            if(amount > 1) {
              amount = 1;
            }
            opt.ctx.moveTo(p1[0], p1[1]);
            // opt.ctx.lineTo(p2[0], p2[1]);
            console.log(p1[0], p1[1], p2[0], p2[1]);

            if(p2[0] > p1[0] && p2[1] < p2[0]) {
              opt.ctx.quadraticCurveTo(p1[0]+40, p1[1]-40, p2[0], p2[1]);
            } else if(p2[0] > p1[0] && p2[1] > p2[0]) {
              opt.ctx.quadraticCurveTo(p1[0]+40, p1[1]+40, p2[0], p2[1]);
            } else if(p2[0] < p1[0] && p2[1] < p2[0]) {
              opt.ctx.quadraticCurveTo(p1[0]-40, p1[1]-40, p2[0], p2[1]);
            } else {
              opt.ctx.quadraticCurveTo(p1[0]-40, p1[1]+40, p2[0], p2[1]);
            }
            
            // opt.ctx.lineTo(p1[0] + (p2[0]-p1[0])*amount, p1[1] + (p2[1] - p1[1])*amount);
            opt.ctx.stroke();
            opt.ctx.beginPath();
            // opt.ctx.fillStyle = alphaify('#1FBAD6', 1);
            opt.ctx.fillStyle = alphaify('#FFFFFF', 1);
            opt.ctx.arc(p2[0], p2[1], 2, 0, 2 * Math.PI);
            opt.ctx.fill();

            opt.ctx.beginPath();
            // opt.ctx.fillStyle = '#FFFFFF';
            // opt.ctx.textAlign = 'center';
        }

      });
    });
  },

  _onChangeViewport(viewport) {
    if (this.props.onChangeViewport) {
      return this.props.onChangeViewport(viewport);
    }
    this.setState({viewport: viewport});
  },

  _csvToLocations(data) {
    return data.map( (d) => [+d.start_lon+0.08, +d.start_lat-0.03, +d.stop_lon+0.08, +d.stop_lat-0.03] );
  },

  _renderOverlays(viewport) {
    // console.log('this state', this.state);
    return [
      r(CanvasOverlay, assign({}, viewport, {
        redraw: function _redrawCanvas(opt) {
            this.state.opt = opt;
            // opt.ctx.clearRect(0, 0, opt.width, opt.height);
            // opt.ctx.strokeStyle = alphaify('#1FBAD6', 0.07);
            // opt.ctx.lineWidth = 2;
            // this.state.locations.forEach((loc, index) => {
            //   // console.info('loc', loc.toArray())
            //   // var p1 = opt.project([location.longitude, location.latitude]);
            //   // console.log('loca', loc);
            //   var p1 = opt.project([loc[0], loc[1]]);
            //   opt.ctx.beginPath();
            //   var p2 = opt.project([loc[2], loc[3]]);
            //   // console.log('p2', p2);
            //   opt.ctx.moveTo(p1[0], p1[1]);
            //   opt.ctx.lineTo(p2[0], p2[1]);
            //   opt.ctx.stroke();
            //   opt.ctx.beginPath();
            //   opt.ctx.fillStyle = alphaify('#1FBAD6', 0.07);
            //   opt.ctx.arc(p2[0], p2[1], 2, 0, 2 * Math.PI);
            //   opt.ctx.fill();
            //   opt.ctx.beginPath();
            //   opt.ctx.fillStyle = '#FFFFFF';
            //   opt.ctx.textAlign = 'center';
            //   // opt.ctx.fillText(index, p2[0], p2[1] + 4);
            // });          
        }.bind(this)
      })),
      // We use invisible SVG elements to support interactivity.
      // r(SVGOverlay, assign({}, viewport, {
      //   redraw: function _redrwaSVGOverlay(opt) {
      //     var p1 = opt.project([location.longitude, location.latitude]);
      //     var style = {
      //       // transparent but still clickable.
      //       fill: 'rgba(0, 0, 0, 0)'
      //     };
      //     return r.g({
      //       style: {
      //         pointerEvents: 'all',
      //         cursor: 'pointer'
      //       }
      //     }, [r.circle({
      //       style: assign({}, style, {stroke: alphaify('#1FBAD6', 0.8)}),
      //       r: 10,
      //       onClick: function onClick() {
      //         var windowAlert = window.alert;
      //         windowAlert('center');
      //       },
      //       transform: transform([{translate: p1}]),
      //       key: 0
      //     })].concat(locations.map(function _map(loc, index) {
      //       return r.circle({
      //         style: style,
      //         r: 6,
      //         onClick: function onClick() {
      //           var windowAlert = window.alert;
      //           windowAlert('dot ' + index);
      //         },
      //         transform: transform([{translate: opt.project(loc.toArray())}]),
      //         key: index + 1
      //       });
      //     }, this)));
      //   }.bind(this)
      // }))
    ];
  },

  render() {
    var viewport = assign({}, this.state.viewport, this.props);
    return r(MapGL, assign({}, viewport, {
      onChangeViewport: this._onChangeViewport
    }), this._renderOverlays(viewport));
  }
});

module.exports = OverlayExample;
