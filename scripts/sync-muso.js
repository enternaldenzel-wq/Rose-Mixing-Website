import fs from 'fs';
import https from 'https';
import path from 'path';

const URLS = {
  newest: 'https://credits.muso.ai/profile/e47af01c-e51d-442b-92c9-627495d08ee7/credits?sort=releaseDate&direction=DESC',
  popular: 'https://credits.muso.ai/profile/e47af01c-e51d-442b-92c9-627495d08ee7/credits?sort=popularity&direction=DESC'
};

const OUTPUT_FILE = path.join(process.cwd(), 'public', 'credits.json');

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    };
    https.get(url, requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(data);
        else reject(new Error(`Status ${res.statusCode} for ${url}`));
      });
    }).on('error', reject);
  });
}

function extractCredits(html) {
  const match = html.match(/<script>window\.__NUXT__=(.*?);<\/script>/s);
  if (!match || !match[1]) return [];
  
  let nuxtData;
  const payload = match[1];
  
  try {
    if (payload.trim().startsWith('{')) {
      nuxtData = JSON.parse(payload);
    } else {
      const funcMatch = payload.match(/^\(function\((.*?)\){(.*)}\((.*)\)\)$/s);
      if (funcMatch) {
        const argsNames = funcMatch[1];
        const funcBody = funcMatch[2];
        const argsValues = funcMatch[3];
        const evalCode = `(function(${argsNames}){ ${funcBody} })(${argsValues})`;
        nuxtData = eval(evalCode);
      }
    }
  } catch (e) {
    console.error("Eval error", e.message);
    return [];
  }

  // On the /credits page, the key is ProfileCredits:0
  const profileData = nuxtData?.fetch && (nuxtData.fetch['ProfileCredits:0'] || nuxtData.fetch['ProfilePage:0']);
  const musoCredits = profileData?.credits || [];
  
  return musoCredits.map((item, index) => ({
    id: item.track?.id || Math.random().toString(36).substr(2, 9),
    title: item.track?.title || "Unknown Title",
    artist: item.artists ? item.artists.map(a => a.name).join(', ') : "Unknown Artist",
    role: item.credits ? item.credits.join(', ') : "Contributor",
    img: (item.album?.avatarUrl_640_640 || item.album?.avatarUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=1200").replace('ab67616d00004851', 'ab67616d0000b273'), 
    date: item.releaseDate || null,
    popularity: item.track?.popularity || 0
  }));
}

async function sync() {
  console.log('🔄 Syncing dual-order data from MUSO.AI...');
  try {
    const [newestHtml, popularHtml] = await Promise.all([
      fetchPage(URLS.newest),
      fetchPage(URLS.popular)
    ]);

    const newestCredits = extractCredits(newestHtml);
    const popularCredits = extractCredits(popularHtml);

    console.log(`Extracted ${newestCredits.length} from newest URL`);
    console.log(`Extracted ${popularCredits.length} from popular URL`);

    const combinedMap = new Map();
    [...newestCredits, ...popularCredits].forEach(c => {
      combinedMap.set(c.id, c);
    });

    const finalResult = Array.from(combinedMap.values());

    if (finalResult.length === 0) {
      throw new Error("No credits found. Structure might have changed.");
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalResult, null, 2));
    console.log(`✅ Success! Synced ${finalResult.length} total credits.`);
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  }
}

sync();
