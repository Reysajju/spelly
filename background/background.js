chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "openai-request") {
      // Retrieve the user's API key
      chrome.storage.local.get("openaiApiKey", (data) => {
        const apiKey = data.openaiApiKey;
  
        if (!apiKey) {
          sendResponse({ error: "No API key found! Please set it in the popup." });
          return;
        }
  
        fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "text-davinci-003",
            prompt: message.prompt,
            max_tokens: 50
          })
        })
          .then((response) => response.json())
          .then((data) => sendResponse({ suggestion: data.choices[0].text.trim() }))
          .catch((err) => sendResponse({ error: err.message }));
  
        return true; // Keep the message channel open for async response
      });
    }
  });
  