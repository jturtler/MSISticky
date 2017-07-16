
function RESTUtil() {}

RESTUtil.getSynchData = function( url ) {
	return $.ajax({
		type: "GET",
		dataType: "json",
		url: url,
		async: false
	}).responseText;
};



// End of Data Retrieval Manager Class
// ------------------------------------------------------------
