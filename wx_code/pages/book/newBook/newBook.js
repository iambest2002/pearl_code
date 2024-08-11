

const util = require('../../../utils/util.js')
Page({

  data: {



  },


  onLoad: function (options) {



  },
  getName(event){
    this.setData({
      name:event.detail.value
    })
  },
  getText(event){
    this.setData({
      note:event.detail.value
    })
  },
  submit(){

    wx.cloud.database().collection('word_books').add({
      data:{
        name:this.data.name,
        note:this.data.note,
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


  }

})


