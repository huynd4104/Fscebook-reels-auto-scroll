document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("toggle");
  const delayInput = document.getElementById("delay");

  chrome.storage.sync.get(["enabled", "delay"], (data) => {
    toggle.checked = data.enabled ?? true;
    delayInput.value = data.delay ?? 500;
  });

  toggle.addEventListener("change", () => {
    sendSettings();
  });

  delayInput.addEventListener("change", () => {
    sendSettings();
  });

  function sendSettings() {
    const enabled = toggle.checked;
    const delay = parseInt(delayInput.value) || 0;

    chrome.storage.sync.set({ enabled, delay });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "updateSettings",
        enabled,
        delay
      });
    });
  }
});
