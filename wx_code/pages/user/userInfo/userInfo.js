// pages/me/edit/edit.js
const app = getApp();
var util = require("../../../utils/util.js")

Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		if (app.globalData.userInfo) {
			this.setData({
				avatarUrl: app.globalData.userInfo.avatarUrl,
				nickName: app.globalData.userInfo.nickName
			})
		} else {
			this.setData({
				avatarUrl: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0"
			})
		}
	},

	onChooseAvatar(e) {
		console.log(e)
		var avatarUrl = e.detail.avatarUrl
		wx.cloud.uploadFile({
				cloudPath: `loginImages/${Math.random()}_${Date.now()}.png`,
				filePath: avatarUrl
			})
			.then(res => {
				console.log(res.fileID)
				this.setData({
					avatarUrl: res.fileID
				})


			})
	},

	// 提交事件
	comit() {
		var that = this;
		if (!this.data.nickName) {
			wx.showToast({
				title: '请输入昵称',
				icon: 'none'
			})
			return;
		}

		var data = {
			avatarUrl: this.data.avatarUrl,
			nickName: this.data.nickName,
			openid: app.globalData.openid
		};

		wx.cloud.database().collection('user')
			.where({
				openid: app.globalData.openid
			})
			.get()
			.then(res => {
				if (res.data.length > 0) {
					// 用户已存在，更新操作
					wx.cloud.database().collection('user')
						.doc(res.data[0]._id)
						.update({
							data: data
						})
						.then(res => {
							that.updateLocalUser();
						})
				} else {
					// 用户不存在，添加操作
					wx.cloud.database().collection('user')
						.add({
							data: data
						}).then(res => {
							that.updateLocalUser();
						})
				}
			});
	},


	/**
	 * 获取用户并设置回调值
	 */
	updateLocalUser() {
		wx.cloud.database().collection('user')
			.where({
				_openid: app.globalData.openid
			})
			.get()
			.then(res => {
				app.globalData.userInfo = res.data[0];
				wx.setStorageSync('userInfo', res.data[0]);
				var pages = getCurrentPages(); // 当前页面
				var prevPage = pages[pages.length - 2]; // 上个页面
				// 直接给上一个页面赋值
				prevPage.setData({
					userInfo: res.data[0]
				});
				wx.navigateBack({
					success() {
						wx.showToast({
							title: '更新成功',
						})
					}
				})
			})
	},

})