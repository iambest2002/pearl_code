const app = getApp()

Page({
  data: {
    books: [], // 所有书籍
    desc: '', // 书籍描述
    bookName: '', // 当前选择的书籍名称
    wordsNumber: 0, // 总单词数
    everydayWord: 0, // 每日学习单词数
    learnedWords: 0, // 已学单词数
    newWords: 0, // 新词数量
    reviewWords: 0, // 需要复习的数量
    unlearned: 0, // 未学数量
  },

  // 页面加载时，获取学习进度并更新数据
  onLoad() {
    const currentBook = wx.getStorageSync('currentBook');
    if (currentBook) {
      this.setData({ 
        bookName: currentBook.bookName,
        desc: currentBook.desc
      });
      this.loadLearningProgress(currentBook.desc);
    } else {
      console.log("没有选择书籍，请先选择一本书籍！");
    }
    
    this.updateLearningProgress();
  },

  // 根据当前选择的书籍描述加载学习进度
  loadLearningProgress(desc) {
    console.log("加载的书籍描述:", desc);

    // 获取学习进度
    const progress = wx.getStorageSync(`learningProgress_${desc}`) || {};
    // 获取对应的单词数据
    // let wordsData = null;
    // switch (desc.toLowerCase()) {
    //   case 'cet4':
    //     wordsData = wx.getStorageSync('cet4WordsGrouped');
    //     break;
    //   case 'cet6':
    //     wordsData = wx.getStorageSync('cet6WordsGrouped');
    //     break;
    //   case 'pgee':
    //     wordsData = wx.getStorageSync('pgeeWordsGrouped');
    //     break;
    // }

    if (progress) {
      this.setData({
        learnedWords: progress.learnedCount || 0,
        everydayWord: progress.everydayWord || 0,
        reviewWords: progress.reviewCount || 0,
        unlearned: progress.unlearnedCount || 0,
        wordsNumber: progress.wordsNumber || 0
      });
      console.log("更新后的学习进度:", this.data);
    } else {
      console.log("未找到学习进度数据");
    }
  },

  // 更新计划
  updatePlan(data) {
    console.log("接收到的数据:", data);
    
    const desc = data.desc || '';
    // // 获取对应的单词数据来计算总单词数
    // let wordsData = null;
    // switch (desc.toLowerCase()) {
    //   case 'cet4':
    //     wordsData = wx.getStorageSync('cet4WordsGrouped');
    //     break;
    //   case 'cet6':
    //     wordsData = wx.getStorageSync('cet6WordsGrouped');
    //     break;
    //   case 'pgee':
    //     wordsData = wx.getStorageSync('pgeeWordsGrouped');
    //     break;
    // }
    
    const totalWords = data.wordsNumber || 0;  // 使用传入的总单词数
    const everydayWord = data.everydayWord || 0;

    // 获取已有学习进度数据
    let learningProgress = wx.getStorageSync(`learningProgress_${desc}`) || {};
    const learnedCount = learningProgress.learnedCount || 0;
    const reviewCount = learningProgress.reviewCount || 0;
    //wordsData: wordsData // 保存单词数据的引用
    const unlearnedCount = everydayWord; // 每日计划的单词数

    // 更新页面数据
    this.setData({
      desc: data.desc,
      bookName: data.bookName,
      wordsNumber: totalWords,
      everydayWord: everydayWord,
      learnedWords: learnedCount,
      reviewWords: reviewCount,
      unlearned: unlearnedCount
    });

    // 保存学习进度到缓存
    const progressData = {
      wordsNumber: totalWords,
      everydayWord: everydayWord,
      learnedCount: learnedCount,
      reviewCount: reviewCount,
      unlearnedCount: unlearnedCount,
      currentBookDesc: desc  // 添加当前书籍描述
    };

    wx.setStorageSync(`learningProgress_${desc}`, progressData);
    wx.setStorageSync('currentBook', {
      bookName: data.bookName,
      desc: data.desc,
      cacheKey: `${desc.toLowerCase()}WordsGrouped`  // 添加缓存键
    });

    console.log("保存的学习进度:", progressData);
  },

  // 页面显示时更新学习进度
  onShow() {
    const currentBook = wx.getStorageSync('currentBook');
    if (currentBook) {
      this.setData({
        bookName: currentBook.bookName,
        desc: currentBook.desc
      });
      this.loadLearningProgress(currentBook.desc);
    }
    this.updateLearningProgress();
  },

  // 跳转到设置学习计划页面
  toSetMyBook() {
    wx.navigateTo({
      url: './setMyPlan/setMyPlan',
    });
  },

  // 开始学习，跳转到复习页面
  startStudy() {
    if (!this.data.bookName) {
      wx.showToast({
        title: '请先设置学习计划',
        icon: 'none'
      });
      return;
    }

    // 获取当前选择的书籍描述
    const currentBook = wx.getStorageSync('currentBook');
    if (!currentBook || !currentBook.desc) {
      wx.showToast({
        title: '请先设置学习计划',
        icon: 'none'
      });
      return;
    }

    // 根据书籍描述确定要检查的缓存键
    let cacheKey = '';
    switch (currentBook.desc.toLowerCase()) {
      case 'cet4':
        cacheKey = 'cet4WordsGrouped';
        break;
      case 'cet6':
        cacheKey = 'cet6WordsGrouped';
        break;
      case 'pgee':
        cacheKey = 'pgeeWordsGrouped';
        break;
      default:
        cacheKey = 'cet4WordsGrouped';
    }

    // 检查对应的单词数据是否存在
    const wordsData = wx.getStorageSync(cacheKey);
    if (!wordsData || Object.keys(wordsData).length === 0) {
      wx.showToast({
        title: '请先添加单词数据',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateTo({
          url: '../user/getWords/getWords'
        });
      });
      return;
    }

    try {
      // 准备要传递的数据
      const reviewData = {
        bookDesc: currentBook.desc,
        cacheKey: cacheKey,
        progress: wx.getStorageSync(`learningProgress_${currentBook.desc}`) || {},
        everydayWord: this.data.everydayWord,
        //wordsNumber: totalWords  // 将总单词数保存在 currentBook 中
      };

      // 将数据存储到临时缓存中
      //wx.setStorageSync('tempReviewData', reviewData);

      // 跳转到复习页面
      wx.navigateTo({
        url: './review/review',
        success: () => {
          console.log('成功跳转到复习页面');
        },
        fail: (error) => {
          console.error('跳转失败:', error);
          wx.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      });
    } catch (error) {
      console.error('准备复习数据时出错:', error);
      wx.showToast({
        title: '数据准备失败，请重试',
        icon: 'none'
      });
    }
  },

  // 更新学习进度
  updateLearningProgress() {
    const progress = wx.getStorageSync(`learningProgress_${this.data.desc}`) || {};
    console.log("读取缓存的学习进度:", progress); // 打印缓存数据

    const learnedWords = progress.learnedCount || 0;
    const totalWords = this.data.wordsNumber || 0;

    this.setData({
      learnedWords: learnedWords,
      totalWords: totalWords
    });

    console.log("主页面进度更新：已学单词数:", learnedWords, "总单词数:", totalWords);
  },

  toBook() {
    wx.switchTab({
      url: '/pages/book/book',
      success() {
        wx.showToast({
          icon: 'error',
          title: '请先创建生词本',
        });
      }
    });
  },

  toAddWord(event) {
    let wordObject = {};
    wordObject.word = this.data.word;
    wordObject.key = this.data.inputValue;
    app.globalData.wordObject = wordObject;

    console.log("要添加的单词对象:", wordObject); // 打印要添加的单词对象

    wx.navigateTo({
      url: '/pages/index/addBook/addBook',
    });
  },

  getValue(event) {
    console.log("接收到的输入值:", event.detail.value); // 打印输入的值

    this.setData({
      inputValue: event.detail.value
    });
  },

  search() {
    var that = this;
    wx.request({
      url: 'https://route.showapi.com/32-10?showapi_appid=937614&showapi_sign=6da064881fd6486ebf6de636f4df3b24&q=' + this.data.inputValue,
      method: 'POST',
      success(res) {
        console.log("API 返回的结果:", res.data.showapi_res_body); // 打印 API 返回的数据
        that.setData({
          word: res.data.showapi_res_body
        });
        wx.setStorageSync('word', res.data.showapi_res_body);

        // 更新历史记录
        if (wx.getStorageSync('history')) {
          let history = wx.getStorageSync('history');
          history.push(that.data.inputValue);
          wx.setStorageSync('history', history);
        } else {
          let history = [];
          history.push(that.data.inputValue);
          wx.setStorageSync('history', history);
        }
      }
    });
  }
});
