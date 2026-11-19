const { createChatCompletion, groqConfig } = require('./groqService');
const destinationsData = require('../data/pakistanDestinations.json');

function money(value) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

// Clean reasoning tags (<think>...</think>) and strip any accidental emojis
function cleanAssistantContent(content) {
  let cleaned = String(content || '')
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
    // Remove Unicode emojis to uphold strict zero-emoji requirement
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '')
    .trim();

  if (!cleaned || /^<think>/i.test(cleaned)) {
    throw new Error('AI response contained an incomplete reasoning trace');
  }

  return cleaned;
}

// Extract matching application destination cards for rich interactive frontend rendering
function extractDestinationCards(text) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const matched = [];

  for (const dest of destinationsData) {
    const destName = dest.name.toLowerCase();
    const destId = dest.destinationId.toLowerCase();
    if (lower.includes(destName) || lower.includes(destId)) {
      matched.push({
        id: dest.destinationId,
        name: dest.name,
        category: dest.category,
        region: dest.region,
        imageUrl: dest.imageUrl,
        rating: dest.rating || 4.8,
        description: dest.description,
      });
      if (matched.length >= 4) break;
    }
  }

  return matched;
}

// Offline fallback knowledge generator when Groq API is disconnected
function fallbackReply(message, trip, appContext = {}) {
  const text = String(message || '').toLowerCase();
  const tripHistory = appContext.tripHistory || [];
  const activeAlerts = appContext.activeAlerts || [];
  const activeTrip = appContext.activeTrip || trip;

  // Itinerary generation request -> Guide to Plan a Trip feature
  if (text.includes('itinerary') || text.includes('day-by-day') || text.includes('plan my trip') || text.includes('make a trip plan')) {
    return 'Smart Travel Planner has a dedicated "Plan a Trip" feature that automatically creates day-by-day itineraries with custom budgets, transport options, hotel bookings, and routing. Please tap "Plan a Trip" in the main navigation menu to generate your complete travel plan.';
  }

  // Roman Urdu queries
  if (text.includes('kahan') || text.includes('jagah') || text.includes('kesa') || text.includes('batao') || text.includes('safar') || text.includes('karein')) {
    if (text.includes('family') || text.includes('bachon')) {
      return 'Family ke sath safar ke liye Islamabad, Murree & Galyat, Swat Valley, aur Hunza Valley behtareen aur pur-aman maqamat hain. Yahan achi hotels, asan road access, aur safe mahol dastiyab hai.';
    }
    if (text.includes('peaceful') || text.includes('sukoon') || text.includes('khamosh')) {
      return 'Pur-aman aur khamosh mahol ke liye Hunza Valley (Karimabad & Gulmit), Skardu ke Upper Kachura Lake, aur Neelum Valley (Arang Kel) shandar intikhab hain. Yahan qudrati khubsurti aur pur-sukoon faza milti hai.';
    }
    return 'Pakistan mein har khitte ki apni khubsurti hai. Paharon aur jheelon ke liye Northern Areas (Hunza, Skardu, Swat) behtareen hain. Saqafat aur tareekh ke liye Lahore aur Multan, jabke samandar ke liye Karachi aur Gwadar mashhoor hain. Aap kisi makhsoos shehar ya mausam ke bare mein pooch sakte hain.';
  }

  // Packing advice
  if (text.includes('pack') || text.includes('what to wear') || text.includes('clothes') || text.includes('jacket')) {
    return [
      'Essential Packing Advice for Pakistan Travel:',
      '',
      '- Mountain & Northern Areas: Warm thermal layers, windproof fleece jacket, waterproof hiking boots, sunscreen, UV sunglasses, personal first-aid kit, and power banks.',
      '- Summer & Coastal Areas: Breathable cotton clothing, sun hat, comfortable walking sandals, and hydration supplies.',
      '- Cultural & Religious Sites: Modest, respectful attire with shoulders and knees covered, plus a scarf for mosque entry.',
    ].join('\n');
  }

  // Safety advice
  if (text.includes('safety') || text.includes('safe') || text.includes('precaution') || text.includes('emergency')) {
    return [
      'Travel Safety Guidelines for Pakistan:',
      '',
      '1. Mountain Roads: Travel during daylight hours, check weather forecasts for landslide warnings, and use experienced local drivers on high-altitude jeep tracks.',
      '2. Health & Altitude: Acclimatize gradually above 8,000 feet, stay well-hydrated, and carry altitude medication if heading to Deosai or Khunjerab Pass.',
      '3. Emergency Contacts: National Highway & Motorway Police (130), Rescue 1122, and local tourist police helplines.',
      '4. Connectivity: Carry a regional SIM card (such as SCOM or Telenor) with reliable network coverage in Gilgit-Baltistan and Kashmir.',
    ].join('\n');
  }

  // Specific city match in database
  const matchedDest = destinationsData.find((d) => text.includes(d.name.toLowerCase()));
  if (matchedDest) {
    return [
      `Destination: ${matchedDest.name} (${matchedDest.region})`,
      `- Category: ${matchedDest.category}`,
      `- Description: ${matchedDest.description}`,
      `- Popular Sights: ${(matchedDest.popularActivities || []).slice(0, 4).join(', ')}`,
      `- Recommended Season: ${matchedDest.bestTimeToVisit || 'Spring to Autumn'}`,
      `- Travel Difficulty: ${matchedDest.travelDifficulty || 'Easy'}`,
    ].join('\n');
  }

  // Saved trip history
  if (text.includes('history') || text.includes('saved trip') || text.includes('previous')) {
    if (!tripHistory.length) return 'You do not have any saved trips in your account yet. Generate an itinerary through the Plan a Trip feature to view your saved travel history.';
    const summaries = tripHistory.slice(0, 5).map((t) => `${t.destination}: ${t.days} days, budget ${money(t.budget || t.plannedBudget)}`);
    return `You have ${tripHistory.length} saved trip(s): ${summaries.join('; ')}.`;
  }

  // Active alerts
  if (text.includes('alert') || text.includes('warning') || text.includes('weather alert')) {
    if (!activeAlerts.length) return 'There are no active travel alerts recorded for your current routes. Weather and highway conditions are reported normal.';
    return `Active Alerts (${activeAlerts.length}): ${activeAlerts.slice(0, 4).map((a) => `${a.severity} - ${a.title}: ${a.message}`).join('; ')}`;
  }

  // General travel query
  return [
    'Welcome to SafarSaathi AI, your intelligent travel and tourism companion for Smart Travel Planner.',
    '',
    'I can assist you with:',
    '- Destination discovery and regional comparisons (e.g. Hunza vs Skardu)',
    '- Best seasons, packing suggestions, and travel precautions',
    '- Local culture, traditional cuisine, and regional heritage across Pakistan',
    '- Transport guidance, accommodation advice, and travel tips',
    '',
    'Feel free to ask any travel question in English, conversational English, or Roman Urdu!',
  ].join('\n');
}

/**
 * SafarSaathi AI Travel Assistant
 * Handles conversational queries across all tourism topics in English, Roman Urdu, and Urdu.
 */
async function answerTravelQuestion({ message, trip, appContext = {}, history = [] }) {
  const safeMessage = String(message || '').trim().slice(0, 1000);
  if (!safeMessage) throw new Error('Message is required');

  const destinationCards = extractDestinationCards(safeMessage);

  // Build application destinations summary for AI context grounding
  const topDestinationsSummary = destinationsData.slice(0, 25).map((d) => (
    `${d.name} (${d.region}, ${d.category}): ${d.description.slice(0, 90)}... Top spots: ${(d.popularActivities || []).slice(0, 3).join(', ')}`
  )).join('\n');

  try {
    const rawContent = await createChatCompletion({
      temperature: 0.35,
      maxTokens: 800,
      messages: [
        {
          role: 'system',
          content: [
            'You are SafarSaathi AI, the intelligent travel and tourism companion of Smart Travel Planner.',
            'You help users understand, discover, compare and explore travel destinations and tourism-related topics.',
            'You can answer a broad range of travel and tourism questions, not just a limited set of predefined FAQs.',
            'Understand the user\'s actual question and respond with relevant, helpful information.',
            'Communicate naturally and conversationally, just like a chat with a knowledgeable travel expert.',
            'Understand and fluently respond in English, conversational English, Roman Urdu, and Urdu based on the user\'s message.',
            'Adapt to the user\'s interests, budget preferences, and travel context when they share them.',
            'Use available application destination data when recommending destinations within Smart Travel Planner.',
            'You are primarily specialized in Pakistan tourism, but you can also answer general international travel questions.',
            'DO NOT force every conversation into destination recommendations if they ask about packing, culture, transport, or safety.',
            'DO NOT automatically generate a detailed day-by-day itinerary. Smart Travel Planner has a separate dedicated Plan a Trip feature. You must guide users to that feature when they explicitly want a complete itinerary.',
            'Never invent current weather, hotel availability, travel prices, road conditions, safety alerts, visa requirements, or other time-sensitive facts. If reliable live information is unavailable, explain the limitation honestly.',
            'Do not use any emojis in your response. Use clear text, markdown bullet points, and clean typography.',
            'Keep responses concise, informative, and formatted cleanly for mobile and web screens (under 250 words unless detailed advice is requested).',
          ].join(' '),
        },
        {
          role: 'system',
          content: `Application destination catalog preview:\n${topDestinationsSummary}`,
        },
        {
          role: 'system',
          content: `Authenticated user context: ${JSON.stringify({
            activeTrip: appContext.activeTrip ? { destination: appContext.activeTrip.destination, days: appContext.activeTrip.days, budget: appContext.activeTrip.budget } : null,
            savedTripsCount: (appContext.tripHistory || []).length,
            activeAlertsCount: (appContext.activeAlerts || []).length,
          })}`,
        },
        ...history.slice(-8).map((item) => ({ role: item.role, content: String(item.content).slice(0, 1200) })),
        { role: 'user', content: safeMessage },
      ],
    });

    const cleaned = cleanAssistantContent(rawContent).slice(0, 4000);
    const matchedCards = destinationCards.length > 0 ? destinationCards : extractDestinationCards(cleaned);

    return {
      content: cleaned,
      model: groqConfig().model,
      fallbackUsed: false,
      recommendedDestinations: matchedCards,
    };
  } catch (error) {
    console.warn(`[chat] Groq unavailable; using deterministic knowledge engine. Reason: ${error.message}`);
    const fallback = cleanAssistantContent(fallbackReply(safeMessage, trip, appContext));
    const matchedCards = destinationCards.length > 0 ? destinationCards : extractDestinationCards(fallback);

    return {
      content: fallback,
      model: 'deterministic-knowledge-engine',
      fallbackUsed: true,
      recommendedDestinations: matchedCards,
    };
  }
}

module.exports = {
  answerTravelQuestion,
  fallbackReply,
  extractDestinationCards,
};
