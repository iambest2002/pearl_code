const app = getApp();
Page({
  data: {
    currentStep: 0, // 0-选择词义阶段, 1-拼写阶段
    currentIndex: 0, // 当前单词索引
    currentWord: {}, // 当前单词对象
    wordList: [], // 复习单词列表（10个一组）
    options: [], // 选项列表
    userInput: '', // 用户输入的拼写
    score: 0, // 得分
    isCorrect: false, // 答案是否正确
    showResult: false, // 是否显示结果
    progress: 0, // 进度
    correctWords: [], // 修改为数组// 答对的单词
    pendingSelection: [], // 待选择词义的单词
    pendingSpelling: [], // 待拼写单词
    phase: 0, // 0-选择词义阶段, 1-拼写阶段
    spelledWords: [] // 已拼写正确的单词
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
              phonetic: word.phonetic || ''
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
      // 读取已掌握的单词进度
      const progress = wx.getStorageSync(`progress_${selectedBook.desc}`) || [];
      const learnedWords = progress.length;

      this.setData({
        wordList,
        currentWord: wordList[0],
        options: this.generateOptions(wordList[0], wordList),
        learnedWords: learnedWords,
        wordsNumber: flattenedWords.length
      });

    } catch (error) {
      console.error('数据处理错误:', error);
      wx.showToast({
        title: error.message || '数据格式错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
    // 保存进度
    //this.saveProgress();
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
      // 将正确答案添加到 correctWords 数组
      if (!this.data.correctWords.includes(currentWord.word)) {
        this.data.correctWords.push(currentWord.word);
      }
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
        duration: 1000
      });
    }

    setTimeout(() => {
      this.nextStep();
    }, 1500);
  },

  // review.js 中添加 updatePendingSpelling 方法
  updatePendingSpelling(word) {
    // 获取待拼写队列
    let pendingSpelling = wx.getStorageSync('pendingSpelling') || [];

    // 如果该单词不在待拼写队列中，则加入
    if (!pendingSpelling.includes(word.word)) {
      pendingSpelling.push(word.word);
    }

    // 保存更新后的待拼写队列
    wx.setStorageSync('pendingSpelling', pendingSpelling);
  },

  submitSpelling() {
    const userInput = this.data.userInput.trim().toLowerCase();
    const correctWord = this.data.currentWord.word.toLowerCase();
    const isCorrect = userInput === correctWord;

    if (isCorrect) {
      const correctWords = this.data.correctWords;
      if (!correctWords.includes(correctWord)) {
        correctWords.push(correctWord);
      }

      // 记录拼写正确的单词
      const spelledWords = this.data.spelledWords;
      if (!spelledWords.includes(correctWord)) {
        spelledWords.push(correctWord);
      }
      this.setData({
        spelledWords
      });
    }

    this.setData({
      isCorrect,
      showResult: true,
      score: isCorrect ? this.data.score + 1 : this.data.score
    });

    // 实时保存进度
    this.saveProgress();

    if (!isCorrect) {
      // 拼写错误时将单词加入待拼写队列
      this.updatePendingSpelling(this.data.currentWord);
    }

    setTimeout(() => {
      this.nextStep();
    }, 500);
  },

  nextStep() {
    let {
      currentStep,
      currentIndex,
      wordList,
      phase
    } = this.data;

    if (phase === 0) {
      // 选择词义阶段
      currentIndex++;
      if (currentIndex >= wordList.length) {
        // 完成选择词义阶段，开始拼写阶段
        phase = 1;
        currentIndex = 0;
      }
    } else {
      // 拼写阶段
      currentIndex++;
      if (currentIndex >= wordList.length) {
        // 完成所有阶段，保存进度并返回
        this.saveProgress();
        return;
      }
    }

    const currentWord = wordList[currentIndex];
    let options = phase === 0 ? this.generateOptions(currentWord, wordList) : [];

    this.setData({
      phase,
      currentIndex,
      currentWord,
      options,
      userInput: '',
      showResult: false,
      selectedOption: '',
      progress: ((phase * wordList.length + currentIndex) / (wordList.length * 2)) * 100
    });
  },

  // 页面卸载时（返回页面）保存进度
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
  }
  

});