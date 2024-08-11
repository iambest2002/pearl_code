
Page({

  data: {

  },
   toSearch(){
    wx.navigateTo({
      url: '/pages/book/search/search',
    })
  },
  onLoad: function (options) {

    console.log(options.id)

    wx.cloud.database().collection('word_books')
    .doc(options.id)
    .get()
    .then(res=>{
      console.log(res)
      this.setData({
        book:res.data
      })
    })

    wx.cloud.database().collection('word_words')
    .where({
      bookId:options.id
    })
    .orderBy('time','desc')
    .get()
    .then(res=>{
      console.log(res.data)
      this.setData({
        bookList:res.data
      })
    })

  },

})