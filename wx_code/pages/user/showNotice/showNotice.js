Page({
  data: {
    showNotice: false, // 控制公告栏显示
    noticeContent: '这是最新的公告内容！', // 公告内容
  },

  onLoad() {
    this.checkNoticeDisplay(); // 检查公告栏是否需要显示
  },

  // 检查公告栏显示条件
  checkNoticeDisplay() {
    const lastDisplay = wx.getStorageSync('lastNoticeDisplay') || 0;
    const now = new Date().getTime();
    const diff = now - lastDisplay;

    // 如果超过 2 小时或者没有记录，显示公告栏
    if (diff > 2 * 60 * 60 * 1000) {
      this.setData({ showNotice: true });
    }
  },

  // 关闭公告栏
  onCloseNotice() {
    this.setData({ showNotice: false });
  },

  // 用户选择 "今天不再显示"
  onNotToday() {
    const now = new Date().getTime();
    const endOfToday = new Date().setHours(23, 59, 59, 999);

    // 保存今天不再显示的记录
    wx.setStorageSync('lastNoticeDisplay', endOfToday);
    this.setData({ showNotice: false });
  },

  // 用户选择 "关闭"
  onCloseNotice() {
    // 保存当前时间
    wx.setStorageSync('lastNoticeDisplay', new Date().getTime());
    this.setData({ showNotice: false });
  },
});
