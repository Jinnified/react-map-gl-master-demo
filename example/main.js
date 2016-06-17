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

var document = require('global/document');
var ReactDOM = require('react-dom');
var React = require('react');
var r = require('r-dom');
var window = require('global/window');

var NotInteractiveExample = require('./examples/not-interactive.react');
var ChoroplethExample = require('./examples/choropleth.react');
var CustomExample = require('./examples/custom.react');
const ODSwitch = require('./examples/odswitch');
var GeodataCreator = require('./examples/geodata-creator.react');
var ScatterplotExample = require('./examples/scatterplot.react');
var RouteExample = require('./examples/route.react');
var StyleDiffingExample = require('./examples/style-diffing.react');
var process = require('global/process');

function getAccessToken() {
  var match = window.location.search.match(/access_token=([^&\/]*)/);
  var accessToken = match && match[1];
  if (!accessToken) {
    /* eslint-disable no-process-env */
    accessToken = process.env.MapboxAccessToken;
    /* eslint-enable no-process-env */
  }
  if (accessToken) {
    window.localStorage.accessToken = accessToken;
  } else {
    accessToken = window.localStorage.accessToken;
  }
  return accessToken;
}

var App = React.createClass({

  displayName: 'App',

  render: function render() {
    var common = {
      width: 400,
      height: 400,
      style: {float: 'left'},
      mapboxApiAccessToken: getAccessToken()
    };
    var polylineMapOpt = {
      width: 1920,
      height: 1080,
      style: {float: 'left'},
      mapboxApiAccessToken: getAccessToken(),
      mapStyle: 'mapbox://styles/mapbox/dark-v8'
    }
    return r.div([
      // r(RouteExample, common),
      // r(ScatterplotExample, common),
      // r(ChoroplethExample, common),
      r(CustomExample, polylineMapOpt),
      // r(GeodataCreator, common),
      // r(NotInteractiveExample, common),
      // r(StyleDiffingExample, common)
    ]);
  }
});

const mainContainer = document.createElement('div');
const reactContainer = document.createElement('div');
const screenTitle = document.createElement('div');

const switcher = document.createElement('div');
const switcherDom = '<label><input id="odswitch" type="checkbox" name="odcheckbox" checked>终点分析</label>';
const screenTitleDom = '<h1>出租车OD分析</h1>'

mainContainer.style.position = 'relative';
mainContainer.style['font-family'] = 'Microsoft YaHei';
mainContainer.style['font-size'] = '20px';
mainContainer.style.width = '1920px';
mainContainer.style.height = '1080px';

screenTitle.innerHTML = screenTitleDom;
screenTitle.style.position = 'absolute';
screenTitle.style.top = '20px';
screenTitle.style.left = '40px';
screenTitle.style.color = 'white';

switcher.className = 'odswitcher';
switcher.innerHTML = switcherDom;
switcher.style.color = 'orange';
switcher.style.position = 'absolute';
switcher.style.right = '40px';
switcher.style.top = '20px';
switcher.style.cursor = 'pointer';

reactContainer.className = 'odmap';

document.body.appendChild(mainContainer);
mainContainer.appendChild(reactContainer);
mainContainer.appendChild(switcher);
mainContainer.appendChild(screenTitle);
ReactDOM.render(r(App), reactContainer);
// ReactDom.render(r(App), document.getElementById('app'));