var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const { entries } = Object;

const toSnakeCase = s => s.replace(/\.?([A-Z])/g, (_, y) => `_${y.toLowerCase()}`).replace(/^_/, "");

export function underscore(obj) {
  const rootName = Object.keys(obj).pop();
  return entries(obj[rootName]).reduce((obj, [k, v]) => _extends({}, obj, { [toSnakeCase(k)]: v }), {});
}
//# sourceMappingURL=underscore.js.map