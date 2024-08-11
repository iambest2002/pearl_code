const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const CACHE_COLLECTION = 'cet4_cache';
const WORDS_COLLECTION = 'cet4_words';
const MAX_LIMIT = 100;
const CACHE_EXPIRY = 3600000; // 缓存过期时间，单位是毫秒

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const alphabet = event.alphabet || 'abcdefghijklmnopqrstuvwxyz'.split('');
  const batchIndex = event.batchIndex || 0;
  const letter = alphabet[batchIndex];

  if (!letter) {
    return { data: [], message: "没有更多字母" };
  }

  const currentTimestamp = Date.now();
  let wordsByLetter = [];
  let cacheId = null;
  let cacheTimestamp = 0;
  let cacheStatus = "未缓存";

  try {
    // 查询缓存数据
    const cacheData = await db.collection(CACHE_COLLECTION).where({
      type: `wordsCache_${letter}`,
      openid: openid
    }).get();

    if (cacheData.data.length > 0) {
      const cacheItem = cacheData.data[0];
      cacheTimestamp = cacheItem.timestamp;

      if (currentTimestamp - cacheTimestamp < CACHE_EXPIRY) {
        // 缓存有效
        wordsByLetter = cacheItem.words;
        cacheId = cacheItem._id;
        cacheStatus = "缓存有效";
      } else {
        // 缓存过期，删除缓存
        try {
          await db.collection(CACHE_COLLECTION).doc(cacheItem._id).remove();
          cacheStatus = "缓存过期，已删除";
        } catch (error) {
          cacheStatus = "缓存过期，删除失败";
          return { error: "缓存删除失败", details: error };
        }

        // 重新创建缓存
        const result = await fetchAndCacheWords(letter, openid);
        wordsByLetter = result.wordsByLetter;
        cacheId = result.cacheId;
        cacheStatus = "缓存过期，已更新";
      }
    } else {
      // 没有缓存，创建新缓存
      const result = await fetchAndCacheWords(letter, openid);
      wordsByLetter = result.wordsByLetter;
      cacheId = result.cacheId;
      cacheStatus = "未缓存，已创建";
    }
  } catch (error) {
    return { error: "缓存查询或创建失败", details: error };
  }

  // 返回包含调试信息的响应
  return {
    data: wordsByLetter,
    cacheId: cacheId,
    nextBatchIndex: batchIndex + 1,
    debugInfo: {
      currentTimestamp: currentTimestamp,
      formattedCurrentTime: new Date(currentTimestamp).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
      cacheTimestamp: cacheTimestamp,
      cacheStatus: cacheStatus,
      cacheExpired: currentTimestamp - cacheTimestamp >= CACHE_EXPIRY
    }
  };
};

async function fetchAndCacheWords(letter, openid) {
  let wordsByLetter = [];
  let offset = 0;

  while (true) {
    const res = await db.collection(WORDS_COLLECTION)
      .where({
        word: db.RegExp({
          regexp: `^${letter}`,
          options: 'i'
        })
      })
      .skip(offset)
      .limit(MAX_LIMIT)
      .get();

    wordsByLetter = wordsByLetter.concat(res.data);

    if (res.data.length < MAX_LIMIT) {
      break;
    }

    offset += MAX_LIMIT;
  }

  try {
    const addRes = await db.collection(CACHE_COLLECTION).add({
      data: {
        type: `wordsCache_${letter}`,
        words: wordsByLetter,
        timestamp: Date.now(),
        openid: openid
      }
    });

    console.log("缓存创建成功，ID:", addRes._id); // 添加日志记录
    return {
      wordsByLetter: wordsByLetter,
      cacheId: addRes._id
    };
  } catch (error) {
    console.error("缓存创建失败", error); // 添加错误日志
    return { error: "创建缓存失败", details: error };
  }
}
