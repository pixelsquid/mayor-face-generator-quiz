$(document).ready(function() {

	// globals
	

	if(!Array.indexOf) {// IE fix
		Array.prototype.indexOf = function(obj) {
			for(var i = 0; i < this.length; i++) {
				if(this[i] === obj) {
					return i;
				}
			}
			return -1;
		}
	}
	
	Array.prototype.shuffle = function() {
 	var len = this.length;
	var i = len;
	 while (i--) {
	 	var p = parseInt(Math.random()*len);
		var t = this[i];
  	this[i] = this[p];
  	this[p] = t;
 	}
};
	var shortURL = "http://gu.com/p/375my"
	//var shortURL = "http://bit.ly/IgeAN8";
	var ua = navigator.userAgent, event = (ua.match(/iPad/i)) ? "touchstart" : "click", event2 = (ua.match(/iPad/i)) ? "touchend" : "click";

	var dataObjects = [];
	var myChoices = [];
	var mayorData = [];
	var myMayor = "No preference";
	var myMayorInitial = "N";
	var myDirection = "N";
	var myInnerOuter = "Inner";
	var londonDirection = "N";
	var londonInnerOuter = "Inner";
	var currentChoice = -1;
	var currentQuestion = 0;
	var aboutYouPage = false;
	var infoView = 0;
	var twitterMiddle = "";
	
	//var twitterStem = "http://www.twitter.com/home?status=I+took+the+Guardian%27s+London+mayor+machine+test+and+I+am+";
	var twitterStem = "http://twitter.com/home?status=I've tried the Guardian's London Mayor Machine and my mayor is a ";
	
	var twitterEnd = shortURL;
	//twitterStem = twitterStem + twitterEnd;
	var finalToPage;
	var finalFromPage;
	var finalInfoView;
	
	var mayorObjs = [];
	mayorObjs.push({name:"Boris", initial:"B", color: "#0000ff", imageURL: "images/boris.jpg"});
	mayorObjs.push({name:"Brian", initial:"P", color: "#000000", imageURL: "images/brian.jpg"});
	mayorObjs.push({name:"Jenny", initial:"J", color: "#00ff00", imageURL: "images/jenny.jpg"});
	mayorObjs.push({name:"Ken", initial:"K", color: "#ff0000", imageURL: "images/ken.jpg"});
	mayorObjs.push({name:"No preference", initial:"N", color: "#cccccc", imageURL: "images/brian.jpg"});
	
	var slicesInOrder = [];
	var slicesOptimal = [];
	var randomSlices = [];
	var mayors = [];
	
	var mayorSummary = [];
	var genericMayorSummary = [];
	var currentMayorSummary = genericMayorSummary;
	var summaryIndex;
	
	mayorSummary.push({title: "Night mayor", summary: "What creature have you created here? A policy or two from all the candidates and you end up with a multicoloured mutant. There is no one candidate for you, but you need to make a choice between your head and your ... three other heads"});
	mayorSummary.push({title: "London Misassembly", summary: "Congratulations. You've narrowed your mayor down to a composite of just three of the four possibilities. Perhaps from here you can see who you are most compatible with"});
	mayorSummary.push({title: "London bridge", summary: "Very close to a full mayor. Or look at it this way – you know where you are based but you are not afraid to extend a link to the other side"});
	mayorSummary.push({title: "Tale of two City Halls", summary: "What do we have here? A mayor of two heads. There is a clearly a divide in your responses between the two candidates above and it is up to you to decide which is the one for you"});
	mayorSummary.push({title: "Total Mayor", summary: "There are powerful forces at work here. We presented you a selection of policies to help you make a mayor and you came up with a real person. Perhaps you should vote for this person. Perhaps you are this person"});

	genericMayorSummary.push({title: "Night mayor", summary: "What creature do we have here? A policy or two from all the candidates and you end up with a multicoloured mutant. London is a complicated city, and certainly here those who have expressed a choice have been unable to choose between their heads and their ... three other heads"});
	genericMayorSummary.push({title: "London Misassembly", summary: "Ask a lot of people a lot of questions and you get a lot of answers. But the mayor here has excluded one of the candidates, so at least we can see who they don't like"});
	genericMayorSummary.push({title: "London bridge", summary: "Very close to a full mayor. Or look at it this way –  a mayor who knows where they are based but you are not afraid to extend a link to the other side"});
	genericMayorSummary.push({title: "Tale of two City Halls", summary: "What do we have here? A mayor of two heads. We put the same policies before large numbers of people. They clearly divided opinion"});
	genericMayorSummary.push({title: "Total Mayor", summary: "There are powerful forces at work here. Large numbers of people were presented you a selection of policies to help them make a mayor and you came up with a real candidate"});

	init();

	// Load spreadsheet data

	function init() {

		
	}

	// Create grids

	function buildView(responseJSON) {

		if(dataObjects !== null && dataObjects !== undefined) {// Do we have data?
			
			var divs=[];
			
			for (var i=0; i < 10; i++) {
				
				var htmlString='<div class="questionPage" id="questionPage_' + i +'">';
				htmlString+='<div class="sub-header"><strong>Which of these statements do you most agree with?</strong> <span class="orangeColor">Please choose one from the selection below</span></div>';
				//htmlString+='<div class="which-statement">Which of these statements do you most agree with?</div>';
				htmlString+='<div class="statement statement-topleft" id="statement_' + i + '_0"><div class="statementLetter">A</div>' + dataObjects[i].statement_A + '</div>';
				htmlString+='<div class="statement statement-topright" id="statement_' + i + '_1"><div class="statementLetter">B</div>' + dataObjects[i].statement_B + '</div>';
				htmlString+='<div class="statement statement-bottomleft" id="statement_' + i + '_2"><div class="statementLetter">C</div>' + dataObjects[i].statement_C + '</div>';
				htmlString+='<div class="statement statement-bottomright" id="statement_' + i + '_3"><div class="statementLetter">D</div>' + dataObjects[i].statement_D + '</div>';
				htmlString+='</div>';
				divs.push(htmlString);
			}
			
			$('.container').append(divs.join(""));
			
		//alert(dataObjects.length);
		$('.statement').addClass('statementdeselect');
		$('.nav').addClass('navdeselect');
		$('#results').hide();
		$("#loading").hide();
		$("#question-info-holder").hide();
		$('#pollScreener').hide();
		$('#bubble').hide();
		$('#other-candidates').hide();
		$('#other-candidates-popup').hide();
		$('#splash-results-button').hide();
		addListeners();
		
	

		} // end if

	}// end buildView
	
	function addListeners() {
		
			$('#splash-results-button').bind(event, function(e) {
				fetchMayorData("no poll");
				
			});
			
			$('.statement').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var firstIndex = Number(splitArr[1]);
				var index = Number(splitArr[2]);
				currentChoice = index;
				selectButton(index, 4, "#statement_" + firstIndex + "_", "statementselect", "statementdeselect");
			});
			
			$('#share-button').bind(event, function(e) {
				var url = twitterStem + twitterMiddle + twitterEnd;
				window.open (url,"mywindow");
			});
			
			$('.nav').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var index = Number(splitArr[1]);
				selectButton(index, 4, "#nav_", "navselect", "navdeselect");
				$("#question-info-holder").hide();
				changeInfoView(index);
			});
			
			$('.mayor-button').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var index = Number(splitArr[1]);
				myMayor = mayorObjs[index].name;
				myMayorInitial = mayorObjs[index].initial;
				selectButton(index, 5, "#mayor-button_", "mayorselect", "mayordeselect");
				//alert(myMayor + "     " + myMayorInitial)
			});
			
			$('.select-direction-button').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var index = Number(splitArr[1]);
				londonDirection = $(div).text();
				selectButton(index, 4, "#select-direction-button_", "filterselect", "filterdeselect");
				changeInfoView(3);
				
			});
			
			$('.select-inout-button').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var index = Number(splitArr[1]);
				londonInnerOuter = $(div).text();
				selectButton(index, 2, "#select-inout-button_", "filterselect", "filterdeselect");
				changeInfoView(3);
				
			});
			
			$('.direction-button').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var index = Number(splitArr[1]);
				
				var nx, ny;
				
				switch (index) {
					
					case 0 :
					myDirection = "N";
					nx = 0;
					ny = 0;
					break;
					
					case 1 :
					myDirection = "S";
					nx = -247;
					ny = 0;
					break;
					
					case 2 :
					myDirection = "W";
					nx = 0;
					ny = -247;
					break;
					
					case 3 :
					myDirection = "E";
					nx = -247;
					ny = -247;
					break;
					
				}
				
				$("#compass").css('backgroundPosition', nx + 'px ' + ny + 'px')
				//alert(myDirection);
			});
			
			$('.innerOuter-button').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var index = Number(splitArr[1]);
				
					var nx, ny;
				
				switch (index) {
					
					case 0 :
					myInnerOuter = "Outer";
					nx = -202;
					ny = 0;
					break;
					
					case 1 :
					myInnerOuter = "Inner";
					nx = 0;
					ny = 0;
					break;
					
				}
				
				$("#innerOuterBackground").css('backgroundPosition', nx + 'px ' + ny + 'px')
				//alert(myInnerOuter);
			});
			
			$('#take-the-test-button').bind(event, function(e) {
				transitionPage($('#splash'), $('#aboutYouPage'));
				aboutYouPage = true;
				$('#main-heading').text("About you");
				
				$('#aboutYouPage .sub-header').html("<strong>Please provide details of your preferred mayoral candidate and location</strong>")
				
			});
			
			$('#other-candidates').bind(event, function(e) {
				$('#other-candidates-popup').show();
				
			});
			
			$('#next-button').bind(event, function(e) {
				if (aboutYouPage) {
					transitionPage($('#aboutYouPage'), $('#questionPage_0'));
					$('#category-heading').text(dataObjects[0].category);
					$('#question-counter').html(currentQuestion + 1 + "/10");
					aboutYouPage = false;
					$('#main-heading').text("Question 1 of 10");
					//$('#questionPage_0 .sub-header').html("<strong>Which of these statements do you most agree with?</strong><br>Please choose one from the selection below");
				}
				else if (currentChoice !== -1) {
				nextQuestion();
				}
				
			});
			
			$('#question-button').bind(event, function(e) {
				animateMayorIn(slicesInOrder);
			});
			$('#reset-button').bind(event, function(e) {
				animateMayorIn(slicesOptimal);
			});
			$('#shuffle-button').bind(event, function(e) {
				randomizeSlices();
				animateMayorIn(randomSlices);
			});
			
			$('.questionSlice').bind(event, function(e) {
				var div = this;
				var splitArr = div.id.split("_");
				var index = Number(splitArr[1]);
				showQuestionInfo(index);
			});
			
			$('#close-button').bind(event, function(e) {
				$("#question-info-holder").hide();
			});
			
			$('#candi-close').bind(event, function(e) {
				$('#other-candidates-popup').hide();
			});
	}
	
	function nextQuestion() {
		currentQuestion++;
		myChoices.push(currentChoice);
		currentChoice = -1;
		
		if (currentQuestion > 9) {
			fetchMayorData("poll");
			
			
			
			
			
		} else {
			$('#main-heading').text("Question " + (currentQuestion + 1) + " of 10");
			$('#category-heading').text(dataObjects[currentQuestion].category);
		transitionPage($('#questionPage_' + (currentQuestion-1)), $('#questionPage_' + currentQuestion));
		}
	}
	
		function selectButton(index, totalButtons, idStem, selectClass, deselectClass) {
		
		for (var i = 0; i < totalButtons; i++) {
			
			if ($(idStem + i).hasClass(selectClass)) {
				$(idStem + i).removeClass(selectClass).addClass(deselectClass);
			}
		}
		
		$(idStem + index).removeClass(deselectClass).addClass(selectClass);
		
	}
	
	function transitionPage(pageA, pageB) {
		$(pageB).show().animate({
					left : '0'
				}, 300, function() {
					// Animation complete.
				});
		$(pageA).animate({
					left : '-940'
				}, 300, function() {
					// Animation complete.
					$(pageA).hide();
				});
	}
	
	function getMayorBreakdown(choices) {
		
		var boris =[];
		var ken = [];
		var brian = [];
		var jenny = [];
		
		slicesOptimal = [];
		
		mayors = [boris, ken, brian, jenny];
		
		for (var i=0; i< choices.length; i++) {
			
			var key = dataObjects[i].mayor_key.charAt(Number(choices[i]));
			
			var orderObj = {};
			
			orderObj.top = i * 35;
			orderObj.mayor = key;
			orderObj.slice = $('#questionSlice_' + i);
			
			
			
			switch (key) {
				
				case "B":
				
				orderObj.imageURL = "url(images/boris.jpg)";
				orderObj.imageURL2 = "images/boris.jpg";
				orderObj.mayorName = "Boris";
				orderObj.longName = "Boris Johnson";
				orderObj.mayorInitial = "B";
				orderObj.color = "#2d6f9f";
				orderObj.lightColor = "#d5e2ec";
				boris.push(orderObj);
				break;
				
				case "K":
				orderObj.imageURL = "url(images/ken.jpg)";
				orderObj.imageURL2 = "images/ken.jpg";
				orderObj.mayorName = "Ken";
				orderObj.longName = "Ken Livingstone";
				orderObj.mayorInitial = "K";
				orderObj.color = "#a73d25";
				orderObj.lightColor = "#edd8d3";
				ken.push(orderObj);
				break;
				
				case "P":
				
				orderObj.imageURL = "url(images/brian.jpg)";
				orderObj.imageURL2 = "images/brian.jpg";
				orderObj.mayorName = "Brian";
				orderObj.longName = "Brian Paddick";
				orderObj.mayorInitial = "P";
				orderObj.color = "#a87c25";
				orderObj.lightColor = "#eee5d3";
				brian.push(orderObj);
				break;
				
				case "J":
				
				orderObj.imageURL = "url(images/jenny.jpg)";
				orderObj.imageURL2 = "images/jenny.jpg";
				orderObj.mayorName = "Jenny";
				orderObj.longName = "Jenny Jones";
				orderObj.mayorInitial = "J";
				orderObj.color = "#299935";
				orderObj.lightColor = "#d5ecd8";
				jenny.push(orderObj);
				break;
			}
			
			slicesInOrder[i] = orderObj;
			
			
			/*
			
			$('#questionSlice_' + i).css({
						top : (i * 35),
						'background' : imageURL
					}).css('backgroundPosition', 0 + 'px ' + (-i * 35) + 'px');
				*/
			
		}
		for (var k = 0; k < 4; k++) { // Do it four times to make sure
		
		for (var ii = 0; ii < mayors.length; ii++) {
			if (mayors[ii + 1] != undefined && mayors[ii+1].length > mayors[ii].length) {
				var tmp = mayors[ii];
				mayors[ii] = mayors[ii+1];
				mayors[ii+1] = tmp;
			}
		}
		
		}
		
		
		
		var htmlString = "";
		
		var mixture = 0;
		/*
		tmp = mayors[1];
				mayors[1] = mayors[0];
				mayors[0] = tmp;
		*/
		for (var iii = 0; iii < mayors.length; iii++) {
			if (mayors[iii].length > 0) {
				mixture ++;
				twitterMiddle += (mayors[iii].length / 10) * 100 + "%25 " + mayors[iii][0].mayorName + " ";
				htmlString += "<br><font color='" + mayors[iii][0].color + "'>" + (mayors[iii].length / 10) * 100 + "% " + mayors[iii][0].longName + "</font>";
			}
			for (var iv=0; iv< mayors[iii].length; iv++) {
				slicesOptimal.push(mayors[iii][iv]);
			}
		}
		/*
		if (mayors[0].length > mayors[1].length) {
			twitterMiddle = "mostly " + mayors[0][0].mayorName;
		} else {
			twitterMiddle = "equally " + mayors[0][0].mayorName + " and " + mayors[1][0].mayorName;
			
			if (mayors[1].length == mayors[2].length) {
				twitterMiddle += " and " + mayors[2][0].mayorName;
			}
			
		}
		*/
		
		
		summaryIndex = 0;
		
		/*
		
		if (mixture == 3 && mayors[0].length < 5) {
			summaryIndex = 1;
		} else if (mixture >= 2 && mixture != 4 && mayors[0].length >= 5) {
			summaryIndex = 2;
		} else if (mixture == 2 && mayors[0].length == 5) {
			summaryIndex = 3;
		} else if (mixture == 1) {
			summaryIndex = 4;
		} 
		*/
		
		if (mixture == 1) {
			summaryIndex = 4; // Total mayor
		} else if (mayors[0].length >= 8) {
			summaryIndex = 3; // Bridge
		} else if (mixture == 2) {
			summaryIndex = 3; // Two City
		} else if (mixture == 3) {
			summaryIndex = 1; // Misassembly
		} else {
			summaryIndex = 0; // Night
		}
		
		twitterMiddle = currentMayorSummary[summaryIndex].title + " " + twitterMiddle;
		

		var breakdownString = htmlString + "<p><br><strong>Mayor type: " + currentMayorSummary[summaryIndex].title + "</strong><br>"+ currentMayorSummary[summaryIndex].summary + "</p>"
		
		
		//$('#infoHolder').html("You are...<br>" + htmlString + "<p><br><strong>Mayor type: " + mayorSummary[summaryIndex].title + "</strong><br>"+ mayorSummary[summaryIndex].summary + "</p>");
		
		return breakdownString;
		
	}
	
	function animateMayorIn(sliceArr) {
		
		for (var i = 0; i < sliceArr.length; i++) {
			$(sliceArr[i].slice).stop(true, false).fadeTo(0,0).css({
						top : -35,
						'background' : sliceArr[i].imageURL
					}).css('backgroundPosition', 0 + 'px ' + (-i * 35) + 'px').delay(550 - i*50).animate({
					top : (i * 35),
					opacity: 1
				}, (50+ i*50), function() {
					// Animation complete.
				});;
		}
	}
	
	function randomizeSlices() {
		
		randomSlices = [];
		var randArr = mayors;
		
		randArr.shuffle();
		
		
		for (var iii = 0; iii < randArr.length; iii++) {
			for (var iv=0; iv< randArr[iii].length; iv++) {
				randomSlices.push(mayors[iii][iv]);
			}
		}
		
	}
	
	function changeInfoView(view) {
		
		$('#other-candidates').show();
		
		var arr, infoHtml, newChoices;
		
		infoView = view;
		
		switch (view) {
			
			case 0:
			//alert("My Mayor");
			currentMayorSummary = mayorSummary;
			$("#filterButtons").hide();
			$("#share-button").show();
			$('#main-heading').text("Meet your mayor...");
			infoHtml = getMayorBreakdown(myChoices);
			$('#infoHolder').html("Your mayor is...<br>" + infoHtml);
			animateMayorIn(slicesOptimal);
			break;
			
			case 1:
			currentMayorSummary = genericMayorSummary;
			$('#main-heading').text("Meet your area's mayor...");
			$("#filterButtons").hide();
			$("#share-button").hide();
			arr = queryMayorData("any", myDirection, myInnerOuter, ["any", "any", "any", "any", "any", "any", "any", "any", "any", "any"]);
			newChoices = getChoicesFromArr(arr);
			infoHtml = getMayorBreakdown(newChoices);
			$('#infoHolder').html("Your area's mayor is...<br>" + infoHtml);
			animateMayorIn(slicesOptimal);
			
			
			break;
			
			case 2:
			currentMayorSummary = genericMayorSummary;
			$("#filterButtons").hide();
			$("#share-button").hide();
			$('#main-heading').text("Meet London's mayor...");
			arr = queryMayorData("any", "any", "any", ["any", "any", "any", "any", "any", "any", "any", "any", "any", "any"]);
			newChoices = getChoicesFromArr(arr);
			infoHtml = getMayorBreakdown(newChoices);
			$('#infoHolder').html("London's mayor is...<br>" + infoHtml);
			animateMayorIn(slicesOptimal);
			break;
			
			case 3:
			currentMayorSummary = genericMayorSummary;
			$("#filterButtons").show();
			$("#share-button").hide();
			$('#main-heading').text("Meet London's mayor by area...");
			arr = queryMayorData("any", londonDirection, londonInnerOuter, ["any", "any", "any", "any", "any", "any", "any", "any", "any", "any"]);
			newChoices = getChoicesFromArr(arr);
			infoHtml = getMayorBreakdown(newChoices);
			$('#infoHolder').html(londonInnerOuter + " " + getDirectionFromLetter(londonDirection) + " London's mayor is...<br>" + infoHtml);
			animateMayorIn(slicesOptimal);
			break;
			
			
		}
		
	}
	
	function getMayorData() {
		
		var mayorArr = ["Boris", "Brian", "Jenny", "Ken", "No preference"];
		var directionArr = ["N", "S", "E", "W"];
		var innerOuterArr = ["Inner", "Outer"];
		var questionArr = ["0", "1", "2", "3"];
		
		
		
		for (var i = 0; i < 10; i++) {
			
			var obj = {};
			
			obj.mayor = getRandom(mayorArr);
			obj.direction = getRandom(directionArr);
			obj.innerOuter = getRandom(innerOuterArr);
			obj.Q_1 = getRandom(questionArr);
			obj.Q_2 = getRandom(questionArr);
			obj.Q_3 = getRandom(questionArr);
			obj.Q_4 = getRandom(questionArr);
			obj.Q_5 = getRandom(questionArr);
			obj.Q_6 = getRandom(questionArr);
			obj.Q_7 = getRandom(questionArr);
			obj.Q_8 = getRandom(questionArr);
			obj.Q_9 = getRandom(questionArr);
			obj.Q_10 = getRandom(questionArr);
			
			
			
			mayorData.push(obj);
		}
		
		//alert (mayorData.length);
		
		//var arr = queryMayorData("any", "any", "any", ["1", "any", "1", "any", "1", "2", "any", "any", "any", "any"]);
		//alert(arr.length);
	}
	
	function getRandom(arr) {
		
		var index = Math.floor(Math.random() * arr.length);
		
		return arr[index];
		
	}
	
	function queryMayorData(mayor, direction, innerOuter, questionArr) {
		
		var arr = mayorData.slice(0);
		
		arr = filterArr(arr, "mayor", mayor);
		arr = filterArr(arr, "direction", direction);
		arr = filterArr(arr, "innerOuter", innerOuter);
		arr = filterArr(arr, "Q_1", questionArr[0]);
		arr = filterArr(arr, "Q_2", questionArr[1]);
		arr = filterArr(arr, "Q_3", questionArr[2]);
		arr = filterArr(arr, "Q_4", questionArr[3]);
		arr = filterArr(arr, "Q_5", questionArr[4]);
		arr = filterArr(arr, "Q_6", questionArr[5]);
		arr = filterArr(arr, "Q_7", questionArr[6]);
		arr = filterArr(arr, "Q_8", questionArr[7]);
		arr = filterArr(arr, "Q_9", questionArr[8]);
		arr = filterArr(arr, "Q_10", questionArr[9]);
		
		return arr;
		
	}
	
	function filterArr(arr, searchKey, searchVal) {
		
		var returnArr = [];
		
		for (var i=0; i<arr.length; i++) {
			if (arr[i][searchKey] != undefined && (arr[i][searchKey] == searchVal || searchVal == "any")) {
				returnArr.push(arr[i])
			}
		}
		
		return returnArr;
		
	}
	
	function getChoicesFromArr(arr) {
		
		var cArray = [];
		var Qs = ["Q_1", "Q_2", "Q_3", "Q_4", "Q_5", "Q_6", "Q_7", "Q_8", "Q_9", "Q_10"];
		
		for (var i=0; i < Qs.length; i++) {
			
			var qKey = Qs[i];
			var totalsArray = [0,0,0,0];
			
			for (var ii=0; ii<arr.length; ii++) {
				
				var val = Number(arr[ii][qKey]);
				//alert(totalsArray[val]);
				totalsArray[val]++;
				//alert("again   " + totalsArray[val]);
				
			}
			
			var currentMax = 0;
			var questionWinner = "0";
			
			for (iii=0; iii < totalsArray.length; iii++) {
				if (totalsArray[iii] > currentMax) {
					currentMax = totalsArray[iii];
					questionWinner = String(iii);
				}
			}
			
			cArray.push(questionWinner);
			
		}
		
		//alert(cArray);
		
		return cArray;
		
	}
	
	function showQuestionInfo(index) {
		
		
		
		var letters = ["A", "B", "C", "D"];
		
		var mayorInitial = slicesInOrder[index].mayorInitial;
		
		var currentLetter = letters[dataObjects[index].mayor_key.indexOf(mayorInitial)];
		
		//alert(currentLetter);
		
		var statementKey = "statement_" + currentLetter;
		
		//alert(slicesInOrder[index].mayorName);
		
		//dataObjects[index].mayor_key.charAt(Number(choices[i]));
	
		
		var voteString;
		
		if (infoView == 0) {
			voteString = "'s</strong> policy gets your vote!";
		} else {
			voteString = "'s</strong> policy gets the most votes!";
		}
		
		
		
		$("#question-number").html("<font color='" + slicesInOrder[index].color + "'><strong>Question " + (index + 1) + ": </strong>" + dataObjects[index].category + '</font>');
		
		$("#question-info_0").html("<div id='winner-heading'><strong>" + slicesInOrder[index].mayorName + voteString + "</div><img class='question-portrait-winner' src='" + slicesInOrder[index].imageURL2 + "' width='60' height='60' /><p>" + dataObjects[index][statementKey] + "</p>");
		
		var currentQuestion = 1, mayorName="", imageURL="";
		
		$('#winner-heading').css({
						'background' : slicesInOrder[index].color
			});
			
		$('#question-info_0').css({
						'background' : slicesInOrder[index].lightColor
			});
			
			
			
		
		
		
		//alert(currentLetter);
		
	
			
		
		
		for (var i = 0; i < letters.length; i++) {
			
			var testInitial = dataObjects[index].mayor_key.charAt(i);
			
			if (testInitial != slicesInOrder[index].mayorInitial) {
				
				for (var ii=0; ii< mayorObjs.length; ii++) {
					
					if (mayorObjs[ii].initial == testInitial) {
						mayorName = mayorObjs[ii].name;
						imageURL = mayorObjs[ii].imageURL;
						mayorInitial = mayorObjs[ii].initial;
						break;
					}
				}
				
			currentLetter = letters[dataObjects[index].mayor_key.indexOf(mayorInitial)];
			statementKey = "statement_" + currentLetter;	
				
			$("#question-info_" + currentQuestion).html("<img class='question-portrait' src='" + imageURL + "' width='60' height='60' /><p><strong>" + mayorName + ": </strong>" +dataObjects[index][statementKey] + "</p>");
				currentQuestion++;
			}
			
		}
		
		
		
		
		
		
		
		
		$("#question-info-holder").show();
		
	}
	
	function getDirectionFromLetter(letter) {
		
		var returnString = "";
		
		switch (letter) {
			
			
			case "N" :
			returnString = "North";
			break;
			
			case "S" :
			returnString = "South";
			break;
			
			case "W" :
			returnString = "West";
			break;
			
			case "E" :
			returnString = "East";
			break;
			
		}
		
		return returnString;
	}
	
	function fetchMayorData(typeString) {
		
		//getMayorData();
		//alert("data");
		//$('#pollScreener').show();
		$('#next-button').hide();
		$('#sub-header').hide();
		
		switch (typeString) {
			
			case "poll" :
			
			//transitionPage($('#questionPage_9'), $('#results'));
			finalFromPage = $('#questionPage_9');
			finalToPage = $('#results');
			$("#nav_1").hide();
			$("#nav_2").hide();
			$("#nav_3").hide();
			finalInfoView = 0;
			$('#category-heading').hide();
			//changeInfoView(0);
			$('#nav_0').removeClass('navdeselect').addClass('navselect');
			
			//mayorData = result;
			mayorData = [];
	$('#pollScreener').hide();
	changeInfoView(finalInfoView);
	transitionPage($(finalFromPage), $(finalToPage));
	$('#bubble').delay(6000).fadeIn(500, function () {
		
		$('#bubble').delay(4000).fadeOut(500, function () {
		
		$('#bubble').hide();
   	});	
            
    });
			
			
			
			
			//post(myMayor, myDirection, myInnerOuter, myChoices[0], myChoices[1], myChoices[2], myChoices[3], myChoices[4], myChoices[5], myChoices[6], myChoices[7], myChoices[8], myChoices[9]);
			
			break;
			
			case "no poll" :
				
				$("#nav_0").hide();
				$("#nav_1").hide();
				$('#nav_2').removeClass('navdeselect').addClass('navselect');
				finalFromPage = $('#splash');
				finalToPage = $('#results');
				finalInfoView = 2;
				//changeInfoView(2);
				//transitionPage($('#splash'), $('#results'));
				query(null);
			
			break;
		}
	}
	
	function post(mayor, direction, innerOuter, Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10) {

  // disable the buttons and clear the text field
  
 // $("#msgTxt").val("");
  
  // post your mayor details
  $.post("/_je/mayor-data", { mayor: mayor, direction: direction, innerOuter:innerOuter, Q_1:Q1, Q_2:Q2, Q_3:Q3, Q_4:Q4, Q_5:Q5, Q_6:Q6, Q_7:Q7, Q_8:Q8, Q_9:Q9, Q_10:Q10 }, function (result){	
    query(null);
  }, "text");
}

function query(keyword) {
  
  // build query params
  //disableButton(true);
  //if (keyword) params = {cond : "messageBody_.eq." + keyword};
  //else params = { sort: "_createdAt.desc", limit: 100};
  
   params = { sort: "_createdAt.desc"};
  
  // query for the messages
  $.get("/_je/mayor-data", params, function (result) {
    //$("#messages").empty();
    //for (i = 0; i < result.length; i++) {
      //var msg = $("<div/>").text(result[i].mayor + "  " + result[i].direction + "  " + result[i].innerOuter + "   " + result[i].Q_1);
      //$("#messages").append(msg);
    //}
    //disableButton(false);
	//alert(result);
	mayorData = result;
	$('#pollScreener').hide();
	changeInfoView(finalInfoView);
	transitionPage($(finalFromPage), $(finalToPage));
	$('#bubble').delay(6000).fadeIn(500, function () {
		
		$('#bubble').delay(4000).fadeOut(500, function () {
		
		$('#bubble').hide();
   	});	
            
    });

  });
}
	
	
	


});
