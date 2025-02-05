import {
  Parser
} from "../../../../miniprogram_npm/expr-eval/index.js";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    mode: 'standard', // 'standard' 或 'programmer'
    display: '0',
    expression: '',
    currentNumber: '0',
    lastOperator: '',
    lastNumber: '',
    base: 10,
    hexValue: '0',
    decValue: '0',
    octValue: '0',
    binValue: '0'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 切换计算器模式
  switchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({
      mode,
      display: '0',
      expression: '',
      base: 10
    });
    if (mode === 'programmer') {
      this.updateBaseDisplays('0');
    }
  },

  // 标准计算器功能
  appendNumber(e) {
    const number = e.currentTarget.dataset.number;
    if (this.data.mode === 'standard') {
      let { display, expression, lastOperator, lastNumber, currentNumber } = this.data;
      
      // 如果有上一个运算符
      if (lastOperator) {
        if (currentNumber === '0') {
          currentNumber = number;
        } else {
          currentNumber += number;
        }
        
        // 更新完整表达式
        expression = `${lastNumber} ${this.getOperatorSymbol(lastOperator)} ${currentNumber}`;
        
        // 实时计算结果
        try {
          const parser = new Parser();
          const calcExpression = `${lastNumber}${lastOperator}${currentNumber}`;
          const result = parser.evaluate(calcExpression);
          display = this.formatResult(result);
        } catch (e) {
          display = currentNumber;
        }
      } else {
        // 没有运算符时直接更新显示
        if (display === '0') {
          display = number;
          currentNumber = number;
        } else {
          display = display + number;
          currentNumber = display;
        }
        expression = currentNumber; // 显示当前数字作为表达式
      }
      
      this.setData({
        display,
        currentNumber,
        expression
      });
    } else {
      // 进制计算器输入处理
      let display = this.data.display;
      if (display === '0') {
        display = number;
      } else {
        display += number;
      }
      this.setData({ display });
      this.updateBaseDisplays(display);
    }
  },

  appendOperator(e) {
    if (this.data.mode !== 'standard') return;
    const operator = e.currentTarget.dataset.operator;
    let { display, expression, lastOperator, lastNumber, currentNumber } = this.data;
    
    // 如果已经有一个运算符，先计算前面的结果
    if (lastOperator) {
      try {
        const parser = new Parser();
        const calcExpression = `${lastNumber}${lastOperator}${currentNumber}`;
        const result = parser.evaluate(calcExpression);
        lastNumber = this.formatResult(result);
      } catch (e) {
        lastNumber = currentNumber;
      }
    } else {
      lastNumber = display;
    }
    
    // 更新表达式显示
    expression = `${lastNumber} ${this.getOperatorSymbol(operator)}`;
    
    this.setData({
      expression,
      lastOperator: operator,
      lastNumber,
      currentNumber: '0',
      display: lastNumber
    });
  },

  appendDot() {
    if (this.data.mode !== 'standard') return;
    let display = this.data.display;
    
    // 获取最后一个数字
    const numbers = display.split(/[+\-×÷]/);
    const lastNumber = numbers[numbers.length - 1];
    
    // 如果最后一个数字还没有小数点，则添加
    if (!lastNumber.includes('.')) {
      display += '.';
      this.setData({ display });
    }
  },

  appendHex(e) {
    if (this.data.base !== 16) return;
    const value = e.currentTarget.dataset.value;
    let display = this.data.display;
    if (display === '0') {
      display = value;
    } else {
      display += value;
    }
    this.setData({ display });
    this.updateBaseDisplays(display);
  },

  clearAll() {
    this.setData({
      display: '0',
      expression: '', // 清除表达式
      currentNumber: '0',
      lastOperator: '',
      lastNumber: ''
    });
    if (this.data.mode === 'programmer') {
      this.updateBaseDisplays('0');
    }
  },

  delete() {
    let display = this.data.display;
    if (display.length > 1) {
      display = display.slice(0, -1);
    } else {
      display = '0';
    }
    this.setData({ display });
    if (this.data.mode === 'programmer') {
      this.updateBaseDisplays(display);
    }
  },

  calculate() {
    if (this.data.mode !== 'standard') return;
    const { lastNumber, lastOperator, currentNumber } = this.data;
    
    if (!lastOperator) return;
    
    try {
      const parser = new Parser();
      const calcExpression = `${lastNumber}${lastOperator}${currentNumber}`;
      const result = parser.evaluate(calcExpression);
      const formattedResult = this.formatResult(result);
      
      // 计算完成后清除表达式
      this.setData({
        display: formattedResult,
        expression: '',
        currentNumber: formattedResult,
        lastOperator: '',
        lastNumber: ''
      });
    } catch (e) {
      wx.showToast({
        title: '请输入完整的表达式',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 进制计算器功能
  setBase(e) {
    const base = parseInt(e.currentTarget.dataset.base);
    this.setData({ base });
    this.updateBaseDisplays(this.data.display);
  },

  updateBaseDisplays(value) {
    let decValue;
    
    // 根据当前进制将输入值转换为十进制
    switch (this.data.base) {
      case 16:
        decValue = parseInt(value, 16);
        break;
      case 10:
        decValue = parseInt(value, 10);
        break;
      case 8:
        decValue = parseInt(value, 8);
        break;
      case 2:
        decValue = parseInt(value, 2);
        break;
      default:
        decValue = 0;
    }

    if (isNaN(decValue)) {
      decValue = 0;
    }

    this.setData({
      hexValue: decValue.toString(16).toUpperCase(),
      decValue: decValue.toString(10),
      octValue: decValue.toString(8),
      binValue: decValue.toString(2)
    });
  },

  // 复制计算结果
  copyResult() {
    wx.setClipboardData({
      data: this.data.display,
      success: () => {
        wx.showToast({
          title: '已复制结果',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  // 复制进制转换值
  copyValue(e) {
    const value = e.currentTarget.dataset.value;
    wx.setClipboardData({
      data: value,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'success',
          duration: 1500
        });
      }
    });
  },

  // 添加新方法：检查表达式是否合法
  isValidExpression(expr) {
    // 简单的表达式验证
    try {
      // 替换显示符号为实际计算符号
      expr = expr.replace('×', '*').replace('÷', '/');
      new Parser().parse(expr);
      return true;
    } catch (e) {
      return false;
    }
  },

  // 格式化计算结果
  formatResult(result) {
    if (Number.isInteger(result)) {
      return result.toString();
    }
    return parseFloat(result.toFixed(8)).toString();
  },

  // 获取运算符显示符号
  getOperatorSymbol(operator) {
    switch (operator) {
      case '*': return '×';
      case '/': return '÷';
      default: return operator;
    }
  },
})