export function isNotObject(value) {
  return typeof value !== 'object' || value === null;
}

export function tryParseJSON(jsonString) {
  try {
    const parsedJSON = JSON.parse(jsonString);
    return parsedJSON;
  } catch (error) {
    // Parsing failed, return false
    return false;
  }
}
