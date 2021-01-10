'use strict';

// Listen messages from popup
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  var oldUI = document.getElementById('pagelet_bluebar');
  if (request.type === "scroll") {
    console.log('Scrolling');
    scrollFunctions();
    sendResponse({msg: "scrolling started"});
  } else if (request.type === "expand") {
    console.log('Expanding');
    if (oldUI) { expandFunctionsOld(); }
    else       { expandFunctions();    }
    sendResponse({msg: "expanding started"});
  } else if (request.type === "remove") {
    console.log('Removing');
    if (oldUI) { removeOld(); }
    else       { remove();    }
    sendResponse({msg: "removing started"});
  } else if (request.type === "dump") {
    console.log('Dumping');
    dump();
    sendResponse({msg: "dumping started"});
  } else if (request.type === "isolate") {
    console.log('Isolating');
    if (oldUI) { isolateOld(); }
    else       { isolate();    }
    sendResponse({msg: "isolating started"});
  } else if (request.type === "datetime") {
    if (oldUI || location.href.includes('m.facebook.com/messages')) { 
      console.log('Datetime');
      datetime();
      sendResponse({msg: "Show datetime started"});
    } else { alert('This function does not actually work with the new layout.'); }
  } else if (request.type === "translate") {
    console.log('Translating');
    if (oldUI) { translateOld(); }
    else       { translateNew(); }
    sendResponse({msg: "Translating started"});
  } else if (request.type === "openMobile") {
    console.log('Open in Facebook Mobile');
    openMobile();
    sendResponse({msg: "Opening in Facebook Mobile started"});
  } else if (request.type === "currFBID") {
    // [OLD LAYOUT]
    if (oldUI) {
      var linkCode = document.getElementsByClassName('profilePicThumb')[0]; // person page
      var fbid = '-';
      if (linkCode) {
        var linkHref = linkCode.href; var regex = /referrer_profile_id=([0-9]+)/i; var match = linkHref.match(regex);
        if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'person' }); }
        regex = /profile_id=([0-9]+)/i; match = linkHref.match(regex);
        if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'person' }); }
      } else {
        linkCode = document.getElementsByClassName('_2dgj')[0]; // business page
        if (linkCode) {
          var linkHref = linkCode.href; var regex = /\/([^\/]+)\/photos/i; var match = linkHref.match(regex);
          if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'page' }); }
        } else {
          linkCode = document.getElementsByClassName('_4adj')[0]; // group page
          if (linkCode) {
            var linkHref = linkCode.id; var regex = /headerAction_([0-9]+)/i; var match = linkHref.match(regex);
            if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'group' }); }
          } else {
            linkCode = document.getElementsByClassName('_4258')[0]; // event page
            if (linkCode) {
              var linkHref = linkCode.getAttribute("ajaxify"); var regex = /fbid=([0-9]+)/i; var match = linkHref.match(regex);
              if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'event' }); }
            } else {
              linkCode = document.getElementsByClassName('_3eur')[0]; // in messenger
              if (linkCode) {
                var linkHTML = linkCode.innerHTML; var regex = /uid="([0-9]+)/i; var match = linkHTML.match(regex);
                if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'messenger' }); }
              } else {
                linkCode = document.getElementsByClassName('_6ybk')[0]; // in messenger
                if (linkCode) {
                  var linkHTML = linkCode.innerHTML; var regex = /uid="([0-9]+)/i; var match = linkHTML.match(regex);
                  if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'messenger' }); }
                } else {
                  var currUrl = location.href; // in Facebook Mobile
                  var regex = new RegExp('https://m.facebook.com/messages');
                  if (currUrl && regex.test(currUrl)) {
                    var regex = /%3A([0-9]+)&/i; var match = currUrl.match(regex);
                    if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'mobile' }); }
                  } else {
                    var regex = new RegExp('https://www.facebook.com/messages/t');
                    if (currUrl && regex.test(currUrl)) {
                      linkCode = document.getElementsByClassName('d1544ag0')[0]; // in messenger
                      if (linkCode) {
                        var hrefUrl = linkCode.href; regex = /id=([0-9]+)/i; var match = hrefUrl.match(regex);
                        if (match && match.length > 0) { fbid = match[1]; chrome.storage.local.set({ 'PROF_TYPE': 'new messenger' }); }
                      }
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
            var content = metas[i].getAttribute('content'); var regex = /[\/\=]([0-9]+)/i; var match = content.match(regex);
            if (match && match.length > 0) {
              fbid = match[1]; regex = /fb:\/\/([^\/]+)\//i; match = content.match(regex);
              if (match && match.length > 0) {
                var profType;
                if (match[1] == 'profile') { profType = 'person'; } else if (match[1] == 'page') { profType = 'page'; } else if (match[1] == 'group') { profType = 'group'; }
                if (profType) { chrome.storage.local.set({ 'PROF_TYPE': profType }); }
              }
            }
          }
        }
      }
    } else { // New Layout
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
  }
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
    else if (items.SCROLL_TYPE === 'likes'     ) { scrollLikes(items.TIME_TO_WAIT); }
    // Scroll chat in Facebook Mobile
    else if (items.SCROLL_TYPE === 'chatMobile') { scrollChatFM(items.SCROLL_LIMIT_TYPE, items.SCROLL_LIMIT_VAL, items.TIME_TO_WAIT); }
    // Scroll a page
    else {
      var oldUI = document.getElementById('pagelet_bluebar');
      if (oldUI && items.SCROLL_LIMIT_TYPE === 'date') { scrollPageByDateOld(items.SCROLL_LIMIT_VAL); }
      else { scrollPage(items.SCROLL_LIMIT_TYPE, items.SCROLL_LIMIT_VAL, items.TIME_TO_WAIT); }
    }
  });
}

// Scroll conversation to top
async function scrollChat(limitType, maxScroll, timeToWait) {
  var noLimit = true;
  if (limitType === 'count') { noLimit = false; }
  var scrollState    = true;
  var nbrItemsBefore = document.getElementsByClassName('pby63qed').length;
  var nbrItemsAfter  = nbrItemsBefore + 1;
  var i = 0;
  while (((noLimit && nbrItemsAfter > nbrItemsBefore) || i < maxScroll) && scrollState == true) {
    nbrItemsBefore   = document.getElementsByClassName('pby63qed').length;
    var scrollingDiv = document.getElementsByClassName('nred35xi')[1];
    if (scrollingDiv) { scrollingDiv.scrollIntoView(true); } // Scroll to the header
    else { break; }
    await sleep(timeToWait);
    nbrItemsAfter = document.getElementsByClassName('pby63qed').length;
    while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
      scrollingDiv   = document.getElementsByClassName('nred35xi')[1];
      if (scrollingDiv) { scrollingDiv.scrollIntoView(true); } // Scroll to the header
      await sleep(timeToWait);
      nbrItemsAfter = document.getElementsByClassName('pby63qed').length;
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
  var iframe = document.getElementsByTagName('iframe')[0];
  var innerDoc;
  if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
  else        { innerDoc = document; }
  var scrollState    = true;
  var contactMenu    = innerDoc.querySelectorAll('[role="navigation"]')[document.querySelectorAll('[role="navigation"]').length-1];
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
      scrollingDiv   = contactMenu.querySelectorAll('[role="progressbar"]')[0];
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

// Scroll likes completely
async function scrollLikes(timeToWait) {
  var tabList        = document.querySelectorAll('[role="dialog"]')[0];
  var likeNodes      = tabList.getElementsByClassName('l82x9zwi');
  var scrollState    = true;
  var nbrItemsBefore = tabList.getElementsByClassName('l82x9zwi').length;
  var scrollingDiv   = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
  var nbrItemsAfter  = nbrItemsBefore + 1;
  while (nbrItemsAfter > nbrItemsBefore && scrollState == true) {
    nbrItemsBefore = tabList.getElementsByClassName('l82x9zwi').length;
    scrollingDiv   = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
    scrollingDiv.scrollIntoView(false); // Scroll to the last contact
    await sleep(timeToWait);
    nbrItemsAfter = tabList.getElementsByClassName('l82x9zwi').length;
    var j = 0;
    while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
      scrollingDiv   = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
      scrollingDiv.scrollIntoView(false); // Scroll to the last contact
      await sleep(timeToWait);
      nbrItemsAfter = tabList.getElementsByClassName('l82x9zwi').length;
      j++;
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { scrollState = items.SCROLL_STATE; });
  }
  tabList.getElementsByClassName('l82x9zwi')[0].scrollIntoView(true);
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

// [OLD LAYOUT] Scroll page by date
async function scrollPageByDateOld(stopDate) {
  var lastDisplayedDate = document.getElementsByClassName('timestampContent')[document.getElementsByClassName('timestampContent').length-1].innerHTML;
  var date1 = new Date(lastDisplayedDate);
  var date2 = new Date(stopDate);
  var scrollState = true;
  while (date1 > date2 && scrollState == true) {
    window.scrollTo(0,document.body.scrollHeight);
    await sleep(1000);
    lastDisplayedDate = document.getElementsByClassName('timestampContent')[document.getElementsByClassName('timestampContent').length-1].innerHTML;
    date1 = new Date(lastDisplayedDate);
    chrome.storage.local.get('SCROLL_STATE', function(items) { scrollState = items.SCROLL_STATE; });
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

// [OLD LAYOUT] Expand functions
function expandFunctionsOld() {
  chrome.storage.local.get(null, function(items) {
    if (items.EXPAND_SEEMORE  == true) { expandSeeMoreOld(); }
    if (items.EXPAND_POSTS    == true) { expandPostsOld();   }
    if (items.EXPAND_COMMENTS == true) { expandComments1Old(); expandComments2Old(); expandComments3Old(); }
  });
}
async function expandSeeMoreOld() {
  var el = document.getElementsByClassName('see_more_link');
  while (el.length) { for (var i = 0; i  < el.length; i++) { el[i].click(); } await sleep(1000); el = document.getElementsByClassName('see_more_link'); }
  alert('End expanding See more');
}
async function expandComments1Old() {
  var el = document.getElementsByClassName('_4sxc _42ft');
  while (el.length) { for (var i = 0; i  < el.length; i++) { el[i].click(); } await sleep(1000); el = document.getElementsByClassName('_4sxc _42ft'); }
  alert('End expanding comments/replies type 1');
}
async function expandComments2Old() {
  var el = document.getElementsByClassName('UFIPagerLink');
  while (el.length) { for (var i = 0; i  < el.length; i++) { el[i].click(); } await sleep(1000); el = document.getElementsByClassName('UFIPagerLink'); }
  alert('End expanding comments/replies type 2');
}
async function expandComments3Old() {
  var el = document.getElementsByClassName('_5v47 fss');
  while (el.length) { for (var i = 0; i  < el.length; i++) { el[i].click(); } await sleep(1000); el = document.getElementsByClassName('_5v47 fss'); }
  alert('End expanding comments/replies type 3');
}
async function expandPostsOld() {
  var el = document.getElementsByClassName('_44b2');
  while (el.length) { for (var i = 0; i  < el.length; i++) { el[i].click(); } await sleep(1000); el = document.getElementsByClassName('_44b2'); }
  alert('End expanding More posts');
}

// Expand function
function expandFunctions() {
  chrome.storage.local.get(null, function(items) {
    console.log('EXPAND_SEEMORE: ' + items.EXPAND_SEEMORE);
    console.log('EXPAND_COMMENTS: ' + items.EXPAND_SEEMORE);
    console.log('Time to wait: ' + (items.TIME_TO_WAIT/1000));
    if (items.EXPAND_SEEMORE  == true) { expandSeeMore(items.TIME_TO_WAIT);  }
    if (items.EXPAND_COMMENTS == true) { expandComments(items.TIME_TO_WAIT); }
  });
}

// Expand See more
function expandSeeMoreText() {
  var nbrLinks = 0;
  var posts = document.querySelectorAll('[role="article"]');
  for (var i = 0; i < posts.length; i++) {
    var buttons = posts[i].getElementsByClassName('oo9gr5id');
    for (var j = 0; j < buttons.length; j++) {
      var role = buttons[j].getAttribute("role");
      var nbrChilds = buttons[j].childElementCount;
      if (!nbrChilds && role == 'button' && buttons[j] && buttons[j].innerText) {
        buttons[j].click();
        nbrLinks++;
      }
    }
  }
  return(nbrLinks);
}
async function expandSeeMore(timeToWait) {
  var nbrExpandedBefore = 1;
  var nbrExpandedAfter  = 0;
  while (nbrExpandedBefore != nbrExpandedAfter) {
    nbrExpandedBefore = expandSeeMoreText();
    await sleep(timeToWait);
    nbrExpandedAfter = expandSeeMoreText();
    if (!nbrExpandedAfter || nbrExpandedBefore == nbrExpandedAfter) { // All expanded ?
      var j = 0;
      while (j < 5 && (!nbrExpandedAfter || nbrExpandedBefore == nbrExpandedAfter)) {
        await sleep(timeToWait);
        nbrExpandedAfter = expandSeeMoreText();
        j++;
      }
    }
  }
  window.scrollTo(0,0);
  alert('End expanding See more');
}

// Expand comments and replies
function expandCommentReplies() {
  var nbrLinks = 0;
  var posts = document.querySelectorAll('[role="article"]');
  for (var i = (posts.length-1); i >= 0; i--) {
    posts[i].scrollIntoView();
    var buttons = posts[i].getElementsByClassName('p8fzw8mz');
    for (var j = 0; j < buttons.length; j++) {
      var role = buttons[j].getAttribute("role");
      var hide = buttons[j].getElementsByClassName('sx_d7e427');
      if (!hide.length && role == 'button' && buttons[j] && buttons[j].innerText) {
        buttons[j].click();
        nbrLinks++;
      }
    }
  }
  return(nbrLinks);
}
async function expandComments(timeToWait) {
  var nbrExpandedBefore = 1;
  var nbrExpandedAfter  = 0;
  while (nbrExpandedBefore != nbrExpandedAfter) {
    nbrExpandedBefore = expandCommentReplies();
    await sleep(timeToWait);
    nbrExpandedAfter = expandCommentReplies();
    if (!nbrExpandedAfter || nbrExpandedBefore == nbrExpandedAfter) { // All expanded ?
      var j = 0;
      while (j < 5 && (!nbrExpandedAfter || nbrExpandedBefore == nbrExpandedAfter)) {
        await sleep(timeToWait);
        nbrExpandedAfter = expandCommentReplies();
        j++;
      }
    }
  }
  window.scrollTo(0,0);
  alert('End expanding comments/replies');
}

// [OLD LAYOUT] Remove
function removeOld() {
  chrome.storage.local.get(null, function(items) {
    // Remove blue bar
    if (items.REM_BLUEBAR == true) {
      var div = document.getElementById("pagelet_bluebar"); if (div) { div.parentNode.removeChild(div); }
      var div = document.getElementById("timeline_sticky_header_container"); if (div) { div.parentNode.removeChild(div); }
    }
    // Remove comments
    if (items.REM_COMMENTS == true) {
      var div = document.getElementsByClassName("commentable_item");
      while (div.length) { for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); } div = document.getElementsByClassName("commentable_item"); }
    }
    // Remove Write Comment Box
    if (items.REM_COMMENTS_BOX == true) {
      var div = document.getElementsByClassName("_43u6");
      while (div.length) { for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); } div = document.getElementsByClassName("_43u6"); }
      div = document.getElementsByClassName("_4efl");
      while (div.length) { for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); } div = document.getElementsByClassName("_4efl"); }
      div = document.getElementById("PageComposerPagelet_");   if (div) { div.parentNode.removeChild(div); }
      div = document.getElementById("pagelet_event_composer"); if (div) { div.parentNode.removeChild(div); }
    }
    // Remove Like bubbles in comments
    if (items.REM_LIKES_INCOM == true) {
      var div = document.getElementsByClassName("_6cuq");
      while (div.length) { for (var i = 0; i  < div.length; i++) { div[i].parentNode.removeChild(div[i]); } div = document.getElementsByClassName("_6cuq"); }
    }
    alert('End removing');
  });
}

// Remove
function remove() {
  chrome.storage.local.get(null, function(items) {
    // Remove top menu bar
    if (items.REM_BLUEBAR == true) {
      var div = document.querySelectorAll('[role="banner"]')[0];
      if (div) { div.remove(); }
    }
    // Remove comments
    if (items.REM_COMMENTS == true) {
      var div = document.getElementsByClassName("monazrh9"); // All comment sections
      while (div.length) {
        for (var i = 0; i  < div.length; i++) { div[i].remove(); }
        div = document.getElementsByClassName("monazrh9");
      }
    }
    // Remove Write Comment Box
    if (items.REM_COMMENTS_BOX == true) {
      var div  = document.getElementsByClassName("rs4xwbwe");     // Main Write comment box
      while (div.length) {
        for (var i = 0; i  < div.length; i++) { div[i].parentNode.parentNode.parentNode.remove(); }
        div = document.getElementsByClassName("rs4xwbwe");
      }
      var createPost = document.getElementsByClassName('kb5gq1qc')[0]; // Create Post on a page
      createPost.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.remove();
    }
    // Remove Like bubbles in comments
    if (items.REM_LIKES_INCOM == true) {
      var div = document.getElementsByClassName("_6cuq");      // All Like bubbles in comments
      while (div.length) {
        for (var i = 0; i  < div.length; i++) { div[i].remove(); }
        div = document.getElementsByClassName("_6cuq");
      }
    }
    alert('End removing');
  });
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
    if (items.DUMP_TYPE !== 'allFriends' && items.DUMP_TYPE !== 'allLikes' &&
        items.DUMP_TYPE !== 'album'      && items.DUMP_TYPE !== 'allAlbums') {
      var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
      html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: small; }';
      html += 'th { font-weight: bold; text-align: center; }</style>';
      html += '</head><table style="margin: auto;">';
    }
    // Friends in current page
    if (items.DUMP_TYPE === 'friends') {
      var friendGroupNode = document.getElementsByClassName('sjgh65i0')[0];
      var friendNodes     = friendGroupNode.getElementsByClassName('gfomwglr');
      var friends         = [];
      var currCat;
      var activeTab = friendGroupNode.getElementsByClassName('q66pz984')[0];
      if (activeTab) { currCat = activeTab.innerHTML; }
      for (var i = 0; i < friendNodes.length; i++) {
        var profUrl     = '';
        var profImg     = '';
        var profName    = '';
        var profDetails = '';
        var f_Url = friendNodes[i].getElementsByTagName('a')[0];
        if (f_Url && f_Url.href) { profUrl = f_Url.href; }
        var f_Img = friendNodes[i].getElementsByTagName('img')[0];
        if (f_Img && f_Img.src ) { profImg = f_Img.src;  }
        var spanNodes = friendNodes[i].getElementsByTagName('span');
        if (spanNodes[1]) { profName    = spanNodes[1].innerText; }
        if (spanNodes[2]) { profDetails = spanNodes[2].innerText; }
        if (profName) {
          friends.push({ url:profUrl, img:profImg, name:profName, details:profDetails, });
        }
      }
      html += '<tr><th>Category</th>';
      if (items.ADD_PROF_IMG == true) { html += '<th>Profile Image</th>'; }
      html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Profile Details</th>';
      if (items.ADD_BASE_URI == true) { html += '<th>Origin URL</th>'; }
      html += '</tr>';
      for (var i = 0; i < friends.length; i++) {
        html += '<tr><td>';
        if (currCat) { html += currCat; } html += '</td><td>';
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
    // All Likes
    } else if (items.DUMP_TYPE === 'allLikes') {
      dumpAllLikes(items.ADD_PROF_IMG, items.ADD_BASE_URI, items.ADD_LIKES_COMMENTS, items.TIME_TO_WAIT);
    // Current album
    } else if (items.DUMP_TYPE === 'album') {
      dumpAlbum(items.SMALL_SIZE, items.FULL_SIZE, items.TIME_TO_WAIT);
    // All Albums
    } else if (items.DUMP_TYPE === 'allAlbums') {
      dumpAllAlbums(items.SMALL_SIZE, items.FULL_SIZE, items.TIME_TO_WAIT);
    // Mutual friends
    }else if (items.DUMP_TYPE === 'mutualFriends') {
      var friendGroupNode = document.getElementsByClassName('fbProfileBrowserList')[0];
      var friendNodes     = friendGroupNode.getElementsByClassName('fbProfileBrowserListItem');
      var friends         = [];
      for (var i = 0; i < friendNodes.length; i++) {
        var profUrl     = '';
        var profImg     = '';
        var profName    = '';
        var f_Url = friendNodes[i].getElementsByTagName('a')[0];
        if (f_Url && f_Url.href) { profUrl = f_Url.href; }
        var f_Img = friendNodes[i].getElementsByTagName('img')[0];
        if (f_Img && f_Img.src ) { profImg = f_Img.src;  }
        var linkNodes = friendNodes[i].getElementsByTagName('a')[1];
        if (linkNodes) { profName = linkNodes.innerText; }
        if (profName) {
          friends.push({ url:profUrl, img:profImg, name:profName, });
        }
      }
      html += '<tr>';
      if (items.ADD_PROF_IMG == true) { html += '<th>Profile Image</th>'; }
      html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th>';
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
        if (friends[i].img    ) { html += friends[i].img;     } html += '</td>';
        if (items.ADD_BASE_URI == true) { html += '<td>' + currURI + '</td>'; }
        html += '</tr>';
        countEl++;
      }
    // Group Members
    } else if (items.DUMP_TYPE === 'groupMembers') {
      var groupNodes = document.getElementsByClassName('ofv0k9yr');
      var members    = [];
      for (var i = 1; i < groupNodes.length; i++) {
        var groupName = groupNodes[i].getElementsByTagName('h2')[0].innerText;
        if (groupName) {
          groupName = groupName.slice(0, groupName.indexOf("\n"));
          if (groupName.includes('New to the')) { groupName = 'Member'; }
          var memberNodes = groupNodes[i].getElementsByClassName('l82x9zwi');
          for (var j = 0; j < memberNodes.length; j++) {
            var profUrl     = '';
            var profImg     = '';
            var profName    = '';
            var profDetails = '';
            var f_Url = memberNodes[j].getElementsByTagName('a')[0];
            if (f_Url) {
              if (f_Url.href) { profUrl = f_Url.href; }
              var c_Img = f_Url.getElementsByTagName('image')[0];
              if (c_Img) {
                var img = c_Img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                if (img) { profImg = img; }
              }
              var spanNodes = memberNodes[j].getElementsByClassName('knvmm38d');
              if (spanNodes[0]) { profName    = spanNodes[0].innerText; }
              if (spanNodes[2]) {
                var details = spanNodes[2].innerText.slice(0, spanNodes[2].innerText.indexOf("\n"));
                profDetails = details;
              }
              if (profName) {
                members.push({ url:profUrl, img:profImg, name:profName, details:profDetails, role: groupName, });
              }
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
      var tabList   = document.querySelectorAll('[role="dialog"]')[0];
      var likeNodes = tabList.getElementsByClassName('l82x9zwi');
      var likes     = [];
      for (var i = 0; i < likeNodes.length; i++) {
        var profUrl  = '';
        var profImg  = '';
        var profName = '';
        var f_Url = likeNodes[i].getElementsByTagName('a')[0];
        if (f_Url) {
          if (f_Url.href) { profUrl = f_Url.href; }
          var c_Img = f_Url.getElementsByTagName('image')[0];
          if (c_Img) {
            var img = c_Img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            if (img) { profImg = img; }
          }
          var spanNodes = likeNodes[i].getElementsByClassName('knvmm38d');
          if (spanNodes[0]) { profName = spanNodes[0].innerText; }
          if (profName) {
            likes.push({ url:profUrl, img:profImg, name:profName, });
          }
        }
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
      var commentNodes = document.querySelectorAll('[role="article"]');
      var contrib      = [];
      for (var i = 0; i < commentNodes.length; i++) {
        var profUrl  = '';
        var profImg  = '';
        var profName = '';
        var c_Url = commentNodes[i].getElementsByTagName('a')[0];
        if (c_Url) {
          if (c_Url.href) {
            var url = '';
              if (c_Url.href.includes('?id=')) {
                url = c_Url.href.slice(0, c_Url.href.indexOf('&'));
              } else { url = c_Url.href.slice(0, c_Url.href.indexOf('?')); }
            if (url && url !== currURI) { profUrl = url; }
          }
          var c_Img = c_Url.getElementsByTagName('image')[0];
          if (c_Img) {
            var img = c_Img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            if (img) { profImg = img; }
          }
          var c_Name = commentNodes[i].getElementsByTagName('a')[1];
          if (c_Name) { profName = c_Name.innerText; }
          if (profUrl && profImg && profName) {
            var found = contrib.find(contrib => contrib.url === profUrl);
            if (found) { found.counter++; }
            else { contrib.push({ url:profUrl, img:profImg, name:profName, counter:1 }); }
          }
        }
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
      var contactMenu  = document.querySelectorAll('[role="navigation"]')[document.querySelectorAll('[role="navigation"]').length-1];
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
          var c_Img = c_Url.getElementsByTagName('image')[0];
          if (c_Img) {
            var img = c_Img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
            if (img) { profImg = img; }
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
    if (items.DUMP_TYPE !== 'allFriends' && items.DUMP_TYPE !== 'allLikes' &&
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
  var friendGroupNode = document.getElementsByClassName('sjgh65i0')[0];
  var tabNodes        = friendGroupNode.querySelectorAll('a[role="tab"]');
  var newWindow       = window.open("", "DumpItBlue processing...", "width=600,height=400");
  for (var i = 0; i < tabNodes.length; i++) {
    console.log('Opening ' + tabNodes[i].innerText + ' in a new window');
    var currCat    = '';
	var currCatURL = tabNodes[i].href;
    newWindow.location.assign(currCatURL);
    // Scroll the page
    newWindow.opener.log('Sleep for 5 seconds - Loading the page');
    await sleep(timeToWait*5);
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
    var fgNode = newWindow.document.getElementsByClassName('sjgh65i0')[0];
    if (fgNode) {
      var activeTab = fgNode.getElementsByClassName('q66pz984')[0];
      if (activeTab) { currCat = activeTab.innerHTML; }
      newWindow.opener.log('Dumping friends from ' + currCat);
      var currFGNode   = newWindow.document.getElementsByClassName('sjgh65i0')[0];
      var friendNodes  = currFGNode.getElementsByClassName('gfomwglr');
      for (var j = 0; j < friendNodes.length; j++) {
        var profUrl     = '';
        var profImg     = '';
        var profName    = '';
        var profDetails = '';
        var f_Url = friendNodes[j].getElementsByTagName('a')[0];
        if (f_Url && f_Url.href) { profUrl = f_Url.href; }
        var f_Img = friendNodes[j].getElementsByTagName('img')[0];
        if (f_Img && f_Img.src ) { profImg = f_Img.src;  }
        var spanNodes = friendNodes[j].getElementsByTagName('span');
        if (spanNodes[1]) { profName    = spanNodes[1].innerText; }
        if (spanNodes[2]) { profDetails = spanNodes[2].innerText; }
        if (profName) {
          friends.push({ cat:currCat, catURL:currCatURL, url:profUrl, img:profImg, name:profName, details:profDetails, });
        }
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

// Dump all Likes
async function dumpAllLikes(addProfImg, addBaseUri, addLikesComments, timeToWait) {
  var currURI      = document.baseURI;
  var commentNodes = document.querySelectorAll('[role="article"]');
  var likes        = [];
  for (var i = 0; i < commentNodes.length; i++) {
    // Likes for each post
    var buttons = commentNodes[i].querySelectorAll('[role="button"]');
    for (var j = 0; j < buttons.length; j++) {
      var countEl = 0;
      if (buttons[j] && buttons[j].outerHTML.includes('ni8dbmo4')) {
        var hasImg1 = buttons[j].getElementsByTagName('svg');
        if (hasImg1.length) { continue; } // Not a Likes button
        var hasImg2 = buttons[j].getElementsByTagName('img');
        if (hasImg2.length) { continue; } // Not a Likes button
        else {
          console.log(buttons[j]);
          // Open the popup
          buttons[j].click();
          console.log('Open the popup');
          await sleep(timeToWait*2);
          // Scroll the popup
          console.log('Scroll the popup');
          var tabList = document.querySelectorAll('[role="dialog"]')[0];
          if (!tabList) {
            var j = 0;
            while (j < 5 && !tabList) {
              await sleep(timeToWait*2);
              tabList = document.querySelectorAll('[role="dialog"]')[0];
              j++;
            }
            if (!tabList) { console.log('Unable to connect to popup'); break; }
          }
          var nbrItemsBefore = tabList.getElementsByClassName('l82x9zwi').length;
          var scrollingDiv   = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
          var nbrItemsAfter  = nbrItemsBefore + 1;
          while (nbrItemsAfter > nbrItemsBefore) {
            console.log('Scrolling');
            nbrItemsBefore = tabList.getElementsByClassName('l82x9zwi').length;
            scrollingDiv   = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
            scrollingDiv.scrollIntoView(false); // Scroll to the last contact
            await sleep(timeToWait*2);
            nbrItemsAfter = tabList.getElementsByClassName('l82x9zwi').length;
            var j = 0;
            while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
              console.log('Scrolling');
              scrollingDiv = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
              scrollingDiv.scrollIntoView(false); // Scroll to the last contact
              await sleep(timeToWait);
              nbrItemsAfter = tabList.getElementsByClassName('l82x9zwi').length;
              j++;
            }
          }
          // Extract Likes data
          console.log('Extract the data');
          var likeNodes = tabList.getElementsByClassName('l82x9zwi');
          for (var k = 0; k < likeNodes.length; k++) {
            var profUrl  = '';
            var profImg  = '';
            var profName = '';
            var c_Url = likeNodes[k].getElementsByTagName('a')[0];
            if (c_Url) {
              if (c_Url.href) {
                var url = '';
                  if (c_Url.href.includes('?id=')) {
                    url = c_Url.href.slice(0, c_Url.href.indexOf('&'));
                  } else { url = c_Url.href.slice(0, c_Url.href.indexOf('?')); }
                if (url && url !== currURI) { profUrl = url; }
              }
              var c_Img = c_Url.getElementsByTagName('image')[0];
              if (c_Img) {
                var img = c_Img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                if (img) { profImg = img; }
              }
              var spanNodes = likeNodes[k].getElementsByClassName('knvmm38d');
              if (spanNodes[0]) { profName = spanNodes[0].innerText; }
              if (profUrl && profImg && profName) {
                var found = likes.find(likes => likes.url === profUrl);
                if (found) { found.counter++; }
                else { likes.push({ url:profUrl, img:profImg, name:profName, counter:1 }); }
                countEl++;
              }
            }
          }
          console.log('Number extracted: ' + countEl);
          // Close the popup
          console.log('Close the popup');
          var closeButton = document.querySelectorAll('[aria-label="Close"]');
          if (closeButton) { closeButton[0].click(); await sleep(timeToWait*2); }
        }
      }
    }
  }
  // Likes in comments
  if (addLikesComments) {
    var inComment = document.getElementsByClassName('_6cuq');
    for (var i = 0; i < inComment.length; i++) {
      var countEl = 0;
      var buttonsInComments = inComment[i].querySelectorAll('[role="button"]')[0];
      if (buttonsInComments) {
        console.log(buttonsInComments);
        // Open the popup
        buttonsInComments.click();
        console.log('Open the popup');
        await sleep(timeToWait*2);
        // Scroll the popup
        console.log('Scroll the popup');
        var tabList = document.querySelectorAll('[role="dialog"]')[0];
        if (!tabList) {
          var j = 0;
          while (j < 5 && !tabList) {
            await sleep(timeToWait*2);
            tabList = document.querySelectorAll('[role="dialog"]')[0];
            j++;
          }
          if (!tabList) { console.log('Unable to connect to popup'); break; }
        }
        var nbrItemsBefore = tabList.getElementsByClassName('l82x9zwi').length;
        var scrollingDiv   = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
        var nbrItemsAfter  = nbrItemsBefore + 1;
        while (nbrItemsAfter > nbrItemsBefore) {
          console.log('Scrolling');
          nbrItemsBefore = tabList.getElementsByClassName('l82x9zwi').length;
          scrollingDiv   = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
          scrollingDiv.scrollIntoView(false); // Scroll to the last contact
          await sleep(timeToWait*2);
          nbrItemsAfter = tabList.getElementsByClassName('l82x9zwi').length;
          var j = 0;
          while (j < 5 && nbrItemsAfter == nbrItemsBefore) { // Try five more times
            console.log('Scrolling');
            scrollingDiv = tabList.getElementsByClassName('l82x9zwi')[nbrItemsBefore-1]; // Last displayed contact
            scrollingDiv.scrollIntoView(false); // Scroll to the last contact
            await sleep(timeToWait);
            nbrItemsAfter = tabList.getElementsByClassName('l82x9zwi').length;
            j++;
          }
        }
        // Extract Likes data
        console.log('Extract the data');
        var likeNodes = tabList.getElementsByClassName('l82x9zwi');
        for (var k = 0; k < likeNodes.length; k++) {
          var profUrl  = '';
          var profImg  = '';
          var profName = '';
          var c_Url = likeNodes[k].getElementsByTagName('a')[0];
          if (c_Url) {
            if (c_Url.href) {
              var url = '';
                if (c_Url.href.includes('?id=')) {
                  url = c_Url.href.slice(0, c_Url.href.indexOf('&'));
                } else { url = c_Url.href.slice(0, c_Url.href.indexOf('?')); }
              if (url && url !== currURI) { profUrl = url; }
            }
            var c_Img = c_Url.getElementsByTagName('image')[0];
            if (c_Img) {
              var img = c_Img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
              if (img) { profImg = img; }
            }
            var spanNodes = likeNodes[k].getElementsByClassName('knvmm38d');
            if (spanNodes[0]) { profName = spanNodes[0].innerText; }
            if (profUrl && profImg && profName) {
              var found = likes.find(likes => likes.url === profUrl);
              if (found) { found.counter++; }
              else { likes.push({ url:profUrl, img:profImg, name:profName, counter:1 }); }
              countEl++;
            }
          }
        }
        console.log('Number extracted: ' + countEl);
        // Close the popup
        console.log('Close the popup');
        var closeButton = document.querySelectorAll('[aria-label="Close"]');
        if (closeButton) { closeButton[0].click(); await sleep(timeToWait*2); }
      }
    }
  }
  var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
  html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: small; }';
  html += 'th { font-weight: bold; text-align: center; }</style>';
  html += '</head><table style="margin: auto;">';
  html += '<tr>';
  if (addProfImg == true) { html += '<th>Profile Image</th>'; }
  html += '<th>Profile Name</th><th>Profile URL</th><th>Profile Image URL</th><th>Count</th>';
  if (addBaseUri == true) { html += '<th>Origin URL</th>'; }
  html += '</tr>';
  for (var k = 0; k < likes.length; k++) {
    html += '<tr><td>';
    if (addProfImg == true) { 
      if (likes[k].img) { html += '<img src="' + likes[k].img + '">'; }
      html += '</td><td>';
    }
    if (likes[k].name   ) { html += likes[k].name;    } html += '</td><td>';
    if (likes[k].url    ) { html += likes[k].url;     } html += '</td><td>';
    if (likes[k].img    ) { html += likes[k].img;     } html += '</td><td>';
    if (likes[k].counter) { html += likes[k].counter; } html += '</td>';
    if (addBaseUri == true) { html += '<td>' + currURI + '</td>'; }
    html += '</tr>';
    countEl++;
  }
  html += '</table>';
  var newTab = window.open("", "", "");
  newTab.document.write(html);
}

// Dump current album
async function dumpAlbum(smallSizePhotos, fullSizePhotos, timeToWait) {
  var photos = [];
  // Get album name and url
  var albumURL    = document.baseURI;
  var albumHeader = document.getElementsByClassName('sjgh65i0')[0];
  var albumName;
  var photosNodes;
  if (albumHeader) {
    albumName   = albumHeader.innerText.split(/[\r\n]/)[0];
    var section = document.getElementsByClassName('sbcfpzgs')[1];
    if (section) { photosNodes = section.querySelectorAll('a[role="link"]'); }
  } else { // If current album is in a Page/Group profile
    albumHeader = document.getElementsByClassName('hnhda86s')[0];
    if (albumHeader) { albumName = albumHeader.innerText; }
    var section = document.getElementsByClassName('lhclo0ds')[0];
    if (section) { photosNodes = section.querySelectorAll('a[role="link"]'); }
	console.log(photosNodes);
  }
  var newWindow = window.open("", "DumpItBlue processing...", "width=600,height=400");
  for (var k = 0; k < photosNodes.length; k++) {
    var photoURL1 = '';
    var photoImg1 = '';
    var photoImg2 = '';
    if (photosNodes[k] && photosNodes[k].href && photosNodes[k].href.match(/\/photos?\//i)) {
      photoURL1 = photosNodes[k].href;
      var smallSizeImg = photosNodes[k].getElementsByTagName('img')[0];
      if (smallSizeImg && smallSizeImg.src) {
        photoImg1 = smallSizeImg.src;
        if (fullSizePhotos) {
          newWindow.opener.log('Open the photo URL - ' + photoURL1);
          newWindow.location.assign(photoURL1);
          newWindow.opener.log('Wait while loading page');
          await sleep(timeToWait*5);
          newWindow.opener.log('Search full size image');
          var div = newWindow.document.querySelectorAll('div[data-pagelet="MediaViewerPhoto"]');
          var fullSizeImg;
          if (div) { fullSizeImg = div[0].getElementsByTagName('img'); }
          if (!fullSizeImg) { console.log('Unable to find the image'); }
          else if (fullSizeImg[0] && fullSizeImg[0].src) {
            newWindow.opener.log('Save full size photo details');
            photoImg2 = fullSizeImg[0].src;
          }
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
  var j = 1;
  var currURL     = location.href;
  if (currURL.includes('/groups/')) { j = 3; }
  var albumList   = document.getElementsByClassName('discj3wi')[j];
  var albumsNodes = albumList.querySelectorAll('a[role="link"]');
  console.log();
  var newWindow   = window.open("", "DumpItBlue processing...", "width=600,height=400");
  for (var i = 0; i < albumsNodes.length; i++) {
    if (albumsNodes[i] && albumsNodes[i].href && albumsNodes[i].href.includes('/media/set')) {
      // Open the album page
      var albumURL = albumsNodes[i].href;
      newWindow.opener.log('Open the album URL - ' + albumsNodes[i].href);
      newWindow.location.assign(albumsNodes[i].href);
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
      var albumName;
      var photosNodes;
	  var albumHeader = newWindow.document.getElementsByClassName('sjgh65i0')[0];
      if (albumHeader && !currURL.includes('/groups/')) {
        albumName   = albumHeader.innerText.split(/[\r\n]/)[0];
        var section = newWindow.document.getElementsByClassName('sbcfpzgs')[1];
        if (section) { photosNodes = section.querySelectorAll('a[role="link"]'); }
      } else { // If current album is in a Page/Group profile
        albumHeader = newWindow.document.getElementsByClassName('hnhda86s')[0];
        if (albumHeader) { albumName = albumHeader.	innerText; }
        var section = newWindow.document.getElementsByClassName('lhclo0ds')[0];
        if (section) { photosNodes = section.querySelectorAll('a[role="link"]'); }
	    console.log(photosNodes);
      }
      // Gather small photos data
      for (var k = 0; k < photosNodes.length; k++) {
        var photoURL1 = '';
        var photoImg1 = '';
        var photoImg2 = '';
        if (photosNodes[k] && photosNodes[k].href && photosNodes[k].href.match(/\/photos?\//i)) {
          photoURL1 = photosNodes[k].href;
          newWindow.opener.log(k + ' - ' + photoURL1);
          var smallSizeImg = photosNodes[k].getElementsByTagName('img')[0];
          if (smallSizeImg && smallSizeImg.src) {
            photoImg1 = smallSizeImg.src;
            // Get full size photos data
            if (fullSizePhotos) {
              newWindow.opener.log('Open the photo URL - ' + photoURL1);
              newWindow.location.assign(photoURL1);
              newWindow.opener.log('Wait while loading page');
              await sleep(timeToWait*5);
              newWindow.opener.log('Search full size image');
              var div = newWindow.document.querySelectorAll('div[data-pagelet="MediaViewerPhoto"]');
              var fullSizeImg;
              if (div) { fullSizeImg = div[0].getElementsByTagName('img'); }
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

// [OLD LAYOUT] Isolate scrollable
function isolateOld() {
  chrome.storage.local.get(null, function(items) {
    // Remove useless div
    var div = document.getElementById("pagelet_bluebar"); if (div) { div.parentNode.removeChild(div); }
    div = document.getElementById("timeline_sticky_header_container"); if (div) { div.parentNode.removeChild(div); }
    div = document.getElementsByClassName("uiBoxGray")[0]; if (div) { div.parentNode.removeChild(div); }
    div = document.getElementById("pagelet_sidebar"); if (div) { div.parentNode.removeChild(div); }
    div = document.getElementById("pagelet_dock"); if (div) { div.parentNode.removeChild(div); }
    div = document.getElementById("pageFooter"); if (div) { div.parentNode.removeChild(div); }
    // People
    if (items.PROF_TYPE == 'people') {
      var div = document.getElementById("timeline_top_section"); if (div) { div.parentNode.removeChild(div); }
      div = document.getElementById("timeline_small_column");
      if (div) { div.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.removeChild(div.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode); }
      div = document.getElementsByClassName('_4bl7')[0]; if (div.getAttribute("style")) { div.removeAttribute("style"); }
      div = document.getElementById("timeline_story_column");
      if (div) { while (div = div.parentNode) { if (div.className) { div.className = ''; } } }
      if (items.PRINT == true) { window.print(); } else { alert('End isolating'); }
    // Page
    } else if (items.PROF_TYPE == 'page') {
      var div = (document.getElementsByClassName("_1pfm"))[0]; if (div) { div.parentNode.removeChild(div); }
      div = document.getElementById("entity_sidebar"); if (div) { div.parentNode.parentNode.parentNode.removeChild(div.parentNode.parentNode); }
      div = document.getElementsByClassName('_14iw')[0]; if (div) { div.parentNode.removeChild(div); }
      div = (document.getElementsByClassName("_1xnd"))[0];
      if (div) { while (div = div.parentNode) { if (div.className) { div.className = ''; } } }
      if (items.PRINT == true) { window.print(); } else { alert('End isolating'); }
    // Group
    } else if (items.PROF_TYPE == 'group') {
      var div = document.getElementById("headerArea"); if (div) { div.parentNode.removeChild(div); }
      div = document.getElementById("leftCol"); if (div) { div.parentNode.removeChild(div); }
      div = document.getElementById("rightCol"); if (div) { div.parentNode.removeChild(div); }
      div = document.getElementById("newsFeedHeading");
      if (!div) { div = document.getElementById("pagelet_group_about"); }
      if (!div) { div = document.getElementById("pagelet_group_forsaleposts"); }
      if (!div) { div = document.getElementById("pagelet_group_members"); }
      if (div) { while (div = div.parentNode) { if (div.className) { div.className = ''; } } }
      if (items.PRINT == true) { window.print(); } else { alert('End isolating'); }
    // Event
    } else if (items.PROF_TYPE == 'event') {
      var div = document.getElementsByClassName("_lwx");
      while (div.length) { div[0].parentNode.parentNode.removeChild(div[0].parentNode); div = document.getElementsByClassName("_lwx"); }
      div = document.getElementById("event_header_primary");
      if (div) { while (div = div.parentNode) { if (div.className) { div.className = ''; } } }
      if (items.PRINT == true) { window.print(); } else { alert('End isolating'); }
    }
  });
}

// Isolate scrollable
function isolate() {
  chrome.storage.local.get(null, function(items) {
    if (items.PROF_TYPE != 'messenger' && items.PROF_TYPE != 'messContacts') {
      // Common elements
      var div = document.querySelectorAll('[role="banner"]')[0];
      if (div) { div.remove(); }
      div = document.getElementsByClassName('cddn0xzi');
      for (var i = (div.length-1); i >= 0; i--) { div[i].remove(); }
      div = document.getElementsByClassName('lpgh02oy');
      if (div[1]) { div[1].remove(); }
      // People
      if (items.PROF_TYPE == 'people') {
        div = document.getElementsByClassName('o387gat7');
        for (var i = 0; i < div.length; i++) { div[i].remove(); }
      // Page
      } else if (items.PROF_TYPE == 'page') {
        if (div = document.getElementsByClassName('sjgh65i0')[0]) {
          while (div = div.parentNode) { if (div.className) { div.className = ''; } }
        }
      // Group
      } else if (items.PROF_TYPE == 'group') {
      if (div = document.getElementsByClassName('ihqw7lf3')[0]) {
        while (div = div.parentNode) { if (div.className) { div.className = ''; } }
      }
      // Event
      } else if (items.PROF_TYPE == 'event') {
        if (div = document.getElementsByClassName('sjgh65i0')[0]) {
          while (div = div.parentNode) { if (div.className) { div.className = ''; } }
        }
      }
    } else {
      // Reload the frame (20201225: Doesn't seem to exist anymore)
      var div = document.getElementsByTagName('iframe')[0];
      console.log(div);
      if (div && div.src) {
        if (confirm('To isolate Messenger conversation or contact list, the Messenger frame must be reloaded outside of the main page, continue?')) {
          location.href = div.src;
        }
      }
      // Messenger current chat
      if (items.PROF_TYPE === 'messenger') {
        var div1 = document.querySelectorAll('[role="banner"]')[0]; // Remove top bar
        if (div1) { div1.remove(); }
        var div2 = document.querySelectorAll('[role="navigation"]')[0]; // Remove contact list
        if (div2) { div2.remove(); }
        var div3 = document.getElementsByClassName('t63ysoy8')[0]; // Remove buddy information
        if (div3) { div3.remove(); }
        var div4 = document.querySelectorAll('[role="grid"]')[0]; // Remove all class
        while (div4 = div4.parentNode) { if (div4.className) { div4.className = ''; } }
      // Messenger contacts
      } else if (items.PROF_TYPE === 'messContacts') {
        var div1 = document.querySelectorAll('[role="banner"]')[0]; // Remove top bar
        if (div1) { div1.remove(); }
        var div2 = document.querySelectorAll('[role="main"]')[0]; // Remove conversation panel
        if (div2) { div2.remove(); }
        var div3 = document.getElementsByTagName('h1')[0]; // Remove all class
        while (div3 = div3.parentNode) { if (div3.className) { div3.className = ''; } }
      }
    }
    if (items.PRINT == true) { window.print();         }
    else                     { alert('End isolating'); }
  });
}

// [OLD LAYOUT] Show datetime
function datetime() {
  // In Messenger
  if (location.href.includes('m.facebook.com/messages')) {
    var allDates = document.getElementsByTagName('abbr');
    for (var i = 0; i < allDates.length; i++) {
      if (allDates[i].dataset.store) {
        var obj = JSON.parse(allDates[i].dataset.store);
        if (obj) {
          var date = new Date(obj.time * 1000);
          allDates[i].innerText = date;
        }
      }
    }
  // [OLD LAYOUT]
  } else {
    var el = document.getElementsByClassName('livetimestamp'); // Datetime in comments
    for (var i = 0; i < el.length; i++) {
      var unixtime;
      if (unixtime = el[i].getAttribute('data-utime')) { var date = new Date(unixtime*1000); el[i].innerText = date.toString(); }
    }
    var el = document.getElementsByClassName('timestampContent'); // Datetime in posts
    for (var i = 0; i < el.length; i++) {
      var unixtime;
      if (unixtime = el[i].parentNode.getAttribute('data-utime')) { var date = new Date(unixtime*1000); el[i].innerText = date.toString(); }
    }
    var el = document.getElementsByClassName('_3058'); // Datetime in messenger
    for (var i = 0; i < el.length; i++) {
      var dateElement;
      if (el[i].dataset && el[i].dataset.tooltipContent) { dateElement = el[i].dataset.tooltipContent; }
      else if (el[i].getElementsByClassName('_3zvs')) {
        var div = (el[i].getElementsByClassName('_3zvs'))[0];
        if (div && div.dataset) { dateElement = div.dataset.tooltipContent; }
      }
      if (dateElement) { var dateSpan = document.createElement('span'); dateSpan.innerHTML = dateElement; el[i].appendChild(dateSpan); }
    }
  }
  alert('End show datetime');
}

// [OLD LAYOUT] Translate
async function translateOld() {
  var className = ["_6qw5", "UFITranslateLink"];
  for (var k = 0; k < className.length; k++) {
    var el = document.getElementsByClassName(className[k]);
    if (el.length) {
      for (var i = 0; i < el.length; i++) { el[i].click(); }
      await sleep(1000);
      el = document.getElementsByClassName(className[k]);
      for (var i = 0; i < el.length; i++) { if (el[i].innerText && !el[i].innerText.includes('(')) { el[i].click(); } }
      await sleep(1000);
    }
  }
  el = document.querySelectorAll('div._63qh a'); for (var i = 0; i < el.length; i++) { el[i].click(); }
  alert('End translating');
}

// Translate
async function translateNew() {
  var translateLink = document.getElementsByClassName('n3ffmt46');
  for (var i = 0; i < translateLink.length-1; i++) { translateLink[i].click(); }
  alert('End translating');
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
  // [OLD LAYOUT]
  var oldUI = document.getElementById('pagelet_bluebar');
  if (oldUI) {
    if (currUrl == 'https://m.facebook.com/messages' && items.FBID) {
      var el = document.getElementsByClassName('_5b6s');
      var regex = new RegExp(items.FBID);
      for (var i = 0; i < el.length; i++) { var href = el[i].href; if (href && regex.test(href)) { el[i].click(); } }
    }
  } else {
    var currUrl = location.href;
    if (currUrl.includes('https://m.facebook.com/messages') && items.FBID) { searchMobileChat(items.FBID); }
  }
});