// Spell checking utility
function checkSpelling(text) {
    const typos = [];
    const words = text.split(/\s+/);
  
    words.forEach((word) => {
      if (!dictionary.has(word.toLowerCase())) {
        typos.push(word);
      }
    });
  
    return typos;
  }
  
  // Example dictionary
  const dictionary = new Set(["this", "is", "an", "example", "dictionary"]);
  