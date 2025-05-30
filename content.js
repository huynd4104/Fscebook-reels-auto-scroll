let autoScrollEnabled = true;
let delayTime = 500;
let savedVolume = 1.0;

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
        video.volume = savedVolume;

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

chrome.storage.sync.get(["enabled", "delay", "volume"], (data) => {
  autoScrollEnabled = data.enabled ?? true;
  delayTime = parseInt(data.delay) || 500;
  savedVolume = typeof data.volume === "number" ? data.volume : 1.0;
  watchReelVideos();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateSettings") {
    autoScrollEnabled = message.enabled;
    delayTime = message.delay;

    if (typeof message.volume === "number") {
      savedVolume = message.volume;
      const videos = document.querySelectorAll("video");
      videos.forEach((v) => (v.volume = savedVolume));
    }
  }
});
