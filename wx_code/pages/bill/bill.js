import {
  Parser
} from "../../miniprogram_npm//expr-eval/index.js";
import Decimal from '../../miniprogram_npm//decimal.js/index.js'; // 引入 decimal.js
Page({
  data: {
    showDatePicker: false, // 控制日期选择器的显示与隐藏
    currentDate: new Date().getTime(), // 当前时间戳
    selectedDate: '', // 用户选择的日期
    filteredData: [], // 保存过滤后的数据
    expenseTotalPrice: 0, // 保存支出的总价格
    incomeTotalPrice: 0, // 保存收入的总价格
    detailType: '',
    detailPrice: '',
    detailIcon: '',
    detailDate: '',
    fieldValue: '',
    activeNames: [],
    checked: true,
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
      selectedDate: dateString,
      checked: true, // 默认开关为开启状态
      activeNames: this.data.filteredData.map(item => item._id) // 默认显示所有折叠框内容
    });

    // 获取并保存 openid
    this.getOpenidAndFetchData(dateString);
    // 默认调用 onSwitchChange 方法，将折叠框设置为打开
    this.onSwitchChange({
      detail: true
    });
  },
  onShow() {
    const openid = wx.getStorageSync('openid');
    if (openid) {
      this.setData({
        openid
      });
      this.fetchData(this.data.selectedDate); // 使用获取的 openid 调用 fetchData
    }
  },
  // loadIcons() {
  //   // 前端调用云函数获取图标映射
  //   wx.cloud.callFunction({
  //     name: 'getIconMapping',
  //     success: res => {
  //       console.log('图标映射加载成功:', res.result.typeIconMapping);
  //       this.setData({ typeIconMapping: res.result.typeIconMapping });
  //     },
  //     fail: err => {
  //       console.error('图标映射加载失败:', err);
  //     }
  //   });
  // },

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
  onFoldChange(event) {
    this.setData({
      activeNames: event.detail
    });
  },

  onSwitchChange({
    detail: checked
  }) {
    this.setData({
      checked, // 更新开关状态
      activeNames: checked ? this.data.filteredData.map(item => item._id) : [] // 打开所有折叠框或关闭
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
  showData() {
    const cacheExpenses = 'expenses';
    const cacheIncome = 'income';
    const cachedData = wx.getStorageSync(cacheExpenses);
    const cachedData1 = wx.getStorageSync(cacheIncome);

    if (cachedData || cachedData1) {
      // 如果缓存中有数据，直接从缓存中读取
      console.log('从缓存中读取数据:', cachedData);
      console.log('从缓存中读取数据:', cachedData1);
      this.setData({
        filteredData: cachedData.filteredData,
        expenseTotalPrice: cachedData.expenseTotalPrice,
        incomeTotalPrice: cachedData.incomeTotalPrice,
      });
    } else {
      // 如果缓存中没有数据，则调用云函数获取数据
      this.fetchData(dateString);
    }
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
          limit: 500, // 每次获取的记录数
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
        if (expensesData.length === 500 || incomeData.length === 500) {
          // 如果返回的数据数量等于 limit，则继续获取下一页数据
          this.fetchData(dateString, skip + 500, allData);
        } else {
          allData.sort((a, b) => new Date(b.date) - new Date(a.date)); // 日期升序
          this.setData({
            filteredData: allData
          });
          if (this.data.checked) {
            this.onSwitchChange({
              detail: true
            }); // 如果 checked 为 true，则展开折叠框
          }
        }
      })
      .catch((err) => {
        console.error('获取数据失败:', err);
      });
  },
  processFetchedData(data, type) {
    let currentData = this.data.filteredData;
    // 将 expenseTotal 和 incomeTotal 转换为 Decimal 实例
    let expenseTotal = new Decimal(this.data.expenseTotalPrice || 0);
    let incomeTotal = new Decimal(this.data.incomeTotalPrice || 0);

    // 创建一个 Parser 实例
    const parser = new Parser();

    data.forEach((item) => {
      const priceString = item.price; // 获取价格（假设是字符串形式）
      let price = new Decimal(0); // 默认价格初始化为 Decimal 类型的 0

      try {
        // 如果 priceString 是一个数字字符串，它将被正确解析为数字
        const parsedPrice = parser.parse(priceString).evaluate(); // 解析和计算
        price = new Decimal(parsedPrice); // 转换为 Decimal 实例
      } catch (error) {
        console.error('价格解析错误:', priceString);
        price = new Decimal(0); // 如果解析失败，设置价格为 0
      }

      if (type === 'expenses') { // 如果从支出表获取的数据
        expenseTotal = expenseTotal.plus(price); // 使用 Decimal 的加法
        item['category'] = '支出';
      } else if (type === 'income') { // 如果从收入表获取的数据
        incomeTotal = incomeTotal.plus(price); // 使用 Decimal 的加法
        item['category'] = '收入';
      }
      currentData.push(item);
    });

    // 使用 Decimal 的 toFixed 方法保留两位小数
    this.setData({
      filteredData: [...this.data.filteredData, ...data], // 避免重复
      expenseTotalPrice: expenseTotal.toFixed(2), // 保留两位小数
      incomeTotalPrice: incomeTotal.toFixed(2) // 保留两位小数
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