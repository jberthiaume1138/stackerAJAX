$(document).ready( function() {
	$('.unanswered-getter').submit( function(e){
		e.preventDefault();
		// zero out results if previous search has run
		$('.results').html('');
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

	$('.inspiration-getter').submit(function(e){
		e.preventDefault();

		//clear previous, if any
		$('.results').html('');

		// get user input for tags, pass into the main function to get the results
		var tags = $(this).find("input[name='answerers']").val();
		getTopAnswerers(tags);
	});
});


// this function takes the question object returned by the StackOverflow request
// and returns new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $('.templates .question').clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the .viewed for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" '+
		'href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
		question.owner.display_name +
		'</a></p>' +
		'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};


// this function takes the results object from StackOverflow
// and returns the number of results and tags to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query + '</strong>';
	return results;
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = { 
		tagged: tags,
		site: 'stackoverflow',
		order: 'desc',
		sort: 'creation'
	};
	
	$.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",//use jsonp to avoid cross origin issues
		type: "GET",
	})
	.done(function(result){ //this waits for the ajax to return with a succesful promise object
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);
		//$.each is a higher order function. It takes an array and a function as an argument.
		//The function is executed once for each item in the array.
		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error){ //this waits for the ajax to return with an error promise object
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};


var getTopAnswerers = function (tags) {
	// build URL
 	url = "https://api.stackexchange.com/2.2/tags/" + tags + "/top-answerers/all_time?site=stackoverflow";

 	$.getJSON(url, function(result){
 		// create the # of results header
    	var searchResults = showSearchResults(tags, result.items.length);
  	 	$('.search-results').html(searchResults);

  	 	// process each RESULT object in the ITEMS array
	 	$.each(result.items, function(i, item) {
			$('.results').append(generateAnswerer(i,item));	// appends the newly populated HTML to the RESULTS wrapper
			
			// console.log(item);
		});
	});
};

var generateAnswerer = function(rank,answerer) {
	// clone the template 
	var result = $('.templates .top-answerers').clone();
	
	// fill up the new template with data from the ANSWERER object
	// TODO: make this pretty
	var answererRank = result.find('.rank');
	answererRank.text(rank + 1);

	var answererElem = result.find('.answerer a');
	answererElem.attr('href', answerer.user.link);
	answererElem.text(answerer.user.display_name);

	var answererImage = result.find('.image');
	answererImage.attr('src',answerer.user.profile_image);

	var postCount = result.find('.post-count');
	postCount.text(answerer.post_count);

	var score = result.find('.score');
	score.text(answerer.score);

	var reputation = result.find('.reputation');
	reputation.text(answerer.user.reputation);

	// pass the template, now populated with the values in HTML, back up so it can be appended to the wrapper DIV
	return result;
};