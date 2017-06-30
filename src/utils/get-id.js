import isEmpty from './is-empty';

export default function getId(obj, args, { idValue, idKey = 'id' }) {
  if (idValue) return idValue;

  const object = isEmpty(args) ? obj : args;
  return (object[idKey] ? object[idKey] : Object.values(object).pop()[idKey]);
}
