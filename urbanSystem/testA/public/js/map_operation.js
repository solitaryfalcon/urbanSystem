/**
 * Created by chenweiyi on 19/11/2016.
 */

var _dataSampleUrl = 'http://10.10.240.120:8989/json/sample/';
var _annalTableDataUrl = 'http://10.10.240.120:8989/json/annal/table/';//year/indi

var _annalIndiUrl = 'http://10.10.240.120:8989/json/annal/indi/';
var _pm2_5IndiUrl = 'http://10.10.240.120:8989/json/pm/indi';

var _treeUrl = 'http://10.10.240.120:8989/json/survey';




var _getRequest = function() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}

var _request = _getRequest();
var _typeId = _request['id'];
console.log(_typeId);

var setThemeTitle = function () {
    console.log("set theme")
    switch(_typeId){
        case '0':
            $('#themeName').html('公共设施')
            break;
        case '1':
            $('#themeName').html('环&nbsp&nbsp&nbsp境');
            break;
        case '2':
            $('#themeName').html('交&nbsp&nbsp&nbsp通');
            break;
        case '3':
            $('#themeName').html('经&nbsp&nbsp&nbsp济');
            break;
        case '4':
            $('#themeName').html('社&nbsp&nbsp&nbsp会');
            break;
    }
}

setThemeTitle()
$("body").mousedown(function () {
    $("#themeName").fadeOut(1000);
	$("#themeName").css('display', 'none')

})

// left side
//Slide trigger
$("#slide_button").click(function () {
    $('#search_field').toggle();
    var display = $("#search_field").css("display");
    if(display == 'none'){
        $("#direction").attr('src',"../Style/img/right.png");
    }
    else{
        $("#direction").attr('src',"../Style/img/left.png");
    }
});

// datetime picker
var _setDatetimePicker = function (timeUnit) {

    var _minView = 2;
    var _format = "yyyy-mm-dd"
    console.log(timeUnit)
    if(timeUnit == 'y'){
        _minView = 4;
        _format = "yyyy"
    }
    // console.log(_minView);
    // console.log(_format)
    $('#InputStartTime').datetimepicker('remove');
    $('#InputEndTime').datetimepicker('remove');
    var $startTime = $('#InputStartTime').datetimepicker({
        autoclose: 1,
        todayBtn:  1,
        minView: _minView,
        forceParse: 0,
        startView: _minView,
        format: _format
    });
    var $endTime = $('#InputEndTime').datetimepicker({
        autoclose: 1,
        todayBtn:  1,
        minView: _minView,
        forceParse: 0,
        startView: _minView,
        format: _format
    });

    $startTime.on("changeDate", function (e) {
        $endTime.datetimepicker('setStartDate', e.date);
        // $('#InputEndTime').data("DateTimePicker").minDate(e.date);
    });
    $endTime.on("changeDate", function (e) {
        $startTime.datetimepicker('setEndDate', e.date);
        // $('#InputEndTime').data("DateTimePicker").minDate(e.date);
    });

};
//datetime picker

$("#data-analyze-button").click(function() {
    //if(_typeId == 4){
    //    self.location='analysis/selected.html';
    //}
    // $("#data-explore").css("display", "none");
    // if($("#density-analysis").css("display") == 'none'){
    //     $("#data-analyze").toggle()
    // }else{
    //     $("#density-analysis").css("display", "none");
    // }
    //
    // var analyze_display = $("#data-analyze").css("display");
    // var detail_analysis_display = $("#density-analysis").css("display");
    // // console.log(analyze_display)
    // if(analyze_display == 'none' && detail_analysis_display == 'none'){
    //     $("#data-analyze-button").css("color",'white')
    //     $("#data-analyze-button").css("border-bottom-color",'white')
    // }
    // else{
    //     $("#data-analyze-button").css("color",'#3affff')
    //     $("#data-analyze-button").css("border-bottom-color",'#3affff')
    //     $("#data-explore-button").css("color",'white')
    //     $("#data-explore-button").css("border-bottom-color",'white')
    // }
});
$("#data-explore-button").click(function() {
    $("#data-analyze").css("display", "none");
    $("#density-analysis").css("display", "none");
    $("#data-explore").toggle()
    var display = $("#data-explore").css("display");
    if(display == 'none'){
        $("#data-explore-button").css("color",'white')
        $("#data-explore-button").css("border-bottom-color",'white')
    }
    else{
        $("#data-explore-button").css("color",'#3affff')
        $("#data-explore-button").css("border-bottom-color",'#3affff')
        $("#data-analyze-button").css("color",'white')
        $("#data-analyze-button").css("border-bottom-color",'white')
    }
});

$("#home").click(function (){
    self.location = 'userHome'
})

$("#density-analysis-button").click(function () {
    $('#data-analyze').toggle()
    $('#density-analysis').toggle()
})

$("#exit-desity-analysis").click(function () {
    $('#density-analysis').toggle();
    $('#data-analyze').toggle();
})

//clear leaflet marker
$(".leaflet-control-attribution.leaflet-control").css("display", "none")


//reset
$("button[type=reset]").trigger("click");
