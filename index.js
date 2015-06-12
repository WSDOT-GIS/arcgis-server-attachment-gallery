/// <reference path="bower_components/blueimp-gallery/js/blueimp-gallery.js" />

/*global blueimp*/

(function () {
	var featureUrlRe = /\/\w+Server\/\d+\/\d+/i;
	var featureUrl = location.hash;
	var attachmentsUrl;
	var gallery;
	if (featureUrl) {
		// Remove the hash from beginning of string.
		featureUrl = featureUrl.replace(/^#/, "");
		// Test to see if URL is a feature URL.
		if (featureUrlRe.test(featureUrl)) {
			console.log([featureUrl, "is a feature url"].join(" "));

			if (!/\/attachments\/?/i.test(featureUrl)) {
				attachmentsUrl = featureUrl.replace(/\/?$/, "/attachments");
			}
		}
	}

	var setupGallery = function (e) {
		var request = e.target || e.currentTarget;
		var responseUrl = attachmentsUrl.replace(/\?.+$/, ""); // remove query string / search.
		var galleryData = JSON.parse(request.responseText);
		console.log(galleryData);

		if (galleryData.attachmentInfos) {
			galleryData = galleryData.attachmentInfos.map(function (item) {
				var attachmentUrl = [responseUrl, item.id].join("/");
				return {
					title: item.name,
					href: attachmentUrl,
					type: item.contentType || null,
					thumbnail: attachmentUrl
				};
			});

			gallery = blueimp.Gallery(galleryData);
		}
	};

	var request;
	if (attachmentsUrl) {
		request = new XMLHttpRequest();
		request.open("get", attachmentsUrl + "?f=json");
		request.addEventListener("loadend", setupGallery);
		request.send();
	}

}());