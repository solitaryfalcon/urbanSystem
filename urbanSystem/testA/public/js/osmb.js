var map = new L.Map('majorMap');
// map.setView([31.22866, 121.46965], 16, false);
map.setView([31.23030730373382, 121.46666765213014],11)
// new L.TileLayer('http://{s}.tiles.mapbox.com/v3/osmbuildings.kbpalbpk/{z}/{x}/{y}.png', {
//   attribution: 'Map tiles &copy; <a href="http://mapbox.com">MapBox</a>',
//   maxZoom: 20,
//   maxNativeZoom: 22,
//   minZoom: 8,
//   // tilt : 40,
// }).addTo(map);

L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue',{maxZoom:22,minZoom:5}).addTo(map);

var osmb = new OSMBuildings(map).date(new Date('2015-07-15 10:00:00'));

//********************************************************

var color = '#ffcc00',
  height = 100,
  feature;

function setHeight(el) {
  height = parseInt(el.value);
  setGeoJson();
}

function setGeoJson() {
  if (!feature) {
    return;
  }
  feature.properties = {
    color: color,
    height: 500
  };
  var geoJson = {
    type: 'FeatureCollection',
    features: [feature]
  };
  osmb.set(geoJson);
  console.log(JSON.stringify(geoJson));
}

document.addEventListener('DOMContentLoaded', function() {
  var drawControl = new L.Control.Draw({
    draw: {
      polyline: false,
      polygon: {
        allowIntersection: false,
        shapeOptions: { color:color }
      },
      rectangle: {
        shapeOptions: { color:color }
      },
      circle: false,
      marker: false
    }
  });
  map.addControl(drawControl);

  map.on('draw:created', function (e) {
    feature = e.layer.toGeoJSON();
    setGeoJson();
  });
});

var config = {
  radius : 0.01,
  top : 700,
  colors : ["#DCD2D0","#AABAD7","#67FEC1","#F4FE00","#F4FE00","#F57D0D","#FA0E1B"],
  // 200p  0.001
  // dataUrl:"rectHeat/",
  // maxCount : 10000

  // 18520n 0.02
  dataUrl:"rect/",
  maxCount : 70000
};

var BuildingData = {
  "type":"FeatureCollection",
  "features":[
    {
      "type":"Feature",
      "properties":{
        "color":"#ffcc00",
        "height":500
      },"geometry":{
        "type":"Polygon",
        "coordinates":[
          [
            [121.46666765213014,31.23030730373382],
            [121.46666765213014,31.23181184772342],
            [121.46969318389894,31.23181184772342],
            [121.46969318389894,31.23030730373382],
            [121.46666765213014,31.23030730373382]
          ]
        ]
      }
    }
  ]
}

function showBuildings(){
  var num = document.getElementById("choose").value;
  var min = document.getElementById("min").value;
  var distance = document.getElementById("distance").value;
  $.ajax({
    type: "get",
    url: "/tmp/" + config.dataUrl + num + ".json",
    success: function(result) {
      osmb.set(getBuildData(result, min, distance));
    }
  });
}

function getBuildData(srcData, min, distance){
  var dataArr = {
    "type":"FeatureCollection",
    "features":[]
  };
  var radius = distance;
  radius += 0;
  for (var i = 0; i < srcData.length; i++) {
    var tmp = srcData[i];
    var precent = (tmp.count / config.maxCount).toFixed(4) ;
    console.log(precent);
    var height = config.top * precent;
    if (height < 10) {
      height = 10;
    }
    if (tmp.count > config.maxCount) {
      config.maxCount = tmp.count;
    }
    if (tmp.count > min) {
      var Building = {
        "type":"Feature",
        "properties":{
          "color": getColor(tmp.count),
          "height": height ,
          "roofColor" : config.colors[
            Math.round(
              (config.colors.length - 1) * precent
            )],
          // "wallColor" : config.colors[
          //   Math.round(
          //     (config.colors.length - 1) * precent
          //   )]
          "wallColor" : "#696969"
          // "shape" : "cylinder"
        },"geometry":{
          "type":"Polygon",
          "coordinates":[[
            [tmp.lng, tmp.lat],
            [tmp.lng - radius, tmp.lat],
            [tmp.lng - radius, tmp.lat - radius],
            [tmp.lng, tmp.lat - radius],
            [tmp.lng, tmp.lat]
          ]]
        }
      };
      dataArr.features.push(Building);
    }
  }
  console.log(config.maxCount);
  return dataArr;
}

// 250,14,27 #FA0E1B
// 245 125 13 #F57D0D
// 244 254 0 #F4FE00
// 103 254 193 #67FEC1
// 157 197 220 #AABAD7
// 220 210 208 #DCD2D0

var heatmapLayer;
var radius;
function setHeatMap(heatmapData){
        /**
         * 创建热力图的方法
         * 传一个参数，从后台获取到的热力图的点的数据
         * 数据结构
             var heatmapData={
                max: 1000,
                data: [
                    {lngField:67.89,latitude:21.5,count:100,radius:0.002},
                    {lngField:67.869,latitude:21.551,count:19,radius:0.002}
                ]
            };
         */
        if(heatmapLayer != null){
            /*这个方法是在每一次刷新热力图之前把前一次创建的热力图对象清除,
             *如果不对这个对象进行重置，会在每一刷新的时候给这个对象添加数据上去，
             *会导致这个对象内存增长
             */
            map.removeLayer(heatmapLayer);
        }
        var config = {  //热力图的配置项
            // radius: 0.02,       //设置每一个热力点的半径
            radius : radius,
            maxOpacity: .8,        //设置最大的不透明度
            // minOpacity: 0.3,     //设置最小的不透明度
            scaleRadius: true,      //设置热力点是否平滑过渡
            // blur: 0.95,             //系数越高，渐变越平滑，默认是0.85,
                                    //滤镜系数将应用于所有热点数据。
            useLocalExtrema: true,  //使用局部极值
            latField: 'lat',   //维度
            lngField: 'lng',  //经度
            valueField: 'count',    //热力点的值
            gradient: {   "0.99": "rgba(255,0,0,1)",
                    "0.8": "rgba(255,255,0,1)",
                    "0.7": "rgba(0,255,0,1)",
                    "0.4": "rgba(0,255,255,1)",
                    "0": "rgba(0,0,255,1)"
                },
            //过渡，颜色过渡和过渡比例,范例：
            /*
                {   "0.99": "rgba(255,0,0,1)",
                    "0.9": "rgba(255,255,0,1)",
                    "0.8": "rgba(0,255,0,1)",
                    "0.5": "rgba(0,255,255,1)",
                    "0": "rgba(0,0,255,1)"
                }
            */
            // backgroundColor: 'rgba(27,34,44,0.5)'    //热力图Canvas背景
        };
        heatmapLayer = new HeatmapOverlay(config);  //重新创建热力图对象
        // $(".leaflet-overlay-pane").empty();         //清空热力图的空间
        map.addLayer(heatmapLayer);                 //将热力图图层添加在地图map对象上
        heatmapLayer.setData(heatmapData);
 //设置热力图的的数据
    }

    function change(){
      var num = document.getElementById("choose").value;

      if (!datachangeb) {
        if (newindex >= newarr.length) {
          newindex = 0;
        }
        num = newarr[newindex] + "p";
        document.getElementById("choose").value = num;
        newindex++;
      }
      // var max = document.getElementById("max").value;
      radius = document.getElementById("radius").value;
      if (radius == '') {
        radius = '0.03';
      }
      radius += 0;
      $.ajax({
                         type: "get",
                         url: "/tmp/"+config.dataUrl+num+".json",
                         success: function (result) {
                           setHeatMap({
                            //  max :  maxArr[num],
                            max : 10,
                             data : result
                           });
                         }
                     });

    }

    function getColor(index){
      var colorArr = ["#1C1C1C","#363636","	#4F4F4F","#696969","#828282","#9C9C9C","#B5B5B5","#CFCFCF","#E8E8E8"];
      return colorArr[9 - index];
    }
var datachangeb = true;
function datachange(){
  if (datachangeb) {
    config.dataUrl = "rectHeat/";
    config.maxCount = 10000;
    config.top = 1000;
    document.getElementById("datachange").innerHTML = "new";
    datachangeb = false;
    newindex = 0;
  }else {
    config.dataUrl = "rect/";
    config.maxCount = 70000;
    config.top = 700;
    document.getElementById("datachange").innerHTML = "old";
    datachangeb = true;
  }
}
var newarr = ["200","205","210","215","220","225","230","235"];
var newindex = 0;
