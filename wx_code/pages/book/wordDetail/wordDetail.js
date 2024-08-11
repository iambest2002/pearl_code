
Page({

  data: {

  },

  onLoad: function (options) {
    wx.cloud.database().collection('word_words')
    .doc(options.id)
    .get()
    .then(res=>{
      console.log(res.data)
      this.setData({
        word:res.data
      })
    })
  }

 
})