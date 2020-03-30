// 图表库实例化后储存的函数
var widget = null 
// 进入页面 默认展示的产品
var index_market = 'btcusdt'
// 进入页面 默认展示的产品周期
var index_activeCycle = 5


// window.TradingView.onready 确保在html的dom加载完成后在调用
window.TradingView.onready(function () {
  // chartConfig 在chartConfig.js里面
  // 给chartConfig添加展示周期
  chartConfig.interval = index_activeCycle
  // 给chartConfig添加展示产品
  chartConfig.symbol = index_market

  // 初始化 TradingView
  widget = new window.TradingView.widget(chartConfig)

  widget && widget.onChartReady && widget.onChartReady(function () {
    // 这是k线图 展示的 7日均线和30日均线。
    widget.chart().createStudy('Moving Average', false, false, [7], null, {'Plot.linewidth': 2, 'Plot.color': '#2ba7d6'})
    widget.chart().createStudy('Moving Average', false, false, [30], null, {'Plot.linewidth': 2, 'Plot.color': '#de9f66'})
		setTimeout(() => {
			widget.chart().resetData()
		}, 1000)
	})
})


var marketDom = document.getElementById('symbol')
var intervalDom = document.getElementById('interval')

// 切换产品
marketDom.addEventListener('click', function (e) {
  // e.target.dataset.value 就是我们拿到的产品
  // 5是 5分钟数据
  widget.setSymbol(e.target.dataset.value, 5)
	// 切回平均K线
	widget.chart().setChartType(1)
  // 这个函数不用看，我为了样式好看 写一个添加删除class
  addClass(marketDom, e.target)
	addClass(intervalDom, intervalDom.children[1])
	
}, false)

// 切换产品周期
intervalDom.addEventListener('click', function (e) {
  // e.target.dataset.value 这个就是获取的产品的周期
	console.log(e.target.dataset.value)
	// 1 为平均K线； 3 为面积图
	widget.chart().setChartType(e.target.dataset.value == '1' ? 3 : 1)
  widget.chart().setResolution(e.target.dataset.value)
  // 这个函数不用看，我为了样式好看 写一个添加删除class
  addClass(intervalDom, e.target)
}, false)




// 单纯的写一个添加class的函数，这个不用看 没用
function addClass (fatherDom, dom) {
  [...fatherDom.getElementsByTagName('span')].forEach(function(item){
    item.className = ''
  })
  dom.className = 'active'
}