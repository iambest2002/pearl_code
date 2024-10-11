const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    current: "0",
    active: 0,  // 默认显示第一个标签页
    currentLetter:'',
    searchValue: '',  // 搜索框中的输入值
    cet4WordsGrouped: {}, // CET4 单词
    cet6WordsGrouped: {}, // CET6 单词
    pgeeWordsGrouped: {}, // PGEE 单词
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toUpperCase().split(''), // 使用大写字母
    batchIndex: 0, // 当前批次索引
    loading: false,
    goToWordsaPage: ['CET4', 'CET6', 'PGEE'],
    goToCet4WordsPicker:false,
    hasMore: true // 是否还有更多批次
  },
  
  onLoad() {
    //this.loadWordsBatch(); // 页面加载时加载首批数据
  },
  
  onShow() {
    
  },
  goToCet4WordsPage(){
    wx.navigateTo({
      url: '/pages/index/showCET4Words/showCET4Words',
    });
  },
  goToCet6WordsPage(){
    wx.navigateTo({
      url: '/pages/index/showCET6Words/showCET6Words',
    });
  },
  goToPgeeWordsPage(){
    wx.navigateTo({
      url: '/pages/index/showPGEEWords/showPGEEWords',
    });
  },
  
  onChangeSearch(e) {
    console.log('搜索框内容改变:', e.detail);
    this.setData({
      searchValue: e.detail,
    // },()=>{
    //   this.onClick();
     });
  },

  onCancel() {
    console.log('取消搜索');
    this.setData({
      searchValue: ''
    });
    //this.fetchBookListAndWords(); // 重置数据
  },
  onClick(){

  },


  // 加载更多数据
  loadWordsBatch() {
    if (this.data.loading || !this.data.hasMore) return;
    this.setData({ loading: true });

    // 根据当前的标签页加载不同的缓存数据
    let cachedWordsGrouped;
    if (this.data.current === "0") {
      cachedWordsGrouped = wx.getStorageSync('cet4WordsGrouped') || {};
    } else if (this.data.current === "1") {
      cachedWordsGrouped = wx.getStorageSync('cet6WordsGrouped') || {};
    } else if (this.data.current === "2") {
      cachedWordsGrouped = wx.getStorageSync('pgeeWordsGrouped') || {};
    }
    
    const currentLetter = this.data.alphabet[this.data.batchIndex];
    // 获取当前字母的单词数据
    const currentLetterWords = cachedWordsGrouped[currentLetter] || [];
    
    console.log('当前字母:', currentLetter);
    console.log('当前字母的单词:', currentLetterWords);
    
    // 判断缓存数据是否为空
    if (currentLetterWords.length === 0) {
      wx.showToast({
        title: '无单词数据，请获取单词数据!',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        loading: false
      });
      return;
    }

    // 更新数据
    if (this.data.current === "0") {
      this.setData({
        cet4WordsGrouped: {
          ...this.data.cet4WordsGrouped,
          [currentLetter]: currentLetterWords
        }
      });
    } else if (this.data.current === "1") {
      this.setData({
        cet6WordsGrouped: {
          ...this.data.cet6WordsGrouped,
          [currentLetter]: currentLetterWords
        }
      });
    } else if (this.data.current === "2") {
      this.setData({
        pgeeWordsGrouped: {
          ...this.data.pgeeWordsGrouped,
          [currentLetter]: currentLetterWords
        }
      });
    }
  
    // 更新批次索引
    this.setData({
      loading: false,
      hasMore: this.data.batchIndex < this.data.alphabet.length - 1
    });

    if (this.data.hasMore) {
      this.setData({
        batchIndex: this.data.batchIndex + 1
      });
    }
  },

  // 页面触底事件，自动加载更多数据
  onReachBottom() {
    if (this.data.hasMore) {
      this.loadWordsBatch(); // 触底时加载更多数据
    }
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

  createIndexList(letterWords) {
    return Object.keys(letterWords).map(letter => ({
      index: letter,
      title: letter.toUpperCase(),
      words: letterWords[letter]
    }));
  },
  
  onIndexChange(event) {
    const { index } = event.detail;
    this.setData({
      words: this.data.cet4WordsGrouped[this.data.alphabet[index]] || []
    });
  },

  // 创建索引列表
  createIndexList(letterWords) {
    return Object.keys(letterWords).map(letter => ({
      index: letter,
      title: letter.toUpperCase(),
      words: letterWords[letter]
    }));
  },
  
  // 点击索引
  onIndexChange(event) {
    const { index } = event.detail;
    this.setData({
      words: this.data.letterWords[index] || []
    });
  },
  
  scrollToBottom() {
    wx.createSelectorQuery().selectViewport().scrollOffset(function (res) {
      wx.pageScrollTo({
        scrollTop: res.scrollHeight, // 将页面滚动到总高度
        duration: 300,
      });
    }).exec();
  },
  
  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
    });
  },

  onAlphabetTap(event) {
    const letter = event.currentTarget.dataset.letter;
    wx.pageScrollTo({
      selector: `#letter-${letter}`,
      duration: 300
    });
    this.loadWordsBatch(); // 页面加载时加载首批数据
  },

  // 标签页点击事件
  click(e) {
    let index = e.currentTarget.dataset.code;
    this.setData({
      current: index,
      cet4wordsGrouped: {}, // 清空上一个标签页的分组数据
      batchIndex: 0, // 重置批次索引
      hasMore: true // 重置加载更多标志
    });
    this.loadWordsBatch(); // 切换标签时加载相应数据
  },


});
