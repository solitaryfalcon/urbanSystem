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
				var url = "http://10.10.240.120:8989/json/log/status/80/2016-01-01/2017-01-01";
				var dataSource = [];
				$.ajax({ 
						  type: "get", 
						  url: url,
						  dataType: "json",
						  jsonp:"callback",
						  success: function (data) { 
										  dataSource = data.results;
										  console.log(dataSource);
										  addData();
										   }, 
						  error: function (XMLHttpRequest, textStatus, errorThrown) { 
						  alert(errorThrown); 
						 } 
					 });
				//result ajax 取
				function addData(){
					var result = dataSource;
					var seriesResult = [];
					var dataResult_this = [];
					var dataResult_real = [];
					var dateValue = [];
					for(var i = 0;i<result.length;i++){
						var value_this = result[i].countThis;
						var value_real = result[i].countReal;
						var date = new Date(result[i].statisTime);
						var dateString = [date.getFullYear(),date.getMonth()+1,date.getDate()].join('/');
						dataResult_this.push(value_this);
						dataResult_real.push(value_real);
						dateValue.push(dateString);
					}
					//最后更新时间
					var lastTime = new Date(result[result.length-1].statisTime);
					var lastTimeStr = [lastTime.getFullYear(),lastTime.getMonth()+1,lastTime.getDate()].join('/')+" "
					+[lastTime.getHours(),lastTime.getMinutes(),lastTime.getSeconds()].join(':');
					document.getElementById("houseLastTime").innerHTML = lastTimeStr;
					//console.log("data", seriesResult);
					var myChart = ec.init(document.getElementById('house'));
					var ecConfig = require('echarts/config');
					var option = {
						title: {
							text: '',
							x: 'center'
						},
						tooltip: {
							trigger: 'axis'
						},
						legend: {
							data: ['数据总条数','清洗后条数'],
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
						yAxis: [{
							type: 'value',
						}],
						series: [
								{
								name: '数据总条数',
								type: 'line',
								//boundaryGap:false,
								data: dataResult_this,
								itemStyle:{
								  normal:{color:'orange'}
							  },
							},
							{
								name: '清洗后条数',
								type: 'line',
								//boundaryGap:false,
								data: dataResult_real,
								itemStyle:{
								  normal:{color:'green'}
							  },
							},
						],
					};
					myChart.setOption(option);
				}
            }
        ); 