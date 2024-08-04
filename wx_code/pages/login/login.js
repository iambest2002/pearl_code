Page({
	data: {
			baseUrl: '', // 将此处替换为你的基础URL
			bean: {
					avatarUrl: '', // 用户头像URL
					avatarUrlType: 0, // 1 表示本地图片，其他表示服务器图片
					nickName: '', // 用户昵称
					phone: '' // 用户手机号
			}
	},

	onChooseAvatar(e) {
			const { avatarUrl } = e.detail;
			this.setData({
					'bean.avatarUrl': avatarUrl,
					'bean.avatarUrlType': 1
			});
	},

	handleChangeInput(e) {
			const field = e.currentTarget.dataset.field;
			const value = e.detail.value.trim();
			this.setData({
					[`bean.${field}`]: value
			});
	},

	userInfoUpdateSelect() {
			// 保存用户信息的逻辑
			console.log('保存用户信息', this.data.bean);

			// 将用户信息作为查询参数
			const query = `?avatarUrl=${encodeURIComponent(this.data.bean.avatarUrl)}&avatarUrlType=${this.data.bean.avatarUrlType}&nickName=${encodeURIComponent(this.data.bean.nickName)}&phone=${this.data.bean.phone}`;

			wx.request({
					url: `${this.data.baseUrl}/saveUserInfo${query}`,
					method: 'GET',
					success: (res) => {
							// 成功保存后，进行页面跳转
							this.redirectToHomePage();
					},
					fail: (err) => {
							console.error('保存用户信息失败', err);
					}
			});

			// 模拟保存成功，直接跳转
			this.redirectToHomePage();
	},

	redirectToHomePage() {
			// 跳转到首页或其他页面
			wx.switchTab({
					url: '/pages/bill/bill' // 替换为实际的 Tab 页路径
			});
	}
});
