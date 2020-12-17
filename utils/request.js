/**
 * isDebug true 是测试
 * isDebug false 是正式
 * serviceUrl 默认请求地址
 */
let serviceUrl = ''
let isDebug = false
serviceUrl = isDebug == true ? 'https://wechat-app.debug.packertec.com/food-collect' : 'https://wechat-app.packertec.com/food-collect'
let getToken = function() {
  if (wx.getStorageSync('token')) {
    return wx.getStorageSync('token')
  }
  return false
}
//_checkSession 是判断是否已经登录状态
let _checkSession = function() {
  return new Promise((resolve, reject) => { 
    wx.checkSession({
      success: function(res) {
        resolve(true)
      },
      fail: function(res) {
        resolve(false)
      }
    })
  })
}
let checkLoginStatus = async function() {
  const res = await _checkSession()
  return res
}
/**
 * api 请求地址
 * params 参数
 */
export function request(api, params) {
  return new Promise(async(resolve, reject) => {
      //!await checkLoginStatus() && !getToken() 条件是没有登录或者没有token值
    if (!await checkLoginStatus() && !getToken()) {
      wx.showLoading({
        title: "请稍后",
        mask: true
      })
      wx.login({
        success: login_res => {
          wx.request({
            url: serviceUrl + '/api/miniapp/login',
            method: "POST",
            data: {
              js_code: login_res.code,
              appid: "wx18402c89250816e6",
            //   company_id:wx.getStorageSync('companyId')?wx.getStorageSync('companyId'):1
            },
            header: {
              // 将数据转换成 query string 
              'content-type': 'application/x-www-form-urlencoded',
            },
            success: e => {
              if (e.statusCode == 200) {
                wx.setStorageSync('token', e.data.data.session_key)
                wx.request({
                  url: serviceUrl + api,
                  method: "POST",
                  data: params,
                  header: {
                    // 将数据转换成 query string 
                    'content-type': 'application/x-www-form-urlencoded',
                    'TOKEN': getToken(),
                  },
                  success: res => {
                    if (e.statusCode == 200) {
                      resolve(res.data);
                    } else {
                      reject("请求失败");
                    }
                    wx.hideLoading()
                  },
                  fail: function(error) {
                    wx.hideLoading()
                    reject('接口请求异常');
                  }
                })
              } else {
                reject("登录状态异常");
              }
              wx.hideLoading()
            },
            fail: function(error) {
              wx.hideLoading()
              reject('系统异常');
            }
          })
        }
      })
    } else {
      wx.showLoading({
        title: "请稍后",
        mask: true
      })
      wx.request({
        url: serviceUrl + api,
        method: "POST",
        data: params,
        header: {
          // 将数据转换成 query string 
          'content-type': 'application/x-www-form-urlencoded',
          'TOKEN': getToken()
        },
        success: (res) => {
          if (res.statusCode == 200) {
            //   res.data.code == -1 没有登录是否过期的时候
            if (res.data.code == -1 ) {
              wx.login({
                success: login_res => {
                  wx.request({
                    url: serviceUrl + '/api/miniapp/login',
                    method: "POST",
                    data: {
                      js_code: login_res.code,
                      appid: "wx18402c89250816e6",
                    //   company_id:wx.getStorageSync('companyId')?wx.getStorageSync('companyId'):1
                    },
                    header: {
                      // 将数据转换成 query string 
                      'content-type': 'application/x-www-form-urlencoded',
                    },
                    success: e => {
                      if (e.statusCode == 200) {
                        wx.setStorageSync('token', e.data.data.session_key)
                         wx.setStorageSync('isCompanyId', wx.getStorageSync('companyId'))
                        wx.request({
                          url: serviceUrl + api,
                          method: "POST",
                          data: params,
                          header: {
                            // 将数据转换成 query string 
                            'content-type': 'application/x-www-form-urlencoded',
                            'TOKEN': getToken(),
                          },
                          success: res => {
                            if (e.statusCode == 200) {
                              resolve(res.data);
                            } else {
                              reject("请求失败");
                            }
                            wx.hideLoading()
                          },
                          fail: function(error) {
                            wx.hideLoading()
                            reject('接口请求异常');
                          }
                        })
                      } else {
                        reject("登录状态异常");
                      }
                      wx.hideLoading()
                    },
                    fail: function(error) {
                      wx.hideLoading()
                      reject('系统异常');
                    }
                  })
                }
              })
            } else {
              resolve(res.data);
            }
          } else {
            reject("请求失败");
          }
          wx.hideLoading()
        },
        fail: function(error) {
          wx.hideLoading()
          reject('请求异常');
        }
      })
    }
  })
}