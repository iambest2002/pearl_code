Page({
  data: {
    userInfo: null,
    userInfo_tank: false,
    avatarUrl: '',
    selectedTime: '',
    scheduleId: null
  },

  onTimeChange(e) {
    this.setData({
      selectedTime: e.detail.value
    });
  },

  setSchedule() {
    const selectedTime = this.data.selectedTime;
    if (!selectedTime) {
      wx.showToast({
        title: '请选择时间',
        icon: 'none'
      });
      return;
    }

    // 将定时任务存入本地数据
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const now = new Date();
    const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    const delay = targetTime - now;

    if (delay <= 0) {
      wx.showToast({
        title: '选择的时间已过',
        icon: 'none'
      });
      return;
    }

    const scheduleId = setTimeout(() => {
      wx.showToast({
        title: '时间到了，记得记账哦！',
        icon: 'none'
      });
      this.clearSchedule();
    }, delay);

    this.setData({ scheduleId });
    wx.showToast({
      title: '定时记账已设置',
      icon: 'success'
    });
  },

  clearSchedule() {
    if (this.data.scheduleId) {
      clearTimeout(this.data.scheduleId);
      this.setData({ scheduleId: null });
    }
  },

  onUnload() {
    this.clearSchedule();
  },

  // 其他已有的函数...
});
