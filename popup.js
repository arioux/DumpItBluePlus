'use strict';

var tabId;
// Only one group open
const details = document.querySelectorAll("details");
details.forEach((targetDetail) => {
  targetDetail.addEventListener("click", () => {
    details.forEach((detail) => {
      if (detail !== targetDetail) { detail.removeAttribute("open"); }
    });
  });
});
// Scroll
document.getElementById('scroll').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      var selChoice = document.getElementById('scrollType').value;
      chrome.storage.local.set({ 'SCROLL_TYPE': selChoice });
      var scrollVal = document.getElementById('scrollLimitCountVal').value;
      chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': scrollVal }); 
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
    if (regex.test(tabs[0].url)) { chrome.storage.local.set({ 'SCROLL_STATE': false }); }
  });
});
document.getElementById('scrollLimit').addEventListener('change', function() {
  var selChoice = document.getElementById('scrollLimit').value;
  if        (selChoice == 'count') {
    document.getElementById('scrollLimitCountVal').style.display = 'inline-block';
    chrome.storage.local.set({ 'SCROLL_LIMIT_TYPE': 'count' });
    chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': '1' });
  } else {
    document.getElementById('scrollLimitCountVal').style.display = 'none';
    chrome.storage.local.set({ 'SCROLL_LIMIT_TYPE': 'none' });
    chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': null });
  }
});
// Dump
document.getElementById('dump').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var regex = RegExp('facebook.com');
    if (regex.test(tabs[0].url)) {
      var dumpType = document.getElementById('dumpType').value;
      chrome.storage.local.set({ 'DUMP_TYPE': dumpType });
      var addProfImg = document.getElementById('addProfImg').checked;
      chrome.storage.local.set({ 'ADD_PROF_IMG': addProfImg });
      var addBaseURI = document.getElementById('addBaseURI').checked;
      chrome.storage.local.set({ 'ADD_BASE_URI': addBaseURI });
      var smallSizePhotos = document.getElementById('smallSizePhotos').checked;
      chrome.storage.local.set({ 'SMALL_SIZE': smallSizePhotos });
      var fullSizePhotos = document.getElementById('fullSizePhotos').checked;
      chrome.storage.local.set({ 'FULL_SIZE': fullSizePhotos });
      // Check if right page
      if ((dumpType === 'allAlbums' && !tabs[0].url.includes('photos_albums') && !tabs[0].url.includes('tab=album') && !tabs[0].url.includes('/media/albums')) ||
          (dumpType === 'album'     && !tabs[0].url.includes('/media/set/') && !tabs[0].url.includes('photos')) || (dumpType === 'dumpContacts' && !tabs[0].url.includes('/messages/t/')) ||
          ((dumpType === 'friends' || dumpType === 'allFriends') && !tabs[0].url.includes('friends') && !tabs[0].url.includes('followers') && !tabs[0].url.includes('following')) ||
          (dumpType === 'groupMembers' && !tabs[0].url.includes('members'))) {
        var r = confirm("You don't seem to be in the right page, continue anyway?");
        if (r == false) { return; }
      }	  
      chrome.tabs.sendMessage(tabs[0].id, {type: "dump"}, function(response) {
        console.log(response.msg);
      });
    }
  });
});
// Dump Type setting change
document.getElementById('dumpType').addEventListener('change', function() {
  var dumpType = document.getElementById('dumpType').value;
  if (dumpType === 'album' || dumpType === 'album') {
    document.getElementById('smallSizePhotosOpt').style.display = 'inline-block';
    document.getElementById('fullSizePhotosOpt').style.display = 'inline-block';
    document.getElementById('addProfImgOpt').style.display = 'none';
    document.getElementById('addBaseURIOpt').style.display = 'none';
  } else {
    document.getElementById('addProfImgOpt').style.display = 'inline-block';
    document.getElementById('addBaseURIOpt').style.display = 'inline-block';
    document.getElementById('smallSizePhotosOpt').style.display = 'none';
    document.getElementById('fullSizePhotosOpt').style.display = 'none';
  }
});
// Time to wait setting change
document.getElementById('waitingTime').addEventListener('change', function() {
  var wailVal = document.getElementById('waitingTime').value * 1000;
  chrome.storage.local.set({ 'TIME_TO_WAIT': wailVal });
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
    if (tabs[0] && tabs[0].url && tabs[0].url.includes('facebook.com')) {
      chrome.tabs.sendMessage(tabs[0].id, {type: "currFBID"}, function(response) {
        if (response && response.msg > 0) {
          console.log(response.msg);
          document.getElementById('fbid').value = response.msg;
          document.getElementById('fbid').style.color = '#0066cc';
        } else {
          document.getElementById('fbid').value = "No ID found!";
          document.getElementById('fbid').style.color = 'grey';
        }
        chrome.storage.local.get(['PROF_TYPE'], function(items) {
          // Set default dump for dump function
          document.getElementById('contrib').selected = true; // default
          if (tabs[0].url.includes('mutual_friends')) {
            document.getElementById('mutualFriends').selected = true;
          } else if (tabs[0].url.includes('members')) {
            document.getElementById('groupMembers').selected = true;
          } else if (tabs[0].url.includes('friends') || tabs[0].url.includes('followers') || tabs[0].url.includes('following')) {
            document.getElementById('friends').selected = true;
          } else if (tabs[0].url.includes('/messages/t/')) {
            document.getElementById('dumpContacts').selected = true;
          } else if (tabs[0].url.includes('photos_albums') || tabs[0].url.includes('tab=album') || tabs[0].url.includes('/media/albums')) {
            document.getElementById('allAlbums').selected = true;
          } else if (tabs[0].url.includes('/media/set/') || tabs[0].url.includes('photos')) {
            document.getElementById('album').selected = true;
          } else if (tabs[0].url.includes('photos_albums') || tabs[0].url.includes('tab=album') || tabs[0].url.includes('/media/albums')) {
            document.getElementById('allAlbums').selected = true;
          }
					if (tabs[0].url.includes('/media/set/') || tabs[0].url.includes('photos_albums') || 
							tabs[0].url.includes('tab=album'  ) || tabs[0].url.includes('/media/albums') || 
							tabs[0].url.includes('photos')) {
            document.getElementById('smallSizePhotosOpt').style.display = 'inline-block';
            document.getElementById('fullSizePhotosOpt').style.display = 'inline-block';
            document.getElementById('addProfImgOpt').style.display = 'none';
            document.getElementById('addBaseURIOpt').style.display = 'none';
          } else {
            document.getElementById('addProfImgOpt').style.display = 'inline-block';
            document.getElementById('addBaseURIOpt').style.display = 'inline-block';
            document.getElementById('smallSizePhotosOpt').style.display = 'none';
            document.getElementById('fullSizePhotosOpt').style.display = 'none';
          }
          // Set profile type for isolate function
          if (items.PROF_TYPE && document.getElementById(items.PROF_TYPE)) {
            document.getElementById(items.PROF_TYPE).selected = true;
            if (items.PROF_TYPE == 'messenger') {
              document.getElementById('chat').selected = true;
              chrome.storage.local.set({ 'SCROLL_TYPE': 'chat' });
            }
          } else {
            if (tabs[0].url.includes('m.facebook.com')) {
              document.getElementById('fbMobile').selected = true;
              chrome.storage.local.set({ 'SCROLL_TYPE': 'chatMobile' });
            }
		  }
        });
      });
    } else {
      document.getElementById('fbid').value = "Not on Facebook!";
      document.getElementById('fbid').style.color = 'grey';
    }
	// Time to wait setting
	chrome.storage.local.get('TIME_TO_WAIT', function(items) {
    var timeToWait = 2000; // Default to 2 seconds
	  if (items.TIME_TO_WAIT) { timeToWait = items.TIME_TO_WAIT; }
	  else                    { chrome.storage.local.set({ 'TIME_TO_WAIT': '2000' }); }
	  document.getElementById('waitingTime').value = timeToWait/1000;
    });
  });
  // Reset storage values
  chrome.storage.local.set({ 'SCROLL_TYPE': 'page' });
  chrome.storage.local.set({ 'SCROLL_LIMIT_TYPE': 'none' });
  chrome.storage.local.set({ 'SCROLL_LIMIT_VAL': null });
  chrome.storage.local.set({ 'SCROLL_STATE': false });
  chrome.storage.local.set({ 'PRINT': false });
  chrome.storage.local.set({ 'FBID': '' });
  chrome.storage.local.set({ 'PROF_TYPE': '' });
  chrome.storage.local.set({ 'DUMP_TYPE': '' });
  chrome.storage.local.set({ 'ADD_PROF_IMG': false });
  chrome.storage.local.set({ 'ADD_BASE_URI': false });
});