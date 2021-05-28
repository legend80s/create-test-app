/**
 *
 * @param {any[]} arr1
 * @param {any[]} arr2
 * @returns {any[]}
 */
exports.intersection = (arr1 = [], arr2 = []) => {
  return arr1.filter((item1) => arr2.includes(item1));
}

/**
 *
 * @param {string} sentence
 * @param {string} word
 */
exports.hasWord = (sentence, word) => {
  return new RegExp(`\\b${word}\\b`).test(sentence);
}
