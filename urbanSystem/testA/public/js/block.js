
function showHeatt(){
    Block.heatmap("235");
}

// global config
var config = {

  map : {
    initiRoom : 11,
    initiLng : 121.46965,
    initiLat : 31.22866,
    maxZoom : 22
  },

  od_line : {
    line_color_arr : [1,3,5,7,9,11,13,15],
    line_weight_zoom : 0.3,
    line_fillOpacity : 0.2,
    arrowHead_size : 0.2,
    arrowHead_polygon : false,
    arrowHead_interval : 1000
  },

  od_block : {
    fillOpacity : 0.5,
    weight : 1,
    fill : true,
    strokeColor : "black",
    redArr : ["#FF7F50","#FF7F56","#FF6A6A","#FF6347","#FF4040","#FF3030","#FF0000"],
    blueArr : ["#1E90FF","#1C86EE","#1874CD","#0000FF","#0000CD","#00008B"],
    maxCount : 60
  },

  heatmap : {
    count_arr : [500,1000,2000,3000,5000,10000,20000,50000],
    polygon_fillOpacity : 0.5
  },

  tools : {
    ditial_fix : 5
  }

};

function init(){
  // init map object
  majorMap = L.map("majorMap").setView([config.map.initiLat,config.map.initiLng],config.map.initiRoom);

  // map theme
  L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue',{maxZoom:config.map.maxZoom,minZoom:5}).addTo(majorMap);
}

// init odData
var odData = null;

function getOD(){
  // get od data from svc
  $.ajax({
                     type: "get",
                     url: "/tmp/block/od/blockODLat.json",
                    //  url: "/tmp/od/185p.json",
                    //  data: "name=" + $("#Text1").val(),
                     success: function (result) {
                       odData = orderByCount(result);
                       showOD();
                     }
                 });
}


// display odData & considering filter num
function showOD() {
  clearMap();
  if (odData != null) {
    $.ajax({
                       type: "get",
                       url: "/tmp/block/od/blockColorLat.json",
                       success: function (result) {
                        //  draw rings
                         for (var i = 0; i < result.length; i++) {
                           var count = result[i][0];
                           var rings = result[i][1];
                           showOdRings(count, rings);
                         }

                         // draw od lines
                         showOdLines();
                       }
                   });
  }else {
    getOD();
  }
}

// in O-D graph, show rings layer
function showOdRings(count, rings){
  var color = count > 0 ? getRed(count) : getBlue(count);

  for (var j = 0; j < rings.length; j++) {
    var tmp = transform(rings[j]);
    var polygon = L.polygon(tmp, {
      color : config.od_block.strokeColor,
      fillOpacity : config.od_block.fillOpacity,
      fill : config.od_block.weight,
      fillColor : color
    }).addTo(majorMap);

    polygon.bindPopup("color:"+color+", count:"+count);
  }
}

// in O-D graph, show o-d lines
function showOdLines(){
  var filterNum = $("#odFilter").val();
  var arr = config.od_line.line_color_arr;
  var arrows = [];
  for (var i = 0; i < odData.length; i++) {
    var width = Math.abs(odData[i][2]);
    var latlngs;
    var color = getColor(width, arr);
    if (width >= filterNum) {
      if (odData[i][2] > 0) {
         latlngs = [odData[i][0], odData[i][1]];
      }else {
         latlngs = [odData[i][1], odData[i][0]];
      }
      var polyline = L.polyline(latlngs, {
        weight: width * config.od_line.line_weight_zoom,
        fillOpacity : config.od_line.line_fillOpacity,
        color : color
      }).addTo(majorMap);
    }
  }
  showOdArrows(arrows);
}

// in O-D graph, show o-d arrows
function showOdArrows(arrows){
   var anim = window.setInterval(function() {
     for (var i = 0; i < arrows.length; i++) {
       arrows[i].setPatterns([
           {offset: arrowOffset+'%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: config.od_line.arrowHead_size * arrows[i].size, polygon: config.od_line.arrowHead_polygon, pathOptions: {stroke: true}})}
       ])
       if(++arrowOffset > 100)
           arrowOffset = 0;
     }
   }, config.od_line.arrowHead_interval);
}

function showHeat(time){
  // get heatmap data
  clearMap();
  $.ajax({
                     type: "get",
                     url: "/tmp/block/"+time+"block.json",
                    //  data: "name=" + $("#Text1").val(),
                     success: function (result) {
                       var arr = config.heatmap.count_arr;
                       for (var i = 0; i < result.length; i++) {
                         for (var j = 0; j < result[i].geometry.rings.length; j++) {
                           var latlngs = transform(result[i].geometry.rings[j]);
                           var color = getColor(result[i].attributes.count, arr);
                           var polygon = L.polygon(latlngs, {color: color,fillOpacity : config.heatmap.polygon_fillOpacity}).addTo(majorMap);
                         }
                       }
                     }
                 });
}

// tranform latLng data from 0.xxxxxxx... to 0.xxxxx
function transform(arr) {
  for (var i = 0; i < arr.length; i++) {
    var tmp = arr[i];
    arr[i] = [tmp[1].toFixed(config.tools.ditial_fix),tmp[0].toFixed(config.tools.ditial_fix)];
  }
  return arr;
}

// set heatmap color by sqaure
function getColor(count, arr){
  var index = getIndex(count, arr);
  // var colorArr = ["#1C1C1C","#363636","	#4F4F4F","#696969","#828282","#9C9C9C","#B5B5B5","#CFCFCF","#E8E8E8"];
  var colorArr = ["#E8E8E8","#CFCFCF","#B5B5B5","#9C9C9C","#828282","#696969","#4F4F4F","#363636","#1C1C1C"];
  return colorArr[9 - index];
}

// axis for count value
function getIndex(val, arr){
  for (var i = 0; i < arr.length; i++) {
    if (val < arr[i]){
      return i++;
    }
  }
  return 9;
}

function clearMap() {
  majorMap.eachLayer((layer) => {
    layer.remove();
  })
  L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue',{maxZoom:config.map.maxZoom,minZoom:5}).addTo(majorMap);

}


function orderByCount(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  var m = arr[0][2];
  var aArr = [];
  var bArr = [];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i][2] >= m) {
      bArr.push(arr[i]);
      // console.log(bArr);
    } else {
      aArr.push(arr[i]);
      // console.log(aArr);
    }
  }
  var aRes = orderByCount(aArr).concat([arr[0]]);
  var bRes = orderByCount(bArr);
  return aRes.concat(bRes);
}

function showOD2Block() {
  clearMap();
  $.ajax({
                     type: "get",
                     url: "/tmp/block/od/blockColorLat.json",
                     success: function (result) {
                       // draw rings
                       for (var i = 0; i < result.length; i++) {
                         var tmp = result[i][0];
                        //  var latlngs = transform(result[i][1][0]);
                         for (var j = 0; j < result[i][1].length; j++) {
                           var latlngs = transform(result[i][1][j]);
                           var color = tmp > 0 ? getRed(tmp) : getBlue(tmp);
                           var polygon = L.polygon(latlngs, {
                             color: config.od_block.strokeColor,
                             fillOpacity : config.od_block.fillOpacity,
                             weight : config.od_block.weight,
                             fill : config.od_block.fill,
                             fillColor : color
                            //  stroke : false
                           }).addTo(majorMap);
                           polygon.bindPopup("color:" + color + ", count :" + tmp);
                         }
                        //  var color = tmp > 0 ? getRed(tmp) : getBlue(tmp);
                        //  var polygon = L.polygon(latlngs, {
                        //    color: config.od_block.strokeColor,
                        //    fillOpacity : config.od_block.fillOpacity,
                        //    weight : config.od_block.weight,
                        //    fill : config.od_block.fill,
                        //    fillColor : color
                        //   //  stroke : false
                        //  }).addTo(majorMap);
                        //  polygon.bindPopup("color:" + color + ", count :" + tmp);
                       }
                     }
                   });
}

function getRed(val){
  var i = Math.round(5 * Math.abs(val) / config.od_block.maxCount);
  return config.od_block.redArr[i];
}

function getBlue(val){
  var i = Math.round(5 * Math.abs(val) / config.od_block.maxCount);
  return config.od_block.blueArr[i];
}
