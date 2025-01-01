Page({

  /**
   * 页面的初始数据
   */
  data: {
    filteredWords: '',
    currentLetter: '',
    searchValue: '', // 搜索框中的输入值
    cet4WordsGrouped: {}, // CET4 单词
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.toUpperCase().split(''), // 使用大写字母
    batchIndex: 0, // 当前批次索引
    loading: false,
    hasMore: true, // 是否还有更多批次
    words: [], // 当前显示的单词
    windowHeight: '',
    windowWidth: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  getWindowInfo() {

  },
  onLoad() {
    this.loadWordsBatch();
    console.log("页面加载，初始数据为:", this.data); // 
    // 在页面加载时通过 wx.getSystemInfoSync 获取窗口信息
    const windowInfo = wx.getWindowInfo();
    this.setData({
      windowHeight: windowInfo.windowHeight,
      windowWidth: windowInfo.windowWidth,
    });

    console.log('窗口高度:', windowInfo.windowHeight); // 打印窗口高度
    console.log('窗口宽度:', windowInfo.windowWidth); // 打印窗口宽度
  },

  /**
   * 点击加载按钮，获取CET4的单词
   */
  loadWordsBatch() {
    if (this.data.loading || !this.data.hasMore) return; // 检查是否已经在加载或没有更多数据
    this.setData({
      loading: true
    });
    console.log("点击加载CET4单词按钮");

    // 从缓存中获取 CET4 单词
    const cachedWordsGrouped = wx.getStorageSync('cet4WordsGrouped') || {};

    console.log("从缓存中获取到的 CET4 数据:", cachedWordsGrouped); // 打印从缓存获取到的单词数据

    if (Object.keys(cachedWordsGrouped).length === 0) {
      wx.showToast({
        title: '无缓存数据，请获取单词数据!',
        icon: 'none',
        duration: 2000
      });
      this.setData({
        loading: false
      });
      return;
    }

    // 当前字母
    const currentLetter = this.data.alphabet[this.data.batchIndex];
    const currentLetterWords = cachedWordsGrouped[currentLetter] || [];

    console.log(`加载字母 "${currentLetter}" 的单词:`, currentLetterWords); // 打印加载的单词

    // 更新页面数据
    this.setData({
      cet4WordsGrouped: cachedWordsGrouped,
      currentLetter: currentLetter,
      words: [...this.data.words, ...currentLetterWords], // 将新单词追加到已有的单词列表中
      //batchIndex: this.data.batchIndex + 1,  // 更新为下一个字母
      //loading: false,
      //hasMore: this.data.batchIndex < this.data.alphabet.length - 1  // 检查是否还有更多字母
    });

    wx.showToast({
      title: '加载成功',
      icon: 'success',
      duration: 1000
    });

    // 检查是否加载完所有字母的单词
    // if (this.data.batchIndex > this.data.alphabet.length) {
    //   this.setData({
    //     hasMore: false  // 没有更多字母时，设置为 false
    //   });
    //   wx.showToast({
    //     title: '没有更多数据',
    //     icon: 'none',
    //     duration: 2000
    //   });
    // }

    console.log("当前页面数据更新为:", this.data); // 打印页面数据更新后的状态
  },

  /**
   * 触底事件加载更多单词
   */
  onReachBottom() {
    console.log("触底事件触发，准备加载更多单词");
    if (!this.data.hasMore || this.data.loading) {
      console.log("没有更多单词可加载或正在加载中");
      wx.showToast({
        title: '没有更多单词可加载或正在加载中',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    this.loadWordsBatch();
  },

  /**
   * 点击字母导航
   */
  onAlphabetTap(event) {
    const letter = event.currentTarget.dataset.letter;
    console.log(`点击了字母 "${letter}" 的导航`);
    wx.pageScrollTo({
      selector: `#letter-${letter}`,
      duration: 300
    });
    this.loadWordsBatch();
  },

  /**
   * 滚动到顶部
   */
  scrollToTop() {
    console.log("滚动到页面顶部");
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    console.log("滚动到页面底部");
    wx.createSelectorQuery().selectViewport().scrollOffset((res) => {
      wx.pageScrollTo({
        scrollTop: res.scrollHeight, // 将页面滚动到总高度
        duration: 300
      });
      console.log("滚动到页面高度:", res.scrollHeight);
    }).exec();
  },
  onChangeSearch(e) {
    console.log('搜索框内容改变:', e.detail);
    this.setData({
      searchValue: e.detail,
    });
  },

  onCancel() {
    console.log('取消搜索');
    this.setData({
      searchValue: ''
    });
    //this.fetchBookListAndWords(); // 重置数据
  },
  onClick() {
    console.log("点击搜索");
    const {
      searchValue,
      cet4WordsGrouped,
      alphabet,
      windowHeight
    } = this.data;
    const searchValueLower = searchValue.toLowerCase();
    let foundWord = '';
    let targetRect = null;

    // 查找匹配的单词
    for (let letter of alphabet) {
      const words = cet4WordsGrouped[letter] || [];
      const matchingWords = words.filter(word =>
        word.word && word.word.toLowerCase().startsWith(searchValueLower)
      );

      if (matchingWords.length > 0) {
        foundWord = matchingWords[0].word; // 找到第一个匹配的单词
        break; // 找到后退出循环
      }
    }

    if (foundWord) {
      // 获取当前页面的滚动信息
      wx.createSelectorQuery()
        .selectViewport()
        .scrollOffset((viewportRes) => {
          const currentScrollTop = viewportRes.scrollTop;

          // 获取目标单词的位置
          wx.createSelectorQuery()
            .select(`#${foundWord}`)
            .boundingClientRect((rect) => {
              if (rect) {
                // 如果目标单词的位置未变化，不执行滚动
                if (targetRect && targetRect.top === rect.top) {
                  console.log("单词位置未变化，不执行滚动");
                  wx.showToast({
                    title: `找到单词: ${foundWord}`,
                    icon: 'success',
                    duration: 2000,
                  });
                  return;
                }

                targetRect = rect; // 记录目标单词的位置

                // 计算滚动目标位置
                const scrollToPosition = currentScrollTop + rect.top - windowHeight * 0.1;

                // 执行滚动到目标单词的位置
                wx.pageScrollTo({
                  scrollTop: scrollToPosition,
                  duration: 300, // 滚动动画时间
                });

                wx.showToast({
                  title: `找到单词: ${foundWord}`,
                  icon: 'success',
                  duration: 2000,
                });
              }
            })
            .exec();
        })
        .exec();
    } else {
      wx.showToast({
        title: '未找到相关单词',
        icon: 'none',
        duration: 2000,
      });
    }
  },

});