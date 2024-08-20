// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 生成一个 32 位的十六进制 ID
function generateHexId() {
  return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
    return (Math.random() * 16 | 0).toString(16);
  });
}

exports.main = async (event, context) => {
  const db = cloud.database();

  try {
    // 从 users 表中获取所有用户的 OPENID
    const usersData = await db.collection('user').get();
    const openids = usersData.data.map(user => user._openid);

    // 对每个用户的 OPENID 进行操作
    const operations = openids.map(async (openid) => {
      // 从 accounting 表中获取当前用户的记录
      const accountingData = await db.collection('accounting')
        .where({
          _openid: openid
        })
        .get();

      // 将这些记录插入到 expenses 表中
      const addPromises = accountingData.data.map(item => {
        // 生成一个新的唯一 _id
        const newId = generateHexId(); // 使用生成的 32 位十六进制 ID
      
        return db.collection('expenses').add({
          data: {
            ...item,
            _id: newId, // 替换旧的 _id 为新的 _id
            _openid: openid,
            createdAt: db.serverDate(), // 添加时间戳字段
          }
        });
      });
      
      await Promise.all(addPromises);
      
    });

    // 等待所有操作完成
    await Promise.all(operations);

    return {
      success: true,
      message: '所有用户的数据成功添加到 expenses 表中',
    };
  } catch (error) {
    console.error('云函数操作失败:', error);
    return {
      success: false,
      error
    };
  }
};
