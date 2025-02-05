const app = getApp();
import Toast from '@vant/weapp/toast/toast';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    show: false,         // 控制选择书籍弹窗的显示
    book: {},            // 当前选中的书籍
    books: [],           // 所有书籍列表
    everydayWord: 0,     // 每日学习单词数
    learningProgress: {}, // 当前学习计划的进度
  },

  /**
   * 设置每日学习单词数
   */
  setDanci(event) {
    const everydayWord = event.detail;
    app.globalData.everydayWord = everydayWord;
    this.setData({ everydayWord });
  },

  /**
   * 选择书籍
   */
  setBook(e) {
    const index = e.currentTarget.dataset.index;
    app.globalData.mybook = index;
    this.setMyBook();
    this.setData({ show: false });
  },

  /**
   * 显示选择书籍的弹窗
   */
  showPopup() {
    this.setData({ show: true });
  },

  /**
   * 关闭选择书籍的弹窗
   */
  onClose() {
    this.setData({ show: false });
  },

  /**
   * 设置当前选中的书籍
   */
  setMyBook() {
    const bookIndex = app.globalData.mybook;
    const books = app.globalData.books;

    // 获取当前选中的书籍，确保索引有效
    if (books && books.length > bookIndex) {
      this.setData({
        book: books[bookIndex],
        books: books
      });

      // 读取已有的学习计划进度
      const bookDesc = books[bookIndex].desc || books[bookIndex].name;
      const savedProgress = wx.getStorageSync(`learningProgress_${bookDesc}`);

      // 如果存在学习计划进度，则加载
      if (savedProgress) {
        this.setData({
          learningProgress: savedProgress,
          everydayWord: savedProgress.unlearnedCount || app.globalData.everydayWord
        });
      }
    } else {
      Toast.fail('未找到书籍，请选择有效的书籍！');
    }
  },

  /**
   * 页面加载时初始化数据
   */
  onLoad(options) {
    this.setMyBook();
    this.setData({
      everydayWord: app.globalData.everydayWord, // 默认每日学习10个单词
    });
  },

  /**
   * 保存计划并直接将进度保存到缓存
   */
  savePlan() {
    const bookIndex = app.globalData.mybook;
    const books = app.globalData.books;
    const book = books[bookIndex] || {};

    // 如果没有选择书籍，提醒用户
    if (!book.name) {
      Toast.fail('请先选择一本书籍');
      return;
    }

    const everydayWord = this.data.everydayWord; // 使用当前设置的每日单词数

    // 要保存的数据
    const dataToSave = {
      bookName: book.name,
      wordsNumber: book.wordsNumber,
      everydayWord: everydayWord,
      desc: book.desc
    };

    // 获取当前选中的书籍的描述，作为缓存键名
    const bookDesc = book.desc;

    // 获取已有的学习进度
    let progress = wx.getStorageSync(`learningProgress_${bookDesc}`);

    // 如果进度不存在或重新设置计划，初始化进度
    if (!progress || Object.keys(progress).length === 0) {
      progress = {
        wordsNumber: book.wordsNumber,
        everydayWord: everydayWord,
        learnedCount: 0,           // 已学单词数（初始化为0）
        reviewCount: 0,            // 需要复习的单词数（初始化为0）
        unlearnedCount: everydayWord  // 未学单词数（初始化为每日计划数）
      };
    } else {
      // 如果存在已有进度，则更新每日计划数和未学单词数
      progress.everydayWord = everydayWord;
      // 未学单词数 = 每日计划数 - 今天已学的单词数
      const todayLearned = progress.learnedCount % everydayWord; // 计算今天已学的单词数
      progress.unlearnedCount = everydayWord - todayLearned; // 剩余需要学习的单词数
    }

    // 更新全局变量
    app.globalData.everydayWord = everydayWord;

    // 保存进度到缓存
    wx.setStorageSync(`learningProgress_${bookDesc}`, progress);
    wx.setStorageSync('currentBook', dataToSave);

    wx.showToast({
      title: '学习计划已保存',
      icon: 'success',
      duration: 2000
    });

    console.log("保存的学习进度:", progress);
    
    // 返回上一页
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 可以在此做一些刷新操作
  },
});
