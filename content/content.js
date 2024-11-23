let typingTimeout;
let lastText = "";

// Attach keyup listener to detect typing
document.addEventListener("keyup", (event) => {
  const activeElement = document.activeElement;

  if (activeElement.tagName === "TEXTAREA" || activeElement.tagName === "INPUT") {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      const text = activeElement.value;

      if (text !== lastText) {
        lastText = text;

        // Send text to background for suggestions
        chrome.runtime.sendMessage(
          { type: "openai-request", prompt: text },
          (response) => {
            if (response.suggestion) {
              showSuggestion(activeElement, response.suggestion);
            }
          }
        );
      }
    }, 1000); // 1 second debounce
  }
});

// Function to show suggestions below the input
function showSuggestion(element, suggestion) {
  const suggestionBox = document.createElement("div");
  suggestionBox.className = "ai-suggestion-box";
  suggestionBox.innerText = suggestion;

  const rect = element.getBoundingClientRect();
  suggestionBox.style.position = "absolute";
  suggestionBox.style.left = `${rect.left}px`;
  suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;

  document.body.appendChild(suggestionBox);

  // Remove suggestion on interaction
  suggestionBox.addEventListener("click", () => {
    element.value += ` ${suggestion}`;
    document.body.removeChild(suggestionBox);
  });
}
