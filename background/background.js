let isEnabled = false;  // Flag to track whether suggestions are enabled

// Listen for messages from the popup (Enable/Disable functionality)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handling enable/disable toggle
  if (request.type === "enable-suggestions") {
    isEnabled = request.status;  // Update the enabled status
    sendResponse({ success: true });
  }

  // Handle OpenAI request when suggestions are enabled
  if (request.type === "openai-request") {
    // If suggestions are disabled, don't proceed
    if (!isEnabled) {
      sendResponse({ error: "Suggestions are currently disabled." });
      return;
    }

    const apiKey = localStorage.getItem("openai_api_key");  // Get the saved OpenAI API key

    // Check if API key is present
    if (!apiKey) {
      sendResponse({ error: "API key is not set." });
      return;
    }

    // Construct the prompt for OpenAI's API
    const prompt = request.prompt || "";

    // Determine if this is a spelling check request
    const isSpellCheckRequest = request.isSpellCheck || false;
    let apiPrompt = isSpellCheckRequest
      ? `Correct the spelling mistakes in the following text: ${prompt}`
      : `Suggest the next word in the sentence: ${prompt}`;

    // Call OpenAI API to get suggestions
    fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-davinci-003", // Or another model of your choice
        prompt: apiPrompt,
        max_tokens: 50,  // Adjust based on needs
        temperature: 0.7,  // Controls creativity
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.choices && data.choices[0].text) {
          const suggestion = data.choices[0].text.trim(); // Get the suggestion from the API response
          sendResponse({ suggestion });
        } else {
          sendResponse({ error: "No suggestion found." });
        }
      })
      .catch((error) => {
        sendResponse({ error: error.message });
      });

    return true; // Keep the message channel open for async response
  }
});
