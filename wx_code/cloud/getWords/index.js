const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const WORDS_COLLECTION = 'cet4_words';
const MAX_LIMIT = 100; // 每次请求的最大数量

exports.main = async (event, context) => {
  try {
    const allWords = await fetchAllWords();
    const groupedWords = groupWordsByLetter(allWords);
    return {
      data: groupedWords,
      message: "获取数据成功"
    };
  } catch (error) {
    return { error: "获取数据失败", details: error };
  }
};

async function fetchAllWords() {
  let allWords = [];
  let offset = 0;

  while (true) {
    const res = await db.collection(WORDS_COLLECTION)
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
