interface IStringIndex {
  [key: string]: any
}

export function ukSort(obj: IStringIndex): object {

  // Get an array of the keys
  const keys = Object.keys(obj);

  // Sort the keys alphabetically
  keys.sort();

  // Create a new object with the sorted keys
  const sortedObj: IStringIndex = {};
  for (let key of keys) {
    sortedObj[key] = obj[key];
  }

  return sortedObj;
}
