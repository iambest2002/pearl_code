Page({
  data: {
    detailType: '',
    detailPrice: '',
		detailIcon: '',
		detailDate:'',
		detailRemark:'',
  },

  onLoad: function(options) {
    // 从页面参数中获取数据并设置到页面数据中
    this.setData({
      detailType: options.type,
      detailPrice: options.price,
			detailIcon: options.icon,
			detailDate: options.date,
      detailRemark: options.remark,
    });
  }
});
