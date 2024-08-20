Page({

  /**
   * 页面的初始数据
   */
  data: {
    cet4WordsGrouped: {}, // 按字母分组后的单词
    alphabet: 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split(''), // 使用大写字母
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //this.getWords(); // 页面加载时自动获取单词数据
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  getWords() {
    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'getWords',
      success: res => {
        if (res.result && res.result.data) {
          const cet4WordsGrouped = res.result.data;
          
          // 将分组后的单词数据保存到本地缓存
          wx.setStorageSync('cet4WordsGrouped', cet4WordsGrouped);
          this.setData({
            cet4WordsGrouped: res.result.data,
            loading: false
          });
          console.log('cet4WordsGrouped:', this.data.cet4WordsGrouped);
          
          // 获取部分具体的单词信息
          const firstLetter = Object.keys(cet4WordsGrouped)[0];
          const firstWord = cet4WordsGrouped[firstLetter][0].word;
          
          // 增加窗口提示，显示具体的值
          wx.showToast({
            title: `单词数据获取成功，第一个单词：${firstWord}`,
            icon: 'success',
            duration:2000,
          });

        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none',
            duration:2000,
          });
        }
      },
      fail: err => {
        console.error('云函数调用失败', err);
        wx.showToast({
          title: '获取数据失败',
          icon: 'none',
          duration:2000,
        });
        this.setData({ loading: false });
      }
    });
  },

  groupWordsByLetter(words) {
    const grouped = {};
    words.forEach(word => {
      const firstLetter = word.word[0].toUpperCase(); // 将首字母转为大写
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(word);
    });
    return grouped;
  },

  getStorageInfo() {
    const storageInfo = wx.getStorageInfoSync();
    console.log(storageInfo);

    // 异步获取缓存信息
    wx.getStorageInfo({
      success: function(res) {
        console.log(res);
        
        // 获取具体的缓存大小信息
        const currentSize = res.currentSize;

        // 增加窗口提示，显示具体的值
        wx.showToast({
          title: `缓存：${currentSize}KB`,
          icon: 'success',
          duration:2000,
        });
      },
      fail: function(err) {
        console.error('获取缓存信息失败', err);

        // 增加窗口提示
        wx.showToast({
          title: '获取缓存信息失败',
          icon: 'none',
          duration:2000,
        });
      }
    });

    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        console.log('userInfo:', res.data);

      },
      fail: function(err) {
        console.error('获取用户信息失败', err);

        // 增加窗口提示
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none',
          duration:2000,
        });
      }
    });
     
    wx.getStorage({
      key: 'cet4WordsGrouped',
      success: function(res) {
        console.log('cet4WordsGrouped:', res.data);
      
      },
      fail: function(err) {
        console.error('获取分组单词失败', err);

        // 增加窗口提示
        wx.showToast({
          title: '获取分组单词失败',
          icon: 'none',
          duration:2000,
        });
      }
    });
  },

  removeStorageSync() {
    wx.removeStorage({
      key: 'wordsGrouped',
      success: function() {
        console.log("单词缓存已清除");

        // 增加窗口提示
        wx.showToast({
          title: '单词缓存已清除',
          icon: 'success',
          duration:2000,
        });
      },
      fail: function(err) {
        console.error("清除单词缓存失败", err);

        // 增加窗口提示
        wx.showToast({
          title: '清除单词缓存失败',
          icon: 'none',
          duration:2000,
        });
      }
    });
  },

})
