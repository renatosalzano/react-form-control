export function splitObject(object: { [key: string]: any }, prop: string[] | string) {
  const clone = { ...object };
  if (prop instanceof Array) {
    const output: any[] = [{}];
    prop.forEach((k) => {
      output.push({ ...clone }[k]);
      delete clone[k];
    });
    output[0] = clone;
    console.log("OUTPUT", output);
    return output;
  } else {
    const splitted = { ...clone }[prop];
    delete clone[prop];
    return [clone, splitted];
  }
}
