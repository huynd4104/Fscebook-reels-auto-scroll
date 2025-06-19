document.addEventListener("DOMContentLoaded", () => {
  console.log("Popup loaded - starting initialization");
  
  const facebookOffRadio = document.getElementById("facebook-off");
  const facebookScrollRadio = document.getElementById("facebook-scroll");
  const facebookReplayRadio = document.getElementById("facebook-replay");
  
  const tiktokOffRadio = document.getElementById("tiktok-off");
  const tiktokScrollRadio = document.getElementById("tiktok-scroll");
  const tiktokReplayRadio = document.getElementById("tiktok-replay");
  
  const volumeSlider = document.getElementById("volume");
  const volumeValue = document.getElementById("volume-value");
  const realtimeCheckbox = document.getElementById("realtime-volume");
  const volumeSection = document.getElementById("volume-section");

  const optionItems = document.querySelectorAll(".option-item");

  function updateSelectedState(radio) {
    const groupName = radio.name;
    document.querySelectorAll(`input[name="${groupName}"]`).forEach((r) => {
      r.closest(".option-item").classList.remove("selected");
    });
    if (radio.checked) {
      radio.closest(".option-item").classList.add("selected");
    }
  }

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
    
    if (isEnabled) {
      const percentage = ((volumeSlider.value - volumeSlider.min) / (volumeSlider.max - volumeSlider.min)) * 100;
      volumeSlider.style.background = `linear-gradient(to right, #00d4ff 0%, #00d4ff ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
    }
  }

  function setUIFromSettings(data) {
    console.log("Setting UI from data:", data);
    
    const facebookEnabled = data.facebookEnabled === true;
    const facebookReplayEnabled = data.facebookReplayEnabled === true;
    
    console.log("Facebook - enabled:", facebookEnabled, "replay:", facebookReplayEnabled);
    
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
    
    updateSelectedState(facebookOffRadio);
    updateSelectedState(facebookScrollRadio);
    updateSelectedState(facebookReplayRadio);
    
    const tiktokEnabled = data.tiktokEnabled === true;
    const tiktokReplayEnabled = data.tiktokReplayEnabled === true;
    
    console.log("TikTok - enabled:", tiktokEnabled, "replay:", tiktokReplayEnabled);
    
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
    
    updateSelectedState(tiktokOffRadio);
    updateSelectedState(tiktokScrollRadio);
    updateSelectedState(tiktokReplayRadio);
    
    const volume = typeof data.volume === 'number' ? data.volume : 1.0;
    volumeSlider.value = volume;
    volumeValue.textContent = Math.round(volume * 100) + "%";
    console.log("Set volume to:", volume);
    
    const realtimeVolume = data.realtimeVolume === true;
    realtimeCheckbox.checked = realtimeVolume;
    console.log("Set realtime volume to:", realtimeVolume);
    
    updateVolumeControlState();
    
    console.log("UI setup completed");
  }

  function loadSettings() {
    console.log("Loading settings...");
    
    chrome.storage.sync.get(null, (syncData) => {
      console.log("Chrome storage sync data:", syncData);
      
      if (chrome.runtime.lastError) {
        console.error("Chrome storage sync error:", chrome.runtime.lastError);
        loadFromLocalStorage();
        return;
      }
      
      if (Object.keys(syncData).length > 0) {
        console.log("Found data in sync storage");
        setUIFromSettings(syncData);
      } else {
        console.log("No data in sync storage, trying local storage");
        loadFromLocalStorage();
      }
    });
  }
  
  function loadFromLocalStorage() {
    chrome.storage.local.get(null, (localData) => {
      console.log("Chrome storage local data:", localData);
      
      if (chrome.runtime.lastError) {
        console.error("Chrome storage local error:", chrome.runtime.lastError);
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
  
  function setDefaultSettings() {
    console.log("Setting default settings");
    const defaultData = {
      enabled: true,
      facebookEnabled: true,
      tiktokEnabled: true,
      facebookReplayEnabled: false,
      tiktokReplayEnabled: false,
      volume: 1.0,
      realtimeVolume: false
    };
    
    setUIFromSettings(defaultData);
    
    chrome.storage.sync.set(defaultData, () => {
      console.log("Default settings saved");
    });
  }

  setTimeout(() => {
    loadSettings();
  }, 100);

  optionItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "LABEL") {
        return;
      }
      
      const radio = item.querySelector('input[type="radio"]');
      if (radio && !radio.checked) {
        radio.checked = true;
        updateSelectedState(radio);
        radio.dispatchEvent(new Event("change"));
        console.log(`Clicked option-item, activated radio: ${radio.id}`);
      }
    });
  });

  facebookOffRadio.addEventListener("change", () => {
    console.log("Facebook Off selected");
    updateSelectedState(facebookOffRadio);
    sendSettings();
  });
  facebookScrollRadio.addEventListener("change", () => {
    console.log("Facebook Scroll selected");
    updateSelectedState(facebookScrollRadio);
    sendSettings();
  });
  facebookReplayRadio.addEventListener("change", () => {
    console.log("Facebook Replay selected");
    updateSelectedState(facebookReplayRadio);
    sendSettings();
  });
  
  tiktokOffRadio.addEventListener("change", () => {
    console.log("TikTok Off selected");
    updateSelectedState(tiktokOffRadio);
    sendSettings();
  });
  tiktokScrollRadio.addEventListener("change", () => {
    console.log("TikTok Scroll selected");
    updateSelectedState(tiktokScrollRadio);
    sendSettings();
  });
  tiktokReplayRadio.addEventListener("change", () => {
    console.log("TikTok Replay selected");
    updateSelectedState(tiktokReplayRadio);
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
    
    let facebookEnabled = false;
    let facebookReplayEnabled = false;
    
    if (facebookScrollRadio.checked) {
      facebookEnabled = true;
      facebookReplayEnabled = false;
    } else if (facebookReplayRadio.checked) {
      facebookEnabled = false;
      facebookReplayEnabled = true;
    }
    
    let tiktokEnabled = false;
    let tiktokReplayEnabled = false;
    
    if (tiktokScrollRadio.checked) {
      tiktokEnabled = true;
      tiktokReplayEnabled = false;
    } else if (tiktokReplayRadio.checked) {
      tiktokEnabled = false;
      tiktokReplayEnabled = true;
    }
    
    const volume = parseFloat(volumeSlider.value) || 1.0;
    const realtimeVolume = realtimeCheckbox.checked;
    const enabled = facebookEnabled || tiktokEnabled || facebookReplayEnabled || tiktokReplayEnabled;

    const settings = {
      enabled, 
      facebookEnabled, 
      tiktokEnabled,
      facebookReplayEnabled,
      tiktokReplayEnabled,
      volume, 
      realtimeVolume 
    };

    console.log("Saving settings:", settings);

    chrome.storage.sync.set(settings, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to save to sync storage:", chrome.runtime.lastError);
        chrome.storage.local.set(settings, () => {
          console.log("Settings saved to local storage");
        });
      } else {
        console.log("Settings saved to sync storage");
        chrome.storage.local.set(settings);
      }
    });

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