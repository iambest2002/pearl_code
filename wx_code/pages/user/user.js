/**
 * 作者：编程小石头
 * v 2501902696
 */
Page({
	onLoad() {
		//云开发初始化
		wx.cloud.init({
			//把env替换成你自己的云开发环境id
			env: 'daily-consumption-1eonh2e259454a',
		})
	},
	//退出登录
	tuichu() {
		wx.setStorageSync('user', null)
		this.setData({
			userInfo: null,
		})
	},
	/**
	 * 授权获取头像昵称相关
	 */


	/**
	 * 关闭/打开弹框
	 */
	closeTank(e) {
		if (!this.data.userInfo_tank) {
			wx.cloud.database().collection('user')
				.get()
				.then(res => {
					console.log("用户信息====", res);
					if (res.data.length) {
						this.setData({
							userInfo: res.data[0],
							userInfo_tank: false,
						})

						wx.setStorageSync('user', res.data[0]);
					} else {
						console.log("还未注册====", res)
						this.setData({
							userInfo_tank: true
						})
					}
				}).catch(res => {
					console.log('编程小石头提醒你请添加user表')
				})
		} else {
			this.setData({
				userInfo_tank: false
			})
		}

	},
	/**
	 * 获取头像
	 */
	onChooseAvatar(e) {
		console.log(e);
		this.setData({
			avatarUrl: e.detail.avatarUrl
		})
	},
	/**
	 * 获取用户昵称
	 */
	getNickName(e) {
		console.log(e);
		this.setData({
			nickName: e.detail.value
		})
	},

	/**
	 * 提交
	 */
	submit(e) {
		if (!this.data.avatarUrl) {
			return wx.showToast({
				title: '请选择头像',
				icon: 'error'
			})
		}
		if (!this.data.nickName) {
			return wx.showToast({
				title: '请输入昵称',
				icon: 'error'
			})
		}
		this.setData({
			userInfo_tank: false
		})
		wx.showLoading({
			title: '正在注册',
			mask: 'true'
		})
		let tempPath = this.data.avatarUrl

		let suffix = /\.[^\.]+$/.exec(tempPath)[0];
		console.log(suffix);

		//上传到云存储
		wx.cloud.uploadFile({
			cloudPath: 'userimg/' + new Date().getTime() + suffix, //在云端的文件名称
			filePath: tempPath, // 临时文件路径
			success: res => {
				console.log('上传成功', res)
				let fileID = res.fileID
				wx.hideLoading()
				wx.cloud.database().collection('user')
					.add({
						data: {
							avatarUrl: fileID,
							nickName: this.data.nickName
						}
					}).then(res => {
						let user = {
							avatarUrl: fileID,
							nickName: this.data.nickName
						}
						// 注册成功
						console.log('注册成功')
						wx.setStorageSync('user', user);

						this.setData({
							userInfo: user,
						})
					}).catch(res => {
						console.log('注册失败', res)
						wx.showToast({
							icon: 'error',
							title: '注册失败',
						})
					})

			},
			fail: err => {
				wx.hideLoading()
				console.log('上传失败', res)
				wx.showToast({
					icon: 'error',
					title: '上传头像错误',
				})
			}
		})
	},
})