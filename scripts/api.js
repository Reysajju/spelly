// Listen for input events in text fields and text areas
document.addEventListener("input", (event) => {
    const target = event.target;
  
    // Only process input events for text fields or text areas
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      const text = target.value;
  
      if (text.trim().length > 5) {
        // Send the text to the background script for AI suggestion
        chrome.runtime.sendMessage(
          { type: "openai-request", prompt: text },
          (response) => {
            if (response.error) {
              console.error("Error from OpenAI:", response.error);
              return;
            }
  
            if (response.suggestion) {
              // Append the suggestion to the text field as a placeholder-like suggestion
              showSuggestion(target, response.suggestion);
            }
          }
        );
      }
    }
  });
  
  // Function to show AI suggestions as a tooltip or placeholder
  function showSuggestion(target, suggestion) {
    // Create a tooltip element if it doesn't exist
    let tooltip = target.nextElementSibling;
    if (!tooltip || !tooltip.classList.contains("ai-suggestion-tooltip")) {
      tooltip = document.createElement("div");
      tooltip.className = "ai-suggestion-tooltip";
      target.parentNode.appendChild(tooltip);
    }
  
    // Update the tooltip text and position
    tooltip.innerText = `Suggestion: ${suggestion}`;
    tooltip.style.position = "absolute";
    tooltip.style.left = `${target.offsetLeft}px`;
    tooltip.style.top = `${target.offsetTop + target.offsetHeight}px`;
    tooltip.style.background = "#f1f1f1";
    tooltip.style.border = "1px solid #ccc";
    tooltip.style.padding = "5px";
    tooltip.style.zIndex = "1000";
    tooltip.style.fontSize = "12px";
  
    // Remove the tooltip after 5 seconds
    setTimeout(() => {
      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 5000);
  }
  
  // Detect spelling mistakes
  document.addEventListener("blur", (event) => {
    const target = event.target;
  
    // Only process text fields or text areas
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      const text = target.value;
  
      // Check spelling using a simple API or custom dictionary (e.g., Spellcheck API)
      fetch(`https://api.textgears.com/spelling?key=DEMO_KEY&text=${encodeURIComponent(text)}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.response && data.response.errors) {
            highlightErrors(target, data.response.errors);
          }
        })
        .catch((err) => console.error("Spelling check error:", err));
    }
  });
  
  // Function to highlight spelling errors
  function highlightErrors(target, errors) {
    let highlightedText = target.value;
  
    errors.forEach((error) => {
      const incorrectWord = error.bad;
      const suggestion = error.better.join(", ");
  
      // Replace incorrect word with highlighted version
      const regex = new RegExp(`\\b${incorrectWord}\\b`, "g");
      highlightedText = highlightedText.replace(regex, (match) => {
        return `[${match} → ${suggestion}]`;
      });
    });
  
    // Display the highlighted text as a warning (or you can add inline highlights)
    console.warn("Spelling Issues:", highlightedText);
    alert(`Spelling Mistakes:\n${highlightedText}`);
  }
  