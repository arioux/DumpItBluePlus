'use strict';

// Listen messages from popup
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  if (request.type == "scroll") {
    console.log('scrolling');
    scrollFunctions();
    sendResponse({msg: "scrolling started"});
  } else if (request.type == "expand") {
    console.log('expanding');
    expandFunctions();
    sendResponse({msg: "expanding started"});
  } else if (request.type == "remove") {
    console.log('removing');
    remove();
    sendResponse({msg: "removing started"});
  } else if (request.type == "isolate") {
    console.log('isolating');
    isolate();
    sendResponse({msg: "isolating started"});
  } else if (request.type == "datetime") {
    console.log('datetime');
    datetime();
    sendResponse({msg: "Show datetime started"});
  } else if (request.type == "translate") {
    console.log('translating');
    translate();
    sendResponse({msg: "Translating started"});
  } else if (request.type == "openMobile") {
    console.log('Open in Facebook Mobile');
    openMobile();
    sendResponse({msg: "Opening in Facebook Mobile started"});
  } else if (request.type == "currFBID") {
    var linkCode = document.getElementsByClassName('profilePicThumb')[0]; // person page
    var fbid     = '-';
    if (linkCode) {
      console.log('person page');
      var linkHref = linkCode.href;
      var regex = /fbid=([0-9]+)/i;
      var match = linkHref.match(regex);
      if (match && match.length > 0) {
        fbid = match[1];
        chrome.storage.local.set({ 'PROF_TYPE': 'person' });
      }
      regex = /profile_id=([0-9]+)/i; // My own page
      match = linkHref.match(regex);
      if (match && match.length > 0) {
        fbid = match[1];
        chrome.storage.local.set({ 'PROF_TYPE': 'person' });
      }
    } else {
      linkCode = document.getElementsByClassName('_2dgj')[0]; // business page
      if (linkCode) {
        console.log('business page');
        var linkHref = linkCode.href;
        var regex = /\/([^\/]+)\/photos/i;
        var match = linkHref.match(regex);
        if (match && match.length > 0) {
          fbid = match[1];
          chrome.storage.local.set({ 'PROF_TYPE': 'page' });
        }
      } else {
        linkCode = document.getElementsByClassName('_4adj')[0]; // group page
        if (linkCode) {
          console.log('group page');
          var linkHref = linkCode.id;
          var regex = /headerAction_([0-9]+)/i;
          var match = linkHref.match(regex);
          if (match && match.length > 0) {
            fbid = match[1];
            chrome.storage.local.set({ 'PROF_TYPE': 'group' });
          }
        } else {
          linkCode = document.getElementsByClassName('_4258')[0]; // event page
          if (linkCode) {
            console.log('event page');
            var linkHref = linkCode.getAttribute("ajaxify");
            var regex = /fbid=([0-9]+)/i;
            var match = linkHref.match(regex);
            if (match && match.length > 0) {
              fbid = match[1];
              chrome.storage.local.set({ 'PROF_TYPE': 'event' });
            }
          } else {
            linkCode = document.getElementsByClassName('_3eur')[0]; // in messenger
            if (linkCode) {
              console.log('in messenger');
              var linkHTML = linkCode.innerHTML;
              var regex = /uid="([0-9]+)/i;
              var match = linkHTML.match(regex);
              if (match && match.length > 0) {
                fbid = match[1];
                chrome.storage.local.set({ 'PROF_TYPE': 'messenger' });
              }
            } else {
			  linkCode = document.getElementsByClassName('_6ybk')[0]; // in messenger
              if (linkCode) {
                console.log('in messenger');
                var linkHTML = linkCode.innerHTML;
                var regex = /uid="([0-9]+)/i;
                var match = linkHTML.match(regex);
                if (match && match.length > 0) {
                  fbid = match[1];
                  chrome.storage.local.set({ 'PROF_TYPE': 'messenger' });
                }
              } else {
                var currUrl = location.href; // in Facebook Mobile
                var regex = new RegExp('https://m.facebook.com/messages');
                if (currUrl && regex.test(currUrl)) {
                  console.log('in Facebook Mobile');
                  var regex = /%3A([0-9]+)&/i;
                  var match = currUrl.match(regex);
                  if (match && match.length > 0) {
                    fbid = match[1];
                    chrome.storage.local.set({ 'PROF_TYPE': 'mobile' });
                  }
				}
              }
            }
          }
        }
      }
    }
	// If not found, check meta tags
	if (fbid == '-') {
      var metas = document.getElementsByTagName('meta');
      for (let i = 0; i < metas.length; i++) {
        if (metas[i].getAttribute('property') == 'al:ios:url') {
		  var content = metas[i].getAttribute('content');
		  var regex   = /[\/\=]([0-9]+)/i;
		  var match   = content.match(regex);
          if (match && match.length > 0) {
            fbid = match[1];
			console.log(fbid);
			regex = /fb:\/\/([^\/]+)\//i;
			match = content.match(regex);
			if (match && match.length > 0) {
			  var profType;
			  if      (match[1] == 'profile') { profType = 'person'; }
			  else if (match[1] == 'page'   ) { profType = 'page';   }
			  else if (match[1] == 'group'  ) { profType = 'group';  }
			  if (profType) { chrome.storage.local.set({ 'PROF_TYPE': profType }); }
			}
          }
        }
      }
	}
    sendResponse({msg: fbid});
  }
});

// Sleep function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Scroll function
function scrollFunctions() {
  chrome.storage.local.get(null, function(items) {
    console.log('Scroll type: ' + items.SCROLL_TYPE);
    console.log('Scroll limit type: ' + items.SCROLL_LIMIT_TYPE);
    console.log('Scroll limit value: ' + items.SCROLL_LIMIT_VAL);
    if        (items.SCROLL_TYPE == 'chat') {          // Scroll Messenger conversation
      if        (items.SCROLL_LIMIT_TYPE == 'count') { // X times
        scrollChatByCount(items.SCROLL_LIMIT_VAL);
      } else if (items.SCROLL_LIMIT_TYPE == 'date' ) { // Until it reaches a specific date
        console.log('scroll by date');
        scrollChatByDate(items.SCROLL_LIMIT_VAL);
      } else {                                         // No limit
        scrollChatNoLimit();
      }
    } else if (items.SCROLL_TYPE == 'contact') {       // Scroll contact list
      if        (items.SCROLL_LIMIT_TYPE == 'count') { // X times
        scrollContactsByCount(items.SCROLL_LIMIT_VAL);
      } else if (items.SCROLL_LIMIT_TYPE == 'date' ) { // Until it reaches a specific date
        scrollContactsByDate(items.SCROLL_LIMIT_VAL);
      } else {                                         // No limit
        scrollContactsNoLimit();
      }
    } else if (items.SCROLL_TYPE == 'chatMobile') {    // Scroll chat in Facebook Mobile
      if        (items.SCROLL_LIMIT_TYPE == 'count') { // X times
        scrollChatMBByCount(items.SCROLL_LIMIT_VAL);
      } else if (items.SCROLL_LIMIT_TYPE == 'date' ) { // Until it reaches a specific date
        scrollChatMBByDate(items.SCROLL_LIMIT_VAL);
      } else {                                         // No limit
        scrollChatMBNoLimit();
      }
    } else {                                           // Scroll a page
      if        (items.SCROLL_LIMIT_TYPE == 'count') { // X times
      console.log('scroll with count');
        scrollPageByCount(items.SCROLL_LIMIT_VAL);
      } else if (items.SCROLL_LIMIT_TYPE == 'date' ) { // Until it reaches a specific date
        scrollPageByDate(items.SCROLL_LIMIT_VAL);
      } else {                                         // No limit
        scrollPageNoLimit();
      }
    }
  });
}

// Scroll conversation by count
async function scrollChatByCount(countVal) {
  var scrollState = true;
  var i = 0;
  while (i < countVal && scrollState == true) {
    var scrollingDiv = (document.getElementsByClassName('_2k8v'))[0];
    if (scrollingDiv) { scrollingDiv.scrollIntoView(true); }
    else { break; }
    await sleep(1000);
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
    i++;
  }
  alert('End scrolling');
}

// Scroll conversation by date
async function scrollChatByDate(stopDate) {
  var allDates = document.querySelectorAll("time._3oh-");
  if (allDates.length) {
    var lastDisplayedDate = allDates[0].innerHTML;
    var date1 = new Date(lastDisplayedDate);
    var date2 = new Date(stopDate);
    var scrollState = true;
    while (date1 > date2 && scrollState == true) {
      var scrollingDiv = (document.getElementsByClassName('_2k8v'))[0];
      if (scrollingDiv) { scrollingDiv.scrollIntoView(true); }
      else { break; }
      await sleep(1000);
      lastDisplayedDate = document.querySelectorAll("time._3oh-")[0].innerHTML;
      date1 = new Date(lastDisplayedDate);
      chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
        scrollState = items.SCROLL_STATE;
      });
    }
    alert('End scrolling');
  }
}

// Scroll conversation to top
async function scrollChatNoLimit() {
  var scrollingDiv = (document.getElementsByClassName('_2k8v'))[0];
  var scrollState = true;
  while (scrollingDiv && scrollState == true) {
    scrollingDiv.scrollIntoView(true);
    await sleep(1000);
    scrollingDiv = (document.getElementsByClassName('_2k8v'))[0];
    if (!scrollingDiv) {
      console.log('Sleep for 5 seconds');
      await sleep(5000);
      scrollingDiv = (document.getElementsByClassName('_2k8v'))[0];
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  }
  alert('End scrolling');
}

// Scroll contacts by count
async function scrollContactsByCount(countVal) {
  var scrollState = true;
  var i = 0;
  while (i < countVal && scrollState == true) {
    var scrollingDiv = (document.getElementsByClassName('_1ht1'))[document.getElementsByClassName('_1ht1').length-1];
    if (scrollingDiv) { scrollingDiv.scrollIntoView(false); }
    else { break; }
    await sleep(1000);
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
    i++;
  }
  alert('End scrolling');
}

// Scroll contacts by date
async function scrollContactsByDate(stopDate) {
  var allDates = document.getElementsByClassName('_1ht7');
  if (allDates.length) {
    var lastDisplayedDate = allDates[allDates.length-1].innerText;
    var partsDate     = lastDisplayedDate.split('-');
    partsDate[0]      = parseInt(partsDate[0]) + 2000;
    lastDisplayedDate = partsDate.join('-');
    var date1 = new Date(lastDisplayedDate);
    var date2 = new Date(stopDate);
    var scrollState = true;
    while (date1 > date2 && scrollState == true) {
      var scrollingDiv = (document.getElementsByClassName('_1ht1'))[document.getElementsByClassName('_1ht1').length-1];
      scrollingDiv.scrollIntoView(false); // Scroll to the last contact
      await sleep(1000);
      allDates = document.getElementsByClassName('_1ht7');
      lastDisplayedDate = allDates[allDates.length-1].innerText;
      var partsDate     = lastDisplayedDate.split('-');
      partsDate[0]      = parseInt(partsDate[0]) + 2000;
      lastDisplayedDate = partsDate.join('-');
      date1 = new Date(lastDisplayedDate);
      chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
        scrollState = items.SCROLL_STATE;
      });
    }
    alert('End scrolling');
  }
}

// Scroll contacts completely
async function scrollContactsNoLimit() {
  var scrollState        = true;
  var totalContactBefore = document.getElementsByClassName('_1ht1').length;
  var scrollingDiv       = (document.getElementsByClassName('_1ht1'))[totalContactBefore-1]; // Last displayed contact
  var totalContactAfter  = totalContactBefore + 1;
  while (totalContactAfter > totalContactBefore && scrollState == true) {
    totalContactBefore = document.getElementsByClassName('_1ht1').length;
    scrollingDiv       = (document.getElementsByClassName('_1ht1'))[totalContactBefore-1]; // Last displayed contact
    scrollingDiv.scrollIntoView(false); // Scroll to the last contact
    await sleep(1000);
    totalContactAfter = document.getElementsByClassName('_1ht1').length;
    if (totalContactAfter == totalContactBefore) {
      await sleep(5000);
      totalContactAfter = document.getElementsByClassName('_1ht1').length;
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  }
  (document.getElementsByClassName('_1ht1'))[0].scrollIntoView(true);
  alert('End scrolling');
}

// Scroll chat in Facebook Mobile by count
async function scrollChatMBByCount(countVal) {
  var scrollState = true;
  var i = 0;
  while (i < countVal && scrollState == true) {
    var scrollingLink = (document.getElementsByClassName('touchable primary'))[0];
    if (scrollingLink) { scrollingLink.click(); }
    else { break; }
    await sleep(1000);
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
    i++;
  window.scrollTo(0,0);
  }
  alert('End scrolling');
}

// Scroll chat in Facebook Mobile by date
async function scrollChatMBByDate(stopDate) {
  var allDates = document.getElementsByTagName('abbr');
  if (allDates.length) {
    var lastDisplayedDate = allDates[0].innerText;
    var date1 = new Date(lastDisplayedDate);
    var date2 = new Date(stopDate);
    var scrollState = true;
    while (date1 > date2 && scrollState == true) {
      var scrollingLink = (document.getElementsByClassName('touchable primary'))[0];
      if (scrollingLink) { scrollingLink.click(); }
      else { break; }
      await sleep(1000);
      lastDisplayedDate = document.getElementsByTagName('abbr')[0];
      if (lastDisplayedDate) { date1 = new Date(lastDisplayedDate.innerText); }
      chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
        scrollState = items.SCROLL_STATE;
      });
    window.scrollTo(0,0);
    }
    alert('End scrolling');
  }
}

// Scroll chat in Facebook Mobile to top
async function scrollChatMBNoLimit() {
  var scrollingLink = (document.getElementsByClassName('touchable primary'))[0];
  var scrollState = true;
  while (scrollingLink && scrollState == true) {
    scrollingLink.click();
    await sleep(1000);
    scrollingLink = (document.getElementsByClassName('touchable primary'))[0];
    if (!scrollingLink) {
      console.log('Sleep for 5 seconds');
      await sleep(5000);
      scrollingLink = (document.getElementsByClassName('touchable primary'))[0];
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  window.scrollTo(0,0);
  }
  alert('End scrolling');
}

// Scroll page by count
async function scrollPageByCount(countVal) {
  var scrollState = true;
  var i = 0;
  while (i < countVal && scrollState == true) {
    window.scrollTo(0,document.body.scrollHeight);
    await sleep(1000);
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
    i++;
  }
  window.scrollTo(0,0);
  alert('End scrolling');
}

// Scroll page by date
async function scrollPageByDate(stopDate) {
  var lastDisplayedDate = document.getElementsByClassName('timestampContent')[document.getElementsByClassName('timestampContent').length-1].innerHTML;
  var date1 = new Date(lastDisplayedDate);
  var date2 = new Date(stopDate);
  var scrollState = true;
  while (date1 > date2 && scrollState == true) {
    window.scrollTo(0,document.body.scrollHeight);
    await sleep(1000);
    lastDisplayedDate = document.getElementsByClassName('timestampContent')[document.getElementsByClassName('timestampContent').length-1].innerHTML;
    date1 = new Date(lastDisplayedDate);
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  }
  window.scrollTo(0,0);
  alert('End scrolling');
}

// Scroll page to bottom
async function scrollPageNoLimit() {
  var scrollState = true;
  var lastOffset;
  while ((!((window.innerHeight + window.scrollY) >= document.body.offsetHeight)) && lastOffset != document.body.offsetHeight && scrollState == true) {
  console.log(window.innerHeight + ' ' + window.scrollY + ' ' + document.body.offsetHeight);
  lastOffset = document.body.offsetHeight;
    window.scrollTo(0, document.body.scrollHeight);
    await sleep(1000);
    if (((window.innerHeight + window.scrollY) >= document.body.offsetHeight) || lastOffset == document.body.offsetHeight) {
      console.log('Sleep for 5 seconds');
      await sleep(5000);
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  }
  window.scrollTo(0,0);
  alert('End scrolling');
}

// Expand function
function expandFunctions() {
  chrome.storage.local.get(null, function(items) {
    if (items.EXPAND_SEEMORE  == true) { expandSeeMore(); }
    if (items.EXPAND_POSTS    == true) { expandPosts();   }
    if (items.EXPAND_COMMENTS == true) {
      expandComments1();
      expandComments2();
    }
  });
}

// Expand See more
async function expandSeeMore() {
  var el = document.getElementsByClassName('see_more_link');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('see_more_link');
  }
  alert('End expanding See more');
}

// Expand comments and replies
async function expandComments1() {
  var el = document.getElementsByClassName('_4sxc _42ft');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('_4sxc _42ft');
  }
  alert('End expanding comments/replies');
}

// Expand View 1 comment
async function expandComments2() {
  var el = document.getElementsByClassName('UFIPagerLink');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('UFIPagerLink');
  }
}

// Expand More posts
async function expandPosts() {
  var el = document.getElementsByClassName('_44b2');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('_44b2');
  }
  alert('End expanding More posts');
}

// Remove
function remove() {
  chrome.storage.local.get(null, function(items) {
    // Remove blue bar
    if (items.REM_BLUEBAR == true) {
      var div = document.getElementById("pagelet_bluebar");
      if (div) { div.parentNode.removeChild(div); }
      var div = document.getElementById("timeline_sticky_header_container");
      if (div) { div.parentNode.removeChild(div); }
    }
    // Remove comments
    if (items.REM_COMMENTS == true) {
      var div = document.getElementsByClassName("commentable_item"); // All comment sections
      while (div.length) {
        for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); }
        div = document.getElementsByClassName("commentable_item");
      }
    }
    // Remove Write Comment Box
    if (items.REM_COMMENTS_BOX == true) {
      var div  = document.getElementsByClassName("_43u6");     // Main Write comment box in people
      while (div.length) {
        for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); }
        div = document.getElementsByClassName("_43u6");
      }
	  div  = document.getElementsByClassName("_4efl");         // Write comment inside comments
      while (div.length) {
        for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); }
        div = document.getElementsByClassName("_4efl");
      }
	  div = document.getElementById("PageComposerPagelet_");   // Comment box in page
	  if (div) { div.parentNode.removeChild(div); }
	  div = document.getElementById("pagelet_event_composer"); // Comment box in Event page
	  if (div) { div.parentNode.removeChild(div); }
    }
    // Remove Like bubbles in comments
    if (items.REM_LIKES_INCOM == true) {
      var div = document.getElementsByClassName("_6cuq");      // All Like bubbles in comments
      while (div.length) {
        for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); }
        div = document.getElementsByClassName("_6cuq");
      }
    }
    alert('End removing');
  });
}

// Isolate scrollable
function isolate() {
  chrome.storage.local.get(null, function(items) {
    // Remove useless div
    var div = document.getElementById("pagelet_bluebar");
    if (div) { div.parentNode.removeChild(div); }
        div = document.getElementById("timeline_sticky_header_container");
    if (div) { div.parentNode.removeChild(div); }
        div = (document.getElementsByClassName("uiBoxGray"))[0];
    if (div) { div.parentNode.removeChild(div); }
        div = document.getElementById("pagelet_sidebar");
    if (div) { div.parentNode.removeChild(div); }
        div = document.getElementById("pagelet_dock");
    if (div) { div.parentNode.removeChild(div); }
        div = document.getElementById("pageFooter");
    if (div) { div.parentNode.removeChild(div); }
    // People
    if (items.PROF_TYPE == 'people') {
      // Remove header
      var div = document.getElementById("timeline_top_section");
      if (div) { div.parentNode.removeChild(div); }
      // Remove left column
          div = document.getElementById("timeline_small_column");
      if (div) { div.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(div.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode); }
      // Resize
          div = document.getElementsByClassName('_4bl7')[0];
      if (div.getAttribute("style")) { div.removeAttribute("style"); }
      // Remove all class attributes to adjust content to page width
      div = document.getElementById("timeline_story_column");
      if (div) {
        while (div = div.parentNode) {
          if (div.className) { div.className = ''; }
        }
      }
      if (items.PRINT == true) { window.print(); }
	  else                     { alert('End isolating'); }
    // Page
    } else if (items.PROF_TYPE == 'page') {
      // Remove header
      var div = (document.getElementsByClassName("_1pfm"))[0];
      if (div) { div.parentNode.removeChild(div); }
      // Remove left menu
          div = document.getElementById("entity_sidebar");
      if (div) { div.parentNode.parentNode.parentNode.removeChild(div.parentNode.parentNode); }
      // Remove rigth column
          div = document.getElementsByClassName('_14iw')[0];
      if (div) { div.parentNode.removeChild(div); }
      // Remove all class attributes to adjust content to page width
      div = (document.getElementsByClassName("_1xnd"))[0];
      if (div) {
        while (div = div.parentNode) {
          if (div.className) { div.className = ''; }
        }
      }
      if (items.PRINT == true) { window.print(); }
	  else                     { alert('End isolating'); }
    // Group
    } else if (items.PROF_TYPE == 'group') {
      // Remove header
      var div = document.getElementById("headerArea");
      if (div) { div.parentNode.removeChild(div); }
      // Remove left menu
          div = document.getElementById("leftCol");
      if (div) { div.parentNode.removeChild(div); }
      // Remove right column
          div = document.getElementById("rightCol");
      if (div) { div.parentNode.removeChild(div); }
      // Remove all class attributes to adjust content to page width
      div = document.getElementById("newsFeedHeading");
      if (!div) { div = document.getElementById("pagelet_group_about"); }
      if (!div) { div = document.getElementById("pagelet_group_forsaleposts"); }
      if (!div) { div = document.getElementById("pagelet_group_members"); }
      if (div) {
        while (div = div.parentNode) {
          if (div.className) { div.className = ''; }
        }
      }
      if (items.PRINT == true) { window.print(); }
	  else                     { alert('End isolating'); }
    // Event
    } else if (items.PROF_TYPE == 'event') {
      // Remove left and right menu
      var div = document.getElementsByClassName("_lwx");
	  while (div.length) {
        div[0].parentNode.parentNode.removeChild(div[0].parentNode);
		div = document.getElementsByClassName("_lwx");
      }
      // Remove all class attributes to adjust content to page width
      div = document.getElementById("event_header_primary");
      if (div) {
        while (div = div.parentNode) {
          if (div.className) { div.className = ''; }
        }
      }
      if (items.PRINT == true) { window.print(); }
	  else                     { alert('End isolating'); }
    // Messenger current chat
    } else if (items.PROF_TYPE == 'messenger') {
      // Get current profile ID and UserID
      var linkCode = (document.getElementsByClassName("_3eur"))[0];
      var linkHTML = linkCode.innerHTML;
      var regex = /uid="([0-9]+)/i;
      var match = linkHTML.match(regex);
      var profileIDs;
      if (match && match.length > 0) { profileIDs = 'ID: ' + match[1]; }
      var currURL = window.location.href;
      var currUserID = currURL.split("\/").pop();
      if (currUserID && profileIDs != currUserID) {
        if (profileIDs) { profileIDs += ', UserID: ' + currUserID; }
        else            { profileIDs  = 'UserID: '   + currUserID; }
      }
      // Remove contact list
      var div = (document.getElementsByClassName("_1enh"))[0];
      if (div) { div.parentNode.removeChild(div); }
      // Remove header
          div = (document.getElementsByClassName("_673w"))[0];
      if (div) { div.parentNode.removeChild(div); }
      // Remove contact info
          div = (document.getElementsByClassName(" _4_j5"))[0];
      if (div) { div.parentNode.removeChild(div); }
      // Remove bottom
          div = (document.getElementsByClassName("_4rv3"))[0];
      if (div) {
        var role = div.parentNode.getAttribute('role');
        if (role) { div.parentNode.removeChild(div);                       }
        else      { div.parentNode.parentNode.removeChild(div.parentNode); }
      }
      // Add profile details in title
      if (profileIDs) {
        if (div = (document.getElementsByClassName("_6ybk"))[0]) {
          var profileLink;
          if (profileLink = (div.getElementsByTagName("a"))[0]) {
            div = profileLink;
          }
          div.innerText += ' (' + profileIDs + ')';
        }
      }
      // Remove height to be able to print the whole conversation
      div = (document.getElementsByClassName("_1wfr"))[0];
      if (div) {
        if (div.getAttribute("style")) { div.removeAttribute("style"); }
        while (div = div.parentNode) {
          if (div.className) { div.className = ''; }
        }
      }
      if (items.PRINT == true) { window.print(); }
    // Messenger contacts
    } else if (items.PROF_TYPE == 'messContacts') {
      // Remove chat
          div = (document.getElementsByClassName("_1t2u"))[0];
      if (div) { div.parentNode.removeChild(div); }
      // Remove height to be able to print the whole conversation
        div = (document.getElementsByClassName("_9hq"))[0];
      if (div.getAttribute("style")) { div.removeAttribute("style"); }
      while (div = div.parentNode) {
        if (div.className) { div.className = ''; }
      }
      // Remove class that hide contact details
      var contactDiv = (document.getElementsByClassName("_1qt4"))[0];
      if (contactDiv) {
        while (contactDiv) {
          contactDiv.className = '';
          contactDiv = (document.getElementsByClassName("_1qt4"))[0];
        }
      }
      if (items.PRINT == true) { window.print();         }
	  else                     { alert('End isolating'); }
    }
  });
}

// Show datetime
function datetime() {
  // Datetime in comments
  var el = document.getElementsByClassName('livetimestamp');
  for (var i = 0; i < el.length; i++) {
    var unixtime;
    if (unixtime = el[i].getAttribute('data-utime')) {
      var date = new Date(unixtime*1000);
      el[i].innerText = date.toString();
    }
  }
  // Datetime in posts
  var el = document.getElementsByClassName('timestampContent');
  for (var i = 0; i < el.length; i++) {
    var unixtime;
    if (unixtime = el[i].parentNode.getAttribute('data-utime')) {
      var date = new Date(unixtime*1000);
      el[i].innerText = date.toString();
    }
  }
  // Datetime in messenger
  var el = document.getElementsByClassName('_3058');
  for (var i = 0; i < el.length; i++) {
    var dateElement;
    if (el[i].dataset && el[i].dataset.tooltipContent) {
      dateElement = el[i].dataset.tooltipContent;
    } else if (el[i].getElementsByClassName('_3zvs')) {
      var div = (el[i].getElementsByClassName('_3zvs'))[0];
      if (div && div.dataset) {
        dateElement = div.dataset.tooltipContent;
      }
    }
    if (dateElement) {
      var dateSpan = document.createElement('span');
      dateSpan.innerHTML = dateElement;
      el[i].appendChild(dateSpan);
    }
  }
  alert('End show datetime');
}

// Translate
async function translate() {
  var className = ["_6qw5", "UFITranslateLink"];
  for (var k = 0; k < className.length; k++) {
    var el    = document.getElementsByClassName(className[k]); // in comments (people)
    if (el.length) {
      for (var i = 0; i < el.length; i++) { el[i].click(); } // Click See translation links
      await sleep(1000);
      el    = document.getElementsByClassName(className[k]); // Process a second time
      var regex = new RegExp(/\(/);
      for (var i = 0; i < el.length; i++) { // Click See translation that doesn't contain "("
        if (el[i].innerText && !regex.test(el[i].innerText)) { el[i].click(); }
      }
      await sleep(1000);
    }
  }
  el    = document.querySelectorAll('div._63qh a'); // in posts
  for (var i = 0; i < el.length; i++) { el[i].click(); } // Click See translation buttons
  alert('End translating');
}

// Open conversation in Facebook Mobile
chrome.storage.local.get(null, function(items) {
  var currUrl = location.href;
  if (currUrl == 'https://m.facebook.com/messages' && items.FBID) {
    var el = document.getElementsByClassName('_5b6s');
    var regex = new RegExp(items.FBID);
    for (var i = 0; i < el.length; i++) {
      var href = el[i].href;
      if (href && regex.test(href)) { el[i].click(); }
    }
  }
});