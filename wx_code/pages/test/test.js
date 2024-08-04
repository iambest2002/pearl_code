// pages/customButton/customButton.js
Page({
  onLoad() {
    // 页面加载时的逻辑
  },

  onNavigateToAccounting() {
    wx.navigateTo({
      url: '/pages/Accounting/Accounting' // 跳转到记账页面
    });
  }
});
