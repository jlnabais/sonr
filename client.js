(function() {

  'use strict';



  var SERVER = 'http://acor.sl.pt:6699/fetch';

  var FLOOR = 'assets/floorplan.png';

  var MARKER_TEMPLATE = 'assets/marker-{TPL}.png';

  var MAC_TEST_DEVICE = 'cc:fa:00:c6:02:c6'; // nexus5

  var APs = [
    [ -9.178481698036196, 38.70171840781236 ], // cisco
    [ -9.17857959866524,  38.70185237422613 ], // it
    [ -9.178339540958406, 38.70180632329972 ], // window behind sonae's booth
    [ -9.178427383303644, 38.7019172641176 ]   // window near unbabel
  ];
  var R = 1;



  function genCircle(llArr, clr) {
    var ll = L.latLng(llArr[1], llArr[0]);
    L.circle(ll, R, {fillColor:clr, stroke:false, fillOpacity:0.8}).addTo(map);
  }

  function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
      var y1;
      if (use_last) {
        y1 = y2;
        use_last = false;
      }
      else {
        var x1, x2, w;
        do {
          x1 = 2.0 * Math.random() - 1.0;
          x2 = 2.0 * Math.random() - 1.0;
          w  = x1 * x1 + x2 * x2;
        } while (w >= 1.0);
        w = Math.sqrt((-2.0 * Math.log(w))/w);
        y1 = x1 * w;
        y2 = x2 * w;
        use_last = true;
      }
      var retval = mean + stdev * y1;
      return retval;
    }
  }

  var G = gaussian(0, 0.00006);



  function genIcon(color) {
    return L.icon({
      iconUrl: MARKER_TEMPLATE.replace('{TPL}', color),
      iconSize: [25, 41],
      iconAnchor: [12, 40],
      popupAnchor: [0, -30]
    });
  }

  var iconRed = genIcon('red');
  var iconGreen = genIcon('green');
  var iconBlue = genIcon('blue');

  function ajax(o) {
    'use strict';

    var xhr = new XMLHttpRequest();
    if (o.withCredentials) { xhr.withCredentials = true; }
    xhr.open(o.method || 'GET', o.url, true);
    var cbInner = function() {
      if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
        return o.cb(null, JSON.parse(xhr.response));
      }
      o.cb('error requesting ' + o.url);
    };
    xhr.onload  = cbInner;
    xhr.onerror = cbInner;
    xhr.send(o.body || null);
  }

  ajax({
    url: SERVER,
    cb: function(err, o) {
      if (err) { return console.error(err); }
      console.log(o);
      o.data.observations.forEach(function(dev) {
        var latlng = dev.location;
        heat.addLatLng(L.latLng(latlng.lat, latlng.lng));
        //dev.location.lat += G(); dev.location.lng += G();
        var isTestDevice = (dev.clientMac === MAC_TEST_DEVICE);
        //console.log(dev.clientMac, dev.manufacturer, dev.location, dev.rssi);
        if (isNabais) {
          console.log(isNabais, dev.clientMac, dev.manufacturer, dev.location, dev.rssi);
        }

        L.marker([latlng.lat, latlng.lng], {icon:isTestDevice?iconGreen:iconRed})
        .bindPopup(dev.clientMac + ' - ' + dev.manufacturer)
        .addTo(map);
      });
    }
  });

  var X = 38.7019685480224;
  var Y = -9.178611785173418;
  var Z = 20;

  var map = L.map('map').setView([X, Y], Z);
  map.doubleClickZoom.disable();

  map.on('click', function(ev) {
    console.log([ev.latlng.lng, ev.latlng.lat]);
  });

  var osm = new L.TileLayer(
    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      maxZoom: 22,
      attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      style: 997
    }
  );
  osm.addTo(map);

  function P(a) { return L.latLng(a[1], a[0]); }
  var tl = P([ -9.178551435470583, 38.70153943666488 ]); // RED
  var tr = P([ -9.179044961929323, 38.70215065791783 ]); // GREEN
  var bl = P([ -9.178135693073274, 38.701748759599965 ]); // BLUE

  /*var R = 2;
  L.circle(tl, R, {fillColor:'#F00', stroke:false, opacity:1}).addTo(map);
  L.circle(tr, R, {fillColor:'#0F0', stroke:false, opacity:1}).addTo(map);
  L.circle(bl, R, {fillColor:'#00F', stroke:false, opacity:1}).addTo(map);*/

  genCircle(APs[0], '#0FF');
  genCircle(APs[1], '#F0F');
  genCircle(APs[2], '#077');
  genCircle(APs[3], '#707');



  var plant = L.imageOverlay.rotated(FLOOR, tl, tr, bl, {
    //opacity: 0.5,
    interactive: false
  });
  plant.addTo(map);



  // addressPoints = addressPoints.map(function (p) { return [p[0], p[1]]; });
  var heat = L.heatLayer([], {radius: 10}).addTo(map);
  var draw = true;

  /*map.on({
  movestart: function () { draw = false; },
  moveend:   function () { draw = true; },
  mousemove: function (e) {
  if (draw) {
  heat.addLatLng(e.latlng);
}
}
});*/

})();
