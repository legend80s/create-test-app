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

/**
 * @param {Record<string, any>} json
 * @param {Record<string, string | number | (value: string | number | any[], key: string, json: Record<string, any>) => string | number>} patch
 */
exports.merge = (json, patch) => {
  if (!patch) {
    return { ...json };
  }

  return Object.keys(patch).reduce((acc, key) => {
    const value = patch[key];

    const computed = typeof value !== 'function' ?
      value :
      value(json[key], key, json);

    return {
      ...acc,
      [key]: computed,
    }
  }, json);
}
