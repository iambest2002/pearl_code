const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    books:[],
    bookName: '',      // 单词书名
    wordsNumber: 0,    // 单词数
    everydayWord: 0    // 每日单词数

  },
  updatePlan(data) {
    console.log("接收到的数据:", data);
    // 更新页面数据
    this.setData({
      bookName: data.bookName,
      wordsNumber: data.wordsNumber,
      everydayWord: data.everydayWord
    });
  },
  toSetMyBook(){
    wx.navigateTo({
      url: '/pages/setMyPlan/setMyPlan',
    })
  },
  onLoad: function (){

    // if(wx.getStorageSync('keys')){
    //   this.setData({
    //     word:wx.getStorageSync('keys'),
    //     inputValue:wx.getStorageSync('keys')
    //   })
    //   console(word);
    // }
    // console.log("更新数据:", data); // 添加此行以检查传递的数据
    // this.setData({
    //   bookName: data.bookName,
    //   wordsNumber: data.wordsNumber,
    //   everydayWord: data.everydayWord
    // });
    console.log("页面加载");
    console.log("当前数据:", this.data);
  },
  onShow(){
    // wx.cloud.database().collection('word_books').get()
    // .then(res=>{
    //   console.log(res)
      
    //   let bookNameList = []
    //   for(let i in res.data){
    //     bookNameList.push(res.data[i].name)
    //   }
    //   this.setData({
    //     bookNameList,
    //     book:res.data
    //   })
    // })
    //updatePlan(data);
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
