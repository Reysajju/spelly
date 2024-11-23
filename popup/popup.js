document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const toggleBtn = document.getElementById("toggleBtn");
  const statusText = document.getElementById("statusText");

  // Get the stored API key if it exists
  const storedApiKey = localStorage.getItem("openai_api_key");
  if (storedApiKey) {
    apiKeyInput.value = storedApiKey;
  }

  // Button to save API key
  saveBtn.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
      localStorage.setItem("openai_api_key", apiKey);
      alert("API Key Saved Successfully!");
    } else {
      alert("Please enter a valid API key.");
    }
  });

  // Toggle the extension (enable/disable suggestions)
  let isEnabled = false; // Store the extension's enabled/disabled state
  toggleBtn.addEventListener("click", () => {
    isEnabled = !isEnabled;

    // Update the status and button text
    if (isEnabled) {
      statusText.textContent = "Enabled";
      toggleBtn.textContent = "Disable Suggestions";
      // You can send a message to the background script to enable the functionality
      chrome.runtime.sendMessage({ type: "enable-suggestions", status: true });
    } else {
      statusText.textContent = "Disabled";
      toggleBtn.textContent = "Enable Suggestions";
      // Send message to disable the functionality
      chrome.runtime.sendMessage({ type: "enable-suggestions", status: false });
    }
  });

  // You can add additional functionality here if needed
});
