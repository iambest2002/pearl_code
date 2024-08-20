const app = getApp();

Page({
  data: {
    inputValue: '',
    formatter: '',
    fieldValue: '',
    priceValue:'',
    showKeyboard: false,
    minDate: new Date(2000, 0, 1).getTime(), // 将日期转换为时间戳
    maxDate: new Date(2030, 11, 31).getTime(),
    currentDate: new Date().getTime(), // 当前日期
    showDatePicker: false, // 控制日期选择器的显示
    showTypePicker: false, // 控制日期选择器的显示
    dateValue: '', // 用于显示选择的日期
    selectedType: '', // 当前选中的消费类型
    selectedCategory: '支出',
    scheduleList: [], // 用于存储定时记账的信息
    isDataAdded: false, // 管理是否已添加数据的状态
    pickerColumns: [],
    expenditure: [
			'餐饮', '零食', '水果', '蔬菜', '住房', '购物', '交通', '服装', '娱乐', '医疗', '家庭', '通讯', '孩子', '旅行', '烟酒', '数码', '书籍', '学习', '宠物', '礼金', '礼物', '办公', '快递', '捐赠', '彩票', '维修', '其它'
    ],
    income:['工资', '兼职', '理财', '礼金', '其他'],
  },

  onLoad(options) {
		
		// this.setData({
		// 	formatter: (type, value) => {
		// 		if (type === 'year') {
		// 			return `${value}年`;
		// 		}
		// 		if (type === 'month') {
		// 			return `${value}月`;
		// 		}
		// 		if (type === 'day') {
		// 			return `${value}日`;
		// 		}
		// 		return value;
		// 	}
    // });
    this.updatePickerColumns();

  },
  onShow() {
    this.getScheduleList(); // 页面显示时加载数据
    // this.deleteAccounting(e);
  },
  updatePickerColumns() {
    this.setData({
      pickerColumns: [
        { values: ['支出', '收入'], className: 'column1' },
        { values: this.data.selectedCategory === '支出' ? this.data.expenditure : this.data.income, className: 'column2' }
      ]
    });
  },
  getScheduleList() {
    wx.cloud.callFunction({
      name: 'getAccountingData', // 替换为你的云函数名称
      success: res => {
        if (res.result.success) {
          this.setData({
            scheduleList: res.result.data // 更新页面数据，刷新显示
          });
          console.log(res.result.data)
        } else {
          console.error('获取定时记账信息失败:', res.result.error);
        }
      },
      fail: err => {
        console.error('调用云函数失败:', err);
      }
    });
  },
 // 删除操作
 deleteAccounting(e) {
  const id = e.currentTarget.dataset.id;
  wx.cloud.callFunction({
    name: 'deleteAccounting',
    data: {
      id: id
    },
    success: res => {
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
      this.getScheduleList();
      // 更新页面数据，移除删除的项
      const newScheduleList = this.data.scheduleList.filter(item => item._id !== id);
      this.setData({
        scheduleList: newScheduleList
      });
      // 手动关闭swipe-cell

    },
    fail: err => {
      console.error('删除失败:', err);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  });
},

  showKeyboard() {
    this.setData({
      showKeyboard: true
    });
  },
  // 备注JS
	notes(event) {
		this.setData({
			fieldValue: event.detail // 确保获取正确的输入值
		});
  },
  priceInput(event) {
		this.setData({
			priceValue: event.detail // 确保获取正确的输入值
		});
  },



	onClear() {
		this.setData({
			inputValue: ''
		});
  },
  onCancel() {
		this.setData({
			showKeyboard: false,
			inputValue: '',
			fieldValue: '',
			dateValue: ''
		});
		wx.showToast({
			title: '已取消',
			icon: 'none',
			duration: 2000
		});
	},


  onTypePicker() {
		this.setData({
			showTypePicker: true,
			showKeyboard: true // 隐藏数字键盘
		});
	},

  setSchedule() {
    this.setData({
      showKeyboard: true
    });
  },


  onTypeConfirm(event) {
    const { value } = event.detail;
    const selectedCategory = value[0];
    const selectedType = value[1];

    // 更新选中的类型和分类
    this.setData({
      selectedCategory,
      selectedType,
      showTypePicker: false
    });
  },
  onPickerChange(event) {
    const { picker, value, index } = event.detail;

    if (index === 0) {
      // 如果改变的是第一列的值（支出/收入）
      const newCategory = value[0];
      this.setData({
        selectedCategory: newCategory
      }, () => {
        // 更新第二列的值
        picker.setColumnValues(1, this.data.selectedCategory === '支出' ? this.data.expenditure : this.data.income);
      });
    }
  },
  onTypePicker() {
    this.setData({
      showTypePicker: true
    });
  },

	onDateCancel() {
		this.setData({
			showDatePicker: false
		});
  },
  onTypeCancel() {
		this.setData({
			showTypePicker: false
		});
  },
  onConfirm() {
    const { fieldValue, priceValue, selectedType,scheduleList,selectedCategory  } = this.data;

  if (!fieldValue || !priceValue || !selectedType) {
    wx.showToast({
      title: '请填写完整信息',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 调用云函数，将数据添加到数据库中
  wx.cloud.callFunction({
    name: 'accounting',
    data: {
      note: fieldValue,
      price: priceValue,
      type: selectedType
    },
    success: res => {
      wx.showToast({
        title: '数据添加成功',
        icon: 'success',
        duration: 2000
      });
      // 清空输入内容
      this.setData({
        showKeyboard:false,
        fieldValue: '',
        priceValue: '',
        selectedType: ''
      });
      this.getScheduleList()
    },
    fail: err => {
      console.error('调用云函数失败:', err);
      wx.showToast({
        title: '数据添加失败',
        icon: 'none',
        duration: 2000
      });
    }
  });
  },


  formatDate(date) {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	},
 
});
