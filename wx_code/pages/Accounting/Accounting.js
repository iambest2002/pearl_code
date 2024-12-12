import {
  Parser
} from "../../miniprogram_npm//expr-eval/index.js";
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
    let value = event.currentTarget.dataset.value; // 用户输入的键值
    let inputValue = this.data.inputValue || ""; // 当前输入值

    // 验证是否为数字或运算符
    if (/^\d|\+|\-|\.$/.test(value)) {
      // 处理重复运算符问题
      if (/[\+\-]/.test(value) && /[\+\-]$/.test(inputValue)) {
        wx.showToast({
          title: `${value}不能连续输入`,
          icon: "none"
        });
        return;
      }

      // 处理小数点问题：一个数字中不能有多个小数点
      if (value === "." && /(\d*\.\d*)$/.test(inputValue)) {
        wx.showToast({
          title: "数字中不能有多个小数点",
          icon: "none"
        });
        return;
      }

      // 追加新值
      inputValue += value;
    } else {
      wx.showToast({
        title: "输入无效",
        icon: "none"
      });
      return;
    }

    // 更新数据
    this.setData({
      inputValue: inputValue
    });
    console.log("当前表达式:", inputValue, "类型:", typeof inputValue);
  },



  onDelete() {
    let inputValue = this.data.inputValue || "";
    this.setData({
      inputValue: inputValue.slice(0, -1)
    });
  },


  onClear() {
    this.setData({
      inputValue: ""
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
    let input = this.data.inputValue;
    console.log("输入的表达式:", input);
    // 检查输入是否为空
    if (!input.trim()) {
      wx.showToast({
          title: "输入不能为空",
          icon: "none"
      });
      return; // 直接退出
  }
    // 检查是否包含运算符
    if (/[\+\-]/.test(input)) {
      // 移除末尾的无效符号
      input = input.replace(/[\+\-]+$/, "").trim();
      console.log("清理后的表达式:", input);

      try {
        // 验证表达式是否合法，只允许数字、运算符、小数点、括号和空格
        if (!/^[\d\+\-\.\(\)\s]+$/.test(input)) {
          throw new Error("非法字符");
        }

        const parser = new Parser();
        const result = parser.evaluate(input);
        console.log("计算结果:", result);

        input = result.toString(); // 将计算结果更新为字符串
      } catch (error) {
        console.error("表达式错误:", error);
        wx.showToast({
          title: "输入格式错误",
          icon: "none"
        });
        return; // 出现错误时直接退出函数
      }
    }

    // 更新 inputValue
    this.setData({
      inputValue: input
    });

    const data_code = this.data.current;
    const dataToSave = {
      price: this.data.inputValue,
      note: this.data.fieldValue,
      type: this.data.selectedType,
      date: this.data.dateValue || this.formatDate(new Date())
    };

    // 检查日期是否为空
    if (!this.data.dateValue) {
      const today = new Date();
      const dateString = this.formatDate(today);
      this.setData({
        dateValue: dateString
      });
      console.log("准备保存的数据:", dataToSave);
    }

    // 保存数据
    this.saveDataToDB(data_code, dataToSave);
  },

  saveDataToDB(data_code, dataToSave) {
    const collectionName = data_code === "1" ? "expenses" : "income";

    // 保存到缓存
    this.saveToCache(dataToSave, collectionName);

    // 保存到数据库
    wx.cloud.database().collection(collectionName).add({
        data: {
          price: dataToSave.price,
          note: dataToSave.note,
          type: dataToSave.type,
          date: dataToSave.date
        },
      })
      .then(res => {
        console.log("添加成功", res);
      })
      .catch(res => {
        console.log("添加失败", res);
      });

    // 重置输入值
    this.setData({
      showKeyboard: false,
      inputValue: '',
      fieldValue: '',
      dateValue: ''
    });
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