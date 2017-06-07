/**
 * Created by chenweiyi on 19/11/2016.
 */

var _getFeatureLayer = function (url, pointToLayer) {
    var _featureLayer = L.esri.featureLayer({
        url: url,
        pointToLayer: pointToLayer
    });
    return _featureLayer;
}

var map = L.map('map',{editable: true}).setView([38.678, 108.068], 5);
//[31.22, 121.48], 9
L.esri.basemapLayer('DarkGray').addTo(map);

L.EditControl = L.Control.extend({
    options: {
        position: 'topleft',
        callback: null,
        kind: '',
        html: ''
    },
    onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
            link = L.DomUtil.create('a', '', container);
        link.href = '#';
        link.title = 'Create a new ' + this.options.kind;
        link.innerHTML = this.options.html;
        L.DomEvent.on(link, 'click', L.DomEvent.stop)
            .on(link, 'click', function () {
                window.LAYER = this.options.callback.call(map.editTools);
            }, this);
        return container;
    }
});
L.NewLineControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: map.editTools.startPolyline,
        kind: 'line',
        html: '\\/\\'
    }
});
L.NewPolygonControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: map.editTools.startPolygon,
        kind: 'polygon',
        html: '▰'
    }
});
L.NewMarkerControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: map.editTools.startMarker,
        kind: 'marker',
        html: '?'
    }
});
L.NewRectangleControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: map.editTools.startRectangle,
        kind: 'rectangle',
        html: '⬛'
    }
});
L.NewCircleControl = L.EditControl.extend({
    options: {
        position: 'topleft',
        callback: map.editTools.startCircle,
        kind: 'circle',
        html: '⬤'
    }
});
// map.addControl(new L.NewMarkerControl());
map.addControl(new L.NewLineControl());
map.addControl(new L.NewPolygonControl());
map.addControl(new L.NewRectangleControl());
map.addControl(new L.NewCircleControl());

var deleteShape = function (e) {
    if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) this.editor.deleteShapeAt(e.latlng);
};
map.on('layeradd', function (e) {
    if (e.layer instanceof L.Path) e.layer.on('click', L.DomEvent.stop).on('click', deleteShape, e.layer);
    // if (e.layer instanceof L.Path) e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit);
});


//Prepare feature layer
var myIcons = {
    big: L.icon({
        iconUrl: '../Style/img/1.png',
        // iconSize: [20, 30],
    }),
    small: L.icon({
        iconUrl: '../Style/img/1.png'
    }),
    blank: L.icon({
        iconUrl: '../Style/img/blank.png'
    })
};

var _initialPointToLayer = function(geojson, latlng) {
    if(geojson.properties['lat'] >= 40){
        return L.marker(latlng,{
            icon: myIcons['big'],
            opacity: 0.3
        });
    }else{
        return L.marker(latlng,{
            icon: myIcons['small'],
            opacity: 0.5
        });
    }
}

var _initialFeatureLayer = _getFeatureLayer('http://10.60.38.149:6080/arcgis/rest/services/Service_QueryPM25/MapServer/0',
    _initialPointToLayer);

// console.log(_initialFeatureLayer);

// _initialFeatureLayer.addTo(map);

_initialFeatureLayer.bindPopup(function (evt) {
    // console.log(evt);
    return L.Util.template('<p>City: {city}<br>ID: {id}<br>Position name: {position_name}<br>PM2.5: {pm2_5}<br>Quality: {quality}</p>', evt.feature.properties);
});

$(function () {
    $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
    $('.tree li.parent_li > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(":visible")) {
            children.hide('fast');
            $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
        } else {
            children.show('fast');
            $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
        }
        e.stopPropagation();
    });
});

// var _checkInputTime = function(inputTime){
//     var _result = 0;
//     if(inputTime !== 0)
//     {
//         _result = Date.parse(new Date)
//     }
// }

var _currentFeatureLayer = _initialFeatureLayer;
$(function () {
    $('#submit').on('click', function(e) {

        // var _newDate = $('#InputEndTime').val();
        // if(_newDate !== 0)
        // {
        //     var _endTime = Date.parse(new Date(_newDate.toString()));
        // }
        // else
        // {
        //     _endTime = Date.parse(new Date());
        // }
        // console.log(_endTime);
        // var _featureLayer = _getFeatureLayer('http://10.60.38.149:6080/arcgis/rest/services/Service_QueryPM25/MapServer/0',
        //     function (geojson, latlng) {
        //         // console.log(geojson);
        //         if(geojson.properties['time_point'] >= _endTime){
        //             return L.marker(latlng,{
        //                 icon: myIcons['blank'],
        //                 opacity: 0
        //             });
        //         }else{
        //             return L.marker(latlng,{
        //                 icon: myIcons['small'],
        //                 opacity: 0.5
        //             });
        //         }
        // });
        // console.log(_endTime);
        _featureLayer = _initialFeatureLayer;
        var query = L.esri.query({
            url: 'http://10.60.38.149:6080/arcgis/rest/services/Service_QueryPM25/MapServer/0',
        });
        // query.where("area = '北京'");
        query.between(new Date('2000-03-04'), new Date('2016-11-24'));
        // query.limit(int(2000));
        // console.log(query);
        query.run(function(error, featureCollection, response){
            console.log('Found ' + featureCollection.features.length + ' features');
            console.log(featureCollection);
        });
        query.count(function (error, count, response) {
            console.log('query: ' + count);
        });
        // console.log(_featureLayer);
        var i = 0;
        _initialFeatureLayer.eachFeature(function (feature) {
            if(feature.feature.properties['time_point'] >= 0)
            {
                // console.log(feature);
                L.marker(feature._latlng, {
                    icon: myIcons['small'],
                    opacity: 0.5
                }).addTo(map);
                i += 1;
            }
        });
        console.log('layer: '+ i);
        // _featureLayer.options.pointToLayer = function (geojson, latlng) {
        //     // console.log(geojson);
        //     if (geojson.properties['time_point'] >= 1457193600) {
        //         return L.marker(latlng, {
        //             icon: myIcons['blank'],
        //             opacity: 0
        //         });
        //     } else {
        //         return L.marker(latlng, {
        //             icon: myIcons['small'],
        //             opacity: 0.5
        //         });
        //     }
        // };
        // _featureLayer.bindPopup(function (evt) {
        //     console.log(evt)
        //     return L.Util.template('<p>City: {city}<br>ID: {id}<br>Position name: {position_name}<br>PM2.5: {pm2_5}<br>Quality: {quality}</p>', evt.feature.properties);
        // });
        // map.removeLayer(_initialFeatureLayer);
        // // _currentFeatureLayer = _featureLayer;
        // map.addLayer(_initialFeatureLayer);
    });
});

$(function () {
    var _startTime = $('#InputStartTime').datetimepicker({
        autoclose: 1,
        todayBtn:  1,
        minView: 2,
        forceParse: 0,
        startView: 2,
        format: 'mm/dd/yyyy'
    });
    $('#InputEndTime').datetimepicker({
        autoclose: 1,
        todayBtn:  1,
        minView: 2,
        forceParse: 0,
        startView: 2,
        format: 'mm/dd/yyyy'
    });
    $("#InputStartTime").on("changeDate", function (e) {
        $('#InputEndTime').datetimepicker('setStartDate', e.date);
        // $('#InputEndTime').data("DateTimePicker").minDate(e.date);
    });
    $("#InputEndTime").on("changeDate", function (e) {
        $('#InputStartTime').datetimepicker('setEndDate', e.date);
        // $('#InputEndTime').data("DateTimePicker").minDate(e.date);
    });
});

