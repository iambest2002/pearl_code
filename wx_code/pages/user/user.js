var util = require("../../utils/util.js")
const app = getApp()
Page({
  data: {
    showNotice: false, // 控制公告栏显示
    noticeContent: '欢迎使用！本次更新内容：1.增加小功能：自定义抽奖内容（比如今天吃什么）2.优化公告弹出框显示', // 公告内容
  },

  onLoad() {
    this.checkNoticeDisplay(); // 检查公告栏是否需要显示
  },
  // 检查公告栏显示条件
  checkNoticeDisplay() {
    const lastDisplay = wx.getStorageSync('lastNoticeDisplay') || 0;
    const now = new Date().getTime();
    const diff = now - lastDisplay;

    // 如果超过 2 小时或者没有记录，显示公告栏
    if (diff > 30 * 60 * 1000) {
      this.setData({
        showNotice: true
      });
    }
  },

  // 关闭公告栏
  onCloseNotice() {
    this.setData({
      showNotice: false
    });
  },

  // 用户选择 "今天不再显示"
  onNotToday() {
    const now = new Date().getTime();
    const endOfToday = new Date().setHours(23, 59, 59, 999);

    // 保存今天不再显示的记录
    wx.setStorageSync('lastNoticeDisplay', endOfToday);
    this.setData({
      showNotice: false
    });
  },

  // 用户选择 "关闭"
  onCloseNotice() {
    // 保存当前时间
    wx.setStorageSync('lastNoticeDisplay', new Date().getTime());
    this.setData({
      showNotice: false
    });
  },
  previewImg: function (e) {

    wx.previewImage({
      current: this.data.userInfo.avatarUrl, //当前图片地址  
      //所有要预览的图片的地址集合 数组形式
      urls: [this.data.userInfo.avatarUrl],

    })
  },
  toUserInfo() {
    wx.navigateTo({
      url: './userInfo/userInfo',
    })
  },
  toGetWords() {
    wx.navigateTo({
      url: './getWords/getWords',
    })
  },
  toScheduleAccounting() {
    wx.navigateTo({
      url: './accounting/accounting'
    });
  },
  toFunction() {
    wx.navigateTo({
      url: './function/function'
    });
  },
  
  loginOut() {
    app.globalData.userInfo = null
    this.setData({
      userInfo: null
    })
    wx.removeStorageSync('userInfo')
  },

  onShow() {
    console.log("页面显示，更新用户信息");
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    } else {
      setTimeout(() => {
        this.setData({
          userInfo: app.globalData.userInfo
        });
        wx.hideLoading();
      }, 2000);
    }
  },

  getUserProfile() {
    console.log("获取用户信息");
    wx.cloud.database().collection('user')
      .where({
        _openid: app.globalData.openid
      })
      .get()
      .then(result => {
        if (result.data.length === 0) {
          console.log("首次登录，跳转到用户信息填写页面");
          wx.navigateTo({
            url: './userInfo/userInfo',
            success: () => {
              wx.showToast({
                title: '首次登录请填写用户昵称及头像',
                icon: 'none'
              });
            }
          });
        } else {
          const userData = result.data[0];
          console.log("用户信息已存在:", userData);
          app.globalData.userInfo = userData;
          wx.setStorageSync('userInfo', userData);
          this.setData({
            userInfo: userData
          });
        }
      })
      .catch(err => {
        console.error("获取用户信息失败:", err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      });
  },
})