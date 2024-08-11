const app = getApp();

const util = require('../../utils/util')
Page({
  data: {
    active: 0,  // 默认显示第一个标签页
    searchValue: '',  // 搜索框中的输入值
    newBookNameValue:'',
    newBookRemarkValue:'',
    deleteOptions: [], // 存放多列选择器的数据
    selectedBookIndex: 0,
    selectedWordIndex: 0,
    bookList: [], // 初始化 bookList
    wordsByBook: {}, // 每个单词本中的单词
    showNewBookPopup: false, // 控制弹出层显示
    showDeleteBookPopup: false, // 控制弹出层显示
    newBookName: '',  // 新建生词本的名称
    newBookRemark: '' // 新建生词本的备注
  },

  onLoad () {
    console.log('页面加载');

  this.fetchBookListAndWords();  // 页面加载时获取数据

  
  },

  onShow: function () {
    console.log('页面显示');
    this.fetchBookListAndWords();  // 页面显示时获取数据
  },
  

  // 搜索框内容改变时触发
  onChangeSearch(e) {
    console.log('搜索框内容改变:', e.detail);
    this.setData({
      searchValue: e.detail,
    },()=>{
      this.onClick();
    });
  },

  onClick() {
    const { bookList, searchValue, wordsByBook } = this.data;
    console.log('点击搜索按钮, 搜索值:', searchValue);
  
    if (!searchValue.trim()) {
      wx.showToast({
        title: '请输入单词表名称或单词',
        icon: 'none'
      });
      return;
    }
    const searchValueLower = searchValue.toLowerCase();
    // 查找与输入值匹配的单词表
    let foundBook = false;
    let activeTab = 0;
  
    for (let i = 0; i < bookList.length; i++) {
      const book = bookList[i];
      console.log(`正在搜索单词表: ${book.name}`);
  
      if (book.name.toLowerCase().includes(searchValueLower)) {
        foundBook = true;
        activeTab = i;
        break;
      }
    }
  
    if (foundBook) {
      console.log('找到匹配的单词表:', bookList[activeTab].name);
      this.setData({
        active: activeTab
      });
    } else {
      // 如果未找到匹配的单词表，检查所有标签中的单词
      let foundWord = false;
      let word = '';
      for (let i = 0; i < bookList.length; i++) {
        const bookId = bookList[i]._id;
        const words = wordsByBook[bookId];
  
        for (let j = 0; j < words.length; j++) {
          if (words[j].word.query.toLowerCase().includes(searchValueLower)) {
            foundWord = true;
            activeTab = i;
            word = words[j].word.query
            break;
          }
        }
  
        if (foundWord) break;
      }
  
      if (foundWord) {
        console.log('找到匹配的单词, 切换到对应标签页');
        this.setData({
          active: activeTab,

        });
        wx.showToast({
          title: `已找到单词: ${word}`,
          icon: 'none',
          time:3000
        });
      } else {
        wx.showToast({
          title: '未找到相关单词表或单词',
          icon: 'none',
          time:2000
        });
      }
    }
  },
  
  


  onCancel() {
    console.log('取消搜索');
    this.setData({
      searchValue: ''
    });
    this.fetchBookListAndWords(); // 重置数据
  },

  // 点击新建生词本按钮时触发
  addNewBook() {
    console.log('打开新建生词本弹出框');
    this.setData({
      showNewBookPopup: true
    });
  },
  


  // 关闭弹出层时触发
  addPopupClose() {
    console.log('关闭弹出层');
    this.setData({
      showNewBookPopup: false
    });
  },
  deletePopupClose(){
    this.setData({
      showDeleteBookPopup: false
    });
  },
  newBookNameInput(e) {
    this.setData({
      newBookNameValue: e.detail
    });
    },
    newBookRemarkInput(e) {
      this.setData({
        newBookRemarkValue: e.detail
      });
      },

  // 点击创建按钮时触发
  onCreateNewBook() {
    const { newBookNameValue, newBookRemarkValue } = this.data;
    console.log('创建新生词本:', newBookNameValue, newBookRemarkValue);

    if (!newBookNameValue) {
      wx.showToast({
        title: '请输入生词本名称',
        icon: 'none'
      });
      return;
    }

    // 调用云函数或 API 创建生词本
    wx.cloud.database().collection('word_books').add({
      data: {
        name: newBookNameValue,
        note: newBookRemarkValue,
        time: util.formatTime(new Date())
      }
    }).then(() => {
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });

      console.log('新生词本创建成功');
      
      this.setData({
        showNewBookPopup: false,
        newBookNameValue: '',
        newBookRemarkValue: ''
      });

      this.fetchBookListAndWords(); // 刷新生词本列表
    }).catch(err => {
      console.error('创建新生词本时出错:', err);
    });
  },
  deleteBook(){
    console.log('打开删除弹出层');
    this.setData({
      
      showDeleteBookPopup: true,
    });
  },
  // 查询表中生词本和单词
  fetchBookListAndWords: function () {
    if (!app.globalData.userInfo) {
      wx.switchTab({
        url: '/pages/user/user',
        success() {
          wx.showToast({
            title: '请登录',
            icon: 'none'
          });
        }
      });
      return;
    }

    console.log('获取生词本列表和单词');

    wx.cloud.database().collection('word_books')
      .where({
        _openid: app.globalData.openid
      })
      .orderBy('time', 'desc')
      .get()
      .then(res => {
        console.log('获取到的生词本:', res.data);
        const bookList = res.data;
        this.setData({
          bookList: bookList
        });

        // 获取每个单词本中的单词
        const promises = bookList.map(book => {
          return wx.cloud.database().collection('word_words')
            .where({
              bookId: book._id
            })
            .orderBy('time', 'desc')
            .get()
            .then(wordRes => {
              console.log(`获取到的书籍 ${book.name} 的单词:`, wordRes.data);
              return {
                bookId: book._id,
                words: wordRes.data
              };
            });
        });

        // 更新 wordsByBook 数据
        Promise.all(promises).then(results => {
          const wordsByBook = results.reduce((acc, result) => {
            acc[result.bookId] = result.words;
            return acc;
          }, {});
          console.log('根据生词本分类的单词:', wordsByBook);
          this.setData({
            wordsByBook: wordsByBook
          },  ()=>{
            this.generateDeleteOptions(); // 生成 Picker 选项
          }
        );
        });
        
      }).catch(err => {
        console.error('获取生词本和单词时出错:', err);
      });
  },
  // 更新picker表或单词
  generateDeleteOptions() {
    const { bookList, wordsByBook } = this.data;
  
    if (bookList.length > 0) {
      const columns = [
        {
          values: bookList.map(book => book.name),
          className: 'book-column'
        },
        {
          values: wordsByBook[bookList[0]._id].map(word => word.query),
          className: 'word-column'
        }
      ];
      this.setData({ deleteOptions: columns });
    }
  },
  // 选择删除表或单词
  onChangeDelete(event) {
    const { value, index } = event.detail;
    const { bookList, wordsByBook } = this.data;
  
    if (index === 0) {
      // 获取选中的生词本对象
      const selectedBook = bookList.find(book => book.name === value[0]);
  
      if (selectedBook) {
        // 获取对应的单词列表
        const words = wordsByBook[selectedBook._id] || [];
  
        // 添加一个默认的删除选项
        const wordOptions = ['删除整个生词本', ...words.map(word => word.key)];
  
        // 更新选择器的第二列选项
        this.setData({
          selectedBookId: selectedBook._id,
          'deleteOptions[1].values': wordOptions,  // 使用 key 来显示单词
          selectedWordId: ''  // 默认选择第一个单词
        });
      }
    } else if (index === 1) {
      // 检查用户是否选择了删除整个生词本的选项
      if (value[1] === '删除整个生词本') {
        this.setData({ selectedWordId: '' });  // 设置为 null，表示删除整个生词本
      } else {
        // 获取选中的单词对象
        const selectedWord = wordsByBook[this.data.selectedBookId]?.find(word => word.key === value[1]);
        if (selectedWord) {
          this.setData({ selectedWordId: selectedWord._id });
        }
      }
    }
  },
  // 删除确定触发事件
  onConfirmDelete() {
    const { selectedBookId, selectedWordId } = this.data;
    console.log(selectedBookId,selectedWordId)
    if (selectedWordId === '' ) {
      // 删除整个单词表的逻辑
      wx.cloud.database().collection('word_books').doc(selectedBookId).remove()
        .then(() => {
          wx.showToast({
            title: '单词表已删除',
            icon: 'success'
          });
          this.setData({
            showDeleteBookPopup: false
          });
          this.fetchBookListAndWords();  // 刷新数据
        })
        .catch(err => {
          console.error('删除单词表时出错:', err);
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          });
        });
    } else {
      // 删除单个单词的逻辑
      wx.cloud.database().collection('word_words').doc(selectedWordId).remove()
        .then(() => {
          wx.showToast({
            title: '单词已删除',
            icon: 'success'
          });
          this.setData({
            showDeleteBookPopup: false
          });
          this.fetchBookListAndWords();  // 刷新数据
        })
        .catch(err => {
          console.error('删除单词时出错:', err);
          wx.showToast({
            title: '删除失败',
            icon: 'none'
          });
        });
    }
  },
  
  
  //点击单词跳转详细页面显示
  onWordTap(event) {
    const wordId = event.currentTarget.dataset.id;
    const bookName = event.currentTarget.dataset.bookname;
    console.log(`跳转到单词详情页面: wordId=${wordId}, bookName=${bookName}`);
    
    wx.navigateTo({
      url: `/pages/wordDetail/wordDetail?id=${wordId}&bookname=${bookName}`
    });
  },
  // 页面标签 选择时间
  onChangeTab: function (event) {
    console.log('标签页改变:', event.detail.index);
    this.setData({
      active: event.detail.index
    });
  }
});
