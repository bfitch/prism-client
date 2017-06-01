const { entries } = Object;

const toSnakeCase = (s) => s.replace(/\.?([A-Z])/g, (_,y) => `_${y.toLowerCase()}`).replace(/^_/, "")

export default (obj) => {
  const rootName = Object.keys(obj).pop()
  return entries(obj[rootName]).reduce((obj, [k,v]) => ({...obj, [toSnakeCase(k)]: v }), {});
}
