const util = require('../../utils/util.js')
const app = getApp()

Page({
  data: {
    inputValue: '',  
    word: null,
    wordsGrouped: {}, // 按字母分组的单词
    wordObject: null,
    showPopup: false,
    note: '',
    selectedBook: '',
    bookNameList: [], // 书名列表
    book: [], // 书籍数据
    words: [],
    alphabet: 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split(''), // 使用大写字母
    batchIndex: 0, // 当前批次索引
    loading: false,
    hasMore: true // 是否还有更多批次
  },
  
  onLoad() {
    // if(wx.getStorageSync('word')){
    //   this.setData({
    //     word:wx.getStorageSync('word'),
    //     inputValue:wx.getStorageSync('word').query
    //   })
    // }
    this.loadWordsBatch(); // 页面加载时，调用加载函数
    
  },
  // loadWordsBatch() {
  //   if (!this.data.hasMore || this.data.loading) return;

  //   this.setData({ loading: true });

  //   wx.cloud.callFunction({
  //     name: 'getWords',
  //     data: {
  //       alphabet: this.data.alphabet,
  //       batchIndex: this.data.batchIndex
  //     },
  //     success: res => {
  //       const newWords = res.result.data;
  //       const cacheId = res.result.cacheId;

  //       console.log('Words:', newWords);
  //       console.log('Cache ID:', cacheId);

  //       // 将获取到的新数据按首字母分组
  //       const groupedWords = this.groupWordsByLetter(newWords);

  //       this.setData({
  //         id: cacheId,
  //         words: this.data.words.concat(newWords),
  //         wordsGrouped: { ...this.data.wordsGrouped, ...groupedWords },
  //         batchIndex: res.result.nextBatchIndex,
  //         hasMore: res.result.nextBatchIndex < this.data.alphabet.length,
  //         loading: false
  //       });
  //     },
  //     fail: err => {
  //       console.error('云函数调用失败', err);
  //       this.setData({ loading: false });
  //     }
  //   });
  // },
  loadWordsBatch() {
    if (!this.data.hasMore || this.data.loading) return;

    this.setData({ loading: true });

    const currentLetter = this.data.alphabet[this.data.batchIndex];
    
    wx.request({
      url: 'http://42.193.121.229:80/wx/words/', // 后端 API 地址
      method: 'GET',
      data: { letter: currentLetter }, // 请求指定字母的数据
      success: res => {
        const groupedWords = {};
        groupedWords[currentLetter] = res.data[currentLetter];

        this.setData({
          wordsGrouped: { ...this.data.wordsGrouped, ...groupedWords },
          batchIndex: this.data.batchIndex + 1,
          hasMore: this.data.batchIndex < this.data.alphabet.length - 1,
          loading: false
        });
      },
      fail: err => {
        console.error('请求失败', err);
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
  
  onReachBottom() {
    this.loadWordsBatch();
  },
  
  onIndexSelect(event) {
    const selectedLetter = event.detail.index;
    if (this.data.wordsGrouped[selectedLetter]) {
      // 已经加载过该字母分组，直接跳转到对应位置
      this.scrollToLetter(selectedLetter);
    } else {
      // 加载对应字母分组的数据
      this.setData({
        batchIndex: this.data.alphabet.indexOf(selectedLetter),
        loading: true,
      }, () => {
        this.loadWordsBatch();
      });
    }
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
  
  navigateToPhrasesPage(e) {
    const phrases = e.currentTarget.dataset.phrases || [];
  
    // 检查是否存在短语数据
    if (phrases.length === 0) {
      wx.showToast({
        title: '无相关短语',
        icon: 'none'
      });
      return;
    }
  
    wx.navigateTo({
      url: `/pages/index/phrases/phrases?phrases=${encodeURIComponent(JSON.stringify(phrases))}`
    });
  }
  ,
  
  onShow(){
    wx.cloud.database().collection('word_books').get()
    .then(res=>{
      console.log(res)
      
      let bookNameList = []
      for(let i in res.data){
        bookNameList.push(res.data[i].name)
      }
      this.setData({
        bookNameList,
        book:res.data
      })
    })
  },
  


  // 显示弹出框
  showPopup() {
    this.setData({ showPopup: true });
  },

  // 关闭弹出框
  onClose() {
    this.setData({ showPopup: false });
  },

  // 获取备注输入
  getNote(event) {
    this.setData({
      note: event.detail.value
    })
  },

  // 选择器确认
  onPickerConfirm(event) {
    const selectedBookName = event.detail.value; // 从 picker 中获取选择的值
    console.log('选择的书籍名称:', selectedBookName);
    
    // 查找选中的书籍
    const selectedBook = this.data.book.find(book => book.name === selectedBookName);
    
    if (!selectedBook) {
      wx.showToast({
        title: '未找到匹配的生词本',
        icon: 'none'
      });
      console.log('当前的书籍列表:', this.data.book);
      console.log('当前选择的书籍名称:', selectedBookName);
      return;
    }
  
    const selectedBookId = selectedBook._id;
    let wordObject = {}
    // wordObject.bookId = this.data.book[event.detail.value]._id
    wordObject.word = this.data.word
    wordObject.key = this.data.inputValue
    app.globalData.wordObject = wordObject
    // 添加单词数据到选中的书籍中
    wx.cloud.database().collection('word_words').add({
      data: {
        note: this.data.note,
        bookId: selectedBookId, // 将书籍 ID 作为外键保存
        ...app.globalData.wordObject, // 单词数据
        time: util.formatTime(new Date())
      }
    }).then(res => {
      wx.showToast({
        title: '添加成功',
      })
      this.setData({ showPopup: false });
    }).catch(err => {
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      });
      console.error(err);
    });
  },

  // 选择器取消
  onPickerCancel() {
    this.setData({ showPopup: false });
  },

  onShow:function(options){
    wx.cloud.database().collection('word_books').get()
    .then(res=>{
      let bookNameList = []
      for(let i in res.data){
        bookNameList.push(res.data[i].name)
      }
      this.setData({
        bookNameList,
        book:res.data
      })
    })
  },

  toBook(){
    wx.switchTab({
      url: '/pages/book/book',
      success(){
        wx.showToast({
          icon:'error',
          title: '请先创建生词本',
        })
      }
    })
  },

  // 搜索框内容变化处理
  onChange(event) {
    const value = event.detail;
    this.setData({
      inputValue: value
    });

    // 如果搜索框为空，则清空显示内容
    if (!value) {
      this.setData({
        word: null,
        words: [], // 清空之前的单词表数据
        batchIndex: 0, // 重置批次索引
        hasMore: true, // 重置是否有更多数据的标志
      });
      this.loadWordsBatch(); // 加载单词表数据
    }
  },
  onAlphabetTap(event) {
    const letter = event.currentTarget.dataset.letter;
    wx.pageScrollTo({
      selector: `#letter-${letter}`,
      duration: 300
    });
  },

  // 触发搜索
  search() {
    const { inputValue } = this.data;
    
    // 检查输入内容是否为空
    if (!inputValue.trim()) {
      wx.showToast({
        title: '请输入搜索关键词',
        icon: 'none'
      });
      return;
    }
    
    // 发起搜索请求
    wx.request({
      url: 'https://route.showapi.com/32-10?showapi_appid=1664651&appKey=709Fc857110A436c9D814459BB92E71B&q=' + inputValue,
      method: 'POST',
      success: (res) => {
        this.setData({
          word: res.data.showapi_res_body,
          words: [] // 清空单词表数据
        });
        wx.setStorageSync('word', res.data.showapi_res_body);
        
        // 保存搜索历史
        if (wx.getStorageSync('history')) {
          let history = wx.getStorageSync('history');
          history.push(inputValue);
          wx.setStorageSync('history', history);
        } else {
          let history = [];
          history.push(inputValue);
          wx.setStorageSync('history', history);
        }
      }
    });
  },
})