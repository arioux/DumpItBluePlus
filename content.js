'use strict';

// Listen messages from popup
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.type === "scroll") {
    console.log('Scrolling');
    scrollFunctions();
    sendResponse({msg: "scrolling started"});
  } else if (request.type === "dump") {
    console.log('Dumping');
    dump();
    sendResponse({msg: "dumping started"});
  } else if (request.type === "openMobile") {
    console.log('Open in Facebook Mobile');
    openMobile();
    sendResponse({msg: "Opening in Facebook Mobile started"});
  } else if (request.type === "show" || request.type === "hide") {
    console.log('Showing/Hiding');
		show_hide();
    sendResponse({msg: "Showing/Hiding started"});
  } else if (request.type === "isolate") {
    console.log('Isolating');
    isolate();
    sendResponse({msg: "isolating started"});
  } else if (request.type === "currFBID") {
		var fbid    = '';
		var currUrl = location.href;
		var regex;
		// mobile
		if (currUrl.includes('https://m.facebook.com/messages')) {
			var matchRE = currUrl.match(/\%3A(\d+)/i);
			if (matchRE && matchRE.length > 0) { fbid = matchRE[1]; }
			if (!fbid) {
				regex = /messageOtherUserFBID\:\"(\d+)\"/i;
				fbid  = searchIDScript(regex);
			}
			chrome.storage.local.set({ 'PROF_TYPE': 'mobile' });
			console.log('pageType=mobile messenger');
		}
		// messenger (id of the current chat)
		if (currUrl.includes('https://www.facebook.com/messages/t')) {
			var matchRE = currUrl.match(/\/t\/(\d+)/i);
			if (matchRE && matchRE.length > 0) { fbid = matchRE[1]; }
			if (!fbid) {
				var iframe = document.getElementsByTagName('iframe')[0];
				var innerDoc;
				if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
				else        { innerDoc = document; }
				var buddyLink = innerDoc.getElementsByClassName('gpro0wi8')[0];
				if (buddyLink && buddyLink.href) {
					matchRE = buddyLink.href.match(/\/(\d+)/i);
					if (matchRE && matchRE.length > 0) { fbid = matchRE[1]; }
				}
			}
			chrome.storage.local.set({ 'PROF_TYPE': 'messenger' });
			console.log('pageType=messenger');
		}
		// groups
		if (currUrl.includes('https://www.facebook.com/groups/')) {
			regex = /\"groupID\"\:\"(\d+)\"/i;
			fbid  = searchIDScript(regex);
			chrome.storage.local.set({ 'PROF_TYPE': 'group' });
			console.log('pageType=group');
		}
		if (!fbid) {
			// page
			regex = /\"pageID\"\:\"(\d+)\"/i;
			fbid  = searchIDScript(regex);
			if (fbid) {
				chrome.storage.local.set({ 'PROF_TYPE': 'page' });
				console.log('pageType=page');
			}
		}
		if (!fbid) {
			// event
			regex = /\"eventID\"\:\"(\d+)\"/i;
			fbid  = searchIDScript(regex);
			if (fbid) {
				chrome.storage.local.set({ 'PROF_TYPE': 'event' });
				console.log('pageType=event');
			}
		}
		if (!fbid) {
			// person
			var matchRE = currUrl.match(/profile\.php\?id\=(\d+)/i);
			if (matchRE && matchRE.length > 0) { fbid = matchRE[1]; }
			if (!fbid) {
				regex = /\"userID\"\:\"(\d+)\"/i;
				fbid  = searchIDScript(regex);
			}
			if (fbid) {
				chrome.storage.local.set({ 'PROF_TYPE': 'person' });
				console.log('pageType=person');
			}
		}
		// Album page
		if (!fbid && currUrl.includes('media/set/')) {
			regex = /\\\"group_id\\\"\:(\d+)/i; // group?
			fbid  = searchIDScript(regex);
			if (fbid) {
				chrome.storage.local.set({ 'PROF_TYPE': 'group' });
				console.log('pageType=group');
			} else { // Not a group, page?
				regex = /\"Page\",\"id\"\:\"(\d+)/i;
				fbid  = searchIDScript(regex);
				if (fbid) {
					chrome.storage.local.set({ 'PROF_TYPE': 'group' });
					console.log('pageType=page');
				}
			}
		}
	}
	sendResponse({msg: fbid});
});

// Search ID in SCRIPT
function searchIDScript (regex) {
  var scripts = document.getElementsByTagName("SCRIPT");
  if (scripts) {
    for (var i = 0; i < scripts.length; i++) {
      var match = scripts[i].innerHTML.match(regex);
      if (match && match.length > 0) { return match[1]; }
    }
  }
}

// Sleep function
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

// Log function
function log (message) { console.log(message); }

// Scroll function
function scrollFunctions() {
  chrome.storage.local.get(null, function(items) {
    console.log('Scroll type: ' + items.SCROLL_TYPE);
    console.log('Scroll limit type: ' + items.SCROLL_LIMIT_TYPE);
    console.log('Scroll limit value: ' + items.SCROLL_LIMIT_VAL);
    console.log('Time to wait: ' + (items.TIME_TO_WAIT/1000));
    // Scroll Messenger conversation
    if      (items.SCROLL_TYPE === 'chat'      ) { scrollChat(    items.SCROLL_LIMIT_TYPE, items.SCROLL_LIMIT_VAL, items.TIME_TO_WAIT); }
    // Scroll contact list
    else if (items.SCROLL_TYPE === 'contact'   ) { scrollContacts(items.SCROLL_LIMIT_TYPE, items.SCROLL_LIMIT_VAL, items.TIME_TO_WAIT); }
    // Scroll likes in popup
    else if (items.SCROLL_TYPE === 'likes'     ) { scrollLikes(items.SCROLL_LIMIT_TYPE, items.SCROLL_LIMIT_VAL, items.TIME_TO_WAIT); }
    // Scroll chat in Facebook Mobile
    else if (items.SCROLL_TYPE === 'chatMobile') { scrollChatFM(items.SCROLL_LIMIT_TYPE, items.SCROLL_LIMIT_VAL, items.TIME_TO_WAIT); }
    // Scroll a page
    else {
      scrollPage(items.SCROLL_LIMIT_TYPE, items.SCROLL_LIMIT_VAL, items.TIME_TO_WAIT);
    }
  });
}

// Scroll conversation to top
async function scrollChat(limitType, maxScroll, timeToWait) {
	var msgGrid = document.querySelectorAll('[role="grid"]')[1];
  var noLimit = true;
  if (limitType === 'count') { noLimit = false; }
  var scrollState    = true;
  var nbrItemsBefore = msgGrid.querySelectorAll('[role="row"]').length;
  var nbrItemsAfter  = nbrItemsBefore + 1;
  var i = 0;
  while (((noLimit && nbrItemsAfter > nbrItemsBefore) || i < maxScroll) && scrollState == true) {
    nbrItemsBefore   = msgGrid.querySelectorAll('[role="row"]').length;
    var scrollingDiv = msgGrid.querySelectorAll('[role="row"]')[0];
    if (scrollingDiv) { scrollingDiv.scrollIntoView(true); } // Scroll to the header
    else { break; }
    await sleep(timeToWait);
    nbrItemsAfter = msgGrid.querySelectorAll('[role="row"]').length;
		var j = 0;
    while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
      scrollingDiv   = msgGrid.querySelectorAll('[role="row"]')[0];
      if (scrollingDiv) { scrollingDiv.scrollIntoView(true); } // Scroll to the header
      await sleep(timeToWait);
      nbrItemsAfter = msgGrid.querySelectorAll('[role="row"]').length;
      j++;
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { scrollState = items.SCROLL_STATE; });
    i++;
  }
  alert('End scrolling');
}

// Scroll contacts
async function scrollContacts(limitType, maxScroll, timeToWait) {
  var noLimit = true;
  if (limitType === 'count') { noLimit = false; }
  var scrollState    = true;
  var contactMenu    = document.querySelectorAll('[role="grid"]')[0];
  var nbrItemsBefore = contactMenu.querySelectorAll('[role="row"]').length;
  var scrollingDiv   = contactMenu.querySelectorAll('[role="progressbar"]')[0];
  var nbrItemsAfter  = nbrItemsBefore + 1;
  var i = 0;
  while (((noLimit && nbrItemsAfter > nbrItemsBefore) || i < maxScroll) && scrollState == true) {
    nbrItemsBefore = contactMenu.querySelectorAll('[role="row"]').length;
    scrollingDiv   = contactMenu.querySelectorAll('[role="progressbar"]')[0];
    if (scrollingDiv) { scrollingDiv.scrollIntoView(false); } // Scroll to the last contact
    else { break; }
    await sleep(timeToWait);
    nbrItemsAfter = contactMenu.querySelectorAll('[role="row"]').length;
    var j = 0;
    while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
      scrollingDiv = contactMenu.querySelectorAll('[role="progressbar"]')[0];
      scrollingDiv.scrollIntoView(false); // Scroll to the last contact
      await sleep(timeToWait);
      nbrItemsAfter = contactMenu.querySelectorAll('[role="row"]').length;
      j++;
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { scrollState = items.SCROLL_STATE; });
    i++;
  }
  contactMenu.querySelectorAll('[role="row"]')[0].scrollIntoView(true);
  alert('End scrolling');
}

// Scroll Likes
async function scrollLikes (limitType, maxScroll, timeToWait) {
	var dialog;
	var allDialogs = document.querySelectorAll('[role="dialog"]');
	// Test if the comment dialog is open
	for (var i = 0; i < allDialogs.length; i++) {
		var closeButton = allDialogs[i].querySelector('[aria-label="Close"]');
		if (closeButton) { dialog = allDialogs[i]; }
	}
	if (!dialog) { alert('No like or comment dialog'); return; }
  var noLimit = true;
  if (limitType === 'count') { noLimit = false; }
  var scrollState = true;
	// Scroll the popup
	var allImages = dialog.getElementsByTagName('image');
	var nbrItemsBefore = allImages.length;
	var nbrItemsAfter  = nbrItemsBefore + 1;
	var i = 0;
	while (((noLimit && nbrItemsAfter > nbrItemsBefore) || (limitType === 'count' && i < maxScroll)) && scrollState == true) {
		console.log('Scrolling');
		allImages = dialog.getElementsByTagName('image');
		nbrItemsBefore = allImages.length;
		for (var k = 0; k < allImages.length; k++) {
			allImages[k].parentNode.parentNode.scrollIntoView(true);
		}
		await sleep(timeToWait*2);
		nbrItemsAfter = dialog.getElementsByTagName('image').length;
		var j = 0;
		while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
			console.log('Scrolling');
			for (var k = 0; k < allImages.length; k++) {
				allImages[k].parentNode.parentNode.scrollIntoView(true);
			}
			await sleep(timeToWait);
			nbrItemsAfter = dialog.getElementsByTagName('image').length;
			j++;
		}
		chrome.storage.local.get('SCROLL_STATE', function(items) { scrollState = items.SCROLL_STATE; });
		i++;
	}
  dialog.getElementsByTagName('image')[0].scrollIntoView(true);
  alert('End scrolling');
}

// Scroll chat in Facebook Mobile
async function scrollChatFM(limitType, maxScroll, timeToWait) {
  var noLimit = true;
  if (limitType === 'count' || limitType === 'date') { noLimit = false; }
  var allDates = document.getElementsByTagName('abbr');
  var firstDate;
  var date1;
  var date2;
  if (limitType === 'date') {
    if (!allDates.length) {
      alert('Unable to parse any date. Try another option.');
      return;
    }
    firstDate = allDates[0].innerText;
    date1     = new Date(firstDate);
    date2     = new Date(maxScroll);
    if (!date1 || !date2) {
      alert('Parsed date is not valid. Try another option.');
      return;
    }
  }
  var scrollingLink = document.getElementsByClassName('touchable primary')[0];
  var scrollState = true;
  var i = 0;
  while ((noLimit || (limitType === 'count' && i < maxScroll) || (limitType === 'date' && date1 > date2)) && scrollingLink && scrollState == true) {
    window.scrollTo(0,0);
    scrollingLink.click();
    await sleep(timeToWait);
    scrollingLink = document.getElementsByClassName('touchable primary')[0];
    if (limitType === 'date') {
      firstDate = document.getElementsByTagName('abbr')[0];
      if (firstDate) { date1 = new Date(firstDate.innerText); }
    }
    if (!scrollingLink) {
      var j = 0;
      while ((noLimit && j < 5) || ((i+1+j) < maxScroll)) {
        await sleep(timeToWait);
        scrollingLink = document.getElementsByClassName('touchable primary')[0];
        if (scrollingLink) { break; }
        j++;
      }
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { scrollState = items.SCROLL_STATE; });
    i++;
  }
  window.scrollTo(0,0);
  alert('End scrolling');
}

// Scroll page
async function scrollPage(limitType, maxScroll, timeToWait) {
  var noLimit = true;
  if (limitType === 'count') { noLimit = false; }
  var offsetBefore = 0;
  var offsetAfter  = 100;
  var scrollState = true;
  var i = 0;
  while (((noLimit && (!((window.innerHeight + window.scrollY) >= document.body.offsetHeight) || offsetBefore != offsetAfter)) || 
         (limitType === 'count' && i < maxScroll)) && scrollState == true) {
    offsetBefore = document.body.offsetHeight;
    window.scrollTo(0,document.body.scrollHeight);
    await sleep(timeToWait);
    offsetAfter = document.body.offsetHeight;
    if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight) || offsetBefore == offsetAfter) { // Try five more times
      var j = 0;
      while (offsetBefore == offsetAfter) { // While pos in page didn't move
        if      (noLimit && j == 5) { break; } // stop after five tries
        else if (limitType === 'count' && (i+j) == maxScroll) { break; } // or stop if count limit has been reached
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(timeToWait);
        offsetAfter = document.body.offsetHeight;
        j++;
      }
      if (offsetBefore == offsetAfter) { break; } // End of page has been reached
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { scrollState = items.SCROLL_STATE; });
    i++;
  }
  window.scrollTo(0,0);
  alert('End scrolling');
}

// Dump
function dump() {
  chrome.storage.local.get(null, function(items) {
    var currURI = document.baseURI;
    var countEl = 0;
    console.log('Type dump: ' + items.DUMP_TYPE);
    if (items.DUMP_TYPE === 'album' || items.DUMP_TYPE === 'allAlbums') {
      console.log('SMALL_SIZE: ' + items.SMALL_SIZE);
      console.log('FULL_SIZE: ' + items.FULL_SIZE);
    } else {
      console.log('Add profile image? ' + items.ADD_PROF_IMG);
      console.log('Add current page URL? ' + items.ADD_BASE_URI + ' - ' + currURI);
    }
    console.log('Time to wait: ' + (items.TIME_TO_WAIT/1000));
    if (items.DUMP_TYPE !== 'allFriends' && items.DUMP_TYPE !== 'allContrib' && items.DUMP_TYPE !== 'allLikes' &&
        items.DUMP_TYPE !== 'album'      && items.DUMP_TYPE !== 'allAlbums') {
      var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
      html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: small; }';
      html += 'th { font-weight: bold; text-align: center; }</style>';
      html += '</head><table style="margin: auto;">';
    }
    // Friends in current page
    if (items.DUMP_TYPE === 'friends') {
			var friendGroupNode = document.querySelectorAll('[role="tablist"]')[1].parentNode.parentNode.parentNode;
      var friendImgs      = friendGroupNode.getElementsByTagName('img');
      var friends         = [];
      for (var i = 0; i < friendImgs.length; i++) {
        var profUrl     = '';
        var profImg     = '';
        var profName    = '';
        var profDetails = '';
				profImg         = friendImgs[i].src;
				profUrl         = friendImgs[i].parentNode.href;
				var friendNode  = friendImgs[i].parentNode.parentNode.parentNode;
				if (friendNode.childNodes[1] && 
			    	friendNode.childNodes[1].childNodes[0]) {
					if (friendNode.childNodes[1].childNodes[0].innerText) {
    				profName    = friendNode.childNodes[1].childNodes[0].innerText;
					}
					if (friendNode.childNodes[1].childNodes[1] &&
					    friendNode.childNodes[1].childNodes[1].innerText) {
  				  profDetails = friendNode.childNodes[1].childNodes[1].innerText;
					}
				} else { // Work category
				  friendNode = friendNode.parentNode;
					profUrl    = friendNode.parentNode.parentNode.href;
				  if (friendNode.childNodes[1] && 
					    friendNode.childNodes[1].childNodes[0] &&
							friendNode.childNodes[1].childNodes[0].childNodes[0]) {
						if (friendNode.childNodes[1].childNodes[0].childNodes[0].innerText) {
  				    profName    = friendNode.childNodes[1].childNodes[0].childNodes[0].innerText;
						}
						if (friendNode.childNodes[1].childNodes[0].childNodes[1].innerText) {
  				    profDetails = friendNode.childNodes[1].childNodes[0].childNodes[1].innerText;
						}
					}
				}
        if (profName) {
          friends.push({ url:profUrl, img:profImg, name:profName, details:profDetails, });
        }
      }
      html += '<tr>';
      if (items.ADD_PROF_IMG == true) { html += '<th>Profile Image</th>'; }
      html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Profile Details</th>';
      if (items.ADD_BASE_URI == true) { html += '<th>Origin URL</th>'; }
      html += '</tr>';
      for (var i = 0; i < friends.length; i++) {
        html += '<tr><td>';
        if (items.ADD_PROF_IMG == true) {
          if (friends[i].img) { html += '<img src="' + friends[i].img + '">'; }
          html += '</td><td>';
        }
        if (friends[i].name   ) { html += friends[i].name;    } html += '</td><td>';
        if (friends[i].url    ) { html += friends[i].url;     } html += '</td><td>';
        if (friends[i].img    ) { html += friends[i].img;     } html += '</td><td>';
        if (friends[i].details) { html += friends[i].details; } html += '</td>';
        if (items.ADD_BASE_URI == true) { html += '<td>' + currURI + '</td>'; }
        html += '</tr>';
        countEl++;
      }
    // All friends
    } else if (items.DUMP_TYPE === 'allFriends') {
      dumpAllFriends(items.ADD_PROF_IMG, items.ADD_BASE_URI, items.TIME_TO_WAIT);
    // All Contributors
    } else if (items.DUMP_TYPE === 'allContrib') {
      dumpAllProfiles(1, items.ADD_PROF_IMG, items.ADD_BASE_URI, items.TIME_TO_WAIT);
    // All Likes
    } else if (items.DUMP_TYPE === 'allLikes') {
      dumpAllProfiles(2, items.ADD_PROF_IMG, items.ADD_BASE_URI, items.TIME_TO_WAIT);
    // Current album
    } else if (items.DUMP_TYPE === 'album') {
      dumpAlbum(items.SMALL_SIZE, items.FULL_SIZE, items.TIME_TO_WAIT);
    // All Albums
    } else if (items.DUMP_TYPE === 'allAlbums') {
      dumpAllAlbums(items.SMALL_SIZE, items.FULL_SIZE, items.TIME_TO_WAIT);
    // Group Members
    } else if (items.DUMP_TYPE === 'groupMembers') {
      var members     = [];
			var memberLists = document.querySelectorAll('[role="list"]');
			for (var i = 0; i < memberLists.length; i++) {
				var groupNameTag = memberLists[i].parentNode.parentNode.getElementsByTagName('h2')[0];
				var groupName    = groupNameTag.innerText;
				if (groupName.match(/[\r\n]/)) { groupName = groupName.split(/[\r\n]/)[0]; }
				if (groupName) {
					var catMembers = memberLists[i].querySelectorAll('[role="listitem"]');
					for (var j = 0; j < catMembers.length; j++) {
						var memberUrl    = '';
						var memberImg    = '';
						var memberName   = '';
						var memberText   = '';
						var memberUrlTag = catMembers[j].getElementsByTagName('a')[0];
						var memberUrl    = memberUrlTag.href;
						var memberName   = memberUrlTag.getAttribute("aria-label");
						var memberImgTag = catMembers[j].getElementsByTagName('image')[0];
						var memberImg = memberImgTag.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
						var memberTextAll = catMembers[j].innerText;
						var memberTextParts = memberTextAll.split(/[\r\n]/);
						if (catMembers[j].querySelector('[role="button"]')) { memberTextParts.pop(); }
						memberTextParts.shift();
						if (memberTextParts[0]) { memberText = memberTextParts[0]; }
						if (memberTextParts[1] && memberTextParts[1].length > 1) { memberText = memberText + ' / ' + memberTextParts[1]; }
						if (memberName) {
							members.push({ url:memberUrl, img:memberImg, name:memberName, details:memberText, role: groupName, });
						}
					}
				}
      }
      html += '<tr><th>Role</th>';
      if (items.ADD_PROF_IMG == true) { html += '<th>Profile Image</th>'; }
      html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Profile Details</th>';
      if (items.ADD_BASE_URI == true) { html += '<th>Origin URL</th>'; }
      html += '</tr>';
      for (var i = 0; i < members.length; i++) {
        html += '<tr><td>';
        if (members[i].role   ) { html += members[i].role;    } html += '</td><td>';
        if (items.ADD_PROF_IMG == true) {
          if (members[i].img) { html += '<img src="' + members[i].img + '">'; }
          html += '</td><td>';
        }
        if (members[i].name   ) { html += members[i].name;    } html += '</td><td>';
        if (members[i].url    ) { html += members[i].url;     } html += '</td><td>';
        if (members[i].img    ) { html += members[i].img;     } html += '</td><td>';
        if (members[i].details) { html += members[i].details; } html += '</td>';
        if (items.ADD_BASE_URI == true) { html += '<td>' + currURI + '</td>'; }
        html += '</tr>';
        countEl++;
      }
    // Likes
    } else if (items.DUMP_TYPE === 'likes') {
			var likes = [];
			var dialog;
			var allDialogs = document.querySelectorAll('[role="dialog"]');
			// Test if the comment dialog is open
			for (var i = 0; i < allDialogs.length; i++) {
				var closeButton = allDialogs[i].querySelector('[aria-label="Close"]');
				if (closeButton) { dialog = allDialogs[i]; }
			}
			if (!dialog) { console.log('No like or comment dialog'); return;  }
			var profilImgTags = dialog.getElementsByTagName('image');
			var j = 0;
			while (j < profilImgTags.length) {
				// Get profile image
				var profileImgUrl = profilImgTags[j].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
				var parent1 = profilImgTags[j].parentNode.parentNode.parentNode.parentNode;
				if (!parent1 || !parent1.href) { j++; continue; }
				// Get profile URL
				var profileURL = '';
				var profilURLFull = parent1.href;
				if (profilURLFull.match(/profile\.php\?id\=/i)) {
					profileURL = profilURLFull.split(/\&/)[0];
				} else {
					profileURL = profilURLFull.split(/\?/)[0];
				}
				// Get profile name
				var parent2 = parent1.parentNode.parentNode.parentNode;
				if (!parent2) { j++; continue; }
				var allChilds = parent2.childNodes;
				if (!allChilds || !allChilds[1]) { j++; continue; }
				var nameSpan = allChilds[1].getElementsByTagName('span')[0];
				var profileName = nameSpan.innerText;
				if (profileName) {
  				likes.push({ url:profileURL, img:profileImgUrl, name:profileName, });
				}
				j++;
			}
      html += '<tr>';
      if (items.ADD_PROF_IMG == true) { html += '<th>Profile Image</th>'; }
      html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th>';
      if (items.ADD_BASE_URI == true) { html += '<th>Origin URL</th>'; }
      html += '</tr>';
      for (var i = 0; i < likes.length; i++) {
        html += '<tr><td>';
        if (items.ADD_PROF_IMG == true) {
          if (likes[i].img) { html += '<img src="' + likes[i].img + '">'; }
          html += '</td><td>';
        }
        if (likes[i].name   ) { html += likes[i].name; } html += '</td><td>';
        if (likes[i].url    ) { html += likes[i].url;  } html += '</td><td>';
        if (likes[i].img    ) { html += likes[i].img;  } html += '</td>';
        if (items.ADD_BASE_URI == true) { html += '<td>' + currURI + '</td>'; }
        html += '</tr>';
        countEl++;
      }
    // Contributors
    } else if (items.DUMP_TYPE === 'contrib') {
      var contrib = [];
			var dialog;
			var allDialogs = document.querySelectorAll('[role="dialog"]');
			// Test if the comment dialog is open
			for (var i = 0; i < allDialogs.length; i++) {
				var closeButton = allDialogs[i].querySelector('[aria-label="Close"]');
				if (closeButton) { dialog = allDialogs[i]; }
			}
			if (!dialog) { alert('No like or comment dialog'); return;  }
			var profilImgTags = dialog.getElementsByTagName('image');
			var j = 1;
			while (j < profilImgTags.length) {
				// Get profile image
				var profileImgUrl = profilImgTags[j].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
				var parent1 = profilImgTags[j].parentNode.parentNode.parentNode.parentNode;
				if (!parent1 || !parent1.href) { j++; continue; }
				// Get profile URL
				var profileURL = '';
				var profilURLFull = parent1.href;
				if (profilURLFull.match(/profile\.php\?id\=/i)) {
					profileURL = profilURLFull.split(/\&/)[0];
				} else {
					profileURL = profilURLFull.split(/\?/)[0];
				}
				// Get profile name
				var parent2 = parent1.parentNode.parentNode.parentNode;
				if (!parent2) { j++; continue; }
				var allChilds = parent2.childNodes;
				if (!allChilds || !allChilds[1]) { j++; continue; }
				var nameSpan = allChilds[1].getElementsByTagName('span')[0];
				var profileName = nameSpan.innerText;
				if (profileName) {
					var found = contrib.find(contrib => contrib.url === profileURL);
					if (found) { found.counter++; }
					else {
						contrib.push({ url:profileURL, img:profileImgUrl, name:profileName, counter:1 });
					}
				}
				j++;
			}
      html += '<tr>';
      if (items.ADD_PROF_IMG == true) { html += '<th>Profile Image</th>'; }
      html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Count</th>';
      if (items.ADD_BASE_URI == true) { html += '<th>Origin URL</th>'; }
      html += '</tr>';
      for (var i = 0; i < contrib.length; i++) {
        html += '<tr><td>';
        if (items.ADD_PROF_IMG == true) {
          if (contrib[i].img) { html += '<img src="' + contrib[i].img + '">'; }
          html += '</td><td>';
        }
        if (contrib[i].name   ) { html += contrib[i].name;    } html += '</td><td>';
        if (contrib[i].url    ) { html += contrib[i].url;     } html += '</td><td>';
        if (contrib[i].img    ) { html += contrib[i].img;     } html += '</td><td>';
        if (contrib[i].counter) { html += contrib[i].counter; } html += '</td>';
        if (items.ADD_BASE_URI == true) { html += '<td>' + currURI + '</td>'; }
        html += '</tr>';
        countEl++;
      }
    // Contacts (Messenger)
    } else if (items.DUMP_TYPE === 'dumpContacts') {
      var contactMenu  = document.querySelectorAll('[role="grid"]')[0];
      var contactNodes = contactMenu.querySelectorAll('[role="row"]');
      var contacts     = [];
      for (var i = 0; i < contactNodes.length; i++) {
        var profUrl     = '';		
        var profImg     = '';
        var profName    = '';
        var lastMsg     = '';
        var lastMsgDate = '';
        var c_Url = contactNodes[i].getElementsByTagName('a')[0];
        if (c_Url) {
          if (c_Url.href) {
            profUrl = c_Url.href; // https://www.facebook.com/messages/t/[Contact ID]/
            if (profUrl.includes('messages/t/')) { profUrl = profUrl.replace('messages/t/', ''); }
          }
          var c_Img = c_Url.getElementsByTagName('img')[0];
          if (c_Img) {
            profImg = c_Img.src;
						profName = c_Img.alt;
          }
					var textAll = contactNodes[i].innerText;
					var textParts = textAll.split(/[\r\n]/);
					if (textParts[0]) {
						lastMsgDate = textParts.pop();
						textParts.pop(); textParts.pop();
						lastMsg = textParts.pop();
					}
          var nameNode = c_Url.getElementsByClassName('oo9gr5id')[0];
          if (nameNode && nameNode.innerText) { profName = nameNode.innerText; }
          var msgNodes = c_Url.getElementsByClassName('knvmm38d');
          if (msgNodes[msgNodes.length-1] && msgNodes[msgNodes.length-1].innerText) {
            var msgParts = msgNodes[msgNodes.length-1].innerText.split(/[\r\n]/);
            lastMsg      = msgParts[0];
            lastMsgDate  = msgParts[msgParts.length-1];
          }
          if (profUrl && profImg && profName) {
            contacts.push({ url:profUrl, img:profImg, name:profName, lastMsg:lastMsg, lastMsgDate:lastMsgDate });
          }
        }
      }
      html += '<tr>';
      if (items.ADD_PROF_IMG == true) { html += '<th>Profile Image</th>'; }
      html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Last message</th><th>Last message date</th>';
      if (items.ADD_BASE_URI == true) { html += '<th>Origin URL</th>'; }
      html += '</tr>';
      for (var i = 0; i < contacts.length; i++) {
        html += '<tr><td>';
        if (items.ADD_PROF_IMG == true) {
          if (contacts[i].img) { html += '<img src="' + contacts[i].img + '">'; }
          html += '</td><td>';
        }
        if (contacts[i].name       ) { html += contacts[i].name;        } html += '</td><td>';
        if (contacts[i].url        ) { html += contacts[i].url;         } html += '</td><td>';
        if (contacts[i].img        ) { html += contacts[i].img;         } html += '</td><td>';
        if (contacts[i].lastMsg    ) { html += contacts[i].lastMsg;     } html += '</td><td>';
        if (contacts[i].lastMsgDate) { html += contacts[i].lastMsgDate; } html += '</td>';
        if (items.ADD_BASE_URI == true) { html += '<td>' + currURI + '</td>'; }
        html += '</tr>';
        countEl++;
      }
    }
    if (items.DUMP_TYPE !== 'allFriends' && items.DUMP_TYPE !== 'allContrib' && items.DUMP_TYPE !== 'allLikes' &&
        items.DUMP_TYPE !== 'album'      && items.DUMP_TYPE !== 'allAlbums') {
      html += '</table>';
      var newTab = window.open("", "", "");
      newTab.document.write(html);
    }
  });
}

// Dump all friends
async function dumpAllFriends(addProfImg, addBaseUri, timeToWait) {
  var currURI         = document.baseURI;
  var friends         = [];
  var friendGroupNode = document.querySelectorAll('[role="tablist"]')[1].parentNode.parentNode.parentNode;
  var tabNodes        = friendGroupNode.querySelectorAll('[role="tab"]');
  var newWindow       = window.open("", "DumpItBlue processing...", "width=1000,height=800");
  for (var i = 1; i < tabNodes.length; i++) {
    var currCat = tabNodes[i].innerText;
    console.log('Opening ' + currCat + ' in a new window');
	  var currCatURL = tabNodes[i].href;
		newWindow.opener.log(currCatURL);
    newWindow.location.assign(currCatURL);
    // Scroll the page
    newWindow.opener.log('Sleep for 5 seconds - Loading the page');
    await sleep(timeToWait*5);
		newWindow.opener.log('Scrolling the page');
    var offsetBefore = 0;
    var offsetAfter  = 100;
    while (!((newWindow.innerHeight + newWindow.scrollY) >= newWindow.document.body.offsetHeight) || offsetBefore != offsetAfter) {
      offsetBefore = newWindow.document.body.offsetHeight;
      newWindow.scrollTo(0,newWindow.document.body.scrollHeight);
      await sleep(timeToWait);
      offsetAfter = newWindow.document.body.offsetHeight;
      if (((newWindow.innerHeight + newWindow.scrollY) >= newWindow.document.body.offsetHeight) || offsetBefore == offsetAfter) { // Try five more times
        var j = 0;
        while (offsetBefore == offsetAfter && j < 5) { // While pos in page didn't move
          newWindow.scrollTo(0, newWindow.document.body.scrollHeight);
          await sleep(timeToWait);
          offsetAfter = newWindow.document.body.offsetHeight;
          j++;
        }
        if (offsetBefore == offsetAfter) { break; } // End of page has been reached
      }
    }		
    // Dump the friends
		newWindow.opener.log('Dumping friends from ' + currCat);
		friendGroupNode = newWindow.document.querySelectorAll('[role="tablist"]')[1].parentNode.parentNode.parentNode;
		var friendNodes = friendGroupNode.getElementsByTagName('img');
		for (var j = 0; j < friendNodes.length; j++) {
			var profUrl     = '';
			var profImg     = '';
			var profName    = '';
			var profDetails = '';
			profImg         = friendNodes[j].src;
			profUrl         = friendNodes[j].parentNode.href;
			var friendNode  = friendNodes[j].parentNode.parentNode.parentNode;
			if (friendNode.childNodes[1] && 
					friendNode.childNodes[1].childNodes[0]) {
				if (friendNode.childNodes[1].childNodes[0].innerText) {
					profName    = friendNode.childNodes[1].childNodes[0].innerText;
				}
				if (friendNode.childNodes[1].childNodes[1] &&
						friendNode.childNodes[1].childNodes[1].innerText) {
					profDetails = friendNode.childNodes[1].childNodes[1].innerText;
				}
			} else { // Work category
				friendNode = friendNode.parentNode;
				profUrl    = friendNode.parentNode.parentNode.href;
				if (friendNode.childNodes[1] && 
						friendNode.childNodes[1].childNodes[0] &&
						friendNode.childNodes[1].childNodes[0].childNodes[0]) {
					if (friendNode.childNodes[1].childNodes[0].childNodes[0].innerText) {
						profName    = friendNode.childNodes[1].childNodes[0].childNodes[0].innerText;
					}
					if (friendNode.childNodes[1].childNodes[0].childNodes[1].innerText) {
						profDetails = friendNode.childNodes[1].childNodes[0].childNodes[1].innerText;
					}
				}
			}
			if (profName) {
				friends.push({ cat:currCat, catURL:currCatURL, url:profUrl, img:profImg, name:profName, details:profDetails, });
			}
    }
  }
  newWindow.location.assign("about:blank");
  var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
  html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: medium; } ';
  html += 'th { font-weight: bold; text-align: center; }</style>';
  html += '</head><table style="margin: auto;">';
  html += '<tr><th>Category</th>';
  if (addProfImg == true) { html += '<th>Profile Image</th>'; }
  html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Profile Details</th>';
  if (addBaseUri == true) { html += '<th>Origin URL</th>'; }
  html += '</tr>';
  for (var i = 0; i < friends.length; i++) {
    html += '<tr><td>';
    if (friends[i].cat    ) { html += friends[i].cat;     } html += '</td><td>';
    if (addProfImg == true) {
      if (friends[i].img) { html += '<img src="' + friends[i].img + '">'; }
      html += '</td><td>';
    }
    if (friends[i].name   ) { html += friends[i].name;    } html += '</td><td>';
    if (friends[i].url    ) { html += friends[i].url;     } html += '</td><td>';
    if (friends[i].img    ) { html += friends[i].img;     } html += '</td><td>';
    if (friends[i].details) { html += friends[i].details; } html += '</td>';
    if (addBaseUri == true) {
      html += '<td>';
      if (friends[i].catURL) { html += friends[i].catURL; }
      html += '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  newWindow.document.write(html);
}

// Dump all profiles (contributors or likes)
async function dumpAllProfiles(type, addProfImg, addBaseUri, timeToWait) {
  var currURI  = document.baseURI;
  var allPosts = document.querySelectorAll('[role="article"]');
  var profiles = [];
	// For each post
	for (var k = 0; k < allPosts.length; k++) {
		var countEl = 0;
	  // Get the like & comment toolbar
  	var toolbar = allPosts[k].querySelector('[role="toolbar"]');
		if (!toolbar) { console.log('No toolbar'); continue; }
		var dialogButton;
		if (type == 1) {
			var parentNode = toolbar.parentNode.parentNode.parentNode;
			var childs;
			if (parentNode) {
				childs = parentNode.childNodes[0].childNodes;
			}
			if (childs && childs[1]) {
				dialogButton = childs[1].querySelector('[role="button"]');
			}
		} else if (type == 2) {
			var allLikeButtons = toolbar.parentNode.getElementsByTagName('div');
			if (allLikeButtons && allLikeButtons[allLikeButtons.length-2]) {
				dialogButton = allLikeButtons[allLikeButtons.length-2];
			}
		}
		if (!dialogButton) { console.log('No like or comment button'); continue;  }
		// Open the popup
		dialogButton.click();
		console.log('Wait for loading...');
		await sleep(timeToWait*2);
		console.log('Loaded...');
		var dialog;
		var allDialogs = document.querySelectorAll('[role="dialog"]');
		// Test if the comment dialog is open
		for (var i = 0; i < allDialogs.length; i++) {
			var closeButton = allDialogs[i].querySelector('[aria-label="Close"]');
			if (closeButton) { dialog = allDialogs[i]; }
		}
		if (!dialog) { console.log('No like or comment dialog'); continue;  }
		if (type == 1) {
			// Show all comments
			var commentSection = dialog.getElementsByTagName('h3');
			var allIcons = commentSection[1].parentNode.getElementsByTagName('i');
			var selectBox;
			for (var n = 0; n < allIcons.length; n++) {
				if (allIcons[n].style.backgroundImage.match("rQp6okZNzWW.png") && 
				    allIcons[n].style.backgroundPosition.match("-17px -143px")) {
					selectBox = allIcons[n];
					break;
				}
			}
			if (selectBox) {
				selectBox.click();
				await sleep(2000);
				var allSelectBox = document.querySelectorAll('[role="menuitem"]');
				if (allSelectBox && allSelectBox[0]) { allSelectBox[0].click(); }
			}
		}
		// Scroll the popup
		var allImages = dialog.getElementsByTagName('image');
		var nbrItemsBefore = allImages.length;
		var nbrItemsAfter  = nbrItemsBefore + 1;
		while (nbrItemsAfter > nbrItemsBefore) {
			// Scroll the popup
			console.log('Scrolling');
			allImages = dialog.getElementsByTagName('image');
			nbrItemsBefore = allImages.length;
			for (var i = 0; i < allImages.length; i++) {
				allImages[i].parentNode.parentNode.scrollIntoView(true);
			}
			await sleep(timeToWait*2);
			nbrItemsAfter = allImages.length;
			var j = 0;
			while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
				console.log('Scrolling');
				for (var i = 0; i < allImages.length; i++) {
					allImages[i].parentNode.parentNode.scrollIntoView(true);
				}
				await sleep(timeToWait);
				nbrItemsAfter = allImages.length;
				j++;
			}
		}
		var profilImgTags = dialog.getElementsByTagName('image');
		var j = 0;
		if (type == 1) { j++; }
		while (j < profilImgTags.length) {
			// Get profile image
			var profileImgUrl = profilImgTags[j].getAttributeNS('http://www.w3.org/1999/xlink', 'href');
			var parent1 = profilImgTags[j].parentNode.parentNode.parentNode.parentNode;
			if (!parent1 || !parent1.href) { j++; continue; }
			// Get profile URL
			var profileURL = '';
			var profilURLFull = parent1.href;
			if (profilURLFull.match(/profile\.php\?id\=/i)) {
				profileURL = profilURLFull.split(/\&/)[0];
			} else {
				profileURL = profilURLFull.split(/\?/)[0];
			}
			// Get profile name
			var parent2 = parent1.parentNode.parentNode.parentNode;
			if (!parent2) { j++; continue; }
			var allChilds = parent2.childNodes;
			if (!allChilds || !allChilds[1]) { j++; continue; }
			var nameSpan = allChilds[1].getElementsByTagName('span')[0];
			var profileName = nameSpan.innerText;
			var found = profiles.find(profiles => profiles.url === profileURL);
			if (found) { found.counter++; }
			else { profiles.push({ url:profileURL, img:profileImgUrl, name:profileName, counter:1 }); }
			countEl++;
			j++;
		}
		// Close the popup
		var closeButton = document.querySelector('[aria-label="Close"]');
		if (closeButton) { closeButton.click(); }
		console.log('Number extracted: ' + countEl);
	}
	if (!profiles.length) { alert('No profiles found'); return; }

  // Likes in comments (ToDo)
	
	// Dump the profiles
  var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
  html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: small; }';
  html += 'th { font-weight: bold; text-align: center; }</style>';
  html += '</head><table style="margin: auto;">';
  html += '<tr>';
  if (addProfImg == true) { html += '<th>Profile Image</th>'; }
  html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Count</th>';
  if (addBaseUri == true) { html += '<th>Origin URL</th>'; }
  html += '</tr>';
  for (var k = 0; k < profiles.length; k++) {
    html += '<tr><td>';
    if (addProfImg == true) { 
      if (profiles[k].img) { html += '<img src="' + profiles[k].img + '">'; }
      html += '</td><td>';
    }
    if (profiles[k].name   ) { html += profiles[k].name;    } html += '</td><td>';
    if (profiles[k].url    ) { html += profiles[k].url;     } html += '</td><td>';
    if (profiles[k].img    ) { html += profiles[k].img;     } html += '</td><td>';
    if (profiles[k].counter) { html += profiles[k].counter; } html += '</td>';
    if (addBaseUri == true) { html += '<td>' + currURI + '</td>'; }
    html += '</tr>';
  }
  html += '</table>';
  var newTab = window.open("", "", "");
  newTab.document.write(html);
}

// Dump current album
async function dumpAlbum(smallSizePhotos, fullSizePhotos, timeToWait) {
  var photos = [];
	var albumName;
	var type = 1;
  // Get album name and url
  var albumURL    = document.baseURI;
	var photosNodes = document.querySelectorAll('[role="listitem"]'); // Some page and group album type
	console.log(photosNodes.length);
	if (photosNodes.length > 0) {
		// Get the album name (toDo)
		type = 2;
  } else {
		var mainTag      = document.querySelectorAll('[role="main"]');
		var albumSection = mainTag[0].childNodes[5];
		var albumHeader  = albumSection.getElementsByTagName('div')[0];
		if (albumHeader) {
			albumName   = albumHeader.getElementsByTagName('span')[0].innerText;
			photosNodes = albumHeader.getElementsByTagName('img');
		}
	}
	var newWindow = window.open("", "DumpItBlue processing...", "width=1000,height=600");
	for (var k = 0; k < photosNodes.length; k++) {
		if (type == 1 && k == 0) { continue; } // Skip the first image for normal album
		var photoURL1 = '';
		var photoImg1 = '';
		var photoImg2 = '';
		if (type == 2) {
			if (photosNodes[k].getElementsByTagName('img').length > 0) {
				photoImg1 = photosNodes[k].getElementsByTagName('img')[0].src;
				photoURL1 = photosNodes[k].getElementsByTagName('a')[0].href;
			}
		} else {
			photoImg1 = photosNodes[k].src;
			photoURL1 = photosNodes[k].parentNode.href;
		}
		if (photoURL1) {
			console.log('photourl: ' + photoURL1);
			if (fullSizePhotos) {
				newWindow.opener.log('Open the photo URL - ' + photoURL1);
				newWindow.location.assign(photoURL1);
				newWindow.opener.log('Wait while loading page');
				await sleep(timeToWait*5);
				newWindow.opener.log('Search full size image');
				var div = newWindow.document.querySelectorAll('div[data-name="media-viewer-nav-container"]');
				var fullSizeImg;
				if (div) { fullSizeImg = div[0].parentNode.getElementsByTagName('img'); }
				if (!fullSizeImg) { console.log('Unable to find the image'); }
				else if (fullSizeImg[0] && fullSizeImg[0].src) {
					newWindow.opener.log('Save full size photo details');
					photoImg2 = fullSizeImg[0].src;
				}
			}
		}
		if (photoURL1 && photoImg1) {
			photos.push({ urlPhoto:photoURL1, smallSize:photoImg1, fullSize:photoImg2 });
		}
	}
  newWindow.location.assign("about:blank");
  var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
  html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: small; }';
  html += 'th { font-weight: bold; text-align: center; }</style>';
  html += '</head><table style="margin: auto;">';
  html += '<tr><th>Album Name</th><th>Album URL</th>';
  if (smallSizePhotos) {
    html += '<th>Photo (small)</th><th>Small photo URL</th>';
  }
  html += '<th>Page URL</th>';
  if (fullSizePhotos ) {
    html += '<th>Photo (full size)</th><th>Full size photo URL</th>';
  }
  html += '</tr>';
  for (var k = 0; k < photos.length; k++) {
    html += '<tr><td>';
    if (albumName) { html += albumName; } html += '</td><td>';
    if (albumURL ) { html += albumURL;  } html += '</td><td>';
    if (smallSizePhotos == true) {
      if (photos[k].smallSize) { html += '<img src="' + photos[k].smallSize + '" style="max-width: 150px">'; } html += '</td><td>';
      if (photos[k].smallSize) { html += photos[k].smallSize; } html += '</td><td>';
    }
    if (photos[k].urlPhoto  ) { html += photos[k].urlPhoto; } html += '</td>';
    if (fullSizePhotos == true) {
      html += '<td>';
      if (photos[k].fullSize) { html += '<img src="' + photos[k].fullSize + '" style="max-width: 250px">'; } html += '</td><td>';
      if (photos[k].fullSize) { html += photos[k].fullSize; } html += '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  newWindow.document.write(html);
  await sleep(1000);
  newWindow.alert('Use "Save as" dialog to save all the photos.');
}

// Dump All albums
async function dumpAllAlbums(smallSizePhotos, fullSizePhotos, timeToWait) {
  var photos = [];
  // Get album name and url
	var sectionTitleTag = document.getElementsByTagName('h2')[0];
	var photosSection   = sectionTitleTag.parentNode.parentNode.parentNode.parentNode.parentNode;
	var albumCovers     = photosSection.getElementsByTagName('img');
  var newWindow       = window.open("", "DumpItBlue processing...", "width=1000,height=600");
  for (var i = 0; i < albumCovers.length; i++) {
	  var albumURLTag = albumCovers[i].parentNode;
		while (!albumURLTag.href) { albumURLTag = albumURLTag.parentNode; }
    if (albumURLTag.href.includes('/media/set')) {
      // Open the album page
      var albumURL  = albumURLTag.href;
			var albumName = albumURLTag.innerText.split(/[\r\n]/)[0];
      newWindow.opener.log('Open the album URL - ' + albumURL);
      newWindow.location.assign(albumURL);
			newWindow.document.domain = "facebook.com";
      // Scroll the album page
      newWindow.opener.log('Wait while loading the page');
      await sleep(timeToWait*5);
      newWindow.opener.log('Scroll the page');
      var offsetBefore = 0;
      var offsetAfter  = 100;
      while (!((newWindow.innerHeight + newWindow.scrollY) >= newWindow.document.body.offsetHeight) || offsetBefore != offsetAfter) {
        offsetBefore = newWindow.document.body.offsetHeight;
        newWindow.scrollTo(0,newWindow.document.body.scrollHeight);
        await sleep(timeToWait);
        offsetAfter = newWindow.document.body.offsetHeight;
        if (((newWindow.innerHeight + newWindow.scrollY) >= newWindow.document.body.offsetHeight) || offsetBefore == offsetAfter) { // Try five more times
          var j = 0;
          while (offsetBefore == offsetAfter && j < 5) { // While pos in page didn't move
            newWindow.scrollTo(0, newWindow.document.body.scrollHeight);
            await sleep(timeToWait);
            offsetAfter = newWindow.document.body.offsetHeight;
            j++;
          }
          if (offsetBefore == offsetAfter) { break; } // End of page has been reached
        }
      }
      newWindow.opener.log('Gather small photos data');
			// Get album name and url
			var type = 1;
			var photosNodes = newWindow.document.querySelectorAll('[aria-label="Photo album photo"]'); // Some page and group album type
			if (photosNodes.length > 0) {
				type = 2;
			} else {
				var mainTag      = newWindow.document.querySelectorAll('[role="main"]');
				var albumSection = mainTag[0].childNodes[5];
				var albumHeader  = albumSection.getElementsByTagName('div')[0];
				if (albumHeader) {
					albumName   = albumHeader.getElementsByTagName('span')[0].innerText;
					photosNodes = albumHeader.getElementsByTagName('img');
				}
			}
			// Gather small photos data
			for (var k = 0; k < photosNodes.length; k++) {
				if (type == 1 && k == 0) { continue; } // Skip the first image for normal album
				var photoURL1 = '';
				var photoImg1 = '';
				var photoImg2 = '';
				if (type == 2) {
					if (photosNodes[k].getElementsByTagName('img').length > 0) {
						photoImg1 = photosNodes[k].getElementsByTagName('img')[0].src;
						photoURL1 = photosNodes[k].getElementsByTagName('a')[0].href;
					}
				} else {
					photoImg1 = photosNodes[k].src;
					photoURL1 = photosNodes[k].parentNode.href;
				}
				if (photoURL1) {
					console.log('photourl: ' + photoURL1);
					if (fullSizePhotos) {
						newWindow.opener.log('Open the photo URL - ' + photoURL1);
						newWindow.location.assign(photoURL1);
						newWindow.opener.log('Wait while loading page');
						await sleep(timeToWait*5);
						newWindow.opener.log('Search full size image');
						var div = newWindow.document.querySelectorAll('div[data-name="media-viewer-nav-container"]');
						if (div[0]) {
							var fullSizeImg = div[0].parentNode.getElementsByTagName('img');
							if (!fullSizeImg) { console.log('Unable to find the image'); }
							else if (fullSizeImg[0] && fullSizeImg[0].src) {
								newWindow.opener.log('Save full size photo details');
								photoImg2 = fullSizeImg[0].src;
							}
						}
					}
				}
				if (photoURL1 && photoImg1) {
					photos.push({ albumName:albumName, albumURL:albumURL, urlPhoto:photoURL1, smallSize:photoImg1, fullSize:photoImg2 });
				}
			}
		}
  }
  newWindow.location.assign("about:blank");
  var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
  html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: small; }';
  html += 'th { font-weight: bold; text-align: center; }</style>';
  html += '</head><table style="margin: auto;">';
  html += '<tr><th>Album Name</th><th>Album URL</th>';
  if (smallSizePhotos) {
    html += '<th>Photo (small)</th><th>Small photo URL</th>';
  }
  html += '<th>Page URL</th>';
  if (fullSizePhotos ) {
    html += '<th>Photo (full size)</th><th>Full size photo URL</th>';
  }
  html += '</tr>';
  for (var k = 0; k < photos.length; k++) {
    html += '<tr><td>';
    if (photos[k].albumName) { html += photos[k].albumName; } html += '</td><td>';
    if (photos[k].albumURL ) { html += photos[k].albumURL;  } html += '</td><td>';
    if (smallSizePhotos == true) {
      if (photos[k].smallSize) { html += '<img src="' + photos[k].smallSize + '" style="max-width: 150px">'; } html += '</td><td>';
      if (photos[k].smallSize) { html += photos[k].smallSize; } html += '</td><td>';
    }
    if (photos[k].urlPhoto  ) { html += photos[k].urlPhoto; } html += '</td>';
    if (fullSizePhotos == true) {
      html += '<td>';
      if (photos[k].fullSize) { html += '<img src="' + photos[k].fullSize + '" style="max-width: 250px">'; } html += '</td><td>';
      if (photos[k].fullSize) { html += photos[k].fullSize; } html += '</td>';
    }
    html += '</tr>';
  }
  html += '</table>';
  newWindow.document.write(html);
  await sleep(1000);
  newWindow.alert('Use "Save as" dialog to save all the photos.');
}

// Show/Hide
function show_hide() {
  chrome.storage.local.get(null, function(items) {
    // Show/Hide navigation bar bar
		if (items.REM_BLUEBAR == true) {
			var selectNode = document.querySelector('[role="banner"]');
			if (selectNode) {
				if (items.SHOW == 0) { selectNode.style.display = "none";  }
				else                 { selectNode.style.display = "block"; }
			}
		}
    // Show/Hide comments
		if (items.REM_COMMENTS == true) {
			var reactSelectNodes = document.querySelectorAll('[role="toolbar"]');
			for (var i = (reactSelectNodes.length-1); i >= 0; i--) {
				if (items.SHOW == 0) {
					reactSelectNodes[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = "none";
				} else {
					reactSelectNodes[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = "block";
				}
			}
		}
    // Show/Hide Write Comment Box
		if (items.REM_COMMENTS_BOX == true) {
			var WCSelectNodes = document.querySelectorAll('[aria-label="Available Voices"]');
			for (var i = (WCSelectNodes.length-1); i >= 0; i--) {
				if (items.SHOW == 0) {
					WCSelectNodes[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = "none";
				} else {
					WCSelectNodes[i].parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = "block";
				}
			}
			var writeSomething = document.querySelector('[aria-label="Profile"]');
			if (writeSomething) {
				writeSomething.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.style.display = "none";
			}
		}
  });
}

// Isolate scrollable
function isolate() {
  chrome.storage.local.get(null, function(items) {
      // Remove navigation bar and menu
			var selectNode = document.querySelector('[role="banner"]');
			if (selectNode) { selectNode.remove(); }
      // Posts (People and page)
      if (items.PROF_TYPE === 'posts') {
				var mainNode = document.querySelector('[role="main"]');
				var childs   = mainNode.childNodes;
				for (var i = (childs.length-2); i >= 0; i--) { childs[i].remove(); }
				var childs2 = childs[childs.length-1].childNodes;
				var temp = childs2[2].childNodes[0].childNodes[0];
				temp.remove();
				childs2[1].remove();
				// Remove all classes
				var currentNode = childs2[1].childNodes[0].childNodes[0];
				while (!currentNode.id) {
					currentNode.className = '';
					currentNode = currentNode.parentNode;
				}
      // Group
      } else if (items.PROF_TYPE === 'group') {
				var navMenu = document.querySelector('[role="navigation"]');
				if (navMenu) { navMenu.remove(); }
				var mainNode = document.querySelectorAll('[role="main"]')[0];
				var childs   = mainNode.childNodes;
				for (var i = (childs.length-2); i >= 0; i--) { childs[i].remove(); }
				mainNode.childNodes[0].childNodes[2].childNodes[4].childNodes[0].childNodes[0].childNodes[0].style.display = "none"; // Can't remove, so hide
				// Remove all classes
				var currentNode = mainNode.childNodes[0].childNodes[2].childNodes[4].childNodes[0].childNodes[0].childNodes[0];
				while (!currentNode.id) {
					currentNode.className = '';
					currentNode = currentNode.parentNode;
				}
      // Event
      } else if (items.PROF_TYPE === 'event') {
				var navMenu = document.querySelector('[role="navigation"]');
				if (navMenu) { navMenu.remove(); }
				var mainNode = document.querySelectorAll('[role="main"]')[1];
				var childs   = mainNode.childNodes;
				for (var i = (childs.length-2); i >= 0; i--) { childs[i].remove(); }
				childs[0].childNodes[0].childNodes[0].childNodes[1].style.display = "none";
				// Remove all classes
				var currentNode = childs[0].childNodes[0].childNodes[0].childNodes[0];
				while (!currentNode.id) {
					currentNode.className = '';
					currentNode = currentNode.parentNode;
				}
      // Messenger current chat
			} else if (items.PROF_TYPE === 'messenger') {
			// Remove contacts
			var navMenu = document.querySelector('[role="navigation"]');
			if (navMenu) { navMenu.remove(); }
			// Remove right info
			var mainNode = document.querySelectorAll('[role="main"]')[0];
			var childs   = mainNode.childNodes[0].childNodes[0].childNodes[0].childNodes;
			if (childs[1]) { childs[1].remove(); }
			if (childs[0].childNodes[0]) { childs[0].childNodes[0].childNodes[0].remove(); } // Remove conversation title
			// Remove bottom
			var writeBar = document.querySelector('[role="group"]');
			if (writeBar) { writeBar.parentNode.remove(); }
			// Remove all classes
			var currentNode = mainNode.querySelector('[role="grid"]');
			while (!currentNode.id) {
				currentNode.className = '';
				currentNode = currentNode.parentNode;
			}
		// Messenger contacts
		} else if (items.PROF_TYPE === 'messContacts') {
			// Remove conversation
			var mainNode = document.querySelectorAll('[role="main"]')[0];
			if (mainNode) { mainNode.parentNode.parentNode.parentNode.parentNode.remove(); }
			var currentNode = document.querySelector('[role="navigation"]').childNodes[0].childNodes[0];
			while (!currentNode.id || (currentNode.id && !currentNode.id.match(/mount_0_0/))) {
				currentNode.className = '';
				currentNode = currentNode.parentNode;
			}
		}
    if (items.PRINT == true) { window.print();         }
    else                     { alert('End isolating'); }
  });
}

// Search conversation in current page
async function searchMobileChat (fbid) {
  var el = document.getElementsByClassName('_5b6s');
  if (!el) { return; }
  var regex = new RegExp(fbid);
  for (var i = 0; i < el.length; i++) {
    if (el[i].href && el[i].href.match(regex)) { el[i].click(); return; }
  }
  var scrollingLink = document.getElementsByClassName('touchable primary')[0];
  while (scrollingLink) {
    scrollingLink.click();
    await sleep(1000);
    el = document.getElementsByClassName('_5b6s');
    for (var i = (el.length-1); i >= 0; i--) {
      if (el[i].href && el[i].href.match(regex)) { el[i].click(); return; }
    }
    scrollingLink = document.getElementsByClassName('touchable primary')[0];
  }    
}

// Open conversation in Facebook Mobile
chrome.storage.local.get(null, function(items) {
	var currUrl = location.href;
	if (currUrl.includes('https://m.facebook.com/messages') && items.FBID) { searchMobileChat(items.FBID); }
});