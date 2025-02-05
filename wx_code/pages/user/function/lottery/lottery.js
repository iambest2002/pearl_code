Page({
  data: {
    prizeList: [], // 奖品列表
    newPrize: '', // 新奖品输入
    isRolling: false, // 是否正在抽奖
    currentPrize: '', // 当前选中的奖品
    currentIndex: -1, // 当前选中的索引
    timer: null, // 定时器
    result: '', // 最终结果
  },

  onLoad() {
    // 从缓存加载奖品列表
    const savedPrizes = wx.getStorageSync('prizeList') || [];
    this.setData({
      prizeList: savedPrizes
    });
  },

  // 输入框内容变化
  onInputChange(e) {
    this.setData({
      newPrize: e.detail.value
    });
  },

  // 添加奖品
  addPrize() {
    const newPrize = this.data.newPrize.trim();
    if (!newPrize) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 检查是否存在相同内容
    if (this.data.prizeList.includes(newPrize)) {
      wx.showToast({
        title: '已存在相同内容',
        icon: 'none'
      });
      return;
    }

    const updatedList = [...this.data.prizeList, newPrize];
    this.setData({
      prizeList: updatedList,
      newPrize: ''
    });

    // 保存到缓存
    wx.setStorageSync('prizeList', updatedList);
    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 删除奖品
  deletePrize(e) {
    const index = e.currentTarget.dataset.index;
    const updatedList = this.data.prizeList.filter((_, i) => i !== index);
    this.setData({
      prizeList: updatedList
    });
    wx.setStorageSync('prizeList', updatedList);
  },

  // 开始抽奖
  startLottery() {
    if (this.data.prizeList.length === 0) {
      wx.showToast({
        title: '请先添加奖品',
        icon: 'none'
      });
      return;
    }

    if (this.data.isRolling) {
      return;
    }

    this.setData({
      isRolling: true,
      result: '' // 清空上次结果
    });

    let count = 0;
    const totalTime = 3000; // 总时间3秒
    const interval = 50; // 初始间隔50ms
    const maxCount = totalTime / interval;
    
    // 随机滚动效果
    const roll = () => {
      count++;
      const randomIndex = Math.floor(Math.random() * this.data.prizeList.length);
      this.setData({
        currentIndex: randomIndex,
        currentPrize: this.data.prizeList[randomIndex]
      });

      if (count < maxCount) {
        // 速度渐慢
        const nextInterval = interval + (count / maxCount) * 150;
        this.data.timer = setTimeout(roll, nextInterval);
      } else {
        // 停止并显示结果
        this.setData({
          isRolling: false,
          result: this.data.currentPrize
        });
      }
    };

    roll();
  }
}); 