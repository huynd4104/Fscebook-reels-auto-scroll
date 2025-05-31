document.addEventListener("DOMContentLoaded", () => {
  const facebookToggle = document.getElementById("facebook-toggle");
  const tiktokToggle = document.getElementById("tiktok-toggle");
  const delayInput = document.getElementById("delay");
  const volumeSlider = document.getElementById("volume");
  const volumeValue = document.getElementById("volume-value");
  const realtimeCheckbox = document.getElementById("realtime-volume");

  // Load saved settings
  chrome.storage.sync.get([
    "enabled", 
    "facebookEnabled", 
    "tiktokEnabled", 
    "delay", 
    "volume", 
    "realtimeVolume"
  ], (data) => {
    // Backward compatibility: nếu chưa có settings riêng cho từng platform
    const defaultEnabled = data.enabled ?? true;
    
    facebookToggle.checked = data.facebookEnabled ?? defaultEnabled;
    tiktokToggle.checked = data.tiktokEnabled ?? defaultEnabled;
    delayInput.value = data.delay ?? 500;
    volumeSlider.value = data.volume ?? 1.0;
    volumeValue.textContent = Math.round((volumeSlider.value || 0) * 100) + "%";
    realtimeCheckbox.checked = data.realtimeVolume ?? true;
  });

  // Event listeners
  facebookToggle.addEventListener("change", sendSettings);
  tiktokToggle.addEventListener("change", sendSettings);
  delayInput.addEventListener("change", sendSettings);
  volumeSlider.addEventListener("input", () => {
    volumeValue.textContent = Math.round(volumeSlider.value * 100) + "%";
    sendSettings();
  });
  realtimeCheckbox.addEventListener("change", sendSettings);

  function sendSettings() {
    const facebookEnabled = facebookToggle.checked;
    const tiktokEnabled = tiktokToggle.checked;
    const delay = parseInt(delayInput.value) || 0;
    const volume = parseFloat(volumeSlider.value) || 1.0;
    const realtimeVolume = realtimeCheckbox.checked;
    
    // Backward compatibility: enabled = true nếu ít nhất 1 platform được bật
    const enabled = facebookEnabled || tiktokEnabled;

    // Save to storage
    chrome.storage.sync.set({ 
      enabled, 
      facebookEnabled, 
      tiktokEnabled, 
      delay, 
      volume, 
      realtimeVolume 
    });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateSettings",
        enabled,
        facebookEnabled,
        tiktokEnabled,
        delay,
        volume,
        realtimeVolume
      });
    });
  }
});