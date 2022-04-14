export function isEqual(value: any, condition: any) {
  switch (typeof condition) {
    case "boolean":
    case "string":
    case "number":
    case "bigint":
      return value === condition;
    case "object":
      switch (true) {
        case value instanceof Date:
          if (!isDate(condition)) {
            if (typeof condition === "function") return condition(value) as boolean;
            else return false;
          } else return isDateEqual(value, condition as Date);
        case value instanceof Array:
          if (!isArray(condition)) {
            if (typeof condition === "function") return condition(value) as boolean;
            else return false;
          } else return isArrayEqual(value, condition as any[]);
        default:
          if (!isObject(condition)) {
            if (typeof condition === "function") return condition(value) as boolean;
            else return false;
          } else return isObjectEqual(value, condition);
      }
    case "function":
      return condition(value) as boolean;
    default:
      return !!value as boolean;
  }
}

function isObject(object: any) {
  return typeof object === "object";
}

function isDate(date: any) {
  return date instanceof Date;
}

function isArray(array: any) {
  return array instanceof Array;
}

function isObjectEqual(a: any, b: any) {
  if (Object.keys(a).length !== Object.keys(b).length) return false;
  const [keys1, keys2] = [Object.keys(a), Object.keys(b)];
  const [values1, values2] = [Object.values(a), Object.values(b)];
  return isArrayEqual(keys1, keys2) && isArrayEqual(values1, values2);
}

function isDateEqual(a: Date, b: Date) {
  a = new Date(a);
  b = new Date(b);
  return a.getTime() === b.getTime();
}

function isArrayEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  const x = [...a].sort();
  const y = [...b].sort();
  const [x1, y1] = [x[0], x[x.length - 1]];
  const [x2, y2] = [y[0], y[y.length - 1]];
  return isEqual(x1, x2) && isEqual(y1, y2);
}
