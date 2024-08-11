// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: "daily-consumption-1eonh2e259454a",//修改成自己的云环境名称
      traceUser: true,
    })
    var that = this;
    wx.cloud.callFunction({
      name:'getOpenid',
      success(res){
        console.log(res)
        that.globalData.openid = res.result.openid
      }
    })


    if(wx.getStorageSync('userInfo')){
      this.globalData.userInfo = wx.getStorageSync('userInfo')
      this.getUserinfo()
    }
    
  },
  getUserinfo(){
    //获取用户的openid
    var that = this;
    wx.cloud.callFunction({
      name:'getOpenid',
      success(res){
        console.log(res)
        that.globalData.openid = res.result.openid

        //查找数据库用户表里面是否有这个用户记录
        wx.cloud.database().collection('user').where({
          _openid: res.result.openid
        }).get({
          success(result){

            console.log(result)
            that.globalData.userInfo = result.data[0]
            wx.setStorageSync('userInfo', result.data[0])
          }
        })

      }
    })
  },
  globalData: {
    userInfo: null,
    openid:null,
    wordObject: null
  }
})
