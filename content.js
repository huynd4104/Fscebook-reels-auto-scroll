// FIX 1: Khai báo biến với giá trị mặc định rõ ràng
let autoScrollEnabled = true;
let facebookAutoScrollEnabled = true;
let tiktokAutoScrollEnabled = true;
let facebookReplayEnabled = false;
let tiktokReplayEnabled = false;
let delayTime = 500; // FIX 2: Default delay 500ms thay vì 100ms
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

        // Gán volume cho video
        if (realtimeVolumeEnabled) {
          video.volume = savedVolume;
        }

        video.addEventListener("ended", () => {
          if (isReplayEnabledForCurrentPlatform()) {
            // Nếu replay được bật, phát lại video
            setTimeout(() => replayCurrentVideo(video), delayTime);
          } else if (isAutoScrollEnabledForCurrentPlatform()) {
            // Nếu auto scroll được bật, chuyển video tiếp theo
            setTimeout(clickNextButton, delayTime);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// FIX 3: Cải thiện logic load settings
chrome.storage.sync.get([
  "enabled", 
  "facebookEnabled", 
  "tiktokEnabled", 
  "facebookReplayEnabled",
  "tiktokReplayEnabled",
  "delay", 
  "volume", 
  "realtimeVolume"
], (data) => {
  console.log("Content script loaded settings:", data);
  
  // FIX 4: Xử lý giá trị boolean chính xác
  // Chỉ sử dụng giá trị đã lưu nếu nó được định nghĩa rõ ràng
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
  
  // FIX 5: FIXED - Xử lý delay và volume (cho phép delay = 0)
  if (typeof data.delay === 'number' && data.delay >= 0) {
    delayTime = data.delay;
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
    delayTime,
    savedVolume,
    realtimeVolumeEnabled
  });
  
  watchReelVideos();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateSettings") {
    console.log("Content script received settings update:", message);
    
    // FIX 6: FIXED - Cập nhật settings với type checking (cho phép delay = 0)
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
    // FIXED: Cho phép delay = 0, chỉ từ chối giá trị âm
    if (typeof message.delay === 'number' && message.delay >= 0) {
      delayTime = message.delay;
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
      delayTime,
      savedVolume,
      realtimeVolumeEnabled
    });
  }
});