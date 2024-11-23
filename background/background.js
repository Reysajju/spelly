let isEnabled = false;  // Flag to track whether suggestions are enabled

// Listen for messages from the popup (Enable/Disable functionality)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "enable-suggestions") {
    isEnabled = request.status;  // Update the enabled status
    sendResponse({ success: true });
  }

  // Handle OpenAI request when suggestions are enabled
  if (request.type === "openai-request" && isEnabled) {
    const apiKey = localStorage.getItem("openai_api_key");  // Get the saved OpenAI API key

    if (!apiKey) {
      sendResponse({ error: "API key is not set." });
      return;
    }

    // Construct the prompt for OpenAI's API
    const prompt = request.prompt || "";
    
    // If it's a spelling suggestion request, modify the prompt accordingly
    const isSpellCheckRequest = request.isSpellCheck || false;
    let apiPrompt = isSpellCheckRequest ? `Correct the spelling mistakes in the following text: ${prompt}` : `Suggest the next word in the sentence: ${prompt}`;

    // Call OpenAI API to get suggestions
    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-davinci-003',  // Use appropriate model for completion
        prompt: apiPrompt,
        max_tokens: 50,  // Adjust the max tokens based on your needs
        temperature: 0.7,  // You can change the creativity level
      }),
    })
    .then(response => response.json())
    .then(data => {
      const suggestion = data.choices && data.choices[0].text.trim();  // Get the suggestion from the API response
      sendResponse({ suggestion });
    })
    .catch(error => {
      sendResponse({ error: error.message });
    });

    return true;  // Keep the message channel open for asynchronous response
  }
});
