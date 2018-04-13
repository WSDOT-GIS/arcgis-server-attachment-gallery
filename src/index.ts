import Gallery = require("blueimp-gallery");
import loadImage = require("blueimp-load-image");
import { objectToDL, objectToTable } from "./attributesToDom";
import { objectToSearch, searchToObject } from "./urlSearchUtils";

const qsParams = searchToObject();
const fieldOrder = qsParams.fields ? qsParams.fields.split(",") : null;
const featureUrlRe = /\/\w+Server\/\d+\/\d+/i;

/**
 * Gets image's ImageDescription EXIF property (if available).
 * @param {string} url - Image URL.
 * @returns {Promise} - Resolve function parameter contains the text of the ImageDescription if available or null otherwise.
 */
function getImageDescription(url: string) {
  return fetch(url)
    .then(response => response.blob())
    .then(blob => {
      return loadImage.parseMetadata(
        blob,
        (data: any) => {
          const newTitle = data.exif ? data.exif.get("ImageDescription") : null;
          return newTitle;
        },
        {
          parseMetadata: true
        }
      );
    });
}

/**
 *
 * @returns {Promise}
 */
async function getAttachmentInfo() {
  const response = await fetch(`${attachmentsUrl}?f=json`);
  const galleryData = await response.json();
  return galleryData.attachmentInfos;
}

/**
 *
 * @returns {Promise}
 */
async function getFeatureInfo() {
  const response = await fetch(`${featureUrl}?f=json`);
  const layerInfo = await response.json();
  if (layerInfo.error) {
    throw new Error(layerInfo.error);
  }
  return layerInfo;
}

/**
 *
 * @returns {Promise}
 */
async function getLayerInfo() {
  const response = await fetch(`${layerUrl}?f=json`);
  const layerInfo = await response.json();
  if (layerInfo.error) {
    throw new Error(layerInfo.error);
  }
  return layerInfo;
}

async function getAttributes() {
  const [layerInfo, featureInfo] = await Promise.all([
    getLayerInfo(),
    getFeatureInfo()
  ]);

  // Omit OBJECTID and Shape fields.
  const ignoredFieldsRe = /^(?:(?:OBJECTID(?:_\d+)?)|(?:Shape(?:\.STLength\(\))?))$/i;
  const dateRe = /^esriFieldTypeDate$/i;
  const attributes = featureInfo.feature.attributes;
  const fields = layerInfo.fields;
  // var displayField = layerInfo.displayField;

  const output: any = {};

  fields.forEach((field: any) => {
    let value;
    if (!ignoredFieldsRe.test(field.name)) {
      value = attributes[field.name];

      if (dateRe.test(field.type)) {
        value = new Date(value);
      }

      output[field.alias || field.name] = value;
    }
  });

  return output;
}

let featureUrl: string | undefined;
let layerUrl: string | undefined;
let attachmentsUrl: string | undefined;
let gallery: any;

if (qsParams) {
  featureUrl = qsParams.url;

  // Test to see if URL is a feature URL.
  if (featureUrl && featureUrlRe.test(featureUrl)) {
    layerUrl = featureUrl.replace(/\/\d+\/?$/, "");

    if (!/\/attachments\/?/i.test(featureUrl)) {
      attachmentsUrl = featureUrl.replace(/\/?$/, "/attachments");
    }
  }

  if (attachmentsUrl) {
    getAttributes().then(
      attributes => {
        const table = objectToTable(attributes, fieldOrder);
        table.classList.add("attributes");
        const caption = document.createElement("caption");
        caption.textContent = "Feature Attributes";
        table.insertBefore(caption, table.firstChild);
        document.getElementById("blueimp-gallery")!.appendChild(table);
      },
      error => {
        // tslint:disable-next-line:no-console
        console.error(error);
      }
    );

    getAttachmentInfo().then(function(attachmentInfos) {
      const responseUrl = attachmentsUrl!.replace(/\?.+$/, ""); // remove query string / search.

      const exifPromises = new Array<Promise<any>>();

      const galleryData = attachmentInfos.map(function(item: any) {
        const attachmentUrl = [responseUrl, item.id].join("/");
        const data = {
          title: item.name,
          href: attachmentUrl,
          type: item.contentType || null,
          thumbnail: attachmentUrl
        };

        const promise = getImageDescription(attachmentUrl);
        exifPromises.push(promise);

        return data;
      });

      function createGallery() {
        return Gallery(galleryData, {
          carousel: true
        });
      }

      Promise.all(exifPromises).then(
        function(titles) {
          galleryData.forEach(function(gd: any, i: any) {
            gd.title = titles[i] || gd.title;
          });
          gallery = createGallery();
        },
        function(error) {
          // tslint:disable-next-line:no-console
          console.error("Error getting EXIF data", error);
          gallery = createGallery();
        }
      );
    });
  }
}
