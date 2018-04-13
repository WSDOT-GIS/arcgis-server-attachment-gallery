/**
 * Converts a URL search query string into an object.
 * @param {string} [qs=window.location.search] - A query string. Defaults to window.location.search if this parameter is omitted.
 * @returns {Object.<string, string>}
 */
export function searchToObject(qs?: string) {
  if (!qs) {
    qs = window.location.search;
  }
  // Remove leading question mark.
  qs = qs.replace(/^\?/, "");

  const pairs = qs.split("&");

  const output: { [key: string]: string } = {};

  for (let i = 0, l = pairs.length; i < l; i += 1) {
    const pair = pairs[i].split("=");
    const key = pair[0];
    const value = decodeURIComponent(pair[1]);
    output[key] = value;
  }

  return output;
}

/**
 * Converts an object into a query string.
 * @param {Object} o
 * @returns {string}
 */
export function objectToSearch(o: any) {
  let output;
  if (o) {
    output = [];
    for (const name in o) {
      if (o.hasOwnProperty(name)) {
        output.push([name, encodeURIComponent(o[name])].join("="));
      }
    }
    output = output.join("&");
  }
  return output;
}
