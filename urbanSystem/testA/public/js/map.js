/**
 * Created by chenweiyi on 04/12/2016.
 */

// var token = null;
// var timeline_container = document.getElementById('visualization');
var query = L.esri.query({
    url: 'http://10.10.240.120:6080/arcgis/rest/services/Service_PM25/MapServer/0',
    // url: 'http://10.10.240.120:6080/arcgis/rest/services/Service_Annals/MapServer/1'
});

var _formSubmitted = false;
// var _timeline;
var _currentLayer = null;
var _timeUnit = null;

var _annalDataUrl = 'http://10.10.240.120:8989/json/annal/';
var _annalDownloadUrl = 'http://10.10.240.120:8989/download/annal/';
var _pmDataUrl = 'http://10.10.240.120:8989/json/pm/';//2016-03-05 15:00:00/so2

var _selectedNode = new Object();
var _flag = null;
var _dataAnalysisType = null;

// TreeView
$.ajax({
    type: "get",
    url: _treeUrl,
    dataType: "json",
    jsonp:"callback",
    success: function (data) {
        dataSource = data.results;
        // console.log('Tree data:')
        // console.log(dataSource);
        _loadTree();
    },
    error: function (XMLHttpRequest, textStatus, errorThrown) {
        console.log('tree view error');
        console.log(errorThrown);
    }
});


// if(_typeId == '3'){
//     _timeUnit = 'y';
// }

var _defaultCheckedNode = null;
var _prepareTreeData = function (treeSource) {
    var _treeData = [];
    for(var i = 0; i < treeSource.length; i++){
        var _hasChildNode = (treeSource[i].hasOwnProperty('nodes'));
        if(_hasChildNode){
            treeSource[i].selectable = false;
            _prepareTreeData(treeSource[i].nodes);
            _treeData.push(treeSource[i]);
        }else{
            if(_defaultCheckedNode == null){
                _defaultCheckedNode = treeSource[i];
            }
            treeSource[i].selectedIcon = "glyphicon glyphicon-check";
            treeSource[i].icon = "glyphicon glyphicon-unchecked";
            _treeData.push(treeSource[i]);
        }
    }
    return _treeData;
}

var _loadTree = function () {
    console.log('start to load tree')
    // console.log(_typeId)
    // console.log(dataSource[_typeId])
    _prepareTreeData(dataSource[_typeId].nodes);

    var $tree = $('#tree-view').treeview({
        //data: tree,         // 数据源
        data: dataSource[_typeId].nodes,
        showCheckbox: false,   //是否显示复选框
        highlightSelected: true,    //是否高亮选中
        // nodeIcon: 'glyphicon glyphicon-link',
        // emptyIcon: 'glyphicon glyphicon-unchecked',    //没有子节点的节点图标
        multiSelect: false,    //多选
        showBorder: false,
        onhoverColor:"#505050",
        // showIcon: true,
        backColor: "transparent",
        color: "white",
        borderColor: "transparent",
        expandIcon: "glyphicon glyphicon-chevron-right",
        collapseIcon: "glyphicon glyphicon-chevron-down",
        onNodeSelected: function(event,data){
            // $('.dimmer').css('display','block');
            _formSubmitted = false;
            _resetMap();
            _selectedNode = data;
            var _id = data.id;
            console.log('select node data');
            console.log(data);
            _clearLayers();
            _timeUnit = null;
            _flag = null;
            _dataAnalysisType = null;
            $("#table-data-button").css('display', 'none');
            $("#data-analyze-button").css('display', 'none');
            $("button[type=reset]").click();
            // $("#data-sample-table").empty();
            _clearDataTable()
            $("svg#legend").empty();
            $("#timeline-area").css('display', 'none');
            $("#download-button-div").css('display', 'none');
            $('#data-analyze').css('display','none');
            $('#selector-for-od').css('display','none');
            _clearAllAddedDiv()
            if(data.text == "出租车"){
                $("#data-analyze-button").css('display', 'block');
                console.log('hehe')
                _dataAnalysisType = 'map'
            }else if(data.flag == 0 && data.text != "公司信息"){
                _flag = 'SD';
                // if(_timeline){
                //     $("#visualization").css('display', 'none');
                // }
                // $('#legend-div').css('display', 'none');
                // $("svg#legend").empty();
                // $("#data-sample-table").empty();
                var _url = _prepareDataUrl('s',_id);
                _loadSampleData(_url)
            }else if(data.text == "公司信息"){
                _flag = 'EI';
                console.log("enterprise info");
                // _clearAllAddedDiv()
                // $("#data-sample").css('display', 'none');
                // if(_timeline){
                //     $("#visualization").css('display', 'none');
                // }
                // $('#legend-div').css('display', 'none');
                // $("svg#legend").empty();
                _loadEntInicators();
                _loadEnterpriseData();
            }else if(data.text == "POI"){
                _flag = 'POI';
                _clearAllAddedDiv();
                _loadPOIInicators();
                _loadPOIData();
            }else if(data.flag == 1){
                _flag = 'MD';//map data
                $('#legend-div').css('display', 'block');
                var _selectedNodeName = data.text;
                _setIndiSelector(data.id, _selectedNodeName);
                // $("#data-sample-table").empty();
                // $("#data-sample").css('display', 'none');
                if(_selectedNodeName.indexOf('年鉴') >= 0){
                    $("#table-data-button").css('display', 'block');
                    $("#data-analyze-button").css('display', 'block');
                    _dataAnalysisType = 'chart'
                    _timeUnit = 'y';
                    _initAnnalLayer();
                    // console.log('年鉴')
                }else{
                    _timeUnit = 'h';
                    _initEnvLayer();
                    // console.log('非年鉴')
                }
                // console.log('time unit');
                // console.log(_timeUnit)
                _setDatetimePicker(_timeUnit);
            }
        },
        onNodeUnselected: function (event,data) {
            _resetMap()
            _clearLayers()
            _clearAllAddedDiv()
            $("#data-analyze-button").css('display', 'none');
            $('#data-analyze').css('display','none');
        }
            
        
    });

    $tree.treeview('collapseAll', { silent: true });
    // console.log("check node");
    // console.log(_defaultCheckedNode);
    //Select First node
    // var _result = $tree.treeview('search', [ _defaultCheckedNode.text ]);
    // // console.log(_result);
    // for(var i = 0; i < _result.length; i++){
    //     if(!_result[i].hasOwnProperty('nodes')){
    //         $tree.treeview('selectNode', [ _result[i] ]);
    //         break;
    //     }
    // }
    // $tree.treeview('clearSearch');

    var search = function(e) {
        var pattern = $('#input-search').val();
        var results = $tree.treeview('search', [ pattern ]);
    }

    $('#btn-search').on('click', search);
    $('#input-search').on('keyup', search);

}

var _clearAllAddedDiv = function () {
    $("#data-sample").css('display', 'none');
    // if(_timeline){
    //     $("#visualization").css('display', 'none');
    // }
    $("#timeline-area").css('display', 'none')
    $('#legend-div').css('display', 'none');
    $('#data-chart').css('display', 'none');
    $('#download-button-div').css('display', 'none');
}

var _enterpriseLayer = L.esri.featureLayer({
    // url: 'http://10.10.240.120:6080/arcgis/rest/services/Service_Annals/MapServer/0',
    url: 'http://119.23.22.130:6080/arcgis/rest/services/Service_Enterprise/MapServer/0',
    pointToLayer: function (geojson, latlng) {
        return L.polygon(latlng,{
            weight: 0.5,
            fillOpacity: 0,
            fillColor: 'transparent'
        })
    },
    style:{
        color: "rgb(239,243,255)",
        weight: 0.5,
        fillOpacity: 0,
        fillColor: 'transparent'
    },
    // onEachFeature: onEachFeature
});

var _clearLayers = function () {
    // if(map.hasLayer(_annalFeatureLayer)){
    //     map.removeLayer(_annalFeatureLayer)
    // }
    // if(map.hasLayer(_currentLayer)){
    //     map.removeLayer(_currentLayer);
    //     _currentLayer = null;
    // }
    // if(map.hasLayer(_enterpriseLayer)){
    //     map.removeLayer(_enterpriseLayer);
    // }
    // if(map.hasLayer(_POILayer)){
    //     map.removeLayer(_POILayer);
    // }
    map.eachLayer(function(layer) {
        layer.remove();
    })
    L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue',{maxZoom:18,minZoom:5}).addTo(map);
}

var _loadEntInicators = function () {
    // Fill indicator
    var dataSource = ['保险业', '餐饮业', '零售业', '住宿业', '批发业'];
    _fillIndicators(dataSource);
    _defaultIndi = dataSource[0];
}

var _loadEnterpriseData = function () {
    var indicator = _getIndicator();
    map.setView([31.22, 121.48], 10)
    _enterpriseLayer.bindPopup(function (layer) {
        console.log(layer.feature.properties)
        return L.Util.template('<p>Name: {Name}<br>' + indicator + ': ' + layer.feature.properties[indicator] +  '<br></p>', layer.feature.properties);
    }).addTo(map);
    // var _layers = Object.getOwnPropertyNames(_enterpriseLayer._layers);
    // console.log(_layers)
    // console.log(_enterpriseLayer._layers)
}

var _loadPOIInicators = function () {
    // Fill indicator
    var dataSource = ['餐饮', '购物', '公司企业', '商务金融', '休闲娱乐', '教育培训', '生活服务', '医疗', '工作指数', '消费指数', '生活指数', '住宅区', '房价'];
    _fillIndicators(dataSource);
    _defaultIndi = dataSource[0];
};

var _getEngIndicator = function (indicator) {
    var _indiList = ['餐饮', '购物', '公司企业', '商务金融', '休闲娱乐', '教育培训', '生活服务', '医疗', '工作指数', '消费指数', '生活指数', '住宅区', '房价'];
    var _engIndiList = ['catering', 'shopping', 'corporate', 'finance', 'leisure', 'education', 'life_service', 'health_care', 'work_index', 'consume_index', 'living_index', 'uptown', 'house_price'];
    var _index = _indiList.indexOf(indicator);
    return _engIndiList[_index];
}

var _loadPOIData = function () {
    var indicator = _getIndicator();
    // console.log(indicator);
    map.setView([31.22, 121.48], 11);
    var _engIndicator = _getEngIndicator(indicator);
    console.log('eng indicator');
    console.log(_engIndicator)
    var _url = 'http://10.10.240.120:8989/json/POI_level/' + _engIndicator;
    $.ajax({
        type: "get",
        url: _url,
        dataType: "json",
        jsonp:"callback",
        success: function (data) {
            legendData = data.results;
            var partition = [];
            var scale = [];
            for(var i = 0; i < Object.getOwnPropertyNames(legendData).length; i++){
                partition.push(Number(parseFloat(legendData['level' + i.toString()]).toFixed(1)));
                if(i == 0 || i == Object.getOwnPropertyNames(legendData).length - 1){
                    scale.push(Number(parseFloat(legendData['level' + i.toString()]).toFixed(1)))
                }
            }
            _setLegend(scale, partition)
            _drawPOILayer(partition, indicator);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('data sample error');
            console.log(errorThrown);
        }
    });

};

var _drawPOILayer = function (partition, indicator) {
    _POILayer.setStyle(function(feature) {
        var _value = feature.properties[indicator];
        if(_value == null || _value == 0){
            return{
                color: 'rgb(239,243,255)',
                weight: 0.3,
                fillOpacity: 0,
                fillColor: 'transparent',
            };
        }else if(_value < partition[1]){
            return {
                color: 'rgb(239,243,255)',
                weight: 0.3,
                fillOpacity: 0.2,
                fillColor:'rgb(239,243,255)'
            };
        }else if(_value >= partition[1] && _value < partition[2]){
            return {
                color: 'rgb(189,215,231)',
                weight: 0.3,
                fillOpacity: 0.6,
                fillColor: 'rgb(189,215,231)',
            };
        }else if(_value >= partition[2] && _value < partition[3]){
            return {
                color: 'rgb(107,174,214)',
                weight: 0.3,
                fillOpacity: 0.6,
                fillColor: 'rgb(107,174,214)',
            };
        }else if(_value >= partition[3] && _value < partition[4]){
            return {
                color: 'rgb(49,130,189)',
                weight: 0.3,
                fillOpacity: 0.6,
                fillColor: 'rgb(49,130,189)',
            };
        }else if(_value >= partition[4]){
            return {
                color: 'rgb(8,81,156)',
                weight: 0.3,
                fillOpacity: 0.6,
                fillColor: 'rgb(8,81,156)',
            };
        }
    });
    _POILayer.bindPopup(function (layer) {
        // console.log(layer.feature.properties)
        return L.Util.template('<p>' + indicator + ': ' + layer.feature.properties[indicator] +  '</p>', layer.feature.properties);
    }).addTo(map);
};

var _fillIndicators = function (dataSource) {
    var $indicator = $("#indicators");
    $indicator.empty();
    for(var i = 0; i < dataSource.length; i++){
        // console.log(dataSource[i])
        // $indicator.append("<option value='" + dataSource[i].indi_code +"'>" + dataSource[i].indi_name + "</option>");
        $indicator.append("<option value='" + dataSource[i] +"'>" + dataSource[i] + "</option>");
    }
}

var _prepareDataUrl= function (type, suffix) {
    var _url = '';
    if(type == 's'){//sample data
        _url += _dataSampleUrl + suffix;
        $("#download-button-div").css('display','none');
    }else if(type == 'f'){//full data
        _url +=  _annalTableDataUrl + suffix;
        $("#download-button-div").css('display','block');
        $("#annalDataDownloadUrl").attr('href', _annalDownloadUrl + suffix)
    }
    // _loadSampleData(_url);
    return _url;

}

var _loadSampleData = function (url) {
    

    $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        jsonp:"callback",
        success: function (data) {
            dataSource = data.results;
            console.log('data sample:')
            console.log(dataSource);
            if(dataSource != null) {
                $("#data-sample").css('display', 'block');
                _loadDataTable();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('data sample error');
            console.log(errorThrown);
        }
    });
}

var _loadDataTable = function () {
    // console.log(dataSource);
    var $table = document.getElementById("data-sample-table");
    while($table.hasChildNodes()){ $table.removeChild($table.firstChild)};
    if(dataSource){
        for(var i = 0; i < dataSource.length; i++){
            var tr = document.createElement("tr");
            for(var j = 0; j < dataSource[i].length; j++){
                var data = document.createTextNode(" "+dataSource[i][j]+" ");
                var td = document.createElement("td");
                var pre = document.createElement("pre");
                //td.width=1/treeData[i].length*100+"%";
                td.title = dataSource[i][j];
                td.appendChild(pre);
                pre.appendChild(data);
                tr.appendChild(td);
            }
            $table.appendChild(tr);
        }
    }
    $('.dimmer').css('display','none');
}

var _defaultIndi = ''
var _setIndiSelector = function (id, annalName) {
    var _url = '';
    var _ifAnnal = (annalName.indexOf('年鉴') >= 0)
    if(_ifAnnal){
        _url = _annalIndiUrl + id;
    }else{
        _url = _pm2_5IndiUrl;
    }
    var _fillIndiSelector = function () {
        var $indicator = $("#indicators");
        $indicator.empty();
        for(var i = 0; i < dataSource.length; i++){
            // console.log(dataSource[i])
            if(_ifAnnal){
                $indicator.append("<option value='" + dataSource[i].indi_code +"'>" + dataSource[i].indi_name + "</option>");
            }else{
                $indicator.append("<option value='" + dataSource[i] +"'>" + dataSource[i] + "</option>");
            }
        }
    }

    if(_url != ''){
        $.ajax({
            type: "get",
            url: _url,
            dataType: "json",
            jsonp:"callback",
            async: false,
            success: function (data) {
                dataSource = data.results;
                // console.log('new indi:')
                // console.log(dataSource);
                _defaultIndi = dataSource[0];
                _fillIndiSelector();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('indicator selector error');
                console.log(errorThrown);
            }
        });
    }
}

var _clearDataTable = function () {
    $("#data-sample").css('display','none');
    $("#data-sample-table").empty();
}

$("#data-analyze-button").click(function() {
    if($('#data-explore').css('display') != 'none'){
        $('#data-explore').toggle()
    }
    
    _clearDataTable()
    $("#download-button-div").css('display', 'none');
    if(_dataAnalysisType == 'chart'){
        var _isDisplayChart = $('#data-chart').css('display');
        if(_isDisplayChart == 'none'){
            $('.dimmer').css('display','block')
            _loadChartData()
        }else if(_isDisplayChart == 'block'){
            $("#data-chart").css('display', 'none');
        }
    }else{
        var _isDisplayList = $('#data-analyze').css('display');
        if(_isDisplayList == 'none'){
            $('#data-analyze').css('display','block')
        }else{
            $('#data-analyze').css('display','none')
        }

    }
    var display = $("#data-analyze").css("display");
    if(display == 'none'){
        $("#data-analyze-button").css("color",'white')
        $("#data-analyze-button").css("border-bottom-color",'white')
    }
    else{
        $("#data-analyze-button").css("color",'#3affff')
        $("#data-analyze-button").css("border-bottom-color",'#3affff')
        $("#data-explore-button").css("color",'white')
        $("#data-explore-button").css("border-bottom-color",'white')
    }
})

$('#grid-heat').click(function () {
    _dataAnalysisType = 'grid-heat'
    // _displayBlockHeat("120")
    $('#selector-for-od').css('display','none');
    _setTimeline(_getAnalysisTimelineDates(), 7000);
})

var _displayGridHeat = function (time) {
    map.setView([31.23030730373382, 121.46666765213014],11)
    var osmb = new Osmbuilding(map, "../data/osmb/");
    osmb.heatmap(time);
}

$('#grid-cube').click(function () {
    _dataAnalysisType = 'grid-cube'
    // _displayGridCube("120")
    $('#selector-for-od').css('display','none');
    _setTimeline(_getAnalysisTimelineDates(), 20000);
})

var _displayGridCube = function (time) {
    map.setView([31.23030730373382, 121.46666765213014],11)
    var osmb = new Osmbuilding(map, "../data/osmb/");
    osmb.building({
        time : time,
        min : 100,
        distance : 0.01
    });
}

$('#block-heat').click(function () {
    _dataAnalysisType = 'block-heat'
    // _displayBlockHeat("120")
    $('#selector-for-od').css('display','none');
    _setTimeline(_getAnalysisTimelineDates(), 45000)
})

var _displayBlockHeat = function (time) {
    map.setView([31.23030730373382, 121.46666765213014],11)
    var block = new Block(map, "../data/block/");
    block.heatmap(time);
}
var _formerValue = 0;

$('#block-OD-throughput').click(function () {
    _dataAnalysisType = 'block-OD-throughput'
    // _displayBlockOdThroughput("120")
    $('#selector-for-od').css('display','block');
    var spinner = $( "#spinner" ).spinner({
        min: 0,
        incremental: false,
        spin: function (event, ui) {
            console.log(event)
            console.log(ui)
            // $( "#spinner" ).spinner("disable");
            // $('.dimmer').css('display','block')
            // var time = getTime($('.selected').text())
            // var block = new Block(map, "../data/block/");
            // block.odMap(time,spinner.spinner( "value" ));
            // block.showOD2Block(time);
            // $( "#spinner" ).spinner({ disabled: false });
            if(ui.value == 0 && _formerValue == 0){
                return
            }else{
                $('.dimmer').css('display','block')
                var time = getTime($('.selected').text())
                var block = new Block(map, "../data/block/");
                block.odMap(time,spinner.spinner( "value" ));
                block.showOD2Block(time);
                if(ui.value == 0){
                    _formerValue = 0
                }
            }
        }
    });
    spinner.spinner( "value", 0 );
    _setTimeline(_getAnalysisTimelineDates(), 65000);
})

var getTime = function (selectTime) {
    var times = selectTime.split(":");
    if(times[1] == '00'){
        return times[0] + '0'
    }else{
        return times[0] + '5'
    }
}

var _displayBlockOdThroughput = function (time, value) {
    map.setView([31.23030730373382, 121.46666765213014],11)
    var block = new Block(map, "../data/block/");
    block.odMap(time,value);
    block.showOD2Block(time);
}

var _getAnalysisTimelineDates = function () {
    var dates = []
    for(var i = 0; i < 48; i++){
        var date = fix(parseInt(i/2),2)
        if(i%2 == 0){
            date += ':00'
        }else{
            date += ':30'
        }
        dates.push(date)
    }
    return dates
}

var fix = function(num, length) {
    return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
}

var _loadChartData = function () {
    var indicator = _getIndicator();
    console.log(indicator)
    var selectedTime = $(".selected").text();
    var url = "http://10.10.240.120:8989/json/Top10/" + selectedTime + "/" + indicator.indi_code;
    $.ajax({
        type: "get",
        url: url,
        dataType: "json",
        jsonp:"callback",
        success: function (data) {
            dataSource = data.results;
            console.log(dataSource)
            if(dataSource != {}) {
                var unit = dataSource['max'][0]['unit']
                var min_data = [null, null, null, null, null, null, null, null, null, null]
                var max_data = [null, null, null, null, null, null, null, null, null, null]
                var max_datasource = dataSource['max']
                var min_datasource = dataSource['min']
                var date = []
                for(var i = 10; i > 0; i--){
                    date.push((parseInt(selectedTime)-i).toString() + '年')
                }
                console.log(date)
                console.log(max_datasource)
                console.log(min_datasource)
                for(var j = 0; j < max_datasource.length; j++){
                    var index = date.indexOf(max_datasource[j]['year'])
                    if(index >= 0){
                        max_data[index] = max_datasource[j]['value']
                    }
                }
                for(j = 0; j < min_datasource.length; j++){
                    var index = date.indexOf(min_datasource[j]['year'])
                    if(index >= 0){
                        min_data[index] = min_datasource[j]['value']
                    }
                }
                console.log(max_data)
                console.log(min_data)
                _buildDataChart(min_data, max_data, date, unit, indicator.indi_name)
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('analysis data error');
            console.log(errorThrown);
            $('.dimmer').css('display','none')
        }
    });
}

var _buildDataChart = function (min_data, max_data, date, unit, indicator) {
    $('#data-chart').css('display', 'block')
    var myChart = echarts.init(document.getElementById('chart'));

    // 指定图表的配置项和数据
    var option = {
        title: {
            text: indicator + ' (单位:' + unit + ')',
            textStyle:{
                color: "#FFF"
            },
            left: 'center',
            top:0
        },
        legend: {
            data:["min", "max"],
            textStyle:{
                color:'#FFF'
            },
            top:30
        },
        grid:{
            show: true,
            backgroundColor: 'rgba(128, 128, 128, 0.5)'
        },
        tooltip: {
            trigger: 'axis'
        },
//         dataZoom: [{
//             type: 'inside',
//             start: 0,
//             end: 100
//         }, {
//             start: 0,
//             end: 100,
//             handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
//             handleSize: '80%',
//             handleStyle: {
//                 color: '#fff',
//                 shadowBlur: 3,
//                 shadowColor: 'rgba(0, 0, 0, 0.6)',
//                 shadowOffsetX: 1,
//                 shadowOffsetY: 5,
//             },
//             dataBackground:{
//                 lineStyle:{
//                     color:'rgb(8,81,156)',
//                     opacity: 0.5
//                 },
//                 areaStyle:{
//                     opacity:0
//                 }
//             },
// //        fillerColor:'rgba(167,183,204,0.4)',
//             textStyle:{
//                 color: '#FFF'
//             },
//             top: 'bottom'
//         }],
        xAxis: {
            type: 'category',
            data:date,//['1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013'],
            axisLine:{
                lineStyle:{
                    color: '#FFF',
                    width: 6
                }
            },
            axisLabel:{
                textStyle:{
                    fontSize: 14,
                    fontStyle:'bold'
                }
            }
        },
        yAxis: {
            splitLine: {
                show: true
            },
            axisLine:{
                lineStyle:{
                    color: '#FFF',
                    width: 6
                }
            },
            axisLabel:{
                formatter: '{value}',
                textStyle:{
                    fontSize: 14,
                    fontStyle:'bold'
                }
            }
        },
        series: [{
            name: "min",
            type: 'line',
            data: min_data,
            lineStyle:{
                normal:{
                    width:6
                }
            }
            // data: [['1997',5],['1998',20],['1999',36], ['2000',20],['2001',22],['2002',24],['2003',42],['2004',25],['2008',38],['2009',9],['2012',30]]
        },{
            name: "max",
            type: 'line',
            data: max_data,
            itemStyle:{
                normal:{
                    color:'#FFFF00',
                }
            },
            lineStyle:{
                normal:{
                    width:6
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
    $('.dimmer').css('display','none')
}

var map = L.map('map',{
    editable: true,
    zoomControl: false
}).setView([38.678, 108.068], 5);
//[31.22, 121.48], 9
// [38.678, 108.068], 5
// L.esri.basemapLayer('DarkGray').addTo(map);
L.tileLayer.chinaProvider('Geoq.Normal.PurplishBlue',{maxZoom:18,minZoom:5}).addTo(map);

var _resetMap = function () {
    map.setView([38.678, 108.068], 5);
}

var _POILayer = L.esri.featureLayer({
    url: 'http://119.23.22.130:6080/arcgis/rest/services/POI_Origin/MapServer/0',
    // url: 'http://119.23.22.130:6080/arcgis/rest/services/POI_Origin/MapServer',
    style:{
        color: "rgb(239,243,255)",
        weight: 3,
        opacity: 0.3,
        fillOpacity: 0.3,
        fillColor: "transparent"
    },

});

var _pointToLayer = function(geojson, latlng) {
    if(geojson.properties['pm_2.5'] >= 600){
        return L.circleMarker(latlng,{
            // icon: myIcons['big'],
            opacity: 1//0.7
        });
    }else if(geojson.properties['pm_2.5'] >= 300){
        return L.circleMarker(latlng,{
            // icon: myIcons['small'],
            opacity: 1//0.5
        });
    }else{
        return L.circleMarker(latlng,{
            // icon: myIcons['small'],
            opacity: 1//0.3
        });
    }
}

var _getIndicator = function () {
    if(_formSubmitted == true){
        if(_flag == 'EI' || _flag == 'POI'){
            return ($('#indicators').find("option:selected").text());
        }else if(_timeUnit == 'h'){
            return ($('#indicators').find("option:selected").text());
        }else if(_timeUnit == 'y'){
            _selectedIndicator = new Object();
            _selectedIndicator['indi_name'] = $('#indicators').find("option:selected").text();
            _selectedIndicator['indi_code'] = $('#indicators').find("option:selected").val();
            return _selectedIndicator;
        }
    }else{
        // console.log('default indi')
        // console.log(_defaultIndi)
        return _defaultIndi;
    }
}

// var _onTimeSelected = function (properties) {
//     // console.log(properties)
//     // alert('selected items: ' + properties.items);
//     // $('.dimmer').css('display','block');
//     if(_timeUnit == 'h'){
//         var _timeArray = (properties.items)[0].split(" ");
//         var _queryTime = _timeArray[0] + " " + _timeArray[1] + ":00:00.000";
//         var _sql = _getSQLByTime(_queryTime);
//         // console.log(_sql);
//         var _indicator = _getIndicator();
//         // _runQuery(_sql, _indicator);
//         prepareEvnLegendData(_queryTime);
//     }else if(_timeUnit == 'y'){
//         console.log(_getIndicator())
//         _loadAnnalData((properties.items)[0], _getIndicator());
//
//     }
//     $('.dimmer').css('display','block');
// }

var _annalFeatureLayer = L.esri.featureLayer({
    url : 'http://119.23.22.130:6080/arcgis/rest/services/Annals_original/MapServer/0',
    pointToLayer: function (geojson, latlng) {
        return L.polygon(latlng,{
            weight: 0.5,
            fillOpacity: 0,
            fillColor: 'transparent',
        })
    },
    style:{color: "rgb(239,243,255)"},
    // onEachFeature: onEachFeature
});

var _getSQLByTime = function (time) {
    return "time_point = '" + time + "'"
}

var _getSQLbyDate = function (startDate, endDate) {
    return "time_point >= '" + startDate + "' AND time_point <= '" +  endDate + "'";
}

var _runQuery = function (sql, indicator, partition) {
    $('.dimmer').css('display','none');
    query.where(sql);
    // query.count(function (error, count, response) {
    //     console.log('query: ' + count);
    // });
    query.run(function(error, featureCollection, response){

        console.log(featureCollection)
        if(error){
            console.log(error);
        }
        if(map.hasLayer(_currentLayer)){
            map.removeLayer(_currentLayer);
        }
        // console.log(map.hasLayer(_currentLayer))
        // console.log('Found ' + featureCollection.features.length + ' features');
        // console.log("evn part")
        // console.log(partition)
        _currentLayer = L.geoJSON(featureCollection,{
            pointToLayer: _pointToLayer,
            style: function (feature) {
                // return {color: 'rgb(107,174,214)'};
                var valueOfIndi = Number(feature.properties[indicator]);
                // console.log(feature.properties['co'])
                // console.log(value)
                if(valueOfIndi < partition[1]){
                    return {
                        color: 'rgb(239,243,255)',
                        weight: 0,
                        fillOpacity: 0.3,
                    };
                }else if(valueOfIndi >= partition[1] && valueOfIndi < partition[2]){
                    return {
                        color: 'rgb(189,215,231)',
                        weight: 0,
                        fillOpacity: 0.6,
                    };
                }else if(valueOfIndi >= partition[2] && valueOfIndi < partition[3]){
                    return {
                        color: 'rgb(107,174,214)',
                        weight: 0,
                        fillOpacity: 0.6,
                    };
                }else if(valueOfIndi >= partition[3] && valueOfIndi < partition[4]){
                    return {
                        color: 'rgb(49,130,189)',
                        weight: 0,
                        fillOpacity: 0.6,
                    };
                }else if(valueOfIndi >= partition[4]){
                    return {
                        color: 'rgb(8,81,156)',
                        weight: 0,
                        fillOpacity: 0.3,
                    };
                }
                // else{
                //     return {
                //         color: 'rgb(239,243,255)',
                //         weight: 2,
                //         fillOpacity: 0.3,
                //     };
                // }
            }
        }).bindPopup(function (layer) {
            console.log("pop")
            console.log(layer.feature.properties)
            return L.Util.template('<p>City: {city}<br>Position name: {position_name}<br>' + indicator + ': ' + layer.feature.properties[value] +  '<br></p>', layer.feature.properties);
        }).addTo(map);
        // <br>Station_code: {station_code}
        // console.log("features added to map is");
        // console.log((_currentLayer));
        // console.log(map.hasLayer(_currentLayer))
    });
}

var _getTimelineDates = function (startTime, endTime) {
    var dates = []
    if(_timeUnit == 'h'){
        var _timeDifference = (endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60 / 24;
        for(var j = 0; j < _timeDifference; j++){
            var tmp_time = startTime.getTime() + 1000 * 60 * 60 * 24 * j;
            for(var s = 0; s < 24; s++){
                var date = new Date(tmp_time + 1000 * 60 * 60 * s)
                dates.push(date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDay() + " " + date.getHours() + ":00")
            }
        }
        // var _minTime = new Date(startTime.getTime() - 3600000);
        // var _maxTime = new Date(endTime.getTime() + 3600000);
        // var _timeScale = 'hour';
        // // var _zoomMax = 73800000;
        // // var _zoomMin = 73800000;
        // var _zoomMax = 57600000;
        // var _zoomMin = 57600000;

    }else if(_timeUnit == 'y'){
        // _minTime = new Date((startTime - 1).toString());
        // _maxTime = new Date((endTime + 1).toString());
        // _timeScale = 'year';
        // _zoomMax = 157680000000;
        // _zoomMin = 157680000000;
        for(var i = startTime; i <= endTime; i++){
            dates.push(i)
        }
    }
    //
    console.log(dates)
    // _setTimeline(dates)
    // var options = {
    //     showCurrentTime: false,
    //     max: startTime,
    //     min:endTime,
    //     timeAxis: {
    //         scale: 'hour',
    //         step: 1
    //     },
    //     // zoomMax: 86400000
    //     zoomMax: 57600000,
    //     zoomMin: 57600000,
    //     // height: 70,
    // };
    return dates;
}

var _getFormattedTime = function (datetime) {
    return datetime.getFullYear().toString() + '-' + (datetime.getMonth() + 1).toString() + '-' + datetime.getDate().toString()
}

// var _getTimelineItems = function (startTime, endTime) {
//     // console.log(_timeUnit)
//     if(_timeUnit == 'h') {
//         var _timeDifference = (endTime.getTime() - startTime.getTime()) / 1000 / 60 / 60;
//     }else if(_timeUnit == 'y'){
//         _timeDifference = endTime - startTime + 1;
//     }
//     // console.log(_timeDifference);
//     var _dataSet = [];
//     var _newTime = startTime;
//     for (var i = 0; i < _timeDifference; i++){
//         if(_timeUnit == 'h'){
//             _newTime = new Date(startTime.getTime() + (3600000 * i));
//             _dataSet.push({
//                 start: _newTime,
//                 id: _newTime.getFullYear().toString() + '-' + (_newTime.getMonth() + 1).toString() + '-' + _newTime.getDate().toString() + " "+ _newTime.getHours().toString()
//             })
//         }else if(_timeUnit == 'y'){
//             _newTime = new Date((startTime + i * 1).toString());
//             _dataSet.push({
//                 start: _newTime,
//                 id: _newTime.getFullYear().toString(),
//             })
//         }
//     }
//     var items = new vis.DataSet(_dataSet);
//     // console.log(items)
//     return items;
// }

var _getMiddleItem = function (items) {
    var _propertyAmount = Object.getOwnPropertyNames(items._data).length;
    var _mean = Math.round(_propertyAmount / 2);
    var i = 0;
    for(var item in items._data){
        if(i == _mean){
            var _middleItemId = item;
            var _middleItemDate = items._data[_middleItemId].start
            // console.log(_firstDataTime)
        }
        i ++;
    }
    return [_middleItemId, _middleItemDate];
}

// var _updateTimeline = function (items, options, middleTime) {
//     _timeline.setItems(items);
//     _timeline.setOptions(options);
//     _timeline.moveTo(middleTime);
//     // timeline = new vis.Timeline(timeline_container, items, options);
//     // return timeline
// }

var _loadAnnalData = function (year) {
    var indicator = _getIndicator()
    var _url = _annalDataUrl + year + '/' + indicator.indi_code;
    console.log(_url)
    $.ajax({
        type: "get",
        url: _url,
        dataType: "json",
        jsonp:"callback",
        success: function (data) {
            legendData = data.level;
            annalData = data.results;
            // console.log('annal data:')
            // console.log(annalData);
            // _defaultIndi = dataSource[0];
            if(annalData.length){
                var partition = [];
                var scale = [];
                for(var i = 0; i < Object.getOwnPropertyNames(legendData).length; i++){
                    partition.push(Number(parseFloat(legendData['level' + i.toString()]).toFixed(1)));
                    if(i == 0 || i == Object.getOwnPropertyNames(legendData).length - 1){
                        scale.push(Number(parseFloat(legendData['level' + i.toString()]).toFixed(1)))
                    }
                }
                _bindAnnalData(year, indicator, annalData, partition);
                _setLegend(scale, partition);
            }else{
                _bindAnnalData(year, indicator, [], [])
            }

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('annal data error');
            map.removeLayer(_annalFeatureLayer);
            // $('.dimmer').css('display','none');
            // console.log("add blank layer");
            // _annalFeatureLayer.addTo(map);

            _bindAnnalData(year, indicator, [], [])
            // console.log(errorThrown);
        }
    });
}

var _bindAnnalData = function (year, indicator, annalData, partition) {
    // sleep(5000)
    _annalFeatureLayer.addTo(map);
    // console.log('bind annal data')
    // console.log(annalData)
    // var _legendData = _getLegandData();
    // console.log(_legendData)
    _annalFeatureLayer.setStyle(function(feature){
        var _value = null;
        if(feature.properties['city'] == '上海市' || feature.properties['city'] == '天津市' || feature.properties['city'] == '北京市'){
            console.log(feature.properties['city'])
            console.log(feature.properties['CITYCODE'])
        }
        for(var i = 0; i < annalData.length; i++){
            if(annalData[i].city_code == feature.properties['CITYCODE']){
                // console.log(annalData[i].value)
                _value = Number(annalData[i].value);
                // console.log(_value)
                break;
            }
        }
        if(_value == null){
            return{
                color: 'rgb(239,243,255)',
                weight: 0.5,
                fillOpacity: 0,
                fillColor: 'transparent',
            };
        }else if(_value < partition[1]){
            return {
                color: 'rgb(239,243,255)',
                weight: 0.5,
                fillOpacity: 0.3,
                fillColor:'rgb(239,243,255)'
            };
        }else if(_value >= partition[1] && _value < partition[2]){
            return {
                color: 'rgb(189,215,231)',
                weight: 0.5,
                fillOpacity: 0.6,
                fillColor: 'rgb(189,215,231)',
            };
        }else if(_value >= partition[2] && _value < partition[3]){
            return {
                color: 'rgb(107,174,214)',
                weight: 0.5,
                fillOpacity: 0.6,
                fillColor: 'rgb(107,174,214)',
            };
        }else if(_value >= partition[3] && _value < partition[4]){
            return {
                color: 'rgb(49,130,189)',
                weight: 0.5,
                fillOpacity: 0.6,
                fillColor: 'rgb(49,130,189)',
            };
        }else if(_value >= partition[4]){
            return {
                color: 'rgb(8,81,156)',
                weight: 0.5,
                fillOpacity: 0.6,
                fillColor: 'rgb(8,81,156)',
            };
        }

    })
    _annalFeatureLayer.bindPopup(function (layer) {
        for(var i = 0; i < annalData.length; i++){
            if(annalData[i].city_code == layer.feature.properties['CITYCODE']){
                console.log(annalData[i]);
                return L.Util.template('<p>Region: {region}<br>Year: {year}<br>' + indicator.indi_name + ': ' + ((Number(annalData[i].value)).toFixed(2)).toString() +  '<br>Unit: {unit}<br></p>', annalData[i]);
            }
        }
        // console.log(layer)
        return L.Util.template('<p>City: {city}<br>Year: ' + year + '<br>' + indicator.indi_name + ': no value<br></p>', layer.feature.properties);
        // return L.Util.template('<p>Area: {area}<br>City: {city}<br>Position name: {position_name}<br>Station_code: {station_code}<br>' + attribute + ': ' + layer.feature.properties[attribute] +  '<br></p>', layer.feature.properties);
    });
    console.log('aaa');
    console.log(_annalFeatureLayer)
    $('.dimmer').css('display','none');
}

//legend
var _setLegend = function (scale, partition) {
// var _setLegend = function () {
    $('#legend-div').css("display", 'block');
    $("svg#legend").empty();
    var svg = d3.select("svg#legend"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
    // console.log(svg)

    // var i = 20
    var x = d3.scaleLinear()
    // .domain([0, i])
        .domain(scale)
        .rangeRound([400, 1000]);

    var _failToDrawLegend = false;
    if(partition[1].toString().length >= 4){
        var threshold = 40
    }else{
        threshold = 17
    }
    for(var i = 0; i < partition.length - 1; i++ ){
        console.log(x(partition[i+1]) - x(partition[i]))
        if((x(partition[i+1]) - x(partition[i])) < threshold){
            _failToDrawLegend = true;
            break;
        };
    }

    if(_failToDrawLegend){
        var _max = partition[5];
        var _min = partition[0];
        var _mean = (_max - _min)/5;
        var _drawPartition = [];
        for(var j = 0; j < partition.length; j++){
            _drawPartition.push(_min + j * _mean);
        }
    }else{
        _drawPartition = partition
    }

    var color = d3.scaleThreshold()
        .range(['#FFF','rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'])
        .domain(_drawPartition);
        // .range(d3.schemeBlues[6])
        // .domain(d3.range(0, 6))
    // console.log("color = " + color)

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");

    g.selectAll("rect")
        .data(color.range().map(function(d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) {
            // console.log(d)
            return x(d[1]) - x(d[0]);
        })
        .attr("fill", function(d) { return color(d[0]); });

    g.call(d3.axisBottom(x)
        .tickSize(13)
        // .tickFormat(function(x, i) { console.log(x); console.log(i);  return x; })//i ? x : x + "%"
        .tickFormat(function(x, i) {
            if(_drawPartition){
                return partition[i]
            }else{
                return x;
            }
            // console.log(x); console.log(i);  return x;
        })
        .tickValues(color.domain()))
        .select(".domain")
        .remove();



    $("g.tick > text").attr('fill','#FFF')
    $("g.tick > line").attr('stroke','#FFF')
}

// _setLegend([0,465],[0,15,35,61,111,465])

var _setTimeline = function (dates, pauseTime) {
    // $("#dates").empty()
    // $("#issues").empty()
    $('#timeline').remove()
    $('#timeline-area').append("<div id=\"timeline\"></div>")
    $('#timeline').append("<ul id=\"dates\"></ul>")
    $('#timeline').append("<ul id=\"issues\"></ul>")
    // var _isAutoPlay = 'true'
    // if(_dataAnalysisType == 'block-OD-throughput'){
    //     _isAutoPlay = 'false'
    // }
    $("#timeline-area").css("display", "block")
    for(var i = 0; i < dates.length; i++){
        $("#dates").append("<li><a href=\"#" + dates[i] + "\">" + dates[i] + "</a></li>")
        $("#issues").append("<li id=\"" + dates[i] + "\"></li>")
    }
    console.log(pauseTime)
    var timeline = $('').timelinr({
		autoPlay: 'false',
        autoPlayDirection: 'forward',
        // startAt: parseInt(dates.length / 2 + 1),
        startAt: 1,
        autoPlayPause: pauseTime
        // arrowKey: true
    })
}

// var _addNewEnvLayer = function (itemDate, indicator) {
//     // _timeline.setSelection(itemId);
//     var _formattedTime = _getFormattedTime(itemDate);
//
//     //Query
//     var _queryTime = _formattedTime + " " + itemDate.getHours().toString() + ":00:00.000"
//     // var _sql = _getSQLByTime(_queryTime);
//     // _runQuery(_sql, indicator);
//     // console.log("query time")
//     // console.log(_queryTime)
//     prepareEvnLegendData(_queryTime, indicator)
// }

var _loadEnvData = function (queryTime) {
    $('.dimmer').css('display','block');
    var indicator = _getIndicator()
    var _url = _pmDataUrl + queryTime + '/' + indicator
    // console.log(indicator)
    // console.log(_url)
    $.ajax({
        type: "get",
        url: _url,
        dataType: "json",
        jsonp:"callback",
        success: function (data) {
            legendData = data.level;
            pmData = data.results;
            if(pmData.features.length){
                // console.log('legend data:')
                // console.log(legendData);
                var partition = []
                var scale = []
                for(var i = 0; i < Object.getOwnPropertyNames(legendData).length; i++){
                    partition.push(Number(parseFloat(legendData['level' + i.toString()]).toFixed(1)));
                    if(i == 0 || i == Object.getOwnPropertyNames(legendData).length - 1){
                        scale.push(Number(parseFloat(legendData['level' + i.toString()]).toFixed(1)));
                    }
                }
                // console.log(partition)
                // console.log(scale)
                // _defaultIndi = dataSource[0];
                // _runQuery(sql, indicator, partition)
                _bindEnvData(queryTime, pmData, indicator, partition);
                _setLegend(scale, partition);
            }else{
                $('.dimmer').css('display','none');
                $("svg#legend").empty();
                _clearLayers();
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            console.log('pm data error');
            $('.dimmer').css('display','none');
            $("svg#legend").empty();
            _clearLayers();
            // console.log(errorThrown);
        }
    });
    
}

var _bindEnvData = function (queryTime, pmData, indicator, partition) {
    $('.dimmer').css('display','none');
    if(map.hasLayer(_currentLayer)){
        map.removeLayer(_currentLayer);
    }
    _currentLayer = L.geoJSON(pmData,{
        pointToLayer: _pointToLayer,
        style: function (feature) {
            // return {color: 'rgb(107,174,214)'};
            var value = Number(feature.properties.value);
            // console.log(feature.properties['co'])
            // console.log(value)
            if(value < partition[1]){
                return {
                    color: 'rgb(239,243,255)',
                    weight: 0,
                    fillOpacity: 0.3,
                };
            }else if(value >= partition[1] && value < partition[2]){
                return {
                    color: 'rgb(189,215,231)',
                    weight: 0,
                    fillOpacity: 0.6,
                };
            }else if(value >= partition[2] && value < partition[3]){
                return {
                    color: 'rgb(107,174,214)',
                    weight: 0,
                    fillOpacity: 0.6,
                };
            }else if(value >= partition[3] && value < partition[4]){
                return {
                    color: 'rgb(49,130,189)',
                    weight: 0,
                    fillOpacity: 0.6,
                };
            }else if(value >= partition[4]){
                return {
                    color: 'rgb(8,81,156)',
                    weight: 0,
                    fillOpacity: 0.3,
                };
            }
            // else{
            //     return {
            //         color: 'rgb(239,243,255)',
            //         weight: 2,
            //         fillOpacity: 0.3,
            //     };
            // }
        }
    }).bindPopup(function (layer) {
        // console.log("pop")
        // console.log(layer.feature.properties)
        return L.Util.template('<p>City: {city}<br>Position name: {position_name}<br>' + indicator + ': ' + '{value}' +  '<br>Uint: {unit}<br>Time: ' + queryTime + '</p>', layer.feature.properties);
    }).addTo(map);
    // <br>Station_code: {station_code
}


// var _addAnnalData = function (itemId, itemDate, indicator) {
//     // _timeline.setSelection(itemId);
//     var _annalData = _loadAnnalData(itemDate.getFullYear().toString());//.getFullYear().toString()
// }

var _initEnvLayer = function () {
    var _today = new Date();
    // console.log(_today)
    var _datetime = _getFormattedTime(_today);
    // console.log(((new Date(_datetime + " 24:00")).getTime() - (new Date(_datetime + " 00:00")).getTime()) / 1000/ 60 /60)
    var dates = _getTimelineDates(new Date(_datetime + " 00:00"), new Date(_datetime + " 24:00"));
    _setTimeline(dates, 30000)

    // var items = _getTimelineItems(new Date(_datetime + " 00:00"), new Date(_datetime + " 24:00"));

    // var _middleItem = _getMiddleItem(items);
    // var _middleItemId = _middleItem[0];
    // var _middleItemDate = _middleItem[1];

    // $("#visualization").css('display','block');
    // if(_timeline){
    //     _updateTimeline(items, options, _middleItemDate)
    // }else{
    //     _timeline = new vis.Timeline(timeline_container, items, options);
    //     _timeline.on('select', _onTimeSelected);
    // }

    // var _Indi = _getIndicator();
    // _addNewEnvLayer(_middleItemDate, _Indi);

}

// var sleep = function(n) {
//     var start = new Date().getTime();
//     while(true) if(new Date().getTime()-start > n) break;
// }

var _initAnnalLayer = function () {
    // $('.dimmer').css('display','block');
    // console.log($('.dimmer').css("display"));
    // _annalFeatureLayer.addTo(map);
    _annalFeatureLayer.on('load',function () {
        // $('.dimmer').css('display','none');
    });
    var _today = new Date();
    // console.log(_today)
    var _datetime = _today.getFullYear();
    var dates = _getTimelineDates(_datetime - 4, _datetime);
    _setTimeline(dates, 30000)

    // var items = _getTimelineItems(_datetime - 4, _datetime);
    //
    // var _middleItem = _getMiddleItem(items);
    // var _middleItemId = _middleItem[0];
    // var _middleItemDate = _middleItem[1];

    // $("#visualization").css('display','block');
    // if(_timeline){
    //     _updateTimeline(items, options, _middleItemDate)
    // }else{
    //     _timeline = new vis.Timeline(timeline_container, items, options);
    //     _timeline.on('select', _onTimeSelected);
    // }
    // _timeline.setSelection(_middleItemId);
    // var _indicator = _getIndicator();
    // _addAnnalData(_middleItemId, _middleItemDate, _indicator)
    // _addAnnalData(_middleItemId, '2000', "agriculture_a28")
}

$(function () {
    $('#submit').on('click', function(e) {
        // $('.dimmer').css('display','block');
        _formSubmitted = true;
        // console.log("When click submit:")
        // console.log(_formSubmitted);

        if(_flag == 'EI'){
            _loadEnterpriseData();
            return
        }else if(_flag == 'POI'){
            _loadPOIData();
            return
        }else{
            // Get input time
            console.log('submiit')
            console.log(_timeUnit)
            var _selectedIndicator = '';
            if(_timeUnit == 'h'){
                var _startDate = new Date($('#InputStartTime').val() + " 00:00:00.000");
                var _endDate = new Date($('#InputEndTime').val() +  " 24:00:00.000");
            }else if(_timeUnit == 'y'){
                _startDate = Number($('#InputStartTime').val());
                _endDate = Number($('#InputEndTime').val());
            }
            // console.log(_selectedAttribute)
            if($('#InputStartTime').val() == '' || $('#InputEndTime').val() == ''){
                alert("Please input a time")
                return
            }else{
                console.log("correct time")
                console.log(_startDate)
                console.log(_endDate)
                var dates = _getTimelineDates(_startDate, _endDate)
                _setTimeline(dates,30000)
                // var items = _getTimelineItems(_startDate, _endDate);
                // var dates = _getTimelineDates(_startDate, _endDate);
                // // var _middleTime = new Date((_endDate.getTime() - _startDate.getTime()) / 2 + _startDate.getTime());
                // // console.log(_middleTime);
                //
                //
                // var _middleItem = _getMiddleItem(items);
                // var _middleItemId = _middleItem[0];
                // var _middleItemDate = _middleItem[1];
                // _updateTimeline(items, options, _middleItemDate);
                // // $('.dimmer').css('display','block');
                // if(_timeUnit == 'h'){
                //     _selectedIndicator = $('#indicators').find("option:selected").text();
                //     _addNewEnvLayer(_middleItemDate, _selectedIndicator);
                // }else if(_timeUnit == 'y'){
                //     _selectedIndicator = new Object();
                //     _selectedIndicator['indi_name'] = $('#indicators').find("option:selected").text();
                //     _selectedIndicator['indi_code'] = $('#indicators').find("option:selected").val();
                //     console.log('select node');
                //     console.log(_selectedIndicator)
                //     _addAnnalData(_middleItemId, _middleItemDate, _selectedIndicator);
                // }
            }
        }


    });
});

$("#table-data-button").click(function () {
    var _isDisplay = $('#data-sample').css('display');
    $("#data-chart").css('display', 'none');
    if(_isDisplay == 'none'){
        var _indi = _getIndicator().indi_code;
        // var _timeProperty = _timeline.getSelection();
        var _time = $(".selected").text();
        // if(_timeProperty.length){
        //     _time = _timeProperty[0];
        // }
        var _url = _prepareDataUrl('f',_time + '/' + _indi);
        _loadSampleData(_url);
    }else if(_isDisplay == 'block'){
        // $("#data-sample-table").empty();
        // $("#data-sample").css('display', 'none');
        _clearDataTable()
        $("#download-button-div").css('display', 'none');
    }

})

$(function (){
    $("button[type=reset]").on('click', function (e) {
        _formSubmitted = false;
        // _initLayer();
    })
})

$("#close-table").click(function () {
    $("#download-button-div").css('display', 'none');
    // $("#data-sample").css('display', 'none');
    // $("#data-sample-table").empty();
    _clearDataTable()
})

$("#close-chart").click(function () {
    console.log('close chart')
    $("#data-chart").css('display', 'none');
})

//Drawing and Measuring
L.EditControl = L.Control.extend({
    options: {
        position: 'bottomright',
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
        position: 'bottomright',
        callback: map.editTools.startPolyline,
        kind: 'line',
        html: '<img src="../Style/img/line.png">'
    }
});
L.NewPolygonControl = L.EditControl.extend({
    options: {
        position: 'bottomright',
        callback: map.editTools.startPolygon,
        kind: 'polygon',
        html: '<img src="../Style/img/polygon.png">'
    }
});
// L.NewMarkerControl = L.EditControl.extend({
//     options: {
//         position: 'bottomright',
//         callback: map.editTools.startMarker,
//         kind: 'marker',
//         html: '?'
//     }
// });
L.NewRectangleControl = L.EditControl.extend({
    options: {
        position: 'bottomright',
        callback: map.editTools.startRectangle,
        kind: 'rectangle',
        html: '<img src="../Style/img/rectangle.png">'
    }
});
// L.NewCircleControl = L.EditControl.extend({
//     options: {
//         position: 'bottomright',
//         callback: map.editTools.startCircle,
//         kind: 'circle',
//         html: '⬤'
//     }
// });
// map.addControl(new L.NewMarkerControl());
map.addControl(new L.NewLineControl());
map.addControl(new L.NewPolygonControl());
map.addControl(new L.NewRectangleControl());
// map.addControl(new L.NewCircleControl());

var zoomHome = L.Control.zoomHome({
    position: 'bottomright'
}).addTo(map);

// L.control.zoom({
//     position: "bottomright"
// }).addTo(map);

var searchControl = L.esri.Geocoding.geosearch({
    position: "bottomright"
}).addTo(map);


//Ctrl + Click to delete a shape
var deleteShape = function (e) {
    // console.log(e)
    if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && this.editEnabled()) this.editor.deleteShapeAt(e.latlng);
};

map.on('layeradd', function (e) {
    if (e.layer instanceof L.Path) e.layer.on('click', L.DomEvent.stop).on('click', deleteShape, e.layer);
    // if (e.layer instanceof L.Path) e.layer.on('dblclick', L.DomEvent.stop).on('dblclick', e.layer.toggleEdit);
});

//When drawing
map.on('editable:drawing:end', function (e) {
    // console.log(e)
    // e.editor.feature.showMeasurements()
    e.layer.editor.feature.showMeasurements()
});

map.on('editable:drawing:move', function (e) {
    // console.log(e)
    // e.editor.feature.showMeasurements()
    e.layer.editor.feature.updateMeasurements()
});