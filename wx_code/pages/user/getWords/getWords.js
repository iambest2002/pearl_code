import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    cet4WordsGrouped: {}, // 按字母分组后的单词
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), // 使用大写字母
    loading: false,
    onShowGetWordsPicker: false,
    onShowRemoveWordsPicker: false,
    onShowGetStorageInfoPicker: false,
    //['CET4', 'CET6', 'PGEE'],['CET4', 'CET6', 'PGEE'],
    GetWordsCache: ['CET4', 'CET6', 'PGEE'],
    RemoveWordsCache: ['CET4', 'CET6', 'PGEE', 'learnedWords_cet4WordsGrouped', 'learnedWords_cet6WordsGrouped', 'learnedWords_pgeeWordsGrouped', 'learningProgress_cet4WordsGrouped', 'learningProgress_cet6WordsGrouped', 'learningProgress_pgeeWordsGrouped', 'spelledWords_cet4WordsGrouped', 'spelledWords_cet6WordsGrouped', 'spelledWords_pgeeWordsGrouped', ],
    ViewWordsCache: ['ALL', 'EXPENSES', 'INCOME', 'CET4', 'CET6', 'PGEE', 'learnedWords_cet4WordsGrouped', 'learnedWords_cet6WordsGrouped', 'learnedWords_pgeeWordsGrouped', 'learningProgress_cet4WordsGrouped', 'learningProgress_cet6WordsGrouped', 'learningProgress_pgeeWordsGrouped', 'spelledWords_cet4WordsGrouped', 'spelledWords_cet6WordsGrouped', 'spelledWords_pgeeWordsGrouped', 'currentBook', 'bookInfo_cet4WordsGrouped'],
    selectGetWords: '',
  },

  // 获取单词数据
  getWords() {
    this.setData({
      onShowGetWordsPicker: true
    });
  },
  removeStorageSync() {
    this.setData({
      onShowRemoveWordsPicker: true
    });
  },
  getStorageInfo() {
    this.setData({
      onShowGetStorageInfoPicker: true
    })
  },
  // 取消选择
  onShowGetWordsPickerCancel() {
    this.setData({
      onShowGetWordsPicker: false
    });
  },
  onShowRemoveWordsPickerCancel() {
    this.setData({
      onShowRemoveWordsPicker: false
    });
  },
  onShowGetStorageInfoPickerCancel() {
    this.setData({
      onShowGetStorageInfoPicker: false
    });
  },

  // 选择确认后，下载云存储中的文件并处理
  onGetWordsConfirm(event) {
    const {
      value
    } = event.detail;
    this.setData({
      loading: true,
      onShowGetWordsPicker: false
    });

    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 10000,
    });

    // 根据用户选择的值确定文件名
    const fileNameMap = {
      CET4: '3-CET4-顺序_sorted.json',
      CET6: '4-CET6-顺序_sorted.json',
      PGEE: '5-考研-顺序_sorted.json'
    };
    const fileName = fileNameMap[value];

    // 从云存储中下载文件
    wx.cloud.downloadFile({
      fileID: `cloud://daily-consumption-1eonh2e259454a.6461-daily-consumption-1eonh2e259454a-1327338363/words/${fileName}`, // 替换为实际的云存储路径
      success: res => {
        console.log('文件下载成功：', res.tempFilePath);

        // 读取文件内容
        wx.getFileSystemManager().readFile({
          filePath: res.tempFilePath,
          encoding: 'utf-8',
          success: fileRes => {
            const words = JSON.parse(fileRes.data); // 解析 JSON 数据

            // 将单词按首字母分组
            const wordsGrouped = this.groupWordsByLetter(words);

            // 缓存分组后的数据
            const cacheKey = `${value.toLowerCase()}WordsGrouped`;
            wx.setStorage({
              key: cacheKey,
              data: wordsGrouped,
              success: () => {
                wx.showToast({
                  title: `${value} 单词已缓存!`,
                  icon: 'success',
                  duration: 2000
                });
              },
              fail: err => {
                console.error('缓存失败:', err);
                wx.showToast({
                  title: '写入缓存失败!',
                  icon: 'none',
                  duration: 2000
                });
              }
            });

            // 更新页面数据
            this.setData({
              [`${value.toLowerCase()}WordsGrouped`]: wordsGrouped,
              loading: false
            });
          },
          fail: err => {
            console.error('文件读取失败：', err);
            wx.showToast({
              title: '文件读取失败!',
              icon: 'none',
              duration: 2000
            });
            this.setData({
              loading: false
            });
          }
        });
      },
      fail: err => {
        console.error('文件下载失败：', err);
        wx.showToast({
          title: '文件下载失败!',
          icon: 'none',
          duration: 2000
        });
        this.setData({
          loading: false
        });
      }
    });
  },



  // 将单词按首字母分组
  groupWordsByLetter(words) {
    const grouped = {};
    words.forEach(word => {
      const firstLetter = word.word[0].toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(word);
    });
    return grouped;
  },



  onRemoveConfirm(event) {
    const {
      value
    } = event.detail;
    this.setData({
      onShowRemoveWordsPicker: false
    });

    // 确定要删除的缓存键
    const cacheKeyMap = {
      CET4: 'cet4WordsGrouped',
      CET6: 'cet6WordsGrouped',
      PGEE: 'pgeeWordsGrouped',
      learnedWords_cet4WordsGrouped: 'learnedWords_cet4WordsGrouped',//CET4学习单词
      learnedWords_cet6WordsGrouped: 'learnedWords_cet6WordsGrouped',//CET6学习单词
      learnedWords_pgeeWordsGrouped: 'learnedWords_pgeeWordsGrouped',//PGEE学习单词
      learningProgress_cet4WordsGrouped: 'learningProgress_cet4WordsGrouped',//CET4学习进度
      learningProgress_cet6WordsGrouped: 'learningProgress_cet6WordsGrouped',//CET6学习进度
      learningProgress_pgeeWordsGrouped: 'learningProgress_pgeeWordsGrouped',//PGEE学习进度
      spelledWords_cet4WordsGrouped: 'spelledWords_cet4WordsGrouped',//CET4拼写单词
      spelledWords_cet6WordsGrouped: 'spelledWords_cet6WordsGrouped',//CET6拼写单词
      spelledWords_pgeeWordsGrouped: 'spelledWords_pgeeWordsGrouped',//PGEE拼写单词
      bookInfo_cet4WordsGrouped: 'bookInfo_cet4WordsGrouped',
      bookInfo_cet6WordsGrouped: 'bookInfo_cet6WordsGrouped',
      bookInfo_pgeeWordsGrouped: 'bookInfo_pgeeWordsGrouped',
      currentBook: "currentBook",

    };
    const cacheKey = cacheKeyMap[value];

    // 检查缓存是否存在
    wx.getStorage({
      key: cacheKey,
      success: (res) => {
        // 如果缓存存在，则执行删除操作
        wx.removeStorage({
          key: cacheKey,
          success: () => {
            wx.showToast({
              title: `${value} 单词缓存已清除!`,
              icon: 'success',
              duration: 2000
            });
          },
          fail: err => {
            console.error('清除单词缓存失败:', err);
            wx.showToast({
              title: '清除缓存失败!',
              icon: 'none',
              duration: 2000
            });
          }
        });
      },
      fail: err => {
        // 如果缓存不存在，提示用户无该缓存
        wx.showToast({
          title: `无${value}缓存!`,
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 获取缓存信息
  onViewAllStorage() {
    wx.getStorageInfo({
      success: res => {
        console.log(res);
        wx.showToast({
          title: `全部缓存：${res.currentSize}KB`,
          icon: 'success',
          duration: 2000
        });
      },
      fail: err => {
        console.error('获取缓存信息失败', err);
        wx.showToast({
          title: '获取缓存信息失败!',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  ongetStorageInfoConfirm(event) {
    const {
      value
    } = event.detail;
    this.setData({
      onShowGetStorageInfoPicker: false
    });

    if (value === 'ALL') {
      this.onViewAllStorage();
    } else {
      // 确定要查看的缓存键
      const cacheKeyMap = {
        CET4: 'cet4WordsGrouped',
        CET6: 'cet6WordsGrouped',
        PGEE: 'pgeeWordsGrouped',
        EXPENSES: 'expenses',
        INCOME: 'income',
        learnedWords_cet4WordsGrouped: 'learnedWords_cet4WordsGrouped',
        learnedWords_cet6WordsGrouped: 'learnedWords_cet6WordsGrouped',
        learnedWords_cet6WordsGrouped: 'learnedWords_pgeeWordsGrouped',
        learningProgress_cet4WordsGrouped: 'learningProgress_cet4WordsGrouped',
        learningProgress_cet6WordsGrouped: 'learningProgress_cet6WordsGrouped',
        learningProgress_cet6WordsGrouped: 'learningProgress_pgeeWordsGrouped',
        spelledWords_cet4WordsGrouped: 'spelledWords_cet4WordsGrouped',
        spelledWords_cet6WordsGrouped: 'spelledWords_cet6WordsGrouped',
        spelledWords_pgeeWordsGrouped: 'spelledWords_pgeeWordsGrouped',
        bookInfo_cet4WordsGrouped: 'bookInfo_cet4WordsGrouped',
        bookInfo_cet6WordsGrouped: 'bookInfo_cet6WordsGrouped',
        bookInfo_pgeeWordsGrouped: 'bookInfo_pgeeWordsGrouped',
        currentBook: "currentBook",
      };
      const cacheKey = cacheKeyMap[value];

      wx.getStorage({
        key: cacheKey,
        success: (res) => {
          console.log(`${value} 缓存内容:`, res.data);
          const size = JSON.stringify(res.data).length / 1024; // 计算缓存大小 (KB)
          wx.showToast({
            title: `${value} 缓存: ${size.toFixed()} KB`,
            icon: 'none',
            duration: 2000
          });
        },
        fail: err => {
          console.error(`获取${value}缓存失败`, err);
          wx.showToast({
            title: `${value} 无缓存!`,
            icon: 'none',
            duration: 2000
          });
        }
      });
    }
  },
});