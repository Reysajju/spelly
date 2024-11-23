// Detect user input in text fields (inputs or textareas)
document.addEventListener("input", (event) => {
  const target = event.target;

  // Process only text inputs or textareas
  if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
    const text = target.value;

    if (text.length > 5) {
      // Send the text to the background script for an OpenAI suggestion
      chrome.runtime.sendMessage(
        { type: "openai-request", prompt: text },
        (response) => {
          if (response.error) {
            console.error("Error from OpenAI:", response.error);
            return;
          }

          if (response.suggestion) {
            // Show the suggestion to the user (you can customize this part)
            showSuggestion(target, response.suggestion);
          }
        }
      );
    }
  }
});

// Function to display AI suggestions as a tooltip or placeholder
function showSuggestion(target, suggestion) {
  let tooltip = target.nextElementSibling;

  if (!tooltip || !tooltip.classList.contains("ai-suggestion-tooltip")) {
    tooltip = document.createElement("div");
    tooltip.className = "ai-suggestion-tooltip";
    target.parentNode.appendChild(tooltip);
  }

  tooltip.innerText = `Suggestion: ${suggestion}`;
  tooltip.style.position = "absolute";
  tooltip.style.left = `${target.offsetLeft}px`;
  tooltip.style.top = `${target.offsetTop + target.offsetHeight}px`;
  tooltip.style.background = "#f1f1f1";
  tooltip.style.border = "1px solid #ccc";
  tooltip.style.padding = "5px";
  tooltip.style.zIndex = "1000";
  tooltip.style.fontSize = "12px";

  // Remove the suggestion after 5 seconds
  setTimeout(() => {
    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip);
    }
  }, 5000);
}

// api.js

// Function to check if the OpenAI API key is set
function getApiKey() {
  return localStorage.getItem("openai_api_key");
}

// Function to send OpenAI API requests
async function fetchOpenAIResponse(prompt, isSpellCheck) {
  const apiKey = getApiKey(); // Get API key from localStorage

  if (!apiKey) {
    return { error: "API key is not set." };
  }

  const apiPrompt = isSpellCheck
    ? `Correct the spelling mistakes in the following text: ${prompt}`
    : `Suggest the next word in the sentence: ${prompt}`;

  try {
    const response = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-davinci-003",  // Use appropriate model
        prompt: apiPrompt,
        max_tokens: 50,  // Customize token length
        temperature: 0.7,  // Adjust creativity level
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0].text) {
      return { suggestion: data.choices[0].text.trim() };
    } else {
      return { error: "No suggestion found." };
    }
  } catch (error) {
    return { error: error.message };
  }
}

// Expose function to be used by background.js or popup.js
window.fetchOpenAIResponse = fetchOpenAIResponse;
