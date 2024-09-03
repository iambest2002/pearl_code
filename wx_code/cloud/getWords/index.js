const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const MAX_LIMIT = 100; // 每次请求的最大数量

exports.main = async (event, context) => {
  const { value } = event; // 获取前端传递的选择值
  console.log(value)
  let collectionName = '';
  // 根据用户的选择决定从哪个表获取数据
  if (value === 'CET4') {
    collectionName = 'cet4_words';
  } else if (value === 'CET6') {
    collectionName = 'cet6_words';
  } else if (value === 'PGEE') {
    collectionName = 'pgee_words';
  } else {
    return { error: "选择的单词集不正确" }; // 错误处理
  }

  try {
    // 获取单词数据
    const allWords = await fetchAllWords(collectionName);
    const groupedWords = groupWordsByLetter(allWords);
    return {
      data: groupedWords,
      message: "获取数据成功"
    };
  } catch (error) {
    return { error: "获取数据失败", details: error };
  }
};

// 从指定的表中获取所有单词
async function fetchAllWords(collectionName) {
  let allWords = [];
  let offset = 0;

  while (true) {
    const res = await db.collection(collectionName)
      .skip(offset)
      .limit(MAX_LIMIT)
      .get();

    allWords = allWords.concat(res.data);

    if (res.data.length < MAX_LIMIT) {
      break;
    }

    offset += MAX_LIMIT;
  }

  return allWords;
}

// 按首字母分组单词
function groupWordsByLetter(words) {
  const grouped = {};
  words.forEach(word => {
    const firstLetter = word.word[0].toUpperCase(); // 获取单词首字母并转为大写
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(word);
  });
  return grouped;
}
