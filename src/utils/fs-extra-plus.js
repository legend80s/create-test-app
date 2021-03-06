const fsp = require('fs-extra');
const { merge } = require('./lite-lodash');

/**
 * @param {string} jsonFilepath
 * @param {[key: string]: string | number | (value: string | number | any[], key: string, json: Record<string, any>) => string | number} patch
 */
exports.patchJSON = async (jsonFilepath, patch) => {
  const json = await fsp.readJson(jsonFilepath);

  const updated = merge(json, patch);

  await fsp.writeJson(jsonFilepath, updated, { spaces: 2 });

  return updated;
};
