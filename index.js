/// <reference path="bower_components/blueimp-gallery/js/blueimp-gallery.js" />
/// <reference path="C:\Users\jacobsj\Documents\GitHub\arcgis-server-attachment-gallery\attributesToDom.js" />
/// <reference path="C:\Users\jacobsj\Documents\GitHub\arcgis-server-attachment-gallery\urlSearchUtils.js" />

/*global blueimp, attributesToDom, urlSearchUtils*/

/**
 * @external AttachmentInfos
 * @see {@link http://resources.arcgis.com/en/help/arcgis-rest-api/index.html#/Attachment_Infos_Map_Service_Layer/02r3000000r0000000/ Attachment Infos (Map Service\Layer)}
 */

(function () {
	/**
	 * 
	 * @returns {Promise}
	 */
	function getAttachmentInfo() {
		var promise = new Promise(function (resolve, reject) {
			request = new XMLHttpRequest();
			request.open("get", attachmentsUrl + "?f=json");
			request.addEventListener("loadend", function (e) {
				var request, galleryData;
				request = e.target || e.currentTarget;
				if (request.status === 200) {
					galleryData = JSON.parse(request.responseText);
					resolve(galleryData.attachmentInfos);
				} else {
					reject(e);
				}
			});
			request.send();

		});

		return promise;
	}

	/**
	 * 
	 * @returns {Promise}
	 */
	function getFeatureInfo() {
		var promise = new Promise(function (resolve, reject) {
			request = new XMLHttpRequest();
			request.open("get", featureUrl + "?f=json");
			request.addEventListener("loadend", function (e) {
				var request, layerInfo;
				request = e.target || e.currentTarget;
				if (request.status === 200) {
					layerInfo = JSON.parse(request.responseText);
					if (layerInfo.error) {
						reject(layerInfo.error);
					} else {
						resolve(layerInfo);
					}
				} else {
					reject(e);
				}
			});
			request.send();

		});

		return promise;
	}

	/**
	 * 
	 * @returns {Promise}
	 */
	function getLayerInfo() {
		var promise = new Promise(function (resolve, reject) {
			request = new XMLHttpRequest();
			request.open("get", layerUrl + "?f=json");
			request.addEventListener("loadend", function (e) {
				var request, layerInfo;
				request = e.target || e.currentTarget;
				if (request.status === 200) {
					layerInfo = JSON.parse(request.responseText);
					if (layerInfo.error) {
						reject(layerInfo.error);
					} else {
						resolve(layerInfo);
					}
				} else {
					reject(e);
				}
			});
			request.send();

		});

		return promise;
	}

	function getAttributes() {
		var promise = new Promise(function (resolve, reject) {
			Promise.all([getLayerInfo(), getFeatureInfo()]).then(function (values) {
				// Omit OBJECTID and Shape fields.
				var ignoredFieldsRe = /^(?:(?:OBJECTID(?:_\d+)?)|(?:Shape(?:\.STLength\(\))?))$/i;
				var dateRe = /^esriFieldTypeDate$/i;
				var layerInfo = values[0];
				var attributes = values[1].feature.attributes;
				var fields = layerInfo.fields;
				//var displayField = layerInfo.displayField;

				var output = {};

				fields.forEach(function (field) {
					var value;
					if (!ignoredFieldsRe.test(field.name)) {
						value = attributes[field.name];

						if (dateRe.test(field.type)) {
							value = new Date(value);
						}

						output[field.alias || field.name] = value;
					}
				});

				resolve(output);
			}, function (error) {
				reject(error);
			});
		});
		return promise;
	}

	var qsParams = urlSearchUtils.searchToObject();
	var featureUrlRe = /\/\w+Server\/\d+\/\d+/i;
	var featureUrl;
	var layerUrl;
	var attachmentsUrl;
	var gallery;

	if (qsParams) {

		featureUrl = qsParams.url;


		// Test to see if URL is a feature URL.
		if (featureUrl && featureUrlRe.test(featureUrl)) {
			layerUrl = featureUrl.replace(/\/\d+\/?$/, "");

			if (!/\/attachments\/?/i.test(featureUrl)) {
				attachmentsUrl = featureUrl.replace(/\/?$/, "/attachments");
			}
		}



		var request;
		if (attachmentsUrl) {

			getAttributes().then(function (attributes) {
				var table = attributesToDom.objectToTable(attributes);
				table.classList.add("attributes");
				var caption = document.createElement("caption");
				caption.textContent = "Feature Attributes";
				table.insertBefore(caption, table.firstChild);
				document.getElementById("blueimp-gallery").appendChild(table);
			}, function (error) {
				console.error(error);
			});

			getAttachmentInfo().then(function (attachmentInfos) {
				var responseUrl = attachmentsUrl.replace(/\?.+$/, ""); // remove query string / search.
				var galleryData = attachmentInfos.map(function (item) {
					var attachmentUrl = [responseUrl, item.id].join("/");
					return {
						title: item.name,
						href: attachmentUrl,
						type: item.contentType || null,
						thumbnail: attachmentUrl
					};
				});

				gallery = blueimp.Gallery(galleryData, {
					carousel: true
				});
			});
		}
	}

}());