Page({
  data: {
    currentWord: {},
    userInput: '',
    words: [], // 所有待拼写的单词
    isCorrect: false,
    showResult: false,
    progress: 0,
    isUpperCase: false,
    showHint: false, // 是否显示提示
    remainingCount: 0, // 剩余需要拼写的单词数
    currentBook: null, // 添加当前书籍信息
    // 键盘布局数组 - 包含大小写
    keyboardLayout: {
      lowerCase: {
        firstRow: ['q','w','e','r','t','y','u','i','o','p'],
        secondRow: ['a','s','d','f','g','h','j','k','l'],
        thirdRow: ['z','x','c','v','b','n','m']
      },
      upperCase: {
        firstRow: ['Q','W','E','R','T','Y','U','I','O','P'],
        secondRow: ['A','S','D','F','G','H','J','K','L'],
        thirdRow: ['Z','X','C','V','B','N','M']
      }
    }
  },

  onLoad() {
    // 获取当前选择的书籍信息
    const myBookIndex = getApp().globalData.mybook;
    const selectedBook = getApp().globalData.books[myBookIndex];

    if (!selectedBook) {
      wx.showToast({
        title: '请先选择单词书',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 使用书籍描述作为缓存key
    const learnedWordsKey = `learnedWords_${selectedBook.desc}`;
    const spelledWordsKey = `spelledWords_${selectedBook.desc}`;
    
    // 获取当前书籍的已学习单词
    const learnedWords = wx.getStorageSync(learnedWordsKey) || [];
    
    if (learnedWords.length === 0) {
      wx.showToast({
        title: '请先学习单词',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    // 确保单词对象完整性
    const validWords = learnedWords.filter(word => 
      word && word.word && word.mean && typeof word.word === 'string'
    );

    this.setData({
      words: validWords,
      remainingCount: validWords.length,
      progress: 0,
      isUpperCase: false,
      currentBook: selectedBook
    });
    
    if (validWords.length > 0) {
      this.selectNewWord();
    }
  },

  selectNewWord() {
    const { words } = this.data;
    if (!words || words.length === 0) {
      wx.showToast({
        title: '所有单词已完成',
        icon: 'success'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }

    const randomIndex = Math.floor(Math.random() * words.length);
    const word = words[randomIndex];

    if (!word || !word.word || !word.mean) {
      console.error('Invalid word object:', word);
      this.selectNewWord(); // 重新选择
      return;
    }

    this.setData({
      currentWord: word,
      userInput: '',
      isCorrect: false,
      showResult: false,
      showHint: false
    });
  },

  handleInput(e) {
    this.setData({
      userInput: e.detail.value
    });
  },

  clearInput() {
    this.setData({
      userInput: ''
    });
  },

  toUpperCase() {
    this.setData({
      userInput: this.data.userInput.toUpperCase()
    });
  },

  toLowerCase() {
    this.setData({
      userInput: this.data.userInput.toLowerCase()
    });
  },

  submitSpelling() {
    const userInput = this.data.userInput.trim().toLowerCase();
    const correctWord = this.data.currentWord.word.toLowerCase();

    if (userInput === '') {
      wx.showToast({
        title: '请输入单词',
        icon: 'none'
      });
      return;
    }

    const isCorrect = userInput === correctWord;

    this.setData({
      isCorrect,
      showResult: true
    });

    if (isCorrect) {
      // 使用当前书籍的spelledWords缓存
      const spelledWordsKey = `spelledWords_${this.data.currentBook.desc}`;
      const spelledWords = wx.getStorageSync(spelledWordsKey) || [];
      
      if (!spelledWords.includes(correctWord)) {
        spelledWords.push(correctWord);
        wx.setStorageSync(spelledWordsKey, spelledWords);
        
        // 更新学习进度
        const progress = wx.getStorageSync(`learningProgress_${this.data.currentBook.desc}`) || {};
        progress.reviewCount = spelledWords.length;
        wx.setStorageSync(`learningProgress_${this.data.currentBook.desc}`, progress);

        // 从已学习单词缓存中删除该单词
        const learnedWordsKey = `learnedWords_${this.data.currentBook.desc}`;
        const learnedWords = wx.getStorageSync(learnedWordsKey) || [];
        const updatedLearnedWords = learnedWords.filter(word => word.word !== correctWord);
        wx.setStorageSync(learnedWordsKey, updatedLearnedWords);
      }

      // 从待拼写列表中移除当前单词
      const updatedWords = this.data.words.filter(word => word.word !== correctWord);
      
      this.setData({
        words: updatedWords,
        remainingCount: updatedWords.length
      });

      wx.showToast({
        title: '拼写正确',
        icon: 'success'
      });
      
      setTimeout(() => {
        this.selectNewWord();
      }, 1000);
    } else {
      // 拼写错误的处理
      wx.showToast({
        title: '拼写错误，请重试',
        icon: 'none'
      });

      // 清空输入框
      this.setData({
        userInput: ''
      });

      // 3秒后隐藏错误提示
      setTimeout(() => {
        this.setData({
          showResult: false
        });
      }, 5000);
    }
  },

  handleKeyPress(e) {
    const key = e.currentTarget.dataset.key;
    if (!key) return;

    const currentInput = this.data.userInput || '';
    this.setData({
      userInput: currentInput + key // 直接使用数组中的字母，不需要转换
    });
  },

  handleDelete() {
    const currentInput = this.data.userInput;
    if (currentInput.length > 0) {
      this.setData({
        userInput: currentInput.slice(0, -1)
      });
    }
  },

  toggleCase() {
    const isUpperCase = !this.data.isUpperCase;
    this.setData({
      isUpperCase: isUpperCase
    });
  },

  // 切换提示显示状态
  toggleHint() {
    this.setData({
      showHint: !this.data.showHint
    });

    // 如果显示了提示，3秒后自动隐藏
    if (this.data.showHint) {
      setTimeout(() => {
        this.setData({
          showHint: false
        });
      }, 3000);
    }
  },

  // 处理已掌握按钮点击
  handleMastered() {
    const currentWord = this.data.currentWord;
    if (!currentWord || !currentWord.word) return;

    wx.showModal({
      title: '确认已掌握',
      content: `确定已掌握单词 "${currentWord.word}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          // 从已学习单词缓存中删除该单词
          const learnedWordsKey = `learnedWords_${this.data.currentBook.desc}`;
          const learnedWords = wx.getStorageSync(learnedWordsKey) || [];
          const updatedLearnedWords = learnedWords.filter(word => word.word !== currentWord.word);
          wx.setStorageSync(learnedWordsKey, updatedLearnedWords);

          // 添加到已拼写单词列表
          const spelledWordsKey = `spelledWords_${this.data.currentBook.desc}`;
          const spelledWords = wx.getStorageSync(spelledWordsKey) || [];
          if (!spelledWords.includes(currentWord.word)) {
            spelledWords.push(currentWord.word);
            wx.setStorageSync(spelledWordsKey, spelledWords);
          }

          // 更新学习进度
          const progress = wx.getStorageSync(`learningProgress_${this.data.currentBook.desc}`) || {};
          progress.reviewCount = spelledWords.length;
          wx.setStorageSync(`learningProgress_${this.data.currentBook.desc}`, progress);

          // 从当前页面的单词列表中移除
          const updatedWords = this.data.words.filter(word => word.word !== currentWord.word);
          
          this.setData({
            words: updatedWords,
            remainingCount: updatedWords.length
          });

          wx.showToast({
            title: '已标记为掌握',
            icon: 'success'
          });

          setTimeout(() => {
            this.selectNewWord();
          }, 1000);
        }
      }
    });
  },
});