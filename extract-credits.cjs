const fs = require('fs');

const html = fs.readFileSync('muso.html', 'utf8');
const scriptMatch = html.match(/<script>window\.__NUXT__=\(function\((.*?)\){(.*?)}\((.*?)\)\);<\/script>/s);

if (scriptMatch) {
  try {
    const argsNames = scriptMatch[1];
    const funcBody = scriptMatch[2];
    const argsValuesStr = scriptMatch[3];
    
    // Evaluate the NUXT object
    const code = `(function(${argsNames}){ ${funcBody} })(${argsValuesStr})`;
    const scriptResult = eval(code);
    
    // Look for credits in the Apollo cache or state
    let creditsData = [];
    
    // Nuxt state structure varies. Sometimes it's in state, sometimes in apollo data
    // Deep search the object for credit/track items
    function searchForCredits(obj) {
      if (typeof obj !== 'object' || obj === null) return;
      
      // Usually Muso lists credits under some nodes Array
      if (Array.isArray(obj)) {
        obj.forEach(searchForCredits);
        return;
      }
      
      Object.entries(obj).forEach(([key, val]) => {
        if (typeof val === 'object' && val !== null) {
          // Detect a credit object - usually has role, title, etc.
          if (val.__typename === 'Credit' || (val.track && val.roles)) {
            creditsData.push(val);
          }
          searchForCredits(val);
        }
      });
    }
    
    searchForCredits(scriptResult);
    
    // Keep unique ones (they might be duplicated in apollo cache + vuex)
    const uniqueCredits = Array.from(new Set(creditsData.map(c => JSON.stringify(c)))).map(s => JSON.parse(s));
    
    if (uniqueCredits.length > 0) {
      fs.writeFileSync('credits-dump.json', JSON.stringify(uniqueCredits, null, 2));
      console.log('Successfully extracted', uniqueCredits.length, 'raw credits.');
    } else {
      // Let's just dump the whole object so we can inspect it
      fs.writeFileSync('nuxt-state-dump.json', JSON.stringify(scriptResult, null, 2));
      console.log('No specific credits found, dumped full state to nuxt-state-dump.json');
    }
    
  } catch (err) {
    console.error('Error evaluating nuxt payload:', err);
  }
} else {
  // nuxt script might not use params.
  const scriptMatch2 = html.match(/<script>window\.__NUXT__=({.*?});<\/script>/s);
  if (scriptMatch2) {
    fs.writeFileSync('nuxt-state-dump.json', scriptMatch2[1]);
    console.log('Direct object, dumped full state.');
  } else {
    console.log("Could not find window.__NUXT__");
  }
}
