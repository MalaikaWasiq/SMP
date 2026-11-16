const { createChatCompletion, groqConfig } = require('./groqService');
const destinationsData = require('../data/pakistanDestinations.json');

function money(value) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

function fallbackReply(message, trip, appContext = {}) {
  const text = String(message).toLowerCase();
  const tripHistory = appContext.tripHistory || [];
  const activeAlerts = appContext.activeAlerts || [];
  const activeTrip = appContext.activeTrip || trip;

  // 1. General Beauty & Best Cities Questions
  if (text.includes('beautiful') || text.includes('beauty') || text.includes('scenic') || text.includes('prettiest') || text.includes('best city') || text.includes('top city') || text.includes('which city')) {
    return [
      'Pakistan is blessed with diverse beauty across its regions:',
      '',
      '• **Mountain & Alpine Beauty**: **Hunza Valley** and **Skardu** (Gilgit-Baltistan) are world-famous for emerald lakes, dramatic snow peaks, and apricot blossoms.',
      '• **Modern Green Landscapes**: **Islamabad**, nestled against the Margalla Hills, is renowned for its clean tree-lined avenues and scenic viewpoints like Daman-e-Koh.',
      '• **Historic & Cultural Grandeur**: **Lahore** captures Pakistan’s soul with magnificent Mughal monuments (Badshahi Mosque, Lahore Fort) and lively food streets.',
      '• **Lush Pine Valleys**: **Swat Valley**, **Kalam**, and **Neelum Valley** offer rushing rivers and alpine meadows.',
      '• **Coastal Drama**: **Gwadar** and **Kund Malir** feature pristine beaches meeting rugged golden desert cliffs.',
      '',
      '**Recommendation**: If you love mountains and lakes, visit **Hunza** or **Skardu**. For historic architecture, choose **Lahore**. For peaceful greenery, visit **Islamabad**.'
    ].join('\n');
  }

  // 2. Recommendations & Where to go
  if (text.includes('recommend') || text.includes('suggest') || text.includes('where to go') || text.includes('where should i go') || text.includes('best place')) {
    return [
      'Top destinations to consider across Pakistan:',
      '',
      '1. **Northern Areas**: Hunza Valley, Skardu, Fairy Meadows, Neelum Valley (Ideal: May – October)',
      '2. **Adventure & Nature**: Malam Jabba (skiing), Babusar Top, Kumrat Valley, Naran & Kaghan',
      '3. **Cultural & Historical**: Lahore, Multan (City of Saints), Bahawalpur (Noor Mahal), Taxila, Mohenjo-daro',
      '4. **Coastal & Sea**: Gwadar, Kund Malir Beach, Astola Island, Clifton Beach (Ideal: Oct – April)',
      '',
      'You can also select any destination on the Home screen to explore top spots, weather alerts, and generate a customized itinerary!'
    ].join('\n');
  }

  // 3. Questions about specific cities
  const matchedDest = destinationsData.find((d) => text.includes(d.name.toLowerCase()));
  if (matchedDest) {
    return [
      `📍 **${matchedDest.name} (${matchedDest.region})**`,
      `• **Category**: ${matchedDest.category}`,
      `• **Highlights**: ${matchedDest.description}`,
      `• **Top Spots**: ${(matchedDest.popularActivities || []).slice(0, 4).join(', ')}`,
      `• **Best Season**: ${matchedDest.bestTimeToVisit || 'Spring to Autumn'}`,
      `• **Travel Difficulty**: ${matchedDest.travelDifficulty || 'Easy'}`
    ].join('\n');
  }

  // 4. Saved Trip History Queries
  if (text.includes('history') || text.includes('previous') || text.includes('past') || text.includes('saved trip')) {
    if (!tripHistory.length) return 'You do not have any saved trips yet. Generate an itinerary on the Home or Plan Trip screen and it will appear in your account history.';
    const summaries = tripHistory.slice(0, 8).map((savedTrip) => (
      `${savedTrip.destination}: ${savedTrip.days} days, ${money(savedTrip.plannedBudget)} budget, ${money(savedTrip.actualSpend)} recorded`
    ));
    return `You have ${tripHistory.length} saved trip${tripHistory.length === 1 ? '' : 's'}. ${summaries.join('; ')}.`;
  }

  // 5. Compare Budgets Across Trips
  if ((text.includes('compare') || text.includes('all')) && (text.includes('budget') || text.includes('spend'))) {
    if (!tripHistory.length) return 'There are no saved trip budgets to compare yet.';
    return tripHistory.slice(0, 8).map((savedTrip) => (
      `${savedTrip.destination}: budget ${money(savedTrip.plannedBudget)}, estimated ${money(savedTrip.estimatedSpend)}, actual ${money(savedTrip.actualSpend)}`
    )).join('; ');
  }

  // 6. Active Travel Alerts
  if (text.includes('alert') || text.includes('warning') || text.includes('landslide')) {
    if (!activeAlerts.length) return 'You have no active travel alerts. Roads and routes are currently normal.';
    return `You have ${activeAlerts.length} active alert${activeAlerts.length === 1 ? '' : 's'}: ${activeAlerts.slice(0, 6).map((alert) => `${alert.severity} - ${alert.title}: ${alert.message}`).join('; ')}`;
  }

  // 7. User Preferences
  if (text.includes('preference') || text.includes('interest')) {
    const preferences = appContext.user?.preferences || {};
    return `Your saved interests are ${(preferences.interests || []).join(', ') || 'not set'}, your default budget is ${money(preferences.defaultBudget)}, and your preferred hotel type is ${preferences.preferredHotelType || 'Any'}.`;
  }

  // 8. If No Active Trip is Selected
  if (!activeTrip) {
    return 'I can answer any general questions about Pakistan destinations, travel routes, weather, and attractions. If you have an active trip, I can also track your itinerary, budget, actual expenses, and safety alerts!';
  }

  // 9. Expenses
  if (text.includes('expense') || text.includes('spent') || text.includes('actual')) {
    const expenses = activeTrip.expenses || [];
    const actual = activeTrip.budgetBreakdown?.actualSpent ?? activeTrip.actualSpend;
    if (!expenses.length) return `No expenses are recorded yet for ${activeTrip.destination}. The actual-spend total is ${money(actual)}.`;
    return `You recorded ${expenses.length} expense${expenses.length === 1 ? '' : 's'} for ${activeTrip.destination}, totaling ${money(actual)}. ${expenses.slice(0, 5).map((expense) => `${expense.category}: ${money(expense.amount)}${expense.note ? ` (${expense.note})` : ''}`).join('; ')}.`;
  }

  // 10. Budget
  if (text.includes('budget') || text.includes('cost') || text.includes('spend')) {
    const budget = activeTrip.budgetBreakdown || {};
    return `Your ${activeTrip.destination} budget is ${money(activeTrip.budget || activeTrip.plannedBudget)}. Planned spending is ${money(budget.totalEstimated ?? activeTrip.estimatedSpend)}, and recorded actual spending is ${money(budget.actualSpent ?? activeTrip.actualSpend)}.`;
  }

  // 11. Weather & Packing
  if (text.includes('weather') || text.includes('pack')) {
    return `Current planning weather for ${activeTrip.destination} is ${activeTrip.weather?.description || 'normal conditions'} at ${activeTrip.weather?.temp ?? '18'}°C. Check the forecast again shortly before departure and pack comfortable walking shoes, layers, and rain gear for mountain trips.`;
  }

  // 12. Hotel
  if (text.includes('hotel') || text.includes('stay')) {
    return activeTrip.selectedHotel
      ? `Your selected stay is ${activeTrip.selectedHotel.name}, estimated at ${money(activeTrip.selectedHotel.totalStayCost)} for the trip.`
      : `No hotel is selected yet for ${activeTrip.destination}. Open the Hotels tab to compare recommendations.`;
  }

  // 13. Default active trip summary
  const firstDay = activeTrip.itinerary?.[0];
  const stops = firstDay?.activities?.map((item) => item.place).slice(0, 3).join(', ');
  return `Your ${activeTrip.days}-day ${activeTrip.destination} plan is active. Day 1 focuses on ${stops || 'the saved itinerary'}. You can ask me general questions about any city in Pakistan, or specific questions about your itinerary, budget, expenses, hotels, and safety alerts.`;
}

function cleanAssistantContent(content) {
  const cleaned = String(content || '')
    .replace(/<think>[\s\S]*?<\/think>\s*/gi, '')
    .trim();

  if (!cleaned || /^<think>/i.test(cleaned)) {
    throw new Error('AI response contained an incomplete reasoning trace');
  }

  return cleaned;
}

async function answerTravelQuestion({ message, trip, appContext = {}, history = [] }) {
  const safeMessage = String(message || '').trim().slice(0, 1000);
  if (!safeMessage) throw new Error('Message is required');

  try {
    const content = await createChatCompletion({
      temperature: 0.35,
      maxTokens: 800,
      messages: [
        {
          role: 'system',
          content: [
            'You are an expert, friendly AI Travel Assistant and Pakistan Travel Guide inside the Smart Travel Planner application.',
            'You have two distinct capabilities:',
            '1. GENERAL TRAVEL ADVICE ACROSS PAKISTAN: When the user asks general questions (such as "which city is more beautiful in Pakistan?", "best places to visit for families", "recommend places to go", "compare Hunza vs Skardu", "best food in Lahore", "best time to visit Naran", packing advice, cultural spots, or road hazards), answer warmly, knowledgeably, and thoroughly about Pakistan.',
            'DO NOT force general questions to talk about their current active trip! Answer their general question directly with insightful facts and recommendations.',
            '2. USER TRIP & ACCOUNT ASSISTANCE: When the user specifically asks about their current trip, saved trips, day-by-day itinerary, budget breakdown, logged expenses, hotel bookings, route, or alerts, consult the authenticated user context JSON attached below.',
            'Formatting rules: Format answers clearly using markdown (bullet points, bold text, or concise tables). Keep replies under 250 words so they read beautifully on a mobile screen.',
          ].join(' '),
        },
        { role: 'system', content: `Authenticated user context JSON: ${JSON.stringify(appContext)}` },
        ...history.slice(-8).map((item) => ({ role: item.role, content: String(item.content).slice(0, 1200) })),
        { role: 'user', content: safeMessage },
      ],
    });

    return {
      content: cleanAssistantContent(content).slice(0, 4000),
      model: groqConfig().model,
      fallbackUsed: false,
    };
  } catch (error) {
    console.warn(`[chat] Groq unavailable; using deterministic reply. Reason: ${error.message}`);
    return {
      content: fallbackReply(safeMessage, trip, appContext),
      model: 'deterministic-fallback',
      fallbackUsed: true,
    };
  }
}

module.exports = { answerTravelQuestion, fallbackReply };
