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

  // Function to set UI from settings
  function setUIFromSettings(data) {
    console.log("Setting UI from data:", data);

    // Handle Facebook settings
    const facebookEnabled = data.facebookEnabled === true;
    const facebookReplayEnabled = data.facebookReplayEnabled === true;

    console.log("Facebook - enabled:", facebookEnabled, "replay:", facebookReplayEnabled);

    // Reset all Facebook radio buttons
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

    // Handle TikTok settings
    const tiktokEnabled = data.tiktokEnabled === true;
    const tiktokReplayEnabled = data.tiktokReplayEnabled === true;

    console.log("TikTok - enabled:", tiktokEnabled, "replay:", tiktokReplayEnabled);

    // Reset all TikTok radio buttons
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

    // Handle volume
    const volume = typeof data.volume === 'number' ? data.volume : 1.0;
    volumeSlider.value = volume;
    volumeValue.textContent = Math.round(volume * 100) + "%";
    console.log("Set volume to:", volume);

    // Handle realtime volume
    const realtimeVolume = data.realtimeVolume === true;
    realtimeCheckbox.checked = realtimeVolume;
    console.log("Set realtime volume to:", realtimeVolume);

    // Update volume control state
    updateVolumeControlState();

    console.log("UI setup completed");
    updateActiveStates();
  }

  // Load settings with multiple fallbacks
  function loadSettings() {
    console.log("Loading settings...");

    // Try chrome.storage.sync first
    chrome.storage.sync.get(null, (syncData) => {
      console.log("Chrome storage sync data:", syncData);

      if (chrome.runtime.lastError) {
        console.error("Chrome storage sync error:", chrome.runtime.lastError);
        // Fallback to local storage
        loadFromLocalStorage();
        return;
      }

      // Check if there is data in sync storage
      if (Object.keys(syncData).length > 0) {
        console.log("Found data in sync storage");
        setUIFromSettings(syncData);
      } else {
        console.log("No data in sync storage, trying local storage");
        loadFromLocalStorage();
      }
    });
  }

  // Fallback to local storage
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

  // Set default settings
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

    // Save defaults
    chrome.storage.sync.set(defaultData, () => {
      console.log("Default settings saved");
    });
  }

  // Delay loading to ensure DOM is ready
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

    // Save to both sync and local storage
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

  function makeOptionItemsClickable() {
    const optionItems = document.querySelectorAll('.option-item');

    optionItems.forEach(item => {
      const radio = item.querySelector('input[type="radio"]');

      // Add click handler
      item.addEventListener('click', function (e) {
        if (radio && !radio.checked) {
          radio.checked = true;
          radio.dispatchEvent(new Event('change')); // Fixed typo: Changed 'Radios' to 'radio'
          updateActiveStates();
        }
      });

      // Add change handler to radio
      if (radio) {
        radio.addEventListener('change', function () {
          updateActiveStates();
          sendSettings(); // Ensure settings are saved when radio changes
        });
      }
    });

    // Initial active state update
    updateActiveStates();
  }

  // Function to update active states
  function updateActiveStates() {
    const optionItems = document.querySelectorAll('.option-item');

    optionItems.forEach(item => {
      const radio = item.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Call the function after DOM is ready
  makeOptionItemsClickable();
});