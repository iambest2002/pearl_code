// pages/user/function/function.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

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

  tolottery() {
    wx.navigateTo({
      url: './lottery/lottery'
    });
  },
  tocalculator() {
    wx.navigateTo({
      url: './calculator/calculator'
    });
  },
})