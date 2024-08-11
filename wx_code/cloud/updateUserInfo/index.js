// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  const openid = event.openid; // 传递的 openid
  const { nickName, avatarUrl } = event; // 传递的更新数据

  try {
    await db.collection('user').where({
      _openid: openid
    }).update({
      data: {
        nickName: nickName,
        avatarUrl: avatarUrl
      }
    });

    return {
      success: true,
      message: '用户信息更新成功'
    };
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }
};