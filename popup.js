document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle");
  const delayInput = document.getElementById("delay");
  const volumeSlider = document.getElementById("volume");
  const volumeValue = document.getElementById("volume-value");
  const realtimeCheckbox = document.getElementById("realtime-volume");

  chrome.storage.sync.get(["enabled", "delay", "volume", "realtimeVolume"], (data) => {
    toggle.checked = data.enabled ?? true;
    delayInput.value = data.delay ?? 500;
    volumeSlider.value = data.volume ?? 1.0;
    volumeValue.textContent = Math.round((volumeSlider.value || 0) * 100) + "%";
    realtimeCheckbox.checked = data.realtimeVolume ?? true;
  });

  toggle.addEventListener("change", sendSettings);
  delayInput.addEventListener("change", sendSettings);
  volumeSlider.addEventListener("input", () => {
    volumeValue.textContent = Math.round(volumeSlider.value * 100) + "%";
    sendSettings();
  });
  realtimeCheckbox.addEventListener("change", sendSettings);

  function sendSettings() {
    const enabled = toggle.checked;
    const delay = parseInt(delayInput.value) || 0;
    const volume = parseFloat(volumeSlider.value) || 1.0;
    const realtimeVolume = realtimeCheckbox.checked;

    chrome.storage.sync.set({ enabled, delay, volume, realtimeVolume });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateSettings",
        enabled,
        delay,
        volume,
        realtimeVolume
      });
    });
  }
});
