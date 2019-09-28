// import socket from './socket.js';
// import Event from './event.js'

/*********************************************/

// 次文件只需要关注 getBars 和 subscribeBars 函数即可

/******************************************/

// 历史数据 第一条数据的 时间撮 因为k线图一次性历史数据只拿一部分，用户吧图往前滑动，就会用这个时间撮去请求更早的 历史数据
var detafeed_historyTime = 0
// 上一次的 K线周期 切换产品的时候 需要从websock 取消订阅这个
var detafeed_lastResolution = null
// 上一次的产品 切换产品的时候 需要从websock 取消订阅这个
var detafeed_lastSymbol = null


function FeedBase () {}

FeedBase.prototype.onReady = function (callback) {
  callback(this._configuration)
}

FeedBase.prototype.getSendSymbolName = function (symbolName) {
  var name = symbolName.split('/')
  return (name[0] + name[1]).toLocaleLowerCase()
}

FeedBase.prototype.resolveSymbol = function (symbolName, onResolve, onError) {
  onResolve({
    "name": symbolName,
    "timezone": "Asia/Shanghai",
    "pricescale": 100,
    "minmov": 1,
    "minmov2": 0,
    "ticker": symbolName,
    "description": "",
    "session": "24x7",
    "type": "bitcoin",
    "volume_precision": 10,
    "has_intraday": true,
    "intraday_multipliers": ['1', '3', '5', '15', '30', '60'], // 时间
    "has_weekly_and_monthly": false,
    "has_no_volume": false,
    "regular_session": "24x7"
  })
}

FeedBase.prototype.getApiTime = function (resolution) {
  switch (resolution) {
    case '1':
      return 'M1'
    case '3':
      return 'M3'
    case '5':
      return 'M5'
    case '15':
      return 'M15'
    case '30':
      return 'M30'
    case '60':
      return 'H1'
  }
}

FeedBase.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError) {
  // 切换产品周期 或者 切换产品 会执行这个函数

  // 是历史数据 
  var history = true

  /*
    !detafeed_historyTime 如果没请请求过这个产品或者这个周期的历史数据
    resolution !== detafeed_lastResolution 是否更换了产品周期
    detafeed_lastSymbol !== symbolInfo.name 是否切换了产品
  */

  if (!detafeed_historyTime || (resolution !== detafeed_lastResolution) || detafeed_lastSymbol !== symbolInfo.name) {
    // 那就不是历史数据
    history = false
    // 储存请求过的产品
    detafeed_lastSymbol = symbolInfo.name
    // 记录目前时间搓，就用目前的目前时间搓往前请求历史数据
    detafeed_historyTime = window.parseInt((Date.now() / 1000))
  }


  /*
    @socket.sendData
    第一个参数订阅历史数据
    第二个参数订阅实时数据
    第三个参数 是  是否是历史数据
  */
  socket.sendData({
    args: [`candle.${this.getApiTime(resolution)}.${this.getSendSymbolName(symbolInfo.name)}`, 1441, detafeed_historyTime],
    cmd: 'req',
    id: '0a0493f7-80d4-4d1a-9d98-6da9ae9d399e'
  }, `candle.${this.getApiTime(resolution)}.${this.getSendSymbolName(symbolInfo.name)}`, history)
  Event.off('data')

  Event.on('data', data => {
    if (data.data && Array.isArray(data.data)) {
      // 记录这次请求的时间周期
      detafeed_lastResolution = resolution
      var meta = {noData: false}
      var bars = []
      if (data.data.length) {
        detafeed_historyTime = data.data[0].id - 1
        for (var i = 0; i < data.data.length; i += 1) {
          bars.push({
            time: data.data[i].id * 1000,
            close: data.data[i].close,
            open: data.data[i].open,
            high: data.data[i].high,
            low: data.data[i].low,
            volume: data.data[i].base_vol
          })
        }
      } else {
        meta = {noData: true}
      }
      onResult(bars, meta)
    }
  })
}


FeedBase.prototype.subscribeBars = function (symbolInfo, resolution, onTick, listenerGuid, onResetCacheNeededCallback) {
  Event.off('realTime')

  // 拿到实时数据 在这里画
  Event.on('realTime', data => {
    if (Object.prototype.toString.call(data) === '[object Object]' && data.hasOwnProperty('open')) {
      onTick({
        time: data.id * 1000,
        close: data.close,
        open: data.open,
        high: data.high,
        low: data.low,
        volume: data.base_vol
      })
    }
  })
}

FeedBase.prototype.unsubscribeBars = function (listenerGuid) {
  // 取消订阅产品的callback
}
