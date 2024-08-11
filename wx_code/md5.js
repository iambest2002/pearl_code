function md5(string) {
  function md5_RotateLeft(lValue, iShiftBits) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  // ... (这里省略了具体的 MD5 实现代码)
  return temp.toLowerCase();
}

module.exports = md5;
