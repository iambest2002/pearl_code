const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    
  },
  
  onLoad() {
    if(wx.getStorageSync('word')){
      this.setData({
        word:wx.getStorageSync('word'),
        inputValue:wx.getStorageSync('word').query
      })
    }
    
  },
  onShow(){
    wx.cloud.database().collection('word_books').get()
    .then(res=>{
      console.log(res)
      
      let bookNameList = []
      for(let i in res.data){
        bookNameList.push(res.data[i].name)
      }
      this.setData({
        bookNameList,
        book:res.data
      })
    })
  },
  toBook(){


    wx.switchTab({
      url: '/pages/book/book',
      success(){
        wx.showToast({
          icon:'error',
          title: '请先创建生词本',
        })
      }
    })
    
  },
  toAddWord(event){

    
    let wordObject = {}
    // wordObject.bookId = this.data.book[event.detail.value]._id
    wordObject.word = this.data.word
    wordObject.key = this.data.inputValue
    app.globalData.wordObject = wordObject
    
    wx.navigateTo({
      url: '/pages/index/addBook/addBook',
    })
    
  },
  getValue(event){


    console.log(event.detail.value)

    this.setData({
      inputValue:event.detail.value
    })


  },
  search(){
    var that = this
    wx.request({
      url: 'https://route.showapi.com/32-10?showapi_appid=937614&showapi_sign=6da064881fd6486ebf6de636f4df3b24&q=' + this.data.inputValue,
      method:'POST',
      success(res){
        console.log(res.data.showapi_res_body)
        that.setData({
          word:res.data.showapi_res_body
        })
        wx.setStorageSync('word', res.data.showapi_res_body)
        if(wx.getStorageSync('history')){
          let history = wx.getStorageSync('history')
          history.push(that.data.inputValue)
          wx.setStorageSync('history', history)
        }else{
          let history = []
          history.push(that.data.inputValue)
          wx.setStorageSync('history', history)
        }
        

      }
    })



  }
})
