Page({
	data: {
		showDatePicker: false, // 控制日期选择器的显示与隐藏
		currentDate: new Date().getTime(), // 当前时间戳
		selectedDate: '', // 用户选择的日期
		filteredData: [], // 保存过滤后的数据
		activeNames: [],
		expenseTotalPrice: 0, // 保存支出的总价格
		incomeTotalPrice: 0, // 保存收入的总价格
		detailType: '',
		detailPrice: '',
		detailIcon: '',
		detailDate: '',
		fieldValue: '',
		showDetail: false,
		processFetchedData: '',
		listData: [],
		typeIconMapping: {
			// 图标路径映射
			'餐饮': '../../image/food.png',
			'零食': '../../image/candy.png',
			'水果': '../../image/fruit.png',
			'蔬菜': '../../image/vegetables.png',
			'住房': '../../image/hotel.png',
			'购物': '../../image/buy.png',
			'交通': '../../image/bus.png',
			'服装': '../../image/clothes.png',
			'娱乐': '../../image/entertainment.png',
			'医疗': '../../image/hospital.png',
			'家庭': '../../image/family.png',
			'通讯': '../../image/phone.png',
			'孩子': '../../image/baby.png',
			'旅行': '../../image/journey.png',
			'烟酒': '../../image/beer.png',
			'数码': '../../image/ipad.png',
			'书籍': '../../image/bookshelf.png',
			'学习': '../../image/study.png',
			'宠物': '../../image/cat.png',
			'礼金': '../../image/donate.png',
			'礼物': '../../image/gift.png',
			'办公': '../../image/work.png',
			'快递': '../../image/expressdelivery.png',
			'捐赠': '../../image/cashgift.png',
			'彩票': '../../image/lotteryticket.png',
			'维修': '../../image/tool.png',
			'其它': '../../image/other.png',
			'工资': '../../image/wages.png',
			'兼职': '../../image/partTimeJob.png',
			'理财': '../../image/financing.png',
			'礼金': '../../image/cashgift.png',
			'其他': '../../image/fofinanceod.png',
		},
	},

	// 显示详细数据
	showDetail: function (e) {
		const type = e.currentTarget.dataset.type;
		const price = e.currentTarget.dataset.price;
		const icon = e.currentTarget.dataset.icon;
		const date = e.currentTarget.dataset.date;
		const remark = e.currentTarget.dataset.remark;
		const _id = e.currentTarget.dataset.id;
		wx.navigateTo({
			url: `/pages/show/show?type=${type}&price=${price}&icon=${icon}&date=${date}&remark=${remark}&id=${_id}`
		});
		this.setData({
			detailType: type,
			detailPrice: price,
			detailIcon: icon,
			detailDate: date,
			fieldValue: remark,
			recordId: _id,
			showDetail: true // 设置为 true 显示详细数据
		});
	},

	// 页面加载时
	onLoad(options) {
    const now = new Date();
    const dateString = this.formatDate(now);
		this.setData({
			selectedDate: dateString
		});

		// 获取并保存 openid
		this.getOpenidAndFetchData(dateString);
    
  },
	onShow() {
		const openid = wx.getStorageSync('openid');
		if (openid) {
			this.setData({ openid });
			this.fetchData(this.data.selectedDate); // 使用获取的 openid 调用 fetchData
		}
	},

	getOpenidAndFetchData(dateString) {
		wx.cloud.callFunction({
			name: 'getOpenid',
			success: res => {
				console.log('用户的openid:', res.result.openid);
				wx.setStorageSync('openid', res.result.openid); // 保存 openid 到本地存储
				this.setData({
					openid: res.result.openid
				});

			},
			fail: err => {
				console.error('获取 openid 失败', err);
			}
		});
	},

	// 日期选择器变化
	onChange(event) {
		this.setData({
			activeNames: event.detail
		});
	},

	// 显示日期选择器
	onShowDatePicker() {
		this.setData({
			showDatePicker: true
		});
	},

	// 确认日期选择
	onDateConfirm(event) {
		const date = event.detail; // 使用传入事件的日期
		const dateString = this.formatDate(new Date(date));
		this.setData({
			showDatePicker: false,
			selectedDate: dateString
		});
		this.fetchData(dateString); // 获取指定日期的数据
	},

	// 获取数据
	fetchData(dateString, skip = 0, allData = []) {

		const openid = this.data.openid;
		this.setData({
			filteredData: [],
			expenseTotalPrice: 0,
			incomeTotalPrice: 0
		});
		
		wx.cloud.callFunction({
				name: 'getTypeData',
				data: {
					date: dateString,
					skip: skip, // 跳过前 skip 条记录
					limit: 100, // 每次获取的记录数
					openid: openid,
				},
			})
			.then((res) => {
				console.log(res.result)
				const {
					expensesData,
					incomeData,
				} = res.result;
				const newData = [...expensesData, ...incomeData];
				const uniqueData = Array.from(new Set(newData.map(item => item._id)))
					.map(id => {
						return newData.find(item => item._id === id);
					});
				allData = allData.concat(uniqueData);

				// 处理支出数据
				if (expensesData.length > 0) {
					this.processFetchedData(expensesData, 'expenses');
				}
				// 处理收入数据
				if (incomeData.length > 0) {
					this.processFetchedData(incomeData, 'income');
				}
				if (expensesData.length === 100 || incomeData.length === 100) {
					// 如果返回的数据数量等于 limit，则继续获取下一页数据
					this.fetchData(dateString, skip + 100, allData);
				} else {
					this.setData({
						filteredData: allData
					});
				}
			})
			.catch((err) => {
				console.error('获取数据失败:', err);
			});
	},
	processFetchedData(data, type) {
		let currentData = this.data.filteredData;
		let expenseTotal = this.data.expenseTotalPrice;
		let incomeTotal = this.data.incomeTotalPrice;

		data.forEach((item) => {
			const price = parseFloat(item.price);
			if (type === 'expenses') { // 如果从支出表获取的数据
				expenseTotal += isNaN(price) ? 0 : price;
				item['category'] = '支出';
			} else if (type === 'income') { // 如果从收入表获取的数据
				incomeTotal += isNaN(price) ? 0 : price;
				item['category'] = '收入';
			}
			currentData.push(item);
		});

		this.setData({
			filteredData: [...this.data.filteredData, ...data], // 避免重复
			expenseTotalPrice: expenseTotal,
			incomeTotalPrice: incomeTotal,
		});
	},


	// 取消日期选择
	onDateCancel() {
		this.setData({
			showDatePicker: false
		});
	},

	// 格式化日期
	formatDate(date) {
		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		return `${year}-${month}`;
	},
});