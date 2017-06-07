/**
 * Created by chenweiyi on 12/01/2017.
 */

var csj = ['上海市', '南京市', '无锡市', '徐州市', '常州市'];
var jjj = ['北京市', '天津市', '石家庄市', '唐山市', '秦皇岛市'];
var zsj = ['肇庆市', '佛山市', '广州市', '东莞市', '惠州市'];
var lznc = ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市'];

var date = ["1997","1998","1999","2000","2001","2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013"];

var _getRequest = function() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]= decodeURI(strs[i].split("=")[1]);

        }
    }
    return theRequest;
}

var _request = _getRequest();
// console.log(_request);
var _area1 = _request['area1'];
var _area2 = _request['area2'];
var _element = _request['element'];
var _tag = _request['tag'];


var query = L.esri.query({
    url:'http://10.20.47.32:6080/arcgis/rest/services/Server_Timeline/MapServer/0'
});

var _getCities = function (area) {
    _result = [];
    switch(area){
        case "长三角":
            _result = csj;
            break;
        case "京津冀":
            _result = jjj;
            break;
        case "珠三角":
            _result = zsj;
            break;
        case "辽中南":
            _result = lznc;
            break;
        default:
            break;
    }
    return _result;
}

var _Data = []

var _getValue = function (cities1, cities2) {
    // var map = new Object();
    var values1 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var values2 = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var _formattedData1 = [];
    var _formattedData2 = [];
    var i = 0 ;
    var sql = "城市 = '" + cities1[0] + "' OR 城市 = '" + cities1[1] + "' OR 城市 = '" + cities1[1] + "' OR 城市 = '" + cities1[2] + "' OR 城市 = '" + cities1[3] + "' OR 城市 = '" + cities1[4] +
        "' OR 城市 = '" + cities2[0] + "' OR 城市 = '" + cities2[1] + "' OR 城市 = '" + cities2[1] + "' OR 城市 = '" + cities2[2] + "' OR 城市 = '" + cities2[3] + "' OR 城市 = '" + cities2[4] + "'";
    query.where(sql);
    query.run(function(error, featureCollection, response){
        var features = featureCollection.features;
        // console.log(featureCollection)
        for(var j = 0; j < features.length; j++){
            var _year = features[j].properties['年'].toString();
            var _index = date.indexOf(_year);
            var _city = features[j].properties['城市'];
            var _value = features[j].properties[_element];
            // if(_year == 1997){
            //     console.log(_value)
            // }
            if(cities1.indexOf(_city) >= 0){
                values1[_index] += _value;
            }else{
                values2[_index] += _value;
            }
        }
        console.log(values1);
        console.log(values2);
        _formattedData1 = _getFormattedData(values1);
        _formattedData2 = _getFormattedData(values2);
        _buildLineChart(_formattedData1, _formattedData2);
    });
}

var _getFormattedData = function (dataset) {
    console.log(dataset)
    var _formattedData = []
    for(var i = 0; i < date.length; i++){
        // var year = date[i] + 'y'
        _formattedData.push([date[i], dataset[i]]);
    }
    return _formattedData
}

var _getData = function () {
    var cities1 = _getCities(_area1);
    var cities2 = _getCities(_area2);
    _getValue(cities1, cities2);
    // if(_area1 != _area2){
    //     var data2 = _getValue(cities2)
    // }else{
    //     data2 = data1;
    // }
    // console.log(data1)
    // for(var i = 0; i < date.length; i++){
    //     // var year = parseInt(date[i])
    //     _formattedData.push([date[i], map1[i]]);
    // }
    // console.log(_formattedData)
    // _getFormattedData(map1)
}


var _buildLineChart = function (data1, data2) {
    var myChart = echarts.init(document.getElementById('line-chart'));
    console.log(_tag);

    // 指定图表的配置项和数据
    var option = {
        title: {
			text:_tag,
			textStyle:{
				color: "#FFF"
			},
			left: 'center',
			top: 0
        },
        legend: {
            data:[_area1, _area2],
            textStyle:{
                color:'#FFF'
            },
			top:30
        },
        tooltip: {
            trigger: 'axis'
        },
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 100
        }, {
            start: 0,
            end: 100,
            handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: '80%',
            handleStyle: {
                color: '#fff',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 1,
                shadowOffsetY: 5,
            },
            dataBackground:{
                lineStyle:{
                    color:'rgb(8,81,156)',
                    opacity: 0.5
                },
                areaStyle:{
                    opacity:0
                }
            },
//        fillerColor:'rgba(167,183,204,0.4)',
            textStyle:{
                color: '#FFF'
            },
            top: 'bottom'
        }],
        xAxis: {
            type: 'category',
            data:date,//['1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013'],
            axisLine:{
                lineStyle:{
                    color: '#FFF'
                }
            },
            axisLabel:{
                textStyle:{
                    fontSize: 14,
                }
            }
        },
        yAxis: {
            splitLine: {
                show: true
            },
            axisLine:{
                lineStyle:{
                    color: '#FFF'
                }
            },
            axisLabel:{
                textStyle:{
                    fontSize: 14,
                }
            }
        },
        series: [{
            name: _area1,
            type: 'line',
            data: data1
            // data: [['1997',5],['1998',20],['1999',36], ['2000',20],['2001',22],['2002',24],['2003',42],['2004',25],['2008',38],['2009',9],['2012',30]]
        },{
            name: _area2,
            type: 'line',
            data: data2,
            itemStyle:{
                normal:{
                    color:'#FFFF00'
                }
            }
            // data: [['1997',20],['1998',10],['1999',26], ['2000',90],['2001',22],['2002',34],['2003',07],['2006',28],['2008',19],['2012',29],['2013',04]]
        }],
        textStyle: {
            color: '#fff',
            fontSize: 16,
        }
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}

_getData();
// _buildLineChart()