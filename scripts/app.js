// app.js

// Flag to track whether suggestions are enabled or not
let isEnabled = false;

// Function to toggle suggestions (enable/disable)
function toggleSuggestions(status) {
  isEnabled = status;
  const statusText = isEnabled ? "enabled" : "disabled";
  console.log(`Suggestions are now ${statusText}`);

  // Store the state in Chrome storage for persistence
  chrome.storage.local.set({ suggestionsEnabled: isEnabled });
}

// Function to handle text input and request word suggestions
function handleTextInput(event) {
  if (!isEnabled) {
    return;  // If suggestions are disabled, do nothing
  }

  const text = event.target.value.trim();  // Get the current input text

  if (text.length > 0) {
    // Send the request to OpenAI for a word suggestion
    chrome.runtime.sendMessage(
      { type: "openai-request", prompt: text, isSpellCheck: false },
      (response) => {
        if (response.suggestion) {
          showSuggestion(response.suggestion);
        } else if (response.error) {
          console.error(response.error);
        }
      }
    );
  }
}

// Function to handle spelling correction
function handleSpellCheck(event) {
  if (!isEnabled) {
    return;  // If suggestions are disabled, do nothing
  }

  const text = event.target.value.trim();  // Get the current input text

  if (text.length > 0) {
    // Send the request to OpenAI for a spelling suggestion
    chrome.runtime.sendMessage(
      { type: "openai-request", prompt: text, isSpellCheck: true },
      (response) => {
        if (response.suggestion) {
          showSuggestion(response.suggestion);
        } else if (response.error) {
          console.error(response.error);
        }
      }
    );
  }
}

// Function to display the suggestion in the popup
function showSuggestion(suggestion) {
  const suggestionBox = document.getElementById("suggestion-box");
  suggestionBox.innerText = `Next word suggestion: ${suggestion}`;
}

// Event listener for text input (for next word suggestion)
document.getElementById("text-input").addEventListener("input", handleTextInput);

// Event listener for the spell check button
document.getElementById("spell-check-btn").addEventListener("click", handleSpellCheck);

// Event listener for enabling/disabling suggestions toggle
document.getElementById("enable-toggle").addEventListener("change", (event) => {
  toggleSuggestions(event.target.checked);
});

// Initialize the app, checking if suggestions are enabled or disabled
function initializeApp() {
  // Check the initial state of the suggestions enabled flag from Chrome storage
  chrome.storage.local.get("suggestionsEnabled", (data) => {
    if (data.suggestionsEnabled !== undefined) {
      isEnabled = data.suggestionsEnabled;
      document.getElementById("enable-toggle").checked = isEnabled;
      console.log(`Suggestions are ${isEnabled ? "enabled" : "disabled"}`);
    } else {
      // Default to enabled if no value is set yet
      isEnabled = true;
      document.getElementById("enable-toggle").checked = true;
      console.log("Suggestions are enabled by default.");
    }
  });
}

// Call initializeApp on page load
initializeApp();
