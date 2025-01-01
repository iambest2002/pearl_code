// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  // 返回图标映射表
  const typeIconMapping = {
    '餐饮': 'cloud://your-cloud-path/food.png',
    '零食': 'cloud://your-cloud-path/candy.png',
    '水果': 'cloud://your-cloud-path/fruit.png',
    '蔬菜': 'cloud://your-cloud-path/vegetables.png',
    '住房': 'cloud://your-cloud-path/hotel.png',
    '购物': 'cloud://your-cloud-path/buy.png',
    '交通': 'cloud://your-cloud-path/bus.png',
    '服装': 'cloud://your-cloud-path/clothes.png',
    '娱乐': 'cloud://your-cloud-path/entertainment.png',
    '医疗': 'cloud://your-cloud-path/hospital.png',
    '家庭': 'cloud://your-cloud-path/family.png',
    '通讯': 'cloud://your-cloud-path/phone.png',
    '孩子': 'cloud://your-cloud-path/baby.png',
    '旅行': 'cloud://your-cloud-path/journey.png',
    '烟酒': 'cloud://your-cloud-path/beer.png',
    '数码': 'cloud://your-cloud-path/ipad.png',
    '书籍': 'cloud://your-cloud-path/bookshelf.png',
    '学习': 'cloud://your-cloud-path/study.png',
    '宠物': 'cloud://your-cloud-path/cat.png',
    '礼金': 'cloud://your-cloud-path/donate.png',
    '礼物': 'cloud://your-cloud-path/gift.png',
    '办公': 'cloud://your-cloud-path/work.png',
    '快递': 'cloud://your-cloud-path/expressdelivery.png',
    '捐赠': 'cloud://your-cloud-path/cashgift.png',
    '彩票': 'cloud://your-cloud-path/lotteryticket.png',
    '维修': 'cloud://your-cloud-path/tool.png',
    '其它': 'cloud://your-cloud-path/other.png',
    '工资': 'cloud://your-cloud-path/wages.png',
    '兼职': 'cloud://your-cloud-path/partTimeJob.png',
    '理财': 'cloud://your-cloud-path/financing.png',
    '其他': 'cloud://your-cloud-path/finance.png',
  };

  return { typeIconMapping };
};
