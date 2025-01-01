// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  // 模拟从数据库获取公告
  const db = cloud.database();
  try {
    const res = await db.collection('notices').orderBy('updateTime', 'desc').limit(1).get();
    if (res.data.length > 0) {
      return {
        success: true,
        content: res.data[0].content, // 公告内容
        updateTime: res.data[0].updateTime // 更新时间
      };
    } else {
      return {
        success: false,
        message: '没有公告内容'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};
