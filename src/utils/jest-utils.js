/**
 * @param {Record<string, string>} transformers
 */
exports.stringifyTransformers = (transformers) => {
  const entries = Object.keys(transformers).reduce((acc, key) => {
    return acc.concat(makeKey(key) + ': ' + makeValue(transformers[key]));
  }, []);

  return `{
    ${entries.join(',\n    ')},
  }`;
}

function makeKey(ext) {
  return `"^.+\\\\.(${ext})$"`;
}

function makeValue(value) {
  return `"${value}"`;
}
