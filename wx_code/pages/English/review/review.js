const app = getApp();
Page({
  data: {
    currentIndex: 0, // 当前单词索引
    currentWord: {}, // 当前单词对象
    wordList: [], // 复习单词列表
    remainingWords: [], // 答错需要重新学习的单词
    options: [], // 选项列表
    userInput: '', // 用户输入的拼写
    isCorrect: false, // 答案是否正确
    showResult: false, // 是否显示结果
    progress: 0, // 进度
    correctWords: [], // 答对的单词
    pendingSelection: [], // 待选择词义的单词
    showHint: false // 添加提示显示状态
  },

  onLoad() {
    const myBookIndex = app.globalData.mybook;
    const selectedBook = app.globalData.books[myBookIndex];

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

    let allWords = wx.getStorageSync(selectedBook.desc);

    try {
      if (typeof allWords === 'string') {
        allWords = JSON.parse(allWords);
      }

      if (!Array.isArray(allWords)) {
        allWords = Object.values(allWords);
      }

      // 展平并处理单词数据
      const flattenedWords = allWords.reduce((acc, group) => {
        if (Array.isArray(group)) {
          const words = group.map(word => {
            if (!word || !word.word || !word.translations) return null;
            const translation = Array.isArray(word.translations) ? word.translations[0] : word.translations;
            return {
              word: word.word,
              mean: typeof translation === 'object' ? translation.translation : translation,
            };
          }).filter(Boolean);
          return [...acc, ...words];
        }
        return acc;
      }, []);

      // 获取每日计划学习的单词数
      const everydayWord = app.globalData.everydayWord || 10; // 默认为10

      // 获取实际需要显示的单词列表
      const wordList = this.getRandomWords(flattenedWords, everydayWord);

      this.setData({
        wordList,
        currentWord: wordList[0],
        options: this.generateOptions(wordList[0], wordList),
        remainingWords: [],
        progress: 0
      });

    } catch (error) {
      console.error('数据处理错误:', error);
      wx.showToast({
        title: '请添加单词数据',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  getRandomWords(words, count = 10) {
    if (!Array.isArray(words) || words.length === 0) {
      throw new Error('无效的单词数据');
    }

    const result = [];
    const wordsCopy = [...words];
    const targetCount = Math.min(count, wordsCopy.length);

    for (let i = 0; i < targetCount; i++) {
      const randomIndex = Math.floor(Math.random() * wordsCopy.length);
      result.push(wordsCopy[randomIndex]);
      wordsCopy.splice(randomIndex, 1);
    }

    return result;
  },

  generateOptions(currentWord, wordList) {
    let options = [];
    const maxOptions = 4;

    if (!currentWord || !currentWord.mean) {
      return ['选项1', '选项2', '选项3', '选项4'];
    }

    options.push(currentWord.mean);

    const otherMeanings = wordList
      .filter(word => word && word.mean && word.mean !== currentWord.mean)
      .map(word => word.mean);

    while (options.length < maxOptions && otherMeanings.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherMeanings.length);
      const meaning = otherMeanings[randomIndex];
      if (!options.includes(meaning)) {
        options.push(meaning);
      }
      otherMeanings.splice(randomIndex, 1);
    }

    while (options.length < maxOptions) {
      options.push(`释义${options.length + 1}`);
    }

    return [...options].sort(() => 0.5 - Math.random());
  },

  handleOptionSelect(e) {
    const selected = e.currentTarget.dataset.option;
    const currentWord = this.data.currentWord;
    const isCorrect = selected === currentWord.mean;

    if (isCorrect) {
      // 获取当前选择的书籍信息
      const myBookIndex = app.globalData.mybook;
      const selectedBook = app.globalData.books[myBookIndex];
      
      // 使用书籍描述作为缓存key的一部分
      const learnedWordsKey = `learnedWords_${selectedBook.desc}`;
      
      // 获取当前书籍的已学习单词列表
      const learnedWords = wx.getStorageSync(learnedWordsKey) || [];
      
      // 添加新学习的单词
      if (!learnedWords.find(w => w.word === currentWord.word)) {
        learnedWords.push(currentWord);
        wx.setStorageSync(learnedWordsKey, learnedWords);
      }

      if (!this.data.correctWords.includes(currentWord.word)) {
        this.data.correctWords.push(currentWord.word);
      }
    } else {
      // 答错时将单词添加到待重新学习列表
      const remainingWords = this.data.remainingWords;
      if (!remainingWords.find(w => w.word === currentWord.word)) {
        remainingWords.push(currentWord);
      }
      this.setData({ remainingWords });
    }

    this.setData({
      isCorrect,
      showResult: true,
      selectedOption: selected,
      score: isCorrect ? this.data.score + 1 : this.data.score
    });

    if (!isCorrect) {
      wx.showToast({
        title: `正确答案: ${currentWord.mean}`,
        icon: 'none',
        duration: 1500
      });
    }

    setTimeout(() => {
      this.nextWord();
    }, 1500);
  },

  handleInput(e) {
    const userInput = e.detail.value;
    this.setData({
      userInput: userInput
    });
  },

  submitSpelling() {
    const userInput = this.data.userInput.trim().toLowerCase();
    const correctWord = this.data.currentWord.word.toLowerCase();

    if (userInput === '') {
      wx.showToast({
        title: '请输入单词',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    const isCorrect = userInput === correctWord;

    if (isCorrect) {
      const correctWords = this.data.correctWords;
      if (!correctWords.includes(correctWord)) {
        correctWords.push(correctWord);
      }

      const spelledWords = this.data.spelledWords;
      if (!spelledWords.includes(correctWord)) {
        spelledWords.push(correctWord);
      }
      this.setData({
        spelledWords
      });

      wx.showToast({
        title: '拼写正确',
        icon: 'success',
        duration: 1500
      });
    } else {
      this.setData({
        isCorrect: false,
        showResult: true,
        score: this.data.score
      });

      wx.showToast({
        title: '拼写错误',
        icon: 'none',
        duration: 1500
      });

      this.updatePendingSpelling(this.data.currentWord);
    }

    this.saveProgress();

    setTimeout(() => {
      this.nextWord();
    }, 500);
  },

  nextWord() {
    const { currentIndex, wordList, remainingWords } = this.data;
    const nextIndex = currentIndex + 1;

    // 如果当前轮次的单词学习完了
    if (nextIndex >= wordList.length) {
      // 如果还有需要重新学习的单词
      if (remainingWords.length > 0) {
        this.setData({
          wordList: remainingWords, // 将待重新学习的单词设为新的学习列表
          remainingWords: [], // 清空待重新学习列表
          currentIndex: 0, // 重置索引
          currentWord: remainingWords[0],
          options: this.generateOptions(remainingWords[0], remainingWords),
          showResult: false,
          selectedOption: '',
          progress: ((wordList.length - remainingWords.length) / wordList.length) * 100,
          showHint: false // 切换单词时隐藏提示
        });
        return;
      }

      // 如果没有需要重新学习的单词，说明全部学习完成
      this.saveProgress();
      wx.showToast({
        title: '学习完成！',
        icon: 'success',
        duration: 1500
      });
      
      // 延迟1.5秒后返回上一页
      setTimeout(() => {
        wx.navigateBack({
          delta: 1
        });
      }, 1500);
      
      return;
    }

    // 继续学习下一个单词
    const nextWord = wordList[nextIndex];
    this.setData({
      currentIndex: nextIndex,
      currentWord: nextWord,
      options: this.generateOptions(nextWord, wordList),
      showResult: false,
      selectedOption: '',
      progress: (nextIndex / wordList.length) * 100,
      showHint: false // 切换单词时隐藏提示
    });
  },

  onUnload() {
    console.log("页面卸载，保存学习进度");
    this.saveProgress();
  },

  saveProgress() {
    const correctWords = Array.from(this.data.correctWords); // 获取已学单词
    const myBookIndex = app.globalData.mybook;
    const selectedBook = app.globalData.books[myBookIndex];
  
    console.log("已学单词:", correctWords); // 打印已学单词
  
    // 获取现有进度，读取缓存中的学习进度
    let progress = wx.getStorageSync(`learningProgress_${selectedBook.desc}`) || {
      learnedCount: 0,       // 已学单词数
      reviewCount: 0,        // 复习单词数
      unlearnedCount: this.data.wordList.length, // 未学单词数
      wordsNumber: this.data.wordList.length,    // 总单词数
    };
  
    console.log("现有进度:", progress); // 打印现有进度
  
    // 增加新学会的单词数
    const newLearnedCount = progress.learnedCount + correctWords.length;
    const newUnlearnedCount = progress.unlearnedCount - correctWords.length;
  
    // 更新复习单词数（拼写正确的单词）
    const reviewWords = this.data.spelledWords.length || 0;
  
    // 更新后的进度数据
    progress.learnedCount = newLearnedCount;
    progress.unlearnedCount = newUnlearnedCount;
    progress.reviewCount = reviewWords;
  
    console.log("更新后的进度:", progress); // 打印更新后的进度
  
    // 保存进度到缓存
    wx.setStorageSync(`learningProgress_${selectedBook.desc}`, progress);
  
    // 更新全局进度
    app.globalData.learnedWords = progress.learnedCount;
    app.globalData.reviewWords = progress.reviewCount;
    app.globalData.unlearnedWords = progress.unlearnedCount;
    app.globalData.everydayWord = this.data.wordList.length;
  
    console.log("全局更新进度 - 已学习:", progress.learnedCount, "复习单词数量:", progress.reviewCount, "未学单词数:", progress.unlearnedCount);
  
    // 确保在缓存中保存正确的学习进度
    wx.setStorageSync(`learningProgress_${selectedBook.desc}`, {
      learnedCount: progress.learnedCount,  // 已学单词数
      reviewCount: progress.reviewCount,    // 复习单词数
      unlearnedCount: progress.unlearnedCount, // 未学单词数
      wordsNumber: progress.wordsNumber,    // 总单词数
      everydayWord: this.data.wordList.length, // 每日学习单词数
      //wordsNumber: originalWordsNumber, // 保持原始的单词总数
    });
  
    // 每次都保存进度，即使没有完成拼写
    console.log("学习进度保存成功", progress.learnedCount);
  },

  updatePendingSpelling(word) {
    let pendingSpelling = wx.getStorageSync('pendingSpelling') || [];

    if (!pendingSpelling.includes(word.word)) {
      pendingSpelling.push(word.word);
    }

    wx.setStorageSync('pendingSpelling', pendingSpelling);
  },

  // 添加切换提示显示状态的方法
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
  }
});