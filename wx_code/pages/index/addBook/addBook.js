const app = getApp()
const util = require('../../../utils/util.js')
Page({


  data: {

  },


  onLoad: function (options) {
    console.log(app.globalData.wordObject)
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

  bindPickerChange(event){
    let wordObject = {}
    // wordObject.bookId = this.data.book[event.detail.value]._id
    wordObject.word = this.data.word
    wordObject.key = this.data.inputValue
    app.globalData.wordObject = wordObject
    console.log(this.data.book[event.detail.value]._id)
    wx.cloud.database().collection('word_words').add({
      data:{
        note:this.data.note,
        bookId:this.data.book[event.detail.value]._id,

        wordObject:wordObject,

        time:util.formatTime(new Date())
      }
    })
    .then(res=>{
      console.log(res)
      wx.navigateBack({
        delta: 0,
        success(){
          wx.showToast({
            title: '添加成功',
          })
        }
      })
    })
  },

  getValue(event){

    console.log(event.detail.value)

    this.setData({
      note:event.detail.value
    })

  }

  
})