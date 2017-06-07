export function camelizeCollection(data) {
  return data.map(obj => camelizeKeys(obj));
}

export function camelizeKeys(data) {
  return Object.entries(data).reduce((camelizedData, [key, value]) => {
    if (value.constructor && value.constructor === Object) {
      return camelizeKeys(value);
    } else {
      return Object.assign(camelizedData, { [camelize(key)]: value });
    }
  }, {});
}

function camelize(string) {
  return string.replace(/(_\w)/g, function (k) {
    return k[1].toUpperCase();
  });
}
//# sourceMappingURL=camelize.js.map