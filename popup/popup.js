document.getElementById("apiForm").addEventListener("submit", (e) => {
    e.preventDefault();
  
    const apiKey = document.getElementById("apiKey").value.trim();
  
    if (!apiKey.startsWith("sk-")) {
      document.getElementById("status").innerText = "Invalid API key format!";
      return;
    }
  
    // Save the API key in local storage
    chrome.storage.local.set({ openaiApiKey: apiKey }, () => {
      document.getElementById("status").innerText = "API key saved successfully!";
    });
  });
  