Page({
  data: {
    filteredData: [],
    csvData: [],
    totalPrice: 0 // 添加 totalPrice 属性
  },

  getData: function() {
    var that = this;
    wx.request({
      url: 'http://42.193.121.229:80/wx/wx_transmission/',
      method: 'GET',
      success: function(res) {
        let data = res.data;
        if (typeof data !== 'string') {
          data = JSON.stringify(data);
        }
        
        if (data && data.trim().length > 0) {
          console.log('获取到的 CSV 数据:', data);
          const csvData = that.parseCSV(data);
          const totalPrice = that.calculateTotalPrice(csvData); // 计算价格总和
          that.setData({
            filteredData: csvData,
            totalPrice: totalPrice // 保存价格总和
          });
          console.log('解析后的 CSV 数据:', csvData);
          console.log('总价格:', totalPrice); // 输出总价格到控制台
        } else {
          wx.showToast({
            title: '没有获取到数据',
            icon: 'none',
            duration: 2000
          });
          console.warn('获取到的数据为空');
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '请求失败，请稍后再试',
          icon: 'none',
          duration: 2000
        });
        console.error('请求失败', err);
      }
    });
  },

  parseCSV: function(data) {
    const lines = data.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');

      // 如果行为空，则跳过
      if (currentLine.length === 1 && currentLine[0] === '') continue;

      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].trim();
        const value = currentLine[j] ? currentLine[j].trim() : '';
        obj[header] = value;
      }
      result.push(obj);
    }
    return result;
  },

  calculateTotalPrice: function(data) {
    return data.reduce((total, item) => {
      const price = parseFloat(item['消费价格']); // 假设价格字段名为 'price'
      return total + (isNaN(price) ? 0 : price);
    }, 0);
  },

  onLoad: function() {
    this.getData();
  }
});

