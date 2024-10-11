Page({
	data: {
		current: "1",
		currentType: "",
		minDate: new Date(2000, 0, 1).getTime(), // 将日期转换为时间戳
		maxDate: new Date(2030, 11, 31).getTime(),
		showKeyboard: false,
		showDatePicker: false, // 控制日期选择器的显示
		formatter: '',
		fieldValue: '',
		inputValue: '',
		selectedValues: [],
		currentDate: new Date().getTime(), // 当前日期
		dateValue: '', // 用于显示选择的日期
		currentOperator: '', // 当前运算符
		selectedType: '', // 当前选中的消费类型
		// 增加
		expenditure: [
			'餐饮', '零食', '水果', '蔬菜', '住房', '购物', '交通', '服装', '娱乐', '医疗', '家庭', '通讯', '孩子', '旅行', '烟酒', '数码', '书籍', '学习', '宠物', '礼金', '礼物', '办公', '快递', '捐赠', '彩票', '维修', '其它'
		],
		income: ['工资', '兼职', '理财', '礼金', '其他'],
		iconExpenditure: [
			'../../image/food.png', '../../image/candy.png', '../../image/fruit.png', '../../image/vegetables.png', '../../image/hotel.png', '../../image/buy.png', '../../image/bus.png', '../../image/clothes.png', '../../image/entertainment.png', '../../image/hospital.png', '../../image/family.png', '../../image/phone.png', '../../image/baby.png', '../../image/journey.png', '../../image/beer.png', '../../image/ipad.png', '../../image/bookshelf.png', '../../image/study.png', '../../image/cat.png', '../../image/donate.png', '../../image/gift.png', '../../image/work.png', '../../image/expressdelivery.png', '../../image/cashgift.png', '../../image/lotteryticket.png', '../../image/tool.png', '../../image/other.png',
		],
		iconIncome: [
			'../../image/wages.png', '../../image/partTimeJob.png', '../../image/financing.png', '../../image/cashgift.png', '../../image/finance.png',
		],
	},

	onLoad(options) {
		
		this.setData({
			formatter: (type, value) => {
				if (type === 'year') {
					return `${value}年`;
				}
				if (type === 'month') {
					return `${value}月`;
				}
				if (type === 'day') {
					return `${value}日`;
				}
				return value;
			}
		});
	},
	
	onShow() {
    const app = getApp();
    const editData = app.globalData.editData || null;

    if (editData) {
      this.setData({
        selectedType: editData.selectedType,
        inputValue: editData.inputValue,
        fieldValue: editData.fieldValue,
				dateValue: editData.dateValue,
				id: editData.id, // 获取记录的ID
        showKeyboard: false, // 显示数字键盘
      });
      app.globalData.editData = null; // 清除全局数据
    }
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

	onChange(event) {
		const value = event.currentTarget.dataset.value;
		const index1 = this.data.income.indexOf(value);
		const index2 = this.data.expenditure.indexOf(value);
		const selectedValues = this.data.selectedValues;
		// 如果消费类型已选中，则取消选中并隐藏键盘
		if ((index1 >= 0 || index2 >= 0) && selectedValues.includes(value)) {
			this.setData({
				selectedValues: selectedValues.filter(i => i !== value),
				showKeyboard: true
			});
		} else {
			// 否则，选中消费类型并显示键盘
			selectedValues.push(value);
			this.setData({
				selectedValues,
				showKeyboard: true,
				selectedType: value // 更新选中的消费类型
			});
		}
	},
	

	onInput(event) {
		const value = event.currentTarget.dataset.value;
		this.setData({
			inputValue: this.data.inputValue + value
		});
	},

	onDelete() {
		this.setData({
			inputValue: this.data.inputValue.slice(0, -1)
		});
	},

	onClear() {
		this.setData({
			inputValue: ''
		});
  },
  // 保存支出或收入信息到缓存中
	saveToCache(data, type) {
		let cacheKey = type === "expenses" ? 'expenses' : 'income';
		let cachedData = wx.getStorageSync(cacheKey) || [];
		
		// 打印原有的缓存数据
		console.log(`保存前的${type}缓存数据:`, cachedData);

		cachedData.push(data);
		wx.setStorageSync(cacheKey, cachedData);

		// 打印更新后的缓存数据
		console.log(`保存后的${type}缓存数据:`, cachedData);
	},

	onConfirm() {
    const data_code = this.data.current;
    const dataToSave = {
			price: this.data.inputValue,
			note: this.data.fieldValue,
			type: this.data.selectedType,
			date: this.data.dateValue || this.formatDate(new Date())
		};

		if (!this.data.dateValue) {
      const today = new Date();
      const dateString = this.formatDate(today);
      this.setData({
        dateValue: dateString
      });
      console.log('准备保存的数据:', dataToSave);
    }
		if (data_code === "1") {
      this.saveToCache(dataToSave, 'expenses');
			wx.cloud.database().collection('expenses').add({
				data: {
					price: this.data.inputValue,
					note: this.data.fieldValue,
					type: this.data.selectedType,
					date: this.data.dateValue
				},
			})
			.then(res=>{
				console.log('添加成功',res)
			})
			.catch(res=>{
				console.log('添加失败',res)
			})
			this.setData({
				showKeyboard: false,
				inputValue: '',
				fieldValue: '',
				dateValue: ''
			});
		} else {
      this.saveToCache(dataToSave, 'income');
			wx.cloud.database().collection('income').add({
				data: {
					price: this.data.inputValue,
					note: this.data.fieldValue,
					type: this.data.selectedType,
					date: this.data.dateValue
				},
			})
			.then(res=>{
				console.log('添加成功',res)
			})
			.catch(res=>{
				console.log('添加失败',res)
			})

			this.setData({
				showKeyboard: false,
				inputValue: '',
				fieldValue: '',
				dateValue: ''
			});
		}
	},

	click(e) {
		let index = e.currentTarget.dataset.code;
		this.setData({
			current: index
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

	onShowDatePicker() {
		this.setData({
			showDatePicker: true,
			showKeyboard: true // 隐藏数字键盘
		});
	},

	onDateConfirm(event) {
		const date = event.detail;
		const dateString = this.formatDate(new Date(date));
		this.setData({
			currentDate: date,
			showDatePicker: false,
			dateValue: dateString // 更新显示的日期
		});
	},

	onDateCancel() {
		this.setData({
			showDatePicker: false
		});
	},

	formatDate(date) {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		return `${year}-${month}-${day}`;
	},
});