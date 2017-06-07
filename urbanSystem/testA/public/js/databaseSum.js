require.config({
            paths: {
                echarts: './build/dist' //引用资源文件夹路径，注意路径
            }
        });
        require(
            [
                'echarts',
                'echarts/chart/line',   // 按需加载所需图表，用到什么类型就加载什么类型，这里不需要考虑路径                    
                'echarts/chart/bar'     //柱形图
                //'echarts/chart/line'    //折线图
                //'echarts/chart/pie'     //饼图  （如需饼漏斗图动态类型切换，require时还需要echarts/chart/funnel）
                //'echarts/chart/chord'   //和弦图
                //'echarts/chart/map'     //地图
                //'echarts/chart/radar'   //雷达    
            ],
            function (ec) {
				var url = "http://10.10.240.120:8989/json/all/log";
				var dataSource = [];
				$.ajax({ 
						  type: "get", 
						  url: url,
						  dataType: "json",
						  jsonp:"callback",
						  success: function (data) { 
										  dataSource = data.results;
										  //console.log(dataSource);
										  addData();
										   }, 
						  error: function (XMLHttpRequest, textStatus, errorThrown) { 
						  alert(errorThrown); 
						 } 
					 });
				//result ajax 取
				//var result = [{"value":5.0, "date":"2016-10-22 18:00:00.0"},{"value":6.0, "date":"2016-10-23 18:00:00.0"},{"value":7.0, "date":"2016-10-24 18:00:00.0"}];
				function addData(){
					var result = dataSource;
					var seriesResult = [];
					var dataResult = [];
					var dateValue = [];
					for(var i = 0;i<result.length;i++){
						
						var value = result[i].count_number;
						var date = new Date(result[i].statis_time);
						var dateString = [date.getFullYear(),date.getMonth()+1,date.getDate()].join('/');
						dataResult.push(value);
						dateValue.push(dateString);
					}
					var ymin = result[0].count_number;
					var ymax = result[result.length-1].count_number;
					/* var dataTotal = result[result.length-1].value;
					var inputDataTotal = document.getElementById("dataTotal");
					inputDataTotal.innerHTML = dataTotal; */
					//console.log("data", seriesResult);
					var myChart = ec.init(document.getElementById('databaseSum'));
					var ecConfig = require('echarts/config');
					var option = {
						title: {
							text: '数据总量',
							x: 'left'
						},
						tooltip: {
							trigger: 'axis'
						},
						legend: {
							data: ['数据总量'],
							y: "bottom"
						},
						toolbox: {
							show: false, //是否显示工具箱
							feature: {
								mark: { show: true },
								dataView: { show: true, readOnly: false },
								magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
								restore: { show: true },
								saveAsImage: { show: true }
							}
						},
						dataZoom:[
							{
								show:true,
								realtime:true,
								start:0,
								end:30,
							},
							{
								type:'inside',
								realtime:true,
								start:0,
								end:30,
							},
						],
						//calculable: true,    容易搞错的属性，折线图、柱状图是否叠加
						xAxis: [{
							type: 'category',
							data:dateValue,
						}],
						grid: { // 控制图的大小，调整下面这些值就可以，
							 x: 100,
							 x2: 0,
							 y2: 60,// y2可以控制 X轴跟Zoom控件之间的间隔，避免以为倾斜后造成 label重叠到zoom上
						 },
						yAxis: [{
							type: 'value',
							min: ymin,
							max: ymax,
							splitNumber:2,
						}],
						series: [
								{
								name: '数据总量',
								type: 'line',
								//boundaryGap:false,
								data: dataResult,
							},
						],
					};
					myChart.setOption(option);
				}
            }
        ); 