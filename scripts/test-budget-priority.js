const assert = require('assert');
const { calculateBudget, selectVehicleForGroup, VEHICLES } = require('../backend/src/services/budgetService');
const { getFoodMenuForDestination, calculateFoodCost } = require('../backend/src/services/foodMenuService');

console.log('====================================================');
console.log('RUNNING BUDGET ALLOCATION & CALCULATION TESTS (A-J)');
console.log('====================================================\n');

let passedTests = 0;
let failedTests = 0;

function runTest(testName, fn) {
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${testName}: ${err.message}`);
    failedTests++;
  }
}

// ----------------------------------------------------
// TEST A: Low Budget Scenario
// 20 persons, 5 days, Budget Rs 100,000, Coaster Rs 40,000/day
// ----------------------------------------------------
runTest('TEST A: Low budget coaster shortfall and 2-day alternative', () => {
  const result = calculateBudget({
    budget: 100000,
    numberOfPersons: 20,
    days: 5,
    destination: 'Hunza',
    vehicleType: 'luxury-coaster',
    vehicleDailyRate: 40000,
    driverRequired: false,
    foodRequired: false,
    hotelRequired: false,
    activitiesRequired: false,
  });

  // 5-day coaster transport cost = 40,000 * 5 = 200,000
  assert.strictEqual(result.transport.cost, 200000, '5-day transport must equal Rs 200,000');
  // Must generate transport shortfall proposal
  assert.strictEqual(result.proposals.length > 0, true, 'Must generate a proposal');
  const transProp = result.proposals.find((p) => p.service === 'transportation');
  assert(transProp, 'Transportation proposal must be present');
  assert.strictEqual(transProp.shortfall, 100000, 'Shortfall must be 100,000');
  assert.strictEqual(transProp.affordableDays, 2, 'Affordable duration must be 2 days');

  // Recalculating with 2 days
  const result2Days = calculateBudget({
    budget: 100000,
    numberOfPersons: 20,
    days: 5,
    destination: 'Hunza',
    vehicleType: 'luxury-coaster',
    vehicleDailyRate: 40000,
    driverRequired: false,
    foodRequired: false,
    hotelRequired: false,
    activitiesRequired: false,
    userConfirmedAdjustments: { transportDays: 2 },
  });

  // 2-day transport = 40,000 * 2 = 80,000
  assert.strictEqual(result2Days.transport.cost, 80000, '2-day transport must equal Rs 80,000');
  // Remaining after 2 days = 100,000 - 80,000 = 20,000
  assert.strictEqual(result2Days.remainingBudget, 20000, 'Remaining budget must be Rs 20,000');
});

// ----------------------------------------------------
// TEST B: High Budget Scenario
// 20 persons, 5 days, Budget Rs 1,000,000, Coaster Rs 40,000/day
// ----------------------------------------------------
runTest('TEST B: High budget transport calculation', () => {
  const result = calculateBudget({
    budget: 1000000,
    numberOfPersons: 20,
    days: 5,
    destination: 'Hunza',
    vehicleType: 'luxury-coaster',
    vehicleDailyRate: 40000,
    driverRequired: false,
    foodRequired: false,
    hotelRequired: false,
    activitiesRequired: false,
  });

  // Transport = 40,000 * 5 = 200,000
  assert.strictEqual(result.transport.cost, 200000, 'Transport cost must be Rs 200,000');
  // Remaining = 1,000,000 - 200,000 = 800,000
  assert.strictEqual(result.remainingBudget, 800000, 'Remaining budget must be Rs 800,000');
});

// ----------------------------------------------------
// TEST C: Hotel Calculation
// 20 persons, 2 persons per room = 10 rooms, Rs 5,000 per room/night, 5 nights
// ----------------------------------------------------
runTest('TEST C: Hotel calculation with 10 rooms for 5 nights at Rs 5,000', () => {
  const mockHotel = {
    name: 'Hunza Serena Inn',
    comfortLevel: 'Standard',
    pricePerNight: 5000,
    roomsQuantity: 10,
    defaultRoom: { price: 5000 },
  };

  const result = calculateBudget({
    budget: 1000000,
    numberOfPersons: 20,
    days: 6, // 6 days = 5 nights
    destination: 'Hunza',
    vehicleType: 'luxury-coaster',
    vehicleDailyRate: 40000,
    driverRequired: false,
    hotelRequired: true,
    selectedHotel: mockHotel,
    roomsQuantity: 10,
    foodRequired: false,
    activitiesRequired: false,
  });

  // 10 rooms * 5,000 * 5 nights = 250,000
  assert.strictEqual(result.hotel.cost, 250000, 'Hotel cost must be Rs 250,000');
  // Remaining = 800,000 - 250,000 = 550,000
  // Transport 200,000 (6 days = 240,000 if 6 days, let's verify exact days math)
  assert.strictEqual(result.hotel.numberOfRooms, 10, 'Must have 10 rooms');
  assert.strictEqual(result.hotel.nights, 5, 'Must have 5 nights');
});

// ----------------------------------------------------
// TEST D: Food Calculation Formula
// Verify: Per-person meal price * persons * number of included meals/days
// Ensure NO duplicate multiplication!
// ----------------------------------------------------
runTest('TEST D: Food calculation formula accuracy without duplicate multiplication', () => {
  const persons = 4;
  const days = 3;
  // Test Islamabad food menu
  const menu = getFoodMenuForDestination('Islamabad');
  const bRate = menu.breakfast.defaultPricePerPerson; // 450
  const dRate = menu.dinner.defaultPricePerPerson;    // 1150

  const foodCalc = calculateFoodCost({
    destination: 'Islamabad',
    numberOfPersons: persons,
    days,
    selectedMeals: { breakfast: true, lunch: false, dinner: true },
  });

  const expectedBreakfast = bRate * persons * days; // 450 * 4 * 3 = 5400
  const expectedDinner = dRate * persons * days;       // 1150 * 4 * 3 = 13800
  const expectedTotal = expectedBreakfast + expectedDinner;

  assert.strictEqual(foodCalc.breakfast.total, expectedBreakfast, `Breakfast must be ${expectedBreakfast}`);
  assert.strictEqual(foodCalc.dinner.total, expectedDinner, `Dinner must be ${expectedDinner}`);
  assert.strictEqual(foodCalc.totalFoodCost, expectedTotal, `Total food cost must be ${expectedTotal}`);
});

// ----------------------------------------------------
// TEST E: Skipped Food
// Expected: Food expense = Rs. 0
// ----------------------------------------------------
runTest('TEST E: Skipped food results in strictly PKR 0 expense', () => {
  const result = calculateBudget({
    budget: 100000,
    numberOfPersons: 4,
    days: 3,
    foodRequired: false,
  });

  assert.strictEqual(result.food.cost, 0, 'Food cost must be strictly Rs 0 when skipped');
  assert.strictEqual(result.food.status, 'self-managed', 'Food status must be self-managed');
});

// ----------------------------------------------------
// TEST F: Skipped Hotel
// Expected: Hotel expense = Rs. 0
// ----------------------------------------------------
runTest('TEST F: Skipped hotel results in strictly PKR 0 expense', () => {
  const result = calculateBudget({
    budget: 100000,
    numberOfPersons: 4,
    days: 3,
    hotelRequired: false,
  });

  assert.strictEqual(result.hotel.cost, 0, 'Hotel cost must be strictly Rs 0 when skipped');
  assert.strictEqual(result.hotel.status, 'self-managed', 'Hotel status must be self-managed');
});

// ----------------------------------------------------
// TEST G: BBQ Fixed Charge
// Expected: Rs 20,000 deducted once, not multiplied by persons
// ----------------------------------------------------
runTest('TEST G: Fixed event charge (BBQ night) deducted once, not multiplied by persons', () => {
  const result4Persons = calculateBudget({
    budget: 200000,
    numberOfPersons: 4,
    days: 2,
    selectedActivities: ['bbq_night'],
    transportRequired: false,
    foodRequired: false,
    hotelRequired: false,
  });

  const result20Persons = calculateBudget({
    budget: 200000,
    numberOfPersons: 20,
    days: 2,
    selectedActivities: ['bbq_night'],
    transportRequired: false,
    foodRequired: false,
    hotelRequired: false,
  });

  assert.strictEqual(result4Persons.activities.cost, 20000, 'BBQ night must cost Rs 20,000 for 4 persons');
  assert.strictEqual(result20Persons.activities.cost, 20000, 'BBQ night must cost Rs 20,000 for 20 persons (fixed event)');
});

// ----------------------------------------------------
// TEST H: Per-Person Cost Calculation
// Expected: Total actual package cost / number of persons
// ----------------------------------------------------
runTest('TEST H: Per-person cost equals total actual expense divided by persons', () => {
  const persons = 5;
  const result = calculateBudget({
    budget: 250000,
    numberOfPersons: persons,
    days: 3,
    destination: 'Islamabad',
    transportRequired: true,
    foodRequired: true,
    hotelRequired: true,
  });

  const calculatedPerPerson = Math.round(result.totalActualPackageCost / persons);
  assert.strictEqual(result.perPersonExpense, calculatedPerPerson, 'Per-person expense must equal total / persons');
});

// ----------------------------------------------------
// TEST I: Insufficient Remaining Budget & Non-Negative Balance
// Expected: Never produce negative remaining balance
// ----------------------------------------------------
runTest('TEST I: Remaining budget is never negative and proposals generated', () => {
  const result = calculateBudget({
    budget: 15000,
    numberOfPersons: 6,
    days: 5,
    destination: 'Hunza',
    transportRequired: true,
    foodRequired: true,
    hotelRequired: true,
  });

  assert(result.remainingBudget >= 0, 'Remaining budget must be >= 0');
  assert(result.proposals.length > 0, 'Must generate shortfall proposals when budget is exceeded');
});

// ----------------------------------------------------
// TEST J: Destination-Specific Menus
// Verify Islamabad, Hunza, Karachi menus and changing destination
// ----------------------------------------------------
runTest('TEST J: Destination-specific menus and changing destination', () => {
  const isbMenu = getFoodMenuForDestination('Islamabad');
  const hunzaMenu = getFoodMenuForDestination('Hunza Valley');
  const khiMenu = getFoodMenuForDestination('Karachi');

  // Verify Islamabad has Halwa Puri, Karahi, Handi
  assert(isbMenu.breakfast.items.some((i) => i.name.includes('Halwa Puri')), 'Islamabad must have Halwa Puri');
  assert(isbMenu.lunch.items.some((i) => i.name.includes('Karahi')), 'Islamabad must have Karahi');

  // Verify Northern Areas has Pink tea, Trout, Balti feast
  assert(hunzaMenu.breakfast.items.some((i) => i.name.includes('Pink Kashmiri')), 'Hunza must have Pink Kashmiri Tea');
  assert(hunzaMenu.lunch.items.some((i) => i.name.includes('Trout')), 'Hunza must have River Trout');

  // Verify Karachi has Nihari, Karachi Biryani, Seafood
  assert(khiMenu.breakfast.items.some((i) => i.name.includes('Nihari')), 'Karachi must have Nihari');
  assert(khiMenu.lunch.items.some((i) => i.name.includes('Biryani')), 'Karachi must have Biryani');
  assert(khiMenu.dinner.items.some((i) => i.name.includes('Arabian Sea')), 'Karachi must have Seafood');

  // Verify distinct regions
  assert.notStrictEqual(isbMenu.regionKey, hunzaMenu.regionKey, 'Islamabad and Hunza menus must be different');
  assert.notStrictEqual(isbMenu.regionKey, khiMenu.regionKey, 'Islamabad and Karachi menus must be different');
});

// ----------------------------------------------------
// TEST K: Updated Priority Allocation Order (Transport -> Hotel -> Food)
// When budget covers Transport and Hotel, but not Food:
// Hotel must be included, and Food must be flagged with proposal and set to self-managed (PKR 0).
// ----------------------------------------------------
runTest('TEST K: Updated priority allocation flow (Transport -> Hotel -> Food)', () => {
  const mockHotel = {
    name: 'Pine Park Hotel',
    comfortLevel: 'Standard',
    pricePerNight: 5000,
    roomsQuantity: 2,
    defaultRoom: { price: 5000 },
  };

  const result = calculateBudget({
    budget: 60000,
    numberOfPersons: 4,
    days: 3, // 2 nights
    destination: 'Karachi',
    vehicleType: 'comfort-sedan',
    vehicleDailyRate: 6500, // 3 days rental = 19,500 + fuel/driver/tolls
    hotelRequired: true,
    selectedHotel: mockHotel,
    roomsQuantity: 2, // 2 rooms * 5,000 * 2 nights = 20,000
    foodRequired: true,
    selectedMeals: { breakfast: true, lunch: true, dinner: true },
    // Karachi 3 meals = (520 + 1150 + 1650) = 3320 * 4 persons * 3 days = 39,840
  });

  // Transport and Hotel must be covered
  assert.strictEqual(result.transport.status, 'included', 'Transport must be included');
  assert.strictEqual(result.hotel.status, 'included', 'Hotel must be included as Priority 2');
  assert.strictEqual(result.hotel.cost, 20000, 'Hotel cost must be Rs 20,000');

  // Food cannot fit in remaining balance:
  assert.strictEqual(result.food.status, 'self-managed', 'Food must be marked self-managed');
  assert.strictEqual(result.food.cost, 0, 'Company food cost must be PKR 0 when skipped');

  // Must have generated proposal for Food
  const foodProp = result.proposals.find((p) => p.service === 'food');
  assert(foodProp, 'Must have generated food shortfall proposal');
  assert(result.remainingBudget >= 0, 'Remaining budget must be >= 0');
});

console.log('\n====================================================');
console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
}
