document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded - starting initialization");
  
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
  const volumeSection = document.getElementById("volume-section");

  // Function to update volume control state
  function updateVolumeControlState() {
    const isEnabled = realtimeCheckbox.checked;
    volumeSlider.disabled = !isEnabled;
    
    if (isEnabled) {
      volumeSection.classList.remove("disabled");
      volumeSection.classList.add("enabled");
    } else {
      volumeSection.classList.add("disabled");
      volumeSection.classList.remove("enabled");
    }
    
    // Update slider background based on current value
    if (isEnabled) {
      const percentage = ((volumeSlider.value - volumeSlider.min) / (volumeSlider.max - volumeSlider.min)) * 100;
      volumeSlider.style.background = `linear-gradient(to right, #00d4ff 0%, #00d4ff ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
    }
  }

  // FIX: Function để thiết lập UI từ settings
  function setUIFromSettings(data) {
    console.log("Setting UI from data:", data);
    
    // FIX 1: Xử lý Facebook settings
    const facebookEnabled = data.facebookEnabled === true;
    const facebookReplayEnabled = data.facebookReplayEnabled === true;
    
    console.log("Facebook - enabled:", facebookEnabled, "replay:", facebookReplayEnabled);
    
    // Reset tất cả Facebook radio buttons trước
    facebookOffRadio.checked = false;
    facebookScrollRadio.checked = false;
    facebookReplayRadio.checked = false;
    
    if (facebookReplayEnabled) {
      facebookReplayRadio.checked = true;
      console.log("Set Facebook to Replay mode");
    } else if (facebookEnabled) {
      facebookScrollRadio.checked = true;
      console.log("Set Facebook to Scroll mode");
    } else {
      facebookOffRadio.checked = true;
      console.log("Set Facebook to Off mode");
    }
    
    // FIX 2: Xử lý TikTok settings
    const tiktokEnabled = data.tiktokEnabled === true;
    const tiktokReplayEnabled = data.tiktokReplayEnabled === true;
    
    console.log("TikTok - enabled:", tiktokEnabled, "replay:", tiktokReplayEnabled);
    
    // Reset tất cả TikTok radio buttons trước
    tiktokOffRadio.checked = false;
    tiktokScrollRadio.checked = false;
    tiktokReplayRadio.checked = false;
    
    if (tiktokReplayEnabled) {
      tiktokReplayRadio.checked = true;
      console.log("Set TikTok to Replay mode");
    } else if (tiktokEnabled) {
      tiktokScrollRadio.checked = true;
      console.log("Set TikTok to Scroll mode");
    } else {
      tiktokOffRadio.checked = true;
      console.log("Set TikTok to Off mode");
    }
    
    // FIX 3: FIXED - Xử lý delay (cho phép 0)
    const delay = (typeof data.delay === 'number' && data.delay >= 0) ? data.delay : 500;
    delayInput.value = delay;
    console.log("Set delay to:", delay);
    
    // FIX 4: Xử lý volume
    const volume = typeof data.volume === 'number' ? data.volume : 1.0;
    volumeSlider.value = volume;
    volumeValue.textContent = Math.round(volume * 100) + "%";
    console.log("Set volume to:", volume);
    
    // FIX 5: Xử lý realtime volume
    const realtimeVolume = data.realtimeVolume === true;
    realtimeCheckbox.checked = realtimeVolume;
    console.log("Set realtime volume to:", realtimeVolume);
    
    // Update volume control state
    updateVolumeControlState();
    
    console.log("UI setup completed");
  }

  // FIX: Load settings với multiple fallbacks
  function loadSettings() {
    console.log("Loading settings...");
    
    // FIX 6: Thử chrome.storage.sync trước
    chrome.storage.sync.get(null, (syncData) => {
      console.log("Chrome storage sync data:", syncData);
      
      if (chrome.runtime.lastError) {
        console.error("Chrome storage sync error:", chrome.runtime.lastError);
        // Fallback to local storage
        loadFromLocalStorage();
        return;
      }
      
      // Kiểm tra nếu có data trong sync storage
      if (Object.keys(syncData).length > 0) {
        console.log("Found data in sync storage");
        setUIFromSettings(syncData);
      } else {
        console.log("No data in sync storage, trying local storage");
        loadFromLocalStorage();
      }
    });
  }
  
  // FIX 7: Fallback to local storage
  function loadFromLocalStorage() {
    chrome.storage.local.get(null, (localData) => {
      console.log("Chrome storage local data:", localData);
      
      if (chrome.runtime.lastError) {
        console.error("Chrome storage local error:", chrome.runtime.lastError);
        // Set default values
        setDefaultSettings();
        return;
      }
      
      if (Object.keys(localData).length > 0) {
        console.log("Found data in local storage");
        setUIFromSettings(localData);
      } else {
        console.log("No data found anywhere, setting defaults");
        setDefaultSettings();
      }
    });
  }
  
  // FIX 8: Set default settings
  function setDefaultSettings() {
    console.log("Setting default settings");
    const defaultData = {
      enabled: true,
      facebookEnabled: true,
      tiktokEnabled: true,
      facebookReplayEnabled: false,
      tiktokReplayEnabled: false,
      delay: 500,
      volume: 1.0,
      realtimeVolume: false
    };
    
    setUIFromSettings(defaultData);
    
    // Save defaults
    chrome.storage.sync.set(defaultData, () => {
      console.log("Default settings saved");
    });
  }

  // FIX 9: Delay loading để đảm bảo DOM sẵn sàng
  setTimeout(() => {
    loadSettings();
  }, 100);

  // Event listeners for Facebook
  facebookOffRadio.addEventListener("change", () => {
    console.log("Facebook Off selected");
    sendSettings();
  });
  facebookScrollRadio.addEventListener("change", () => {
    console.log("Facebook Scroll selected");
    sendSettings();
  });
  facebookReplayRadio.addEventListener("change", () => {
    console.log("Facebook Replay selected");
    sendSettings();
  });
  
  // Event listeners for TikTok
  tiktokOffRadio.addEventListener("change", () => {
    console.log("TikTok Off selected");
    sendSettings();
  });
  tiktokScrollRadio.addEventListener("change", () => {
    console.log("TikTok Scroll selected");
    sendSettings();
  });
  tiktokReplayRadio.addEventListener("change", () => {
    console.log("TikTok Replay selected");
    sendSettings();
  });
  
  // Event listeners for other controls
  delayInput.addEventListener("change", () => {
    console.log("Delay changed to:", delayInput.value);
    sendSettings();
  });
  
  volumeSlider.addEventListener("input", () => {
    const volume = parseFloat(volumeSlider.value);
    volumeValue.textContent = Math.round(volume * 100) + "%";
    console.log("Volume changed to:", volume);
    updateVolumeControlState();
    sendSettings();
  });
  
  realtimeCheckbox.addEventListener("change", () => {
    console.log("Realtime volume changed to:", realtimeCheckbox.checked);
    updateVolumeControlState();
    sendSettings();
  });

  function sendSettings() {
    console.log("Sending settings...");
    
    // Determine Facebook mode
    let facebookEnabled = false;
    let facebookReplayEnabled = false;
    
    if (facebookScrollRadio.checked) {
      facebookEnabled = true;
      facebookReplayEnabled = false;
    } else if (facebookReplayRadio.checked) {
      facebookEnabled = false;
      facebookReplayEnabled = true;
    }
    
    // Determine TikTok mode
    let tiktokEnabled = false;
    let tiktokReplayEnabled = false;
    
    if (tiktokScrollRadio.checked) {
      tiktokEnabled = true;
      tiktokReplayEnabled = false;
    } else if (tiktokReplayRadio.checked) {
      tiktokEnabled = false;
      tiktokReplayEnabled = true;
    }
    
    // FIXED: Xử lý delay - cho phép 0, chỉ dùng fallback nếu không hợp lệ
    const delayValue = parseInt(delayInput.value);
    const delay = (isNaN(delayValue) || delayValue < 0) ? 500 : delayValue;
    
    const volume = parseFloat(volumeSlider.value) || 1.0;
    const realtimeVolume = realtimeCheckbox.checked;
    const enabled = facebookEnabled || tiktokEnabled || facebookReplayEnabled || tiktokReplayEnabled;

    const settings = {
      enabled, 
      facebookEnabled, 
      tiktokEnabled,
      facebookReplayEnabled,
      tiktokReplayEnabled,
      delay, 
      volume, 
      realtimeVolume 
    };

    console.log("Saving settings:", settings);

    // FIX 10: Save to both sync and local storage
    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to save to sync storage:", chrome.runtime.lastError);
        // Fallback to local storage
        chrome.storage.local.set(settings, () => {
          console.log("Settings saved to local storage");
        });
      } else {
        console.log("Settings saved to sync storage");
        // Also save to local as backup
        chrome.storage.local.set(settings);
      }
    });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "updateSettings",
          ...settings
        }).catch((error) => {
          console.log("Could not send message to content script:", error);
        });
      }
    });
  }
});