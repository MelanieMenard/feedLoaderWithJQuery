// Declare application namespace
var flickrFeedLoader = flickrFeedLoader || {};

// Declare the controller module
flickrFeedLoader.controller = (function (){
	
	/* Private variables of the controller */
	var flickrBaseUrl = 'http://www.flickr.com/services/feeds/photos_public.gne';
	var callbackName = 'jsonpCallback';
	var handlebarTemplateID = '#flickrItemTemplate';
	var imagesDivID = '#images';
	var query = '';
	
	/* Private methods of the controller */	
	formatQuery = function (rawQueryTerms) {
	  
		var formattedQueryTerms = rawQueryTerms.split(' ').join(',');
		query = flickrBaseUrl+'?tags='+formattedQueryTerms+'&format=json&jsoncallback='+callbackName;
		
	};
	
	replaceByLargerImages = function (feedJSONData) {
	  
		// modify the image filename in each image object in the array
		for (var i=0; i < feedJSONData.items.length; i++){     
			feedJSONData.items[i].media.m= (feedJSONData.items[i].media.m).replace("_m.jpg", ".jpg");     
		}
		
	};
	
	/* Public functions of the controller */
	return {
	
		loadFeed : function (rawQueryTerms) {
			
			formatQuery(rawQueryTerms);
			
			// Ajax call to retrieve data
			// it is jsonp so the callback is passed as part of the query string
			$.ajax({
				data:{format: "json"},
				dataType: "jsonp",
				url: query               
			});
		
		},
		
		processJSON : function (feedJSONData) {
			
			// Flickr provides small images, modify filename to get them larger
			replaceByLargerImages(feedJSONData);
			
			// get the handlebar HTML template
			var templateSource   = $(handlebarTemplateID).html();
			// compile the template. 
			// for a real production app, we would precompile the templates for efficiency
			var template = Handlebars.compile(templateSource);
			// feed JSON data to the template
			// it must be of the form: data = { items : [ {itemObject}, {itemObject} ]}
			var output = template(feedJSONData);
			// inject the templated HTML into document
			$(imagesDivID).html(output);
			
			// fade items in (original opacity = 0, 400ms animation time 500ms additional delay for each successive item)
			$.each($('.flickrItem'), function(i, el){
				setTimeout(function(){
					$(el).animate({
						'opacity':1.0
					}, 400);
				},500 + ( i * 500 ));
			});
      
		}	
		
	};	
	
})();

/* this is the bit where I'm not sure it's very neat. 
I was not sure if there was a neater way to make the callback name visible in the global scope
I'm not very used to JSONP */
var jsonpCallback = function (data) {
	flickrFeedLoader.controller.processJSON(data);
};

/* When the document is ready, attach controller events to HTML UI elements */
$(document).ready(function() {
	
	$("#loadFeed").click(function(){
		var queryTerms = $("#queryTerms").val();
		flickrFeedLoader.controller.loadFeed(queryTerms);
	});
  
});

