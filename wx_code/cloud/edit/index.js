// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
	const db = cloud.database();
  const { _id, price, note, date, type } = event;

  try {
    // 选择要更新的表
    let collection;
    if (type === '支出') {
      collection = db.collection('expenses');
    } else if (type === '收入') {
      collection = db.collection('income');
    } else {
      throw new Error('无效的记录类型');
    }

    // 执行更新操作
    const result = await collection.doc(_id).update({
      data: {
        price,
        note,
        date
      }
    });

    return {
      success: true,
      message: '记录更新成功',
      result
    };
  } catch (error) {
    return {
      success: false,
      message: '记录更新失败',
      error: error.message
    };
  }
};
