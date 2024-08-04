Page({
	data: {
		detailType: '',
		detailPrice: '',
		detailIcon: '',
		detailDate: '',
		fieldValue: '',
		showKeyboard: false, // 控制数字键盘的显示与隐藏
		inputValue: '', // 数字键盘的输入值
		showDatePicker: false, // 控制日期选择器的显示与隐藏
		minDate: new Date(2000, 0, 1).getTime(), // 最小日期
		maxDate: new Date().getTime(), // 最大日期
		dateValue: '', // 选择的日期
	},

	onLoad: function (options) {
		console.log('onLoad options:', options);

		this.setData({
			detailType: options.type,
			detailPrice: options.price,
			detailIcon: options.icon,
			detailDate: options.date,
			fieldValue: options.remark,
			recordId: options.id, // 获取记录的ID
		});
		console.log('Data after onLoad:', this.data);
	},

	onDeleteData() {
		wx.showModal({
			title: '确认删除',
			content: '您确定要删除这条记录吗？',
			success: (res) => {
				if (res.confirm) {
					wx.cloud.callFunction({
						name: 'remove',
						data: {
							_id: this.data.recordId
						}, // 传递记录ID
						success: (result) => {
							console.log('删除数据结果:', result);
							if (result.result.success) {
								wx.showToast({
									title: result.result.message,
									icon: 'success',
									duration: 2000
								});

								// 删除成功后，返回上一页
								const pages = getCurrentPages();
								const prevPage = pages[pages.length - 2]; // 上一页
								if (prevPage && typeof prevPage.fetchData === 'function') {
									prevPage.fetchData(prevPage.data.selectedDate); // 刷新数据
								}
								wx.navigateBack(); // 返回上一页
							} else {
								wx.showToast({
									title: result.result.message,
									icon: 'none',
									duration: 2000
								});
							}
						},
						fail: (err) => {
							console.error('调用云函数失败:', err);
							wx.showToast({
								title: '删除失败',
								icon: 'none',
								duration: 2000
							});
						}
					});
				}
			}
		});
	},

	onEdit() {
		console.log('Editing record:', this.data);

		this.setData({
			showKeyboard: true,
			inputValue: this.data.detailPrice, // 将价格填入输入框
			fieldValue: this.data.fieldValue, // 将备注填入备注框
			dateValue: this.data.detailDate, // 将日期填入日期选择器
			currentDate: new Date(this.data.detailDate).getTime(), // 将日期设置为选择器的当前值
		});
		console.log('Data after onEdit:', this.data);
	},
	onConfirm() {
		const updatedData = {
			price: this.data.inputValue,
			note: this.data.fieldValue,
			date: this.data.dateValue,
			icon: this.data.detailIcon,
			type: this.data.detailType, // 保持类型不变
			_id: this.data.recordId // 使用记录 ID 更新特定记录
		};
		console.log('Updating data:', updatedData);
		const app = getApp();
		app.globalData.updatedData = updatedData;

		wx.cloud.callFunction({
			name: 'edit', // 云函数名称
			data: updatedData,
			success: res => {
				console.log('Update successful:', res);
				wx.showToast({
					title: '更新成功',
					icon: 'success',
					duration: 2000
				});
				

				wx.navigateBack(); // 返回上一页

			},
			fail: err => {
				console.error('更新数据失败:', err);
				wx.showToast({
					title: '更新失败',
					icon: 'none',
					duration: 2000
				});
				console.error('更新数据失败:', err);
			}
		});
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
	notes: function (event) {
		this.setData({
			fieldValue: event.detail
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