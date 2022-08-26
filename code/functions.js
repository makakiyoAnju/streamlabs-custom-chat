// Variables and constructs	
	const boardId = '{Your UserID\BoardcasterID}';

	// URLs to use
	const defaultAvatarUrl = `{default_avatar}`;

	// I wouldn't touch this unless you know what you are doing
	const endpoint = channelName => `https://api.twitch.tv/helix/users?login=${channelName}`;

	// Saved information
	const clientId = '{Your Client ID here}'; // Only need to edit if you are doing your own Twitch app registry
	var accessToken = '{Your OAuth token here}'; // Only change if you need a new token
  const cache = {};

// Adds and changes font
var fontSel = document.getElementById("fontSel").value;

if (fontSel !== "optionA") {
  document.body.style.fontFamily = `'{fontPicker}'`;
  WebFont.load({
      google: {
          families: [`{fontPicker}`]
      }
  });
} else {
  document.body.style.fontFamily = 'Visby Round CF Bold';
}

document.addEventListener('onLoad', function(obj) {
	// obj will be empty for chat widget
	// this will fire only once when the widget loads
});

document.addEventListener('onEventReceived', function(obj) {  
  if (!obj || typeof obj.detail === 'undefined' || obj.detail === null) { return; }
  
  const { from: username, messageId, tags, userid } = obj.detail;
  const displayName = tags['display-name'];
  const userId = tags['user-id'];
  
  // Display in the console log (Chrome - Right click anywhere > Inspect > Console)
  console.log(`${displayName}`, '<-');
  
  if (!username) { return; }
  
  // Caches the Twitch user to be used somewhere else eventually  
  /*if (typeof cache[displayName] !== 'undefined') {
    const elems = displayName !== null ? document.getElementsByClassName(`message-${displayName}-avatar`) : document.getElementsByClassName('message--avatar');
    for (const elem of elems) {
      elem.src = cache[username];
    }
    return;
  }*/
  
  // Fetches data of the Twitch user profile pic
 	fetch(endpoint(username), {
    "method": 'GET',
  	"headers": {
    	'Client-ID': clientId,
    	'Authorization': "Bearer " + accessToken
    }
  }).then(r => {
    if (r.status < 200 || r.status > 299) {
      cache[username] = defaultAvatarUrl;
      return;
    }
    return r.json();
  }).then(({ data }) => {
		const [ user ] = data;
    
    cache[username] = user['profile_image_url'];
  }).catch(() => {
    cache[username] = defaultAvatarUrl;
  }).finally(() => {
    const elems = displayName !== null ? document.getElementsByClassName(`message-${displayName}-avatar`) : document.getElementsByClassName('message--avatar');
    
    for (const elem of elems) {
      elem.src = cache[username];
    }
  });
  
  // Switches the alignment of the default messages 
  const subElems = displayName !== null ? document.getElementsByClassName(`${displayName}-id`) : document.getElementsByClassName('-id');
  for (const subElem of subElems) {
    if (document.getElementById("defaultAlign").value == "defaultRight") { 
      subElem.querySelector(".chat").classList.add('bubbleRight');
      subElem.classList.add('justifyRight');

      $(document).ready(function() { $(`.message-${displayName}-avatar`).each(function() { $(this).insertAfter($(this).parent().find('.message')); }); });
    } else {
      subElem.querySelector(".chat").classList.add('bubbleLeft');
    }
  }
  
  // Check if the user is subscribed to the channel  
  fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${boardId}&user_id=${userId}`, {
    "method": 'GET',
  	"headers": {
    	'Client-ID': clientId,
      'Authorization': "Bearer " + accessToken
    }
  }).then(s => {
    return s.json();
  }).then(({ data }) => {
    const [ subUser ] = data;
    const subTier = subUser['tier'];
    const subTierClass = subTier == 3000 ? 'tier3' : subTier == 2000 ? 'tier2' : 'tier1';
    
    const subElems = displayName !== null ? document.getElementsByClassName(`${displayName}-id`) : document.getElementsByClassName('-id');
    
    for (const subElem of subElems) {
      subElem.querySelector(".chat").classList.replace('tier', subTierClass);

      if (document.getElementById("subscriberAlign").value == "subRight") { 
        subElem.querySelector(".chat").classList.replace('bubbleLeft', 'bubbleRight');
        subElem.classList.add('justifyRight');
        $(document).ready(function() { $(`.message-${displayName}-avatar`).each(function() { $(this).insertAfter($(this).parent().find('.message')); }); });
      } else {
        subElem.querySelector(".chat").classList.replace('bubbleRight', 'bubbleLeft');
        subElem.classList.remove('justifyRight');
        $(document).ready(function() { $(`.message-${displayName}-avatar`).each(function() { $(this).insertBefore($(this).parent().find('.message')); }); });
      }
      
      //console.log(`${displayName}`, `${subTierClass}`);
    }
  }).catch((error) => { return; });
});
