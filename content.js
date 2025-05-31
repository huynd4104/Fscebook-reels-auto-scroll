let autoScrollEnabled = true;
let facebookAutoScrollEnabled = true;
let tiktokAutoScrollEnabled = true;
let delayTime = 100;
let savedVolume = 1.0;
let realtimeVolumeEnabled = true;

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
  return autoScrollEnabled; // fallback cho backward compatibility
}

function clickNextButton() {
  // Facebook Reels
  let nextButton = document.querySelector('[aria-label="Thẻ tiếp theo"][role="button"]');
  
  // Nếu không tìm thấy trên Facebook, thử trên TikTok
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

function watchReelVideos() {
  const observer = new MutationObserver(() => {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
      if (!video.dataset.autoScrollAttached) {
        video.dataset.autoScrollAttached = "true";

        // Gán volume cho video
        if (realtimeVolumeEnabled) {
          video.volume = savedVolume;
        }

        video.addEventListener("ended", () => {
          if (isAutoScrollEnabledForCurrentPlatform()) {
            setTimeout(clickNextButton, delayTime);
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
  "delay", 
  "volume", 
  "realtimeVolume"
], (data) => {
  // Backward compatibility: nếu chưa có settings riêng cho từng platform
  autoScrollEnabled = data.enabled ?? true;
  facebookAutoScrollEnabled = data.facebookEnabled ?? data.enabled ?? true;
  tiktokAutoScrollEnabled = data.tiktokEnabled ?? data.enabled ?? true;
  
  delayTime = parseInt(data.delay) || 100;
  savedVolume = typeof data.volume === "number" ? data.volume : 1.0;
  realtimeVolumeEnabled = data.realtimeVolume ?? true;
  watchReelVideos();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateSettings") {
    // Cập nhật settings chung (backward compatibility)
    if (typeof message.enabled !== 'undefined') {
      autoScrollEnabled = message.enabled;
    }
    
    // Cập nhật settings riêng cho từng platform
    if (typeof message.facebookEnabled !== 'undefined') {
      facebookAutoScrollEnabled = message.facebookEnabled;
    }
    if (typeof message.tiktokEnabled !== 'undefined') {
      tiktokAutoScrollEnabled = message.tiktokEnabled;
    }
    
    delayTime = message.delay;
    realtimeVolumeEnabled = message.realtimeVolume ?? true;

    if (typeof message.volume === "number") {
      savedVolume = message.volume;
      if (realtimeVolumeEnabled) {
        const videos = document.querySelectorAll("video");
        videos.forEach((v) => (v.volume = savedVolume));
      }
    }
  }
});