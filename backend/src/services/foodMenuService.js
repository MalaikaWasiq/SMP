const foodMenus = require('../data/destinationFoodMenus.json');

function normalizeCity(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function resolveMenuRegion(destination) {
  const norm = normalizeCity(destination);
  if (!norm) return 'standard';

  // Islamabad / Rawalpindi
  if (norm.includes('islamabad') || norm.includes('rawalpindi') || norm.includes('taxila')) {
    return 'islamabad';
  }

  // Northern Areas
  if (
    norm.includes('hunza') ||
    norm.includes('skardu') ||
    norm.includes('swat') ||
    norm.includes('kalam') ||
    norm.includes('malamjabba') ||
    norm.includes('naran') ||
    norm.includes('kaghan') ||
    norm.includes('gilgit') ||
    norm.includes('chitral') ||
    norm.includes('neelum') ||
    norm.includes('fairymeadows') ||
    norm.includes('astore') ||
    norm.includes('kumrat') ||
    norm.includes('babusar') ||
    norm.includes('deosai')
  ) {
    return 'northern_areas';
  }

  // Karachi & Coastal
  if (
    norm.includes('karachi') ||
    norm.includes('gwadar') ||
    norm.includes('kundmalir') ||
    norm.includes('ormara') ||
    norm.includes('astola') ||
    norm.includes('clifton') ||
    norm.includes('hawksbay')
  ) {
    return 'karachi';
  }

  // Punjab
  if (
    norm.includes('lahore') ||
    norm.includes('multan') ||
    norm.includes('bahawalpur') ||
    norm.includes('faisalabad') ||
    norm.includes('punjab')
  ) {
    return 'punjab';
  }

  return 'standard';
}

function getFoodMenuForDestination(destination) {
  const regionKey = resolveMenuRegion(destination);
  const menu = foodMenus[regionKey] || foodMenus.standard;
  return {
    regionKey,
    regionName: menu.regionName,
    description: menu.description,
    currency: menu.currency || 'PKR',
    breakfast: menu.breakfast,
    lunch: menu.lunch,
    dinner: menu.dinner,
  };
}

function calculateFoodCost({
  destination = '',
  numberOfPersons = 1,
  days = 1,
  selectedMeals = { breakfast: true, lunch: false, dinner: true },
  selectedItems = {},
}) {
  const persons = Math.max(1, Number(numberOfPersons) || 1);
  const tripDays = Math.max(1, Number(days) || 1);
  const menu = getFoodMenuForDestination(destination);

  let breakfastTotal = 0;
  let lunchTotal = 0;
  let dinnerTotal = 0;

  // 1. Breakfast calculation
  const isBreakfastSelected = Boolean(selectedMeals?.breakfast);
  let breakfastRatePerPerson = menu.breakfast.defaultPricePerPerson;
  if (selectedItems?.breakfast && Array.isArray(selectedItems.breakfast) && selectedItems.breakfast.length > 0) {
    const itemSum = menu.breakfast.items
      .filter((item) => selectedItems.breakfast.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    if (itemSum > 0) breakfastRatePerPerson = itemSum;
  }
  if (isBreakfastSelected) {
    breakfastTotal = Math.round(breakfastRatePerPerson * persons * tripDays);
  }

  // 2. Lunch calculation
  const isLunchSelected = Boolean(selectedMeals?.lunch);
  let lunchRatePerPerson = menu.lunch.defaultPricePerPerson;
  if (selectedItems?.lunch && Array.isArray(selectedItems.lunch) && selectedItems.lunch.length > 0) {
    const itemSum = menu.lunch.items
      .filter((item) => selectedItems.lunch.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    if (itemSum > 0) lunchRatePerPerson = itemSum;
  }
  if (isLunchSelected) {
    lunchTotal = Math.round(lunchRatePerPerson * persons * tripDays);
  }

  // 3. Dinner calculation
  const isDinnerSelected = Boolean(selectedMeals?.dinner);
  let dinnerRatePerPerson = menu.dinner.defaultPricePerPerson;
  if (selectedItems?.dinner && Array.isArray(selectedItems.dinner) && selectedItems.dinner.length > 0) {
    const itemSum = menu.dinner.items
      .filter((item) => selectedItems.dinner.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    if (itemSum > 0) dinnerRatePerPerson = itemSum;
  }
  if (isDinnerSelected) {
    dinnerTotal = Math.round(dinnerRatePerPerson * persons * tripDays);
  }

  const totalFoodCost = breakfastTotal + lunchTotal + dinnerTotal;

  return {
    regionKey: menu.regionKey,
    regionName: menu.regionName,
    numberOfPersons: persons,
    days: tripDays,
    breakfast: {
      selected: isBreakfastSelected,
      ratePerPerson: breakfastRatePerPerson,
      total: breakfastTotal,
      items: menu.breakfast.items,
    },
    lunch: {
      selected: isLunchSelected,
      ratePerPerson: lunchRatePerPerson,
      total: lunchTotal,
      items: menu.lunch.items,
    },
    dinner: {
      selected: isDinnerSelected,
      ratePerPerson: dinnerRatePerPerson,
      total: dinnerTotal,
      items: menu.dinner.items,
    },
    totalFoodCost,
  };
}

module.exports = {
  getFoodMenuForDestination,
  calculateFoodCost,
  resolveMenuRegion,
};
