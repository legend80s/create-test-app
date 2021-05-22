/**
 *
 * @param {any[]} arr1
 * @param {any[]} arr2
 * @returns {any[]}
 */
exports.intersection = (arr1 = [], arr2 = []) => {
  return arr1.filter((item1) => arr2.includes(item1));
}
