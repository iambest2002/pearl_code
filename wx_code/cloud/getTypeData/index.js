// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

// 云函数入口函数

exports.main = async (event, context) => {
  const db = cloud.database();
  const $ = db.command.aggregate;
  const { date, skip = 0, limit = 100 } = event;

  const year = date.split('-')[0];
	const month = date.split('-')[1];
	

  try {
    const expensesData = await db.collection('expenses')
      .aggregate()
      .project({
        type: true,
        price: true,
        date: true,
        note: true,
        year: $.substr(['$date', 0, 4]),
        month: $.substr(['$date', 5, 2]),
      })
      .match({
        year: year,
        month: month,
      })
      .skip(skip) // 跳过前 skip 条数据
      .limit(limit) // 获取 limit 条数据
      .end();

    const incomeData = await db.collection('income')
      .aggregate()
      .project({
        type: true,
        price: true,
        date: true,
        note: true,
        year: $.substr(['$date', 0, 4]),
        month: $.substr(['$date', 5, 2]),
      })
      .match({
        year: year,
        month: month,
      })
      .skip(skip)
      .limit(limit)
      .end();

    return {
      expensesData: expensesData.list,
      incomeData: incomeData.list,
    };
  } catch (err) {
    console.error('查询数据库出错:', err);
    return {
      error: err,
    };
  }
};


