'use strict';

var tabId;

// Scroll
document.getElementById('scroll').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      chrome.storage.local.set({ 'SCROLL_STATE': true });
      chrome.tabs.sendMessage(tabs[0].id, {type: "scroll"}, function(response) {
        console.log(response.msg);
      });
    }
  });
});
document.getElementById('scrollStop').addEventListener('click', function() { // Stop scrolling
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      chrome.storage.local.set({ 'SCROLL_STATE': false });
    }
  });
});
document.getElementById('scrollType').addEventListener('change', function() {
  var selChoice = document.getElementById('scrollType').value;
  chrome.storage.local.set({ 'SCROLL_TYPE': selChoice });
});
document.getElementById('scrollLimit').addEventListener('change', function() {
  var selChoice = document.getElementById('scrollLimit').value;
  if        (selChoice == 'count') {
    document.getElementById('scrollLimitCountVal').style.display = 'inline-block';
    document.getElementById('scrollLimitDateVal').style.display = 'none';
    chrome.storage.local.set({ 'SCROLL_LIMIT_TYPE': 'count' });
    chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': '1' });
  } else if (selChoice == 'date') {
    document.getElementById('scrollLimitDateVal').style.display = 'inline-block';
    document.getElementById('scrollLimitCountVal').style.display = 'none';
    chrome.storage.local.set({ 'SCROLL_LIMIT_TYPE': 'date' });
    var defaultDateVal = document.getElementById('scrollLimitDateVal').value;
    chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': defaultDateVal });
  } else {
    document.getElementById('scrollLimitCountVal').style.display = 'none';
    document.getElementById('scrollLimitDateVal').style.display = 'none';
    chrome.storage.local.set({ 'SCROLL_LIMIT_TYPE': 'none' });
    chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': null });
  }
});
document.getElementById('scrollLimitCountVal').addEventListener('change', function() {
  var scrollVal = document.getElementById('scrollLimitCountVal').value;
  chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': scrollVal });
});
document.getElementById('scrollLimitDateVal').addEventListener('change', function() {
  var scrollVal = document.getElementById('scrollLimitDateVal').value;
  chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': scrollVal });
});

// Expand
document.getElementById('expand').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "expand"}, function(response) {
        console.log(response.msg);
      });
    }
  });
});
document.getElementById('SeeMore').addEventListener('click', function() {
  var expandSeeMore = document.getElementById('SeeMore').checked;
  chrome.storage.local.set({ 'EXPAND_SEEMORE': expandSeeMore });
});
document.getElementById('Comments').addEventListener('click', function() {
  var expandComments = document.getElementById('Comments').checked;
  chrome.storage.local.set({ 'EXPAND_COMMENTS': expandComments });
});
document.getElementById('Posts').addEventListener('click', function() {
  var expandPosts = document.getElementById('Posts').checked;
  chrome.storage.local.set({ 'EXPAND_POSTS': expandPosts });
});

// Remove
document.getElementById('remove').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "remove"}, function(response) {
        console.log(response.msg);
      });
    }
  });
});
document.getElementById('remBluebar').addEventListener('click', function() {
  var remBlueBar = document.getElementById('remBluebar').checked;
  chrome.storage.local.set({ 'REM_BLUEBAR': remBlueBar });
});
document.getElementById('remComments').addEventListener('click', function() {
  var remComments = document.getElementById('remComments').checked;
  chrome.storage.local.set({ 'REM_COMMENTS': remComments });
});
document.getElementById('remCommentBox').addEventListener('click', function() {
  var remCommentBox = document.getElementById('remCommentBox').checked;
  chrome.storage.local.set({ 'REM_COMMENTS_BOX': remCommentBox });
});
document.getElementById('remLikesInCom').addEventListener('click', function() {
  var remLikesInCom = document.getElementById('remLikesInCom').checked;
  chrome.storage.local.set({ 'REM_LIKES_INCOM': remLikesInCom });
});

// Isolate
document.getElementById('isolate').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      var profType = document.getElementById('profileType').value;
      chrome.storage.local.set({ 'PROF_TYPE': profType });
      chrome.tabs.sendMessage(tabs[0].id, {type: "isolate"}, function(response) {
        console.log(response.msg);
      });
    }
  });
});
document.getElementById('print').addEventListener('click', function() {
  var print = document.getElementById('print').checked;
  chrome.storage.local.set({ 'PRINT': print });
});

// Show datetime
document.getElementById('datetime').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "datetime"}, function(response) {
        console.log(response.msg);
      });
    }
  });
});

// Show translate
document.getElementById('translate').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "translate"}, function(response) {
        console.log(response.msg);
      });
    }
  });
});

// Open in Facebook Mobile
document.getElementById('openMobile').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      var fbid = document.getElementById('fbid').value;
      if (fbid && fbid != "No ID found!" && fbid != "Not on Facebook!") {
        chrome.storage.local.set({ 'FBID': fbid });
		var urlAddr = 'https://m.facebook.com/messages';
        var oldUI = document.getElementById('pagelet_bluebar');
        if (!oldUI) { urlAddr += '/?entrypoint=jewel&no_hist=1'; }
        chrome.tabs.create({ url: urlAddr });
      }
    }
  });
});

// Get Current Facebook ID
document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    tabId = tabs[0];
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "currFBID"}, function(response) {
        if (response && response.msg > 0) {
          console.log(response.msg);
          document.getElementById('fbid').value = response.msg;
          document.getElementById('fbid').style.color = '#0066cc';
          // Set profile type for isolate function
          chrome.storage.local.get(['PROF_TYPE'], function(items) {
            if (items.PROF_TYPE && document.getElementById(items.PROF_TYPE)) {
              document.getElementById(items.PROF_TYPE).selected = true;
              if (items.PROF_TYPE == 'messenger') {
                document.getElementById('chat').selected = true;
                chrome.storage.local.set({ 'SCROLL_TYPE': 'chat' });
              }
            } else {
              regex = RegExp('m.facebook.com');
              if (regex.test(tabs[0].url)) {
                document.getElementById('fbMobile').selected = true;
                chrome.storage.local.set({ 'SCROLL_TYPE': 'chatMobile' });
              }
            }
          });
        } else {
          document.getElementById('fbid').value = "No ID found!";
          document.getElementById('fbid').style.color = 'grey';
        }
      });
    } else {
      document.getElementById('fbid').value = "Not on Facebook!";
      document.getElementById('fbid').style.color = 'grey';
    }
  });
  // Set current date
  var today = new Date();
  document.getElementById('scrollLimitDateVal').defaultValue = today.toISOString().substr(0, 10);
  // Reset storage values
  chrome.storage.local.set({ 'SCROLL_TYPE': 'page' });
  chrome.storage.local.set({ 'SCROLL_LIMIT_TYPE': 'none' });
  chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': null });
  chrome.storage.local.set({ 'EXPAND_SEEMORE': false });
  chrome.storage.local.set({ 'EXPAND_COMMENTS': false });
  chrome.storage.local.set({ 'EXPAND_POSTS': false });
  chrome.storage.local.set({ 'REM_BLUEBAR': false });
  chrome.storage.local.set({ 'REM_COMMENTS': false });
  chrome.storage.local.set({ 'PRINT': false });
  chrome.storage.local.set({ 'FBID': '' });
});