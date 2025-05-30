let autoScrollEnabled = true;
let delayTime = 100;
let savedVolume = 1.0;
let realtimeVolumeEnabled = true;

function clickNextButton() {
  const nextButton = document.querySelector('[aria-label="Thẻ tiếp theo"][role="button"]');
  if (nextButton) {
    console.log("Đã tìm thấy nút 'Thẻ tiếp theo', đang click...");
    nextButton.click();
  } else {
    console.warn("Không tìm thấy nút 'Thẻ tiếp theo'!");
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
          if (autoScrollEnabled) {
            setTimeout(clickNextButton, delayTime);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

chrome.storage.sync.get(["enabled", "delay", "volume", "realtimeVolume"], (data) => {
  autoScrollEnabled = data.enabled ?? true;
  delayTime = parseInt(data.delay) || 100;
  savedVolume = typeof data.volume === "number" ? data.volume : 1.0;
  realtimeVolumeEnabled = data.realtimeVolume ?? true;
  watchReelVideos();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateSettings") {
    autoScrollEnabled = message.enabled;
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

