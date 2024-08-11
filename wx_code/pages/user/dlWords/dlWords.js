// pages/user/dlWords/dlWords.js
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
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  dlCET4Words(){
    wx.cloud.downloadFile({
      fileID: 'cloud://daily-consumption-1eonh2e259454a.6461-daily-consumption-1eonh2e259454a-1327338363/3-CET4-顺序.json', // 上传后获得的文件ID
      success: res => {
        const filePath = res.tempFilePath;
        // 保存文件到用户设备
        wx.saveFile({
          tempFilePath: filePath,
          success: saveRes => {
            console.log('文件保存成功', saveRes.savedFilePath);
          },
          fail: err => {
            console.error('文件保存失败', err);
          }
        });
      },
      fail: err => {
        console.error('文件下载失败', err);
      }
    });
    
  },

 
})