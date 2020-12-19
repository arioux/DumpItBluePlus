'use strict';

// Listen messages from popup
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  var oldUI = document.getElementById('pagelet_bluebar');
  if (request.type == "scroll") {
    console.log('Scrolling');
    scrollFunctions();
    sendResponse({msg: "scrolling started"});
  } else if (request.type == "expand") {
    console.log('Expanding');
    if (oldUI) { expandFunctionsOld(); }
    else       { expandFunctionsNew(); }
    sendResponse({msg: "expanding started"});
  } else if (request.type == "remove") {
    console.log('Removing');
    if (oldUI) { removeOld(); }
    else       { removeNew(); }
    sendResponse({msg: "removing started"});
  } else if (request.type == "dump") {
    console.log('Dumping');
    dump();
    sendResponse({msg: "dumping started"});
  } else if (request.type == "isolate") {
    console.log('Isolating');
    if (oldUI) { isolateOld(); }
    else       { isolateNew(); }
    sendResponse({msg: "isolating started"});
  } else if (request.type == "datetime") {
    if (oldUI) { 
      console.log('Datetime');
      datetime();
      sendResponse({msg: "Show datetime started"});
    } else { alert('This function does not actually work with the new layout.'); }
  } else if (request.type == "translate") {
    console.log('Translating');
    if (oldUI) { translateOld(); }
    else       { translateNew(); }
    sendResponse({msg: "Translating started"});
  } else if (request.type == "openMobile") {
    console.log('Open in Facebook Mobile');
    openMobile();
    sendResponse({msg: "Opening in Facebook Mobile started"});
  } else if (request.type == "currFBID") {
    var oldUI = document.getElementById('pagelet_bluebar');
    if (oldUI) {
      var linkCode = document.getElementsByClassName('profilePicThumb')[0]; // person page
      var fbid = '-';
      if (linkCode) {
        console.log('person page');
        var linkHref = linkCode.href;
        var regex = /referrer_profile_id=([0-9]+)/i;
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
                  } else {
                    var regex = new RegExp('https://www.facebook.com/messages/t');
                    if (currUrl && regex.test(currUrl)) {
                      linkCode = document.getElementsByClassName('d1544ag0')[0]; // in messenger
                      if (linkCode) {
                        console.log('in new messenger');
                        var hrefUrl = linkCode.href;
                        regex = /id=([0-9]+)/i;
                        var match = hrefUrl.match(regex);
                        if (match && match.length > 0) {
                          fbid = match[1];
                          chrome.storage.local.set({ 'PROF_TYPE': 'new messenger' });
                        }
                      }
                    } else {
                      var newProfileCover = document.getElementsByClassName('uo3d90p7')[0];
                      if (newProfileCover) { linkCode = newProfileCover.getElementsByTagName('a')[0]; }
                      if (linkCode) {
                        console.log('new facebook layout');
                        var linkHref = linkCode.href;
                        var regex = /fbid=([0-9]+)/i;
                        var match = linkHref.match(regex);
                        if (match && match.length > 0) {
                          fbid = match[1];
                          chrome.storage.local.set({ 'PROF_TYPE': 'person' });
                        } else {
                          regex = /\/([^\/]+)\/photos/i;
                          match = linkHref.match(regex);
                          if (match && match.length > 0) {
                            fbid = match[1];
                            chrome.storage.local.set({ 'PROF_TYPE': 'page' });
                          } else {
                            linkHref = linkCode.id;
                            regex = /headerAction_([0-9]+)/i;
                            match = linkHref.match(regex);
                            if (match && match.length > 0) {
                              fbid = match[1];
                              chrome.storage.local.set({ 'PROF_TYPE': 'group' });
                            } else {
                              linkHref = linkCode.getAttribute("ajaxify");
                              regex = /fbid=([0-9]+)/i;
                              match = linkHref.match(regex);
                              if (match && match.length > 0) {
                                fbid = match[1];
                                chrome.storage.local.set({ 'PROF_TYPE': 'event' });
                              }
                            }
                          }
                        }
                      } else {
                        regex = /groups\/([0-9]+)/i;
                        match = currUrl.match(regex);
                        if (match && match.length > 0) {
                          fbid = match[1];
                          chrome.storage.local.set({ 'PROF_TYPE': 'group' });
                        }
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
    } else { // New UI
      var fbid = '';
      var currUrl = location.href;
      // mobile
      var regex = new RegExp('https://m.facebook.com/messages');
      if (currUrl && regex.test(currUrl)) {
        var regex = /\"ACCOUNT_ID\"\:\"(\d+)\"/i;
        var scripts = document.getElementsByTagName("SCRIPT");
        for (var i = 0; i < scripts.length; i++) {
          var match = scripts[i].innerHTML.match(regex);
          if (match && match.length > 0) {
            fbid = match[1];
            break;
          }
        }
        chrome.storage.local.set({ 'PROF_TYPE': 'mobile' });
        console.log('pageType=mobile messenger');
      }
      // messenger (id of the current chat)
      regex = new RegExp('https://www.facebook.com/messages/t');
      if (currUrl && regex.test(currUrl)) {
        var iframe = document.getElementsByTagName('iframe')[0];
        var innerDoc;
        if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
        else        { innerDoc = document; }
        var div = innerDoc.getElementsByClassName('_3oh-');
        for (var i = 0; i < div.length; i++) {
          var matchRE = div[i].innerHTML.match(/uid=\"(\d+)\"/);
          if (matchRE && matchRE.length > 0) { fbid = matchRE[1]; break; }
        }
        chrome.storage.local.set({ 'PROF_TYPE': 'messenger' });
        console.log('pageType=messenger');
      }
      // groups
      var regex = /\"groupID\"\:\"(\d+)\"/i;
      var scripts = document.getElementsByTagName("SCRIPT");
      for (var i = 0; i < scripts.length; i++) {
        var match = scripts[i].innerHTML.match(regex);
        if (match && match.length > 0) {
          fbid = match[1];
          chrome.storage.local.set({ 'PROF_TYPE': 'group' });
          console.log('pageType=group');
          break;
        }
      }
      if (!fbid) {
        // page
        var regex = /\"pageID\"\:\"(\d+)\"/i;
        var scripts = document.getElementsByTagName("SCRIPT");
        for (var i = 0; i < scripts.length; i++) {
          var match = scripts[i].innerHTML.match(regex);
          if (match && match.length > 0) {
            fbid = match[1];
            chrome.storage.local.set({ 'PROF_TYPE': 'page' });
            console.log('pageType=page');
            break;
          }
        }
      }
      if (!fbid) {
        // event
        var regex = /\"eventID\"\:\"(\d+)\"/i;
        var scripts = document.getElementsByTagName("SCRIPT");
        for (var i = 0; i < scripts.length; i++) {
          var match = scripts[i].innerHTML.match(regex);
          if (match && match.length > 0) {
            fbid = match[1];
            chrome.storage.local.set({ 'PROF_TYPE': 'event' });
            console.log('pageType=event');
            break;
          }
        }
      }
      if (!fbid) {
        // person
        var regex = /\"userID\"\:\"(\d+)\"/i;
        var scripts = document.getElementsByTagName("SCRIPT");
        for (var i = 0; i < scripts.length; i++) {
          var match = scripts[i].innerHTML.match(regex);
          if (match && match.length > 0) {
            fbid = match[1];
            chrome.storage.local.set({ 'PROF_TYPE': 'person' });
            console.log('pageType=person');
            break;
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
        console.log('Scroll by date');
        scrollChatByDate(items.SCROLL_LIMIT_VAL);
      } else {                                         // No limit
        scrollChatNoLimit();
      }
    } else if (items.SCROLL_TYPE == 'likes') {         // Scroll likes in popup
      scrollLikesNoLimit();
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
      console.log('Scroll with count');
        scrollPageByCount(items.SCROLL_LIMIT_VAL);
      } else if (items.SCROLL_LIMIT_TYPE == 'date' ) { // Until it reaches a specific date
        var oldUI = document.getElementById('pagelet_bluebar');
        if (oldUI) { scrollPageByDateOld(items.SCROLL_LIMIT_VAL); }
        else       { scrollPageByDateNew(items.SCROLL_LIMIT_VAL); }
      } else {                                         // No limit
        scrollPageNoLimit();
      }
    }
  });
}

// Scroll likes completely
async function scrollLikesNoLimit() {
  var tabList   = document.querySelectorAll('[role="dialog"]')[0];
  var likeNodes = tabList.getElementsByClassName('l82x9zwi');
  var scrollState        = true;
  var totalContactBefore = tabList.getElementsByClassName('l82x9zwi').length;
  var scrollingDiv       = (tabList.getElementsByClassName('l82x9zwi'))[totalContactBefore-1]; // Last displayed contact
  var totalContactAfter  = totalContactBefore + 1;
  while (totalContactAfter > totalContactBefore && scrollState == true) {
    totalContactBefore = tabList.getElementsByClassName('l82x9zwi').length;
    scrollingDiv       = (tabList.getElementsByClassName('l82x9zwi'))[totalContactBefore-1]; // Last displayed contact
    scrollingDiv.scrollIntoView(false); // Scroll to the last contact
    await sleep(1000);
    totalContactAfter = tabList.getElementsByClassName('l82x9zwi').length;
    if (totalContactAfter == totalContactBefore) {
      await sleep(5000);
      totalContactAfter = tabList.getElementsByClassName('l82x9zwi').length;
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  }
  (tabList.getElementsByClassName('l82x9zwi'))[0].scrollIntoView(true);
  alert('End scrolling');
}

// Scroll conversation by count
async function scrollChatByCount(countVal) {
  var iframe = document.getElementsByTagName('iframe')[0];
  var innerDoc;
  if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
  else        { innerDoc = document; }
  var scrollState = true;
  var i = 0;
  while (i < countVal && scrollState == true) {
    var scrollingDiv = (innerDoc.getElementsByClassName('_2k8v'))[0];
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
  var iframe = document.getElementsByTagName('iframe')[0];
  var innerDoc;
  if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
  else        { innerDoc = document; }
  var allDates = innerDoc.querySelectorAll("time._3oh-");
  if (allDates.length) {
    var lastDisplayedDate = allDates[0].innerHTML;
    var date1 = new Date(lastDisplayedDate);
    var date2 = new Date(stopDate);
    var scrollState = true;
    while (date1 > date2 && scrollState == true) {
      var scrollingDiv = (innerDoc.getElementsByClassName('_2k8v'))[0];
      if (scrollingDiv) { scrollingDiv.scrollIntoView(true); }
      else { break; }
      await sleep(1000);
      lastDisplayedDate = innerDoc.querySelectorAll("time._3oh-")[0].innerHTML;
    console.log(lastDisplayedDate);
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
  var iframe = document.getElementsByTagName('iframe')[0];
  var innerDoc;
  if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
  else        { innerDoc = document; }
  var scrollingDiv = (innerDoc.getElementsByClassName('_2k8v'))[0];
  var scrollState = true;
  while (scrollingDiv && scrollState == true) {
    console.log('Scrolling');
    scrollingDiv.scrollIntoView(true);
    await sleep(1000);
    scrollingDiv = (innerDoc.getElementsByClassName('_2k8v'))[0];
    if (!scrollingDiv) {
      console.log('Sleep for 5 seconds');
      await sleep(5000);
      scrollingDiv = (innerDoc.getElementsByClassName('_2k8v'))[0];
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      console.log('Stopped');
      scrollState = items.SCROLL_STATE;
    });
  }
  alert('End scrolling');
}

// Scroll contacts by count
async function scrollContactsByCount(countVal) {
  var iframe = document.getElementsByTagName('iframe')[0];
  var innerDoc;
  if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
  else        { innerDoc = document; }
  var scrollState = true;
  var i = 0;
  while (i < countVal && scrollState == true) {
    var scrollingDiv = (innerDoc.getElementsByClassName('_1ht1'))[innerDoc.getElementsByClassName('_1ht1').length-1];
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
  var iframe = document.getElementsByTagName('iframe')[0];
  var innerDoc;
  if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
  else        { innerDoc = document; }
  var allDates = innerDoc.getElementsByClassName('_1ht7');
  if (allDates.length) {
    var lastDisplayedDate = allDates[allDates.length-1].innerText;
    var partsDate     = lastDisplayedDate.split('-');
    partsDate[0]      = parseInt(partsDate[0]) + 2000;
    lastDisplayedDate = partsDate.join('-');
    var date1 = new Date(lastDisplayedDate);
    var date2 = new Date(stopDate);
    var scrollState = true;
    while (date1 > date2 && scrollState == true) {
      var scrollingDiv = (innerDoc.getElementsByClassName('_1ht1'))[innerDoc.getElementsByClassName('_1ht1').length-1];
      scrollingDiv.scrollIntoView(false); // Scroll to the last contact
      await sleep(1000);
      allDates = innerDoc.getElementsByClassName('_1ht7');
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
  var iframe = document.getElementsByTagName('iframe')[0];
  var innerDoc;
  if (iframe) { innerDoc = iframe.contentDocument || iframe.contentWindow.document; }
  else        { innerDoc = document; }
  var scrollState        = true;
  var totalContactBefore = innerDoc.getElementsByClassName('_1ht1').length;
  var scrollingDiv       = (innerDoc.getElementsByClassName('_1ht1'))[totalContactBefore-1]; // Last displayed contact
  var totalContactAfter  = totalContactBefore + 1;
  while (totalContactAfter > totalContactBefore && scrollState == true) {
    totalContactBefore = innerDoc.getElementsByClassName('_1ht1').length;
    scrollingDiv       = (innerDoc.getElementsByClassName('_1ht1'))[totalContactBefore-1]; // Last displayed contact
    scrollingDiv.scrollIntoView(false); // Scroll to the last contact
    await sleep(1000);
    totalContactAfter = innerDoc.getElementsByClassName('_1ht1').length;
    if (totalContactAfter == totalContactBefore) {
      await sleep(5000);
      totalContactAfter = innerDoc.getElementsByClassName('_1ht1').length;
    }
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  }
  (innerDoc.getElementsByClassName('_1ht1'))[0].scrollIntoView(true);
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

// Scroll page by date (old UI)
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
    chrome.storage.local.get('SCROLL_STATE', function(items) { // Stopped by user
      scrollState = items.SCROLL_STATE;
    });
  }
  window.scrollTo(0,0);
  alert('End scrolling');
}

// lastDisplayedDate
function getLastDisplayedDate() {
  var posts = document.querySelectorAll('[role="article"]');
  for (var i = posts.length-1; i >= 0; i--) {
    var tabindex = posts[i].getAttribute("tabindex");
    if (!tabindex) {
      var date = posts[i].getElementsByClassName('b1v8xokw')[0];
      if (date) { return(date.getAttribute("aria-label")); }
    }
  }
}

// Scroll page by date (new UI)
async function scrollPageByDateNew(stopDate) {
  var lastDisplayedDate = getLastDisplayedDate();
  console.log(lastDisplayedDate);
  var date1 = new Date(lastDisplayedDate);
  var date2 = new Date(stopDate);
  var scrollState = true;
  while (date1 > date2 && scrollState == true) {
    window.scrollTo(0,document.body.scrollHeight);
    await sleep(1000);
    lastDisplayedDate = getLastDisplayedDate();
    console.log(lastDisplayedDate);
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
function expandFunctionsOld() {
  chrome.storage.local.get(null, function(items) {
    if (items.EXPAND_SEEMORE  == true) { expandSeeMoreOld(); }
    if (items.EXPAND_POSTS    == true) { expandPostsOld();   }
    if (items.EXPAND_COMMENTS == true) {
      expandComments1Old();
      expandComments2Old();
      expandComments3Old();
    }
  });
}

// Expand See more
async function expandSeeMoreOld() {
  var el = document.getElementsByClassName('see_more_link');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('see_more_link');
  }
  alert('End expanding See more');
}

// Expand comments and replies
async function expandComments1Old() {
  var el = document.getElementsByClassName('_4sxc _42ft');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('_4sxc _42ft');
  }
  alert('End expanding comments/replies');
}

// Expand View 1 comment
async function expandComments2Old() {
  var el = document.getElementsByClassName('UFIPagerLink');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('UFIPagerLink');
  }
}

// Expand comments See more
async function expandComments3Old() {
  var el = document.getElementsByClassName('_5v47 fss');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('_5v47 fss');
  }
  alert('End expanding comments/replies');
}

// Expand More posts
async function expandPostsOld() {
  var el = document.getElementsByClassName('_44b2');
  while (el.length) {
    for (var i = 0; i  < el.length; i++) { el[i].click(); }
    await sleep(1000);
    el = document.getElementsByClassName('_44b2');
  }
  alert('End expanding More posts');
}

// Expand function
function expandFunctionsNew() {
  chrome.storage.local.get(null, function(items) {
    if (items.EXPAND_SEEMORE  == true) { expandSeeMoreNew();  }
    if (items.EXPAND_COMMENTS == true) { expandCommentsNew(); }
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
async function expandSeeMoreNew() {
  var expanded = expandSeeMoreText();
  while (expanded) {
    await sleep(1000);
    expanded = expandSeeMoreText();
  }
  alert('End expanding See more');
}

// Expand comments and replies
function expandCommentReplies() {
  var nbrLinks = 0;
  var posts = document.querySelectorAll('[role="article"]');
  for (var i = 0; i < posts.length; i++) {
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
async function expandCommentsNew() {
  var expanded = expandCommentReplies();
  while (expanded) {
    await sleep(1000);
    expanded = expandCommentReplies();
  }
  alert('End expanding comments/replies');
}

// Remove
function removeOld() {
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
function removeNew() {
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
    var html = '<head><title>DumpItBlue Report</title><meta charset="UTF-8">';
    html += '<style>table, th, td { border: 1px solid black; border-collapse: collapse; font-size: small; }';
    html += 'th { font-weight: bold; text-align: center; }</style>';
    html += '</head><table style="margin: auto;">';
    // Friends
    if (items.DUMP_TYPE == 'friends') {
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
    // Mutual friends
    } else if (items.DUMP_TYPE == 'mutualFriends') {
      console.log('mutualFriends');
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
    } else if (items.DUMP_TYPE == 'groupMembers') {
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
    } else if (items.DUMP_TYPE == 'likes') {
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
    } else if (items.DUMP_TYPE == 'contrib') {
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
        if (contrib[i].name   ) { html += contrib[i].name;        } html += '</td><td>';
        if (contrib[i].url    ) { html += contrib[i].url;         } html += '</td><td>';
        if (contrib[i].img    ) { html += contrib[i].img;         } html += '</td><td>';
        if (contrib[i].counter) { html += contrib[i].counter;     } html += '</td>';
        if (items.ADD_BASE_URI == true) { html += '<td>' + currURI + '</td>'; }
        html += '</tr>';
        countEl++;
      }
    }
    html += '</table>';
    var newTab = window.open("", "", "");
    newTab.document.write(html);
  });
}

// Isolate scrollable
function isolateOld() {
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
      else                       { alert('End isolating'); }
    }
  });
}
function isolateNew() {
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
      // Reload the frame
      var div = document.getElementsByTagName('iframe')[0];
      if (div && div.src) {
        if (confirm('To isolate Messenger conversation or contact list, the Messenger frame must be reloaded outside of the main page, continue?')) {
          location.href = div.src;
        }
      }
      // Messenger current chat
      if (items.PROF_TYPE == 'messenger') {
        var div2 = document.querySelectorAll('[role="banner"]')[0]; // Remove contact list
        if (div2 && div2.parentNode) { div2.parentNode.remove(); }
        var div3 = document.getElementsByClassName(' _4_j5')[0];
        if (div3) { div3.remove(); }
        var div3 = document.getElementsByClassName('_673w')[0];
        if (div3) { div3.remove(); }
        var div4 = document.querySelectorAll('[role="region"]')[1];
        if (div4) { div4.remove(); }
    var div5;
        if (div5 = document.querySelectorAll('[role="region"]')[0]) {
          while (div5 = div5.parentNode) { if (div5.className) { div5.className = ''; } }
        }
      // Messenger contacts
      } else if (items.PROF_TYPE == 'messContacts') {
        var div2 = document.querySelectorAll('[role="main"]')[1];
        if (div2) { div2.remove(); }
        var div3 = document.querySelectorAll('[role="banner"]')[0];
        if (div3) { div3.remove(); }
        var div4 = document.getElementsByClassName('_58ak')[0];
        if (div4) { div4.remove(); }
        var div5 = document.getElementsByClassName('_6zkc');
        for (var i = (div5.length-1); i >= 0; i--) {
      var div6 = div5[i];
          while (div6 = div6.parentNode) { if (div6.className) { div6.className = ''; } }
        }
      }
    }
    if (items.PRINT == true) { window.print();         }
    else                     { alert('End isolating'); }
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
async function translateOld() {
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

// Translate
async function translateNew() {
  var translateLink = document.getElementsByClassName('n3ffmt46');
  for (var i = 0; i < translateLink.length-1; i++) {
    translateLink[i].click();
  }
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
  var scrollingLink = (document.getElementsByClassName('touchable primary'))[0];
  while (scrollingLink) {
    scrollingLink.click();
    await sleep(1000);
    el = document.getElementsByClassName('_5b6s');
    for (var i = (el.length-1); i >= 0; i--) {
      if (el[i].href && el[i].href.match(regex)) { el[i].click(); return; }
    }
    scrollingLink = (document.getElementsByClassName('touchable primary'))[0];
  }    
}

// Open conversation in Facebook Mobile
chrome.storage.local.get(null, function(items) {
  var currUrl = location.href;
  var oldUI = document.getElementById('pagelet_bluebar');
  if (oldUI) {
    if (currUrl == 'https://m.facebook.com/messages' && items.FBID) {
      var el = document.getElementsByClassName('_5b6s');
      var regex = new RegExp(items.FBID);
      for (var i = 0; i < el.length; i++) {
        var href = el[i].href;
        if (href && regex.test(href)) { el[i].click(); }
      }
    }
  } else {
    var currUrl = location.href;
    if (currUrl.match(/https\:\/\/m.facebook.com\/messages/) && items.FBID) {
      searchMobileChat(items.FBID);
    }
  }
});