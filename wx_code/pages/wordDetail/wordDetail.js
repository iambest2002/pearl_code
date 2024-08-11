const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    
  },
  
  onLoad(options) {
    // if(wx.getStorageSync('word')){
    //   this.setData({
    //     word:wx.getStorageSync('word')
    //   })
    // }

    this.setData({
      inputValue:options.word,
    })
    this.search()
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
  bindPickerChange(event){
    
    console.log(this.data.book[event.detail.value]._id)
    wx.cloud.database().collection('word_words').add({
      data:{
        bookId:this.data.book[event.detail.value]._id,
        word:this.data.word,
        key:this.data.inputValue,
        time:util.formatTime(new Date())
      }
    })
    .then(res=>{
      console.log(res)
      wx.showToast({
        title: '添加成功',
      })
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
      url: 'https://route.showapi.com/32-10?showapi_appid=1664651&showapi_sign=7a767d6ec1f74c0baf76580b80c61ed1&q=' + this.data.inputValue,
      method:'POST',
      success(res){
        console.log(res.data.showapi_res_body)
        that.setData({
          word:res.data.showapi_res_body
        })
        wx.setStorageSync('word', res.data.showapi_res_body)
      }
    })



  }
})
