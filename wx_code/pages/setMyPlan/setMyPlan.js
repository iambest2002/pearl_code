// pages/setplan/setplan.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    book:[],
    books:[],
    show: false,
    everydayWord:0
  },

  
  setDanci(event) {
    // console.log("asd")
    console.log(event.detail);
    // console.log(event);
    app.globalData.everydayWord = event.detail
    console.log(app.globalData.everydayWord);
  },

  setBook(e){
    const _index = e.currentTarget.dataset.index
    // let index = this.cates[_index].children
    console.log(_index)
    app.globalData.mybook = _index
    this.setMyBook()
    this.setData({
      show:false
    })
    




  },

  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  setMyBook(){
    var book = app.globalData.mybook
    this.setData({
      books:app.globalData.books,
      book:app.globalData.books[book]
  })
  },
  onLoad(options) {
    this.setMyBook()
    this.setData({
      everydayWord:app.globalData.everydayWord
    })


  },
  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
  },

  savePlan() {
    var bookIndex = app.globalData.mybook;
    var book = app.globalData.books[bookIndex] || {};
    const everydayWord = app.globalData.everydayWord;

    const dataToPass = {
      bookName: book.name,
      wordsNumber: book.wordsNumber,
      everydayWord: everydayWord
    };

    console.log("要传递的数据:", dataToPass); // 检查数据

      const pages = getCurrentPages();
      console.log("当前页面栈:", pages); // 输出当前页面栈

      if (pages.length >= 2) {
        const prevPage = pages[pages.length - 2]; // 获取上一页
        console.log("上一页:", prevPage); // 输出上一页对象

        if (typeof prevPage.updatePlan === 'function') {
          console.log("调用上一页的 updatePlan "); // 检查调用
          prevPage.updatePlan(dataToPass);
        } else {
          console.log("上一页没有 updatePlan 方法");
        }
      } else {
        console.log("上一页不存在");
      }
    
    wx.navigateBack();
},
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})