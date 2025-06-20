let autoScrollEnabled = true;
let facebookAutoScrollEnabled = true;
let tiktokAutoScrollEnabled = true;
let facebookReplayEnabled = false;
let tiktokReplayEnabled = false;
let savedVolume = 1.0;
let realtimeVolumeEnabled = false;

function getCurrentPlatform() {
  const hostname = window.location.hostname;
  if (hostname.includes('facebook.com')) {
    return 'facebook';
  } else if (hostname.includes('tiktok.com')) {
    return 'tiktok';
  }
  return null;
}

function isAutoScrollEnabledForCurrentPlatform() {
  const platform = getCurrentPlatform();
  if (platform === 'facebook') {
    return facebookAutoScrollEnabled;
  } else if (platform === 'tiktok') {
    return tiktokAutoScrollEnabled;
  }
  return autoScrollEnabled;
}

function isReplayEnabledForCurrentPlatform() {
  const platform = getCurrentPlatform();
  if (platform === 'facebook') {
    return facebookReplayEnabled;
  } else if (platform === 'tiktok') {
    return tiktokReplayEnabled;
  }
  return false;
}

function clickNextButton() {
  let nextButton = document.querySelector('[aria-label="Thẻ tiếp theo"][role="button"]');
  
  if (!nextButton) {
    nextButton = document.querySelector('button[data-e2e="arrow-right"]');
  }

  if (nextButton) {
    console.log("Đã tìm thấy nút Next, đang click...");
    nextButton.click();
  } else {
    console.warn("Không tìm thấy nút Next!");
  }
}

function replayCurrentVideo(video) {
  if (video) {
    console.log("Đang replay video...");
    video.currentTime = 0;
    video.play();
  }
}

function watchReelVideos() {
  const observer = new MutationObserver(() => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (!video.dataset.autoScrollAttached) {
        video.dataset.autoScrollAttached = "true";

        if (realtimeVolumeEnabled) {
          video.volume = savedVolume;
        }

        video.addEventListener("ended", () => {
          if (isReplayEnabledForCurrentPlatform()) {
            replayCurrentVideo(video);
          } else if (isAutoScrollEnabledForCurrentPlatform()) {
            clickNextButton();
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.sync.get([
  "enabled", 
  "facebookEnabled", 
  "tiktokEnabled", 
  "facebookReplayEnabled",
  "tiktokReplayEnabled",
  "volume", 
  "realtimeVolume"
], (data) => {
  console.log("Content script loaded settings:", data);
  
  if (typeof data.facebookEnabled === 'boolean') {
    facebookAutoScrollEnabled = data.facebookEnabled;
  }
  if (typeof data.tiktokEnabled === 'boolean') {
    tiktokAutoScrollEnabled = data.tiktokEnabled;
  }
  if (typeof data.facebookReplayEnabled === 'boolean') {
    facebookReplayEnabled = data.facebookReplayEnabled;
  }
  if (typeof data.tiktokReplayEnabled === 'boolean') {
    tiktokReplayEnabled = data.tiktokReplayEnabled;
  }
  if (typeof data.enabled === 'boolean') {
    autoScrollEnabled = data.enabled;
  }
  
  if (typeof data.volume === 'number' && data.volume >= 0 && data.volume <= 1) {
    savedVolume = data.volume;
  }
  if (typeof data.realtimeVolume === 'boolean') {
    realtimeVolumeEnabled = data.realtimeVolume;
  }
  
  console.log("Final content script settings:", {
    autoScrollEnabled,
    facebookAutoScrollEnabled,
    tiktokAutoScrollEnabled,
    facebookReplayEnabled,
    tiktokReplayEnabled,
    savedVolume,
    realtimeVolumeEnabled
  });
  
  watchReelVideos();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateSettings") {
    console.log("Content script received settings update:", message);
    
    if (typeof message.enabled === 'boolean') {
      autoScrollEnabled = message.enabled;
    }
    if (typeof message.facebookEnabled === 'boolean') {
      facebookAutoScrollEnabled = message.facebookEnabled;
    }
    if (typeof message.tiktokEnabled === 'boolean') {
      tiktokAutoScrollEnabled = message.tiktokEnabled;
    }
    if (typeof message.facebookReplayEnabled === 'boolean') {
      facebookReplayEnabled = message.facebookReplayEnabled;
    }
    if (typeof message.tiktokReplayEnabled === 'boolean') {
      tiktokReplayEnabled = message.tiktokReplayEnabled;
    }
    if (typeof message.realtimeVolume === 'boolean') {
      realtimeVolumeEnabled = message.realtimeVolume;
    }

    if (typeof message.volume === "number" && message.volume >= 0 && message.volume <= 1) {
      savedVolume = message.volume;
      if (realtimeVolumeEnabled) {
        const videos = document.querySelectorAll("video");
        videos.forEach((v) => (v.volume = savedVolume));
      }
    }
    
    console.log("Content script updated settings:", {
      autoScrollEnabled,
      facebookAutoScrollEnabled,
      tiktokAutoScrollEnabled,
      facebookReplayEnabled,
      tiktokReplayEnabled,
      savedVolume,
      realtimeVolumeEnabled
    });
  }
});