const assert = require('assert');
const { answerTravelQuestion, fallbackReply, extractDestinationCards } = require('../backend/src/services/chatService');

console.log('====================================================');
console.log('RUNNING SAFARSAATHI AI CHATBOT AUTOMATED TESTS');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

async function runAsyncTest(testName, fn) {
  try {
    await fn();
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${testName}: ${err.message}`);
    failedTests++;
  }
}

function hasEmojis(text) {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
  return emojiRegex.test(text);
}

(async () => {
  // 1. General Tourism / Destination Comparison
  await runAsyncTest('Chatbot answers destination comparison without crashing', async () => {
    const res = await answerTravelQuestion({
      message: 'Compare Hunza and Skardu for photography and mountains',
    });
    assert(res.content && res.content.length > 50, 'Must return a substantive reply');
    assert(!hasEmojis(res.content), 'Must not contain any emojis');
  });

  // 2. Roman Urdu Support
  await runAsyncTest('Chatbot handles Roman Urdu inquiry naturally', async () => {
    const res = await answerTravelQuestion({
      message: 'Family ke sath ghoomne ke liye kaunsi peaceful jagah achi hai?',
    });
    assert(res.content && res.content.length > 30, 'Must return a helpful Roman Urdu reply');
    assert(!hasEmojis(res.content), 'Must not contain any emojis');
  });

  // 3. Packing & Safety Advice
  await runAsyncTest('Chatbot provides packing advice without itinerary generation', async () => {
    const res = await answerTravelQuestion({
      message: 'What should I pack for a winter trip to northern Pakistan?',
    });
    assert(res.content.toLowerCase().includes('pack') || res.content.toLowerCase().includes('jacket') || res.content.toLowerCase().includes('warm'), 'Must provide packing guidance');
    assert(!hasEmojis(res.content), 'Must not contain any emojis');
  });

  // 4. Non-Itinerary Constraint
  await runAsyncTest('Chatbot guides itinerary request to Plan a Trip feature', async () => {
    const res = await answerTravelQuestion({
      message: 'Generate a day-by-day 5-day itinerary for Swat',
    });
    assert(res.content.toLowerCase().includes('plan a trip'), 'Must mention Plan a Trip feature for itineraries');
    assert(!hasEmojis(res.content), 'Must not contain any emojis');
  });

  // 5. Destination Recommendation Cards
  await runAsyncTest('Chatbot extracts real application destination cards for navigation', async () => {
    const cards = extractDestinationCards('You should definitely visit Hunza Valley and Skardu for alpine views');
    assert(cards.length >= 2, 'Must extract Hunza and Skardu cards');
    assert(cards.some((c) => c.name.includes('Hunza')), 'Must include Hunza');
    assert(cards.some((c) => c.name.includes('Skardu')), 'Must include Skardu');
    assert(cards[0].imageUrl, 'Card must have an image URL');
  });

  // 6. Zero Emoji Guarantee
  await runAsyncTest('Offline fallback reply has strictly zero emojis', async () => {
    const fallback = fallbackReply('Tell me about Lahore');
    assert(!hasEmojis(fallback), 'Fallback must strictly have zero emojis');
  });

  console.log('\n====================================================');
  console.log(`CHATBOT TESTS SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
})();
