const dateTimeFormatOptions = {
  year: "numeric",
  month: "numeric",
  day: "numeric",
  timeZone: "UTC" // "America/Los_Angeles"
};
const dateTimeFormat = Intl.DateTimeFormat("en-us", dateTimeFormatOptions);

function getTimeElement(date: Date) {
  let time;
  const dateString = dateTimeFormat
    ? dateTimeFormat.format(date)
    : String(date);
  try {
    time = document.createElement("time");
  } catch (e) {
    time = null;
  }
  if (time) {
    time.setAttribute("dateTime", dateString);
    time.textContent = dateString;
  } else {
    time = document.createTextNode(dateString);
  }
  return time;
}

/**
 * Converts feature attributes object into a table.
 * @param {Object} attributes
 * @param {string[]} [fields]
 * @returns {HTMLTableElement}
 */
export function objectToTable(attributes: any, fields?: string[] | null) {
  const table = document.createElement("table");

  function addRow(name: string) {
    if (attributes.hasOwnProperty(name)) {
      const value = attributes[name];

      const row = document.createElement("tr");
      let cell = document.createElement("th");
      cell.textContent = name;
      row.appendChild(cell);

      cell = document.createElement("td");

      if (value instanceof Date) {
        cell.appendChild(getTimeElement(value));
      } else {
        cell.textContent = value;
      }
      row.appendChild(cell);

      table.appendChild(row);
    }
  }

  if (fields) {
    for (let i = 0, l = fields.length; i < l; i += 1) {
      const name = fields[i];
      if (attributes.hasOwnProperty(name)) {
        addRow(name);
      }
    }
  } else {
    for (const name in attributes) {
      if (attributes.hasOwnProperty(name)) {
        addRow(name);
      }
    }
  }

  return table;
}

/**
 * Converts feature attributes object into a definition list.
 * @param {Object} attributes
 * @returns {HTMLDListElement}
 */
export function objectToDL(attributes: any) {
  const dl = document.createElement("dl");

  for (const name in attributes) {
    if (attributes.hasOwnProperty(name)) {
      const value = attributes[name];

      const dt = document.createElement("dt");
      dt.textContent = name;
      dl.appendChild(dt);

      const dd = document.createElement("dd");
      dd.textContent = value;
      dl.appendChild(dd);
    }
  }

  return dl;
}
