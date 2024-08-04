// pages/dictionary/dictionary.js
Page({
  data: {
    word: '',
    definition: '',
    error: ''
  },

  // 获取输入单词
  onWordInput(event) {
    this.setData({
      word: event.detail.value
    });
  },

  // 查询单词定义
  searchWord() {
    const { word } = this.data;

    if (!word) {
      this.setData({
        error: 'Please enter a word.'
      });
      return;
    }

    // API调用
    wx.request({
      url: `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
      success: (res) => {
        if (res.statusCode === 200 && res.data.length > 0) {
          const definition = res.data[0].meanings[0].definitions[0].definition;
          this.setData({
            definition,
            error: ''
          });
        } else {
          this.setData({
            definition: '',
            error: 'Word not found.'
          });
        }
      },
      fail: (err) => {
        this.setData({
          definition: '',
          error: 'Error fetching definition. Please try again later.'
        });
      }
    });
  }
});
