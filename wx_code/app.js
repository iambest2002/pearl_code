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
    wordObject: null,
    daySentence1: "",
    daySentence2: "",
    daySentence3: "",
    navBarHeight: 0, // 导航栏高度
    menuRight: 0, // 胶囊距右方间距（方保持左、右间距一致）
    menuTop: 0, // 胶囊距底部间距（保持底部间距一致）
    menuHeight: 0, // 胶囊高度（自定义内容可与胶囊高度保证一致）
    books: [
      {
        "_id": "CET4Full",
        "title": "四级大纲词 『CET4+』",
        "desc": "cet4WordsGrouped",
        "name": "四级大纲词",
        "wordsNumber": 4976,
        "peopleNumber": 0.0,
        "image": "/image/book-CET4Full.png"
      },
      {
        "_id": "CET6Full",
        "title": "六级大纲词 『CET6+』",
        "desc": "cet6WordsGrouped",
        "name": "六级大纲词",
        "wordsNumber": 3994,
        "peopleNumber": 0.0,
        "image": "/image/book-CET4Full.png"
      },
      {
        "_id": "kaoYanFull",
        "title": "考研大纲词汇 『考研+』",
        "desc": "pgeeWordsGrouped",
        "name": "考研大纲词汇",
        "wordsNumber": 5058,
        "peopleNumber": 0.0,
        "image": "/image/book-CET4Full.png"
      },
      
    ],
    value:0,
    mybook: 0,
    everydayWord: 100,
    learnedWord: 0,
  }
})
