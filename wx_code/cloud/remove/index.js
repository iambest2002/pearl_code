const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  const { _id } = event;

  const db = cloud.database();

  try {
    // 检查支出表是否存在记录
    let expenseRes = await db.collection('expenses').where({ _id }).get();
    
    if (expenseRes.data.length > 0) {
      await db.collection('expenses').doc(_id).remove();
      return {
        success: true,
        message: '支出记录删除成功'
      };
    }

    // 如果支出表没有找到记录，检查收入表
    let incomeRes = await db.collection('income').where({ _id }).get();

    if (incomeRes.data.length > 0) {
      await db.collection('income').doc(_id).remove();
      return {
        success: true,
        message: '收入记录删除成功'
      };
    }

    // 如果两个表中都没有找到记录
    return {
      success: false,
      message: '记录在支出和收入表中都没有找到'
    };
  } catch (err) {
    console.error('删除数据失败:', err);
    return {
      success: false,
      message: '删除失败',
      error: err
    };
  }
};
