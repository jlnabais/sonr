(function() {
	'use strict';

	var SERVER = 'http://acor.sl.pt:6699/fetch';

	var FLOOR = 'assets/floorplan.png';
	var MARKER_TEMPLATE = 'assets/marker-{TPL}.png';

	var REFRESH_INTERVAL = 5000;

	var counter = document.getElementById('counter');

	var allMarkersElem = document.getElementById('allMarkers');
	var ALL_MARKERS = allMarkersElem.checked;
	allMarkersElem.onchange = function() { ALL_MARKERS = this.checked; }

	var applyOffsetElem = document.getElementById('applyOffset');
	var IS_APPLY_OFFSET = applyOffsetElem.checked;
	applyOffsetElem.onchange = function() { IS_APPLY_OFFSET = this.checked; }

	var coffee = {lng: -9.178360998630525, lat: 38.70172887394747};
	var brpl = {lng: -9.178474992513658, lat: 38.70181260297325};
	var nabais = {lng: -9.178504496812822, lat: 38.70179690378836};
	var offset = {lng: nabais.lng - brpl.lng, lat: nabais.lat - brpl.lat};
	function applyOffset(latlng) {
		if (!latlng) { return; }

		return {
			lat: latlng.lat - (IS_APPLY_OFFSET ? offset.lat : 0),
			lng: latlng.lng - (IS_APPLY_OFFSET ? offset.lng : 0),
			unc: latlng.unc
		}
	}

	var R = 1;
	var APs = [
		[ -9.178481698036196, 38.70171840781236 ], // cisco
		[ -9.17857959866524,  38.70185237422613 ], // it
		[ -9.178339540958406, 38.70180632329972 ], // window behind sonae's booth
		[ -9.178427383303644, 38.7019172641176 ]   // window near unbabel
	];

	function P(a) { return L.latLng(a[1], a[0]); }

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
			} else {
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

	function genIcon(color, url) {
		return L.icon({
			iconUrl: url || MARKER_TEMPLATE.replace('{TPL}', color),
			iconSize: url ? [40, 40] : [25, 41],
			iconAnchor: url ? [20, 40] : [12, 40],
			popupAnchor: url ? [0, -30] : [0, -30]
		});
	}

	var KNOW_DEVICES = {
		// 'c0:ee:fb:59:7c:4a': [genIcon('green'), 'nabais'],
		'cc:fa:00:c5:fb:ff': [genIcon('red'), 'tavares'],
		// 'b8:6b:23:de:eb:8e': [genIcon('magenta'), 'PC tavares'],
		// 'c0:ee:fb:24:3b:c6': [genIcon('yellow'), 'vitó'],
		// 'e8:50:8b:d9:62:f0': [genIcon('cyan'), 'ze pedro']
	}

	var iconBlue = [genIcon('blue'), 'cenas'];

	function ajax(o) {
		var xhr = new XMLHttpRequest();

		if (o.withCredentials) { xhr.withCredentials = true; }

		xhr.open(o.method || 'GET', o.url, true);

		// xhr.timeout = o.timeout || 60 * 1000;

		var cbInner = function() {
			if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
				return o.cb(null, JSON.parse(xhr.response));
			}

			o.cb('error requesting ' + o.url);
		};

		xhr.onload  = cbInner;
		xhr.onerror = cbInner;
		xhr.ontimeout = cbInner;

		xhr.send(o.body || null);
	}

	var ajaxObject = {
		url: SERVER,
		timeout: REFRESH_INTERVAL / 10,
		cb: function(err, o) {
			if (err) {
				setTimeout(ajax.bind(null, ajaxObject), REFRESH_INTERVAL);

				return console.error(err);
			}

			markers.clearLayers();
			heat.setLatLngs([]);

			var count = 0;

			for (var clientMac in o) {
				if (!o.hasOwnProperty(clientMac)) { continue; }

				var clientAPsinfo = o[clientMac];

				var lat = 0;
				var lng = 0;
				var minUnc = Number.MAX_VALUE;

				for (var apMac in clientAPsinfo.aps) {
					if (!clientAPsinfo.aps.hasOwnProperty(apMac)) { continue; }

					var clientAPinfo = clientAPsinfo.aps[apMac];

					var latlng = applyOffset(clientAPinfo.location);

					if (!latlng || latlng.unc >= minUnc) { continue; }

					minUnc = latlng.unc;

					lat = latlng.lat;
					lng = latlng.lng;
				}

				if (!lat && !lng) { continue; }

				count++;

				heat.addLatLng(L.latLng(lat, lng));

				// dev.location.lat += G();
				// dev.location.lng += G();

				var iconColor = clientAPsinfo.userData && clientAPsinfo.userData.avatar && [genIcon(null, clientAPsinfo.userData.avatar), clientAPsinfo.userData.username] ||
					KNOW_DEVICES[clientMac] ||
					ALL_MARKERS && iconBlue;

				if (!iconColor) { continue; }

				console.log(iconColor[1], apMac, [lat, lng, minUnc, new Date(new Date - clientAPsinfo.lastUpdated)]);

				var marker = L.marker([lat, lng], {
						icon: iconColor[0]
					})
					.bindPopup(clientMac + ' - ' + iconColor[1] + ' (' + minUnc + ')');
				markers.addLayer(marker);
			}

			counter.innerHTML = count;

			setTimeout(ajax.bind(null, ajaxObject), REFRESH_INTERVAL);
		}
	};

	ajax(ajaxObject);

	var X = 38.7019685480224;
	var Y = -9.178611785173418;
	var Z = 20;

	var map = L.map('map').setView([X, Y], Z);
	map.doubleClickZoom.disable();
	map.on('click', function(ev) {
		console.log('click', [ev.latlng.lng, ev.latlng.lat]);
	});

	var markers = new L.FeatureGroup();
	map.addLayer(markers);

	genCircle(APs[0], '#0FF');
	genCircle(APs[1], '#F0F');
	genCircle(APs[2], '#077');
	genCircle(APs[3], '#707');

	var tl = P([-9.178551435470583, 38.70153943666488 ]); // RED
	var tr = P([-9.179044961929323, 38.70215065791783 ]); // GREEN
	var bl = P([-9.178135693073274, 38.701748759599965 ]); // BLUE

	var plant = L.imageOverlay.rotated(FLOOR, tl, tr, bl, {
		interactive: false
	});
	plant.addTo(map);

	var heat = L.heatLayer([], {radius: 25}).addTo(map);
})();
