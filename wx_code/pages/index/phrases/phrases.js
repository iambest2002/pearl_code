Page({
  data: {
    phrases: []
  },
  onLoad(options) {
    try {
      const phrases = options.phrases ? JSON.parse(decodeURIComponent(options.phrases)) : [];
      
      // 设置页面数据
      this.setData({
        phrases: phrases
      });

      // 如果短语数据为空，显示提示信息
      if (phrases.length === 0) {
        wx.showToast({
          title: '没有短语数据',
          icon: 'none'
        });
      }

    } catch (error) {
      console.error('解析 phrases 数据时出错:', error);
      wx.showToast({
        title: '加载数据出错',
        icon: 'none'
      });
    }
  }
})
