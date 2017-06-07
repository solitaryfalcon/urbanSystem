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
            ],
            function (ec) {
				var url = "http://10.10.240.120:8989/json/server_status";
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
					var freeMemory = [];
					var cache = [];
					var dateValue = [];
					for(var i = 0;i<result.length;i++){
						var value_freeMemory = result[i].free;
						var value_cache = result[i].cache;
						var date = new Date(result[i].time);
						var dateString = [date.getFullYear(),date.getMonth()+1,date.getDate()].join('/');
						freeMemory.push(value_freeMemory);
						cache.push(value_cache);
						dateValue.push(dateString);
					}
					//其他数据
					//内存占用
					var cpuOccupy = 100-result[result.length-1].fc;
					document.getElementById("cpu").innerHTML = cpuOccupy+"%";
					//缓冲区
					var buff = result[result.length-1].buff;
					document.getElementById("buff").innerHTML = buff;
					//运行队列
					var runQueue = result[result.length-1].r;
					document.getElementById("runQueue").innerHTML = runQueue;
					//发送块设备
					var blockOut = result[result.length-1].bo;
					document.getElementById("blockOut").innerHTML = blockOut + "/s";
					//接收块设备
					var blockIn = result[result.length-1].bi;
					document.getElementById("blockIn").innerHTML = blockIn + "/s";
					//console.log("data", seriesResult);
					var myChart = ec.init(document.getElementById('server_status'));
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
							data: ['空闲物理内存','缓存'],
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
							splitNumber:10,
						}],
						series: [
								{
								name: '空闲物理内存',
								type: 'line',
								//boundaryGap:false,
								data: freeMemory,
								itemStyle:{
								  normal:{color:'orange'}
							  },
							},
							{
								name: '缓存',
								type: 'line',
								//boundaryGap:false,
								data: cache,
								itemStyle:{
								  normal:{color:'purple'}
							  },
							},
						],
					};
					myChart.setOption(option);
				}
            }
        ); 