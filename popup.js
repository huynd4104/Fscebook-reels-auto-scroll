document.addEventListener("DOMContentLoaded", () => {
  // Facebook controls
  const facebookOffRadio = document.getElementById("facebook-off");
  const facebookScrollRadio = document.getElementById("facebook-scroll");
  const facebookReplayRadio = document.getElementById("facebook-replay");
  
  // TikTok controls
  const tiktokOffRadio = document.getElementById("tiktok-off");
  const tiktokScrollRadio = document.getElementById("tiktok-scroll");
  const tiktokReplayRadio = document.getElementById("tiktok-replay");
  
  // Other controls
  const delayInput = document.getElementById("delay");
  const volumeSlider = document.getElementById("volume");
  const volumeValue = document.getElementById("volume-value");
  const realtimeCheckbox = document.getElementById("realtime-volume");

  // Load saved settings
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
    // Backward compatibility: nếu chưa có settings riêng cho từng platform
    const defaultEnabled = data.enabled ?? true;
    
    const facebookEnabled = data.facebookEnabled ?? defaultEnabled;
    const tiktokEnabled = data.tiktokEnabled ?? defaultEnabled;
    const facebookReplayEnabled = data.facebookReplayEnabled ?? false;
    const tiktokReplayEnabled = data.tiktokReplayEnabled ?? false;
    
    // Set Facebook mode
    if (facebookReplayEnabled) {
      facebookReplayRadio.checked = true;
    } else if (facebookEnabled) {
      facebookScrollRadio.checked = true;
    } else {
      facebookOffRadio.checked = true;
    }
    
    // Set TikTok mode
    if (tiktokReplayEnabled) {
      tiktokReplayRadio.checked = true;
    } else if (tiktokEnabled) {
      tiktokScrollRadio.checked = true;
    } else {
      tiktokOffRadio.checked = true;
    }
    
    // Set other values
    delayInput.value = data.delay ?? 500;
    volumeSlider.value = data.volume ?? 1.0;
    volumeValue.textContent = Math.round((volumeSlider.value || 0) * 100) + "%";
    realtimeCheckbox.checked = data.realtimeVolume ?? true;
  });

  // Event listeners for Facebook
  facebookOffRadio.addEventListener("change", sendSettings);
  facebookScrollRadio.addEventListener("change", sendSettings);
  facebookReplayRadio.addEventListener("change", sendSettings);
  
  // Event listeners for TikTok
  tiktokOffRadio.addEventListener("change", sendSettings);
  tiktokScrollRadio.addEventListener("change", sendSettings);
  tiktokReplayRadio.addEventListener("change", sendSettings);
  
  // Event listeners for other controls
  delayInput.addEventListener("change", sendSettings);
  volumeSlider.addEventListener("input", () => {
    volumeValue.textContent = Math.round(volumeSlider.value * 100) + "%";
    sendSettings();
  });
  realtimeCheckbox.addEventListener("change", sendSettings);

  function sendSettings() {
    // Determine Facebook mode
    let facebookEnabled = false;
    let facebookReplayEnabled = false;
    if (facebookScrollRadio.checked) {
      facebookEnabled = true;
    } else if (facebookReplayRadio.checked) {
      facebookReplayEnabled = true;
    }
    
    // Determine TikTok mode
    let tiktokEnabled = false;
    let tiktokReplayEnabled = false;
    if (tiktokScrollRadio.checked) {
      tiktokEnabled = true;
    } else if (tiktokReplayRadio.checked) {
      tiktokReplayEnabled = true;
    }
    
    const delay = parseInt(delayInput.value) || 0;
    const volume = parseFloat(volumeSlider.value) || 1.0;
    const realtimeVolume = realtimeCheckbox.checked;
    
    // Backward compatibility: enabled = true nếu ít nhất 1 platform có chức năng nào đó được bật
    const enabled = facebookEnabled || tiktokEnabled || facebookReplayEnabled || tiktokReplayEnabled;

    // Save to storage
    chrome.storage.sync.set({ 
      enabled, 
      facebookEnabled, 
      tiktokEnabled,
      facebookReplayEnabled,
      tiktokReplayEnabled,
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
        facebookReplayEnabled,
        tiktokReplayEnabled,
        delay,
        volume,
        realtimeVolume
      });
    });
  }
});