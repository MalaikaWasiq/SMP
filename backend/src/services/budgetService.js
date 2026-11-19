const { calculateFoodCost, getFoodMenuForDestination } = require('./foodMenuService');

function round(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

// Vehicle Catalog matching standard Pakistani rental and tourism fleet
const VEHICLES = [
  {
    id: 'economy-mehran',
    name: 'Suzuki Mehran / Alto 660cc',
    category: 'Economy Hatchback',
    tier: 'Economy',
    capacity: '1 - 3 Persons',
    luggage: '2 Luggage Bags',
    maxPersons: 3,
    rentPerDay: 3000,
    fuelPerDay: 2000,
    icon: 'car-outline',
    desc: 'Fuel-efficient compact budget hatchback for 1 to 3 passengers with 2 luggage bags.',
  },
  {
    id: 'compact-wagonr',
    name: 'Suzuki Wagon R / Cultus VXL',
    category: 'Comfort Hatchback',
    tier: 'Economy',
    capacity: '1 - 4 Persons',
    luggage: '3 Luggage Bags',
    maxPersons: 4,
    rentPerDay: 4000,
    fuelPerDay: 2500,
    icon: 'car-outline',
    desc: 'Tall-boy spacious hatchback with comfortable seating for up to 4 passengers.',
  },
  {
    id: 'comfort-sedan',
    name: 'Toyota Corolla GLi / Altis',
    category: 'Executive Sedan',
    tier: 'Sedan',
    capacity: '1 - 4 Persons',
    luggage: '4 Luggage Bags',
    maxPersons: 4,
    rentPerDay: 6500,
    fuelPerDay: 3600,
    icon: 'car-sport-outline',
    desc: 'Reliable highway AC sedan with generous trunk capacity for family travel.',
  },
  {
    id: 'sedan-civic',
    name: 'Honda Civic Oriel 1.8L',
    category: 'Premium Sedan',
    tier: 'Sedan',
    capacity: '1 - 4 Persons',
    luggage: '4 Luggage Bags',
    maxPersons: 4,
    rentPerDay: 7500,
    fuelPerDay: 4000,
    icon: 'car-sport-outline',
    desc: 'Premium executive sedan with sunroof and high driving comfort.',
  },
  {
    id: 'family-brv',
    name: 'Honda BR-V 7-Seater MPV',
    category: 'Family MPV',
    tier: 'MPV',
    capacity: '4 - 6 Persons',
    luggage: '5 Luggage Bags',
    maxPersons: 6,
    rentPerDay: 9000,
    fuelPerDay: 4800,
    icon: 'car-sport-outline',
    desc: 'Spacious 7-seater MPV with folding rear seats for family vacations.',
  },
  {
    id: 'suv-4x4',
    name: 'Toyota Prado / Mountain 4x4 Jeep',
    category: '4x4 Mountain SUV',
    tier: 'SUV',
    capacity: '4 - 6 Persons',
    luggage: '5 Luggage Bags',
    maxPersons: 6,
    rentPerDay: 14000,
    fuelPerDay: 6000,
    icon: 'trail-sign-outline',
    desc: 'Heavy-duty 4x4 with high ground clearance for rugged mountain passes.',
  },
  {
    id: 'grand-cabin',
    name: 'Toyota HiAce Grand Cabin',
    category: 'Executive Passenger Van',
    tier: 'Van',
    capacity: '7 - 12 Persons',
    luggage: '10 Luggage Bags',
    maxPersons: 12,
    rentPerDay: 15000,
    fuelPerDay: 7500,
    icon: 'bus-outline',
    desc: 'High-roof commuter van with dual AC for joint families and tourist groups.',
  },
  {
    id: 'luxury-coaster',
    name: 'Toyota Coaster Saloon',
    category: 'Tourist Saloon Bus',
    tier: 'Bus',
    capacity: '13 - 22 Persons',
    luggage: '20 Luggage Bags',
    maxPersons: 22,
    rentPerDay: 22000,
    fuelPerDay: 9500,
    icon: 'bus-outline',
    desc: 'Spacious tourist saloon bus with PA sound system and large luggage compartment.',
  },
];

function selectVehicleForGroup(numPersons, preferredVehicleId, customDailyRate = null) {
  const count = Math.max(1, Number(numPersons) || 1);

  let vehicle = null;
  if (preferredVehicleId) {
    const norm = String(preferredVehicleId).toLowerCase().trim();
    vehicle = VEHICLES.find((v) =>
      v.id.toLowerCase() === norm ||
      v.tier.toLowerCase() === norm ||
      v.category.toLowerCase().includes(norm) ||
      v.name.toLowerCase().includes(norm) ||
      (norm.includes('mehran') && v.id === 'economy-mehran') ||
      (norm.includes('alto') && v.id === 'economy-mehran') ||
      (norm.includes('wagon') && v.id === 'compact-wagonr') ||
      (norm.includes('corolla') && v.id === 'comfort-sedan') ||
      (norm.includes('civic') && v.id === 'sedan-civic') ||
      (norm.includes('brv') && v.id === 'family-brv') ||
      (norm.includes('br-v') && v.id === 'family-brv') ||
      (norm.includes('prado') && v.id === 'suv-4x4') ||
      (norm.includes('jeep') && v.id === 'suv-4x4') ||
      (norm.includes('hiace') && v.id === 'grand-cabin') ||
      (norm.includes('coaster') && v.id === 'luxury-coaster')
    );
  }

  // Automatic capacity fallback if preferred vehicle is omitted
  if (!vehicle) {
    if (count <= 3) vehicle = VEHICLES.find((v) => v.id === 'economy-mehran');
    else if (count <= 4) vehicle = VEHICLES.find((v) => v.id === 'compact-wagonr');
    else if (count <= 6) vehicle = VEHICLES.find((v) => v.id === 'family-brv');
    else if (count <= 12) vehicle = VEHICLES.find((v) => v.id === 'grand-cabin');
    else vehicle = VEHICLES.find((v) => v.id === 'luxury-coaster');
  }

  if (!vehicle) vehicle = VEHICLES[0];

  // Support explicit daily rate overrides (e.g., luxury high-spec Coaster at Rs 40,000/day)
  if (customDailyRate && Number(customDailyRate) > 0) {
    return {
      ...vehicle,
      rentPerDay: round(customDailyRate),
    };
  }

  return vehicle;
}

// Activity rates catalog: distinguishes fixed event costs vs per-person costs
const ACTIVITY_RATES = {
  bbq_night: { name: 'Live Charcoal BBQ Night & Bonfire', rateType: 'fixed', price: 20000, desc: 'Private chef bonfire BBQ dinner event for the full group.' },
  bonfire: { name: 'Alpine Forest Campfire & Stargazing', rateType: 'fixed', price: 8000, desc: 'Campfire setup, pine firewood, and warm herbal tea for the group.' },
  boating: { name: 'Lake Motorboat / Shikara Cruise', rateType: 'per_person', price: 1500, desc: 'Scenic mountain lake boating pass.' },
  jeep_safari: { name: 'Rugged 4x4 Off-Road Jeep Safari', rateType: 'fixed', price: 8500, desc: 'Mountain jeep trail access to alpine viewpoints.' },
  heritage_pass: { name: 'Guided Cultural Heritage & Museum Pass', rateType: 'per_person', price: 600, desc: 'Official heritage landmark entries and local historian guide.' },
};

/**
 * Intelligent Priority-Based Travel Package Budget Allocation Engine
 * Priority Order:
 * 1. Transportation
 * 2. Food
 * 3. Hotel / Accommodation
 * 4. Additional Activities & Experiences
 */
function calculateBudget({
  budget,
  budgetPerPerson,
  numberOfPersons = 1,
  days = 1,
  destination = '',
  startLocation = '',
  itinerary = [],
  route = null,
  selectedHotel = null,
  hotelSuggestions = [],
  expenses = [],
  vehicleType = null,
  vehicleDailyRate = null,
  driverRequired = true,
  tripMode = 'company', // 'company' | 'customized'
  transportChoice = 'rental', // 'rental' | 'own'
  foodChoice = 'included', // 'included' | 'self'
  hotelRequired = true,
  transportRequired = true,
  foodRequired = true,
  activitiesRequired = true,
  selectedActivities = [],
  roomsQuantity = null,
  selectedMeals = { breakfast: true, lunch: false, dinner: true },
  selectedFoodItems = {},
  userConfirmedAdjustments = {}, // { transportDays: number, skipFood: boolean, skipHotel: boolean }
}) {
  const persons = Math.max(1, Number(numberOfPersons) || 1);
  const requestedDays = Math.max(1, Number(days) || 1);
  const totalBudget = round(
    Number(budget) || (Number(budgetPerPerson) ? Number(budgetPerPerson) * persons : 40000 * persons)
  );

  const isCompany = tripMode === 'company';
  // Respect explicit false flags regardless of mode
  const isTransportNeeded = transportRequired !== false && transportChoice !== 'none';
  const isFoodNeeded = foodRequired !== false && foodChoice !== 'self';
  const isHotelNeeded = hotelRequired !== false;
  const isActivitiesNeeded = activitiesRequired !== false;
  const isOwnCar = isTransportNeeded && transportChoice === 'own';

  // State trackers for priority evaluation
  let currentRemaining = totalBudget;
  const proposals = [];
  const appliedAdjustments = [];

  // =========================================================================
  // PRIORITY 1: TRANSPORTATION
  // =========================================================================
  const vehicle = selectVehicleForGroup(persons, vehicleType, vehicleDailyRate);
  const vehicleCapacity = Math.max(1, vehicle.maxPersons || 1);
  const numVehicles = isTransportNeeded && !isOwnCar ? Math.ceil(persons / vehicleCapacity) : 1;

  let activeDays = requestedDays;
  if (userConfirmedAdjustments?.transportDays && userConfirmedAdjustments.transportDays > 0) {
    activeDays = Math.min(requestedDays, userConfirmedAdjustments.transportDays);
    appliedAdjustments.push(`Transport duration adjusted to ${activeDays} days.`);
  }

  const isCustomRate = Boolean(vehicleDailyRate && Number(vehicleDailyRate) > 0);
  const driverRatePerDay = isCustomRate ? 0 : (driverRequired ? 2000 : 0);
  const routeKm = Math.max(0, Number(route?.totalDistanceMeters || 0) / 1000);
  const fuelPerDay = vehicle.fuelPerDay || 2000;
  const fuelEstimate = isCustomRate ? 0 : (routeKm > 0 ? round(routeKm * 28) : round(fuelPerDay * activeDays));
  const tollParkingEstimate = isCustomRate ? 0 : round(Math.max(500, routeKm > 0 ? routeKm * 4.5 : 800 * activeDays));

  let transportRent = 0;
  let transportDriver = 0;
  let transportFuel = 0;
  let transportTolls = 0;
  let transportCost = 0;
  let transportStatus = 'included';

  if (!isTransportNeeded || userConfirmedAdjustments?.skipTransport) {
    transportCost = 0;
    transportStatus = 'self-managed';
    appliedAdjustments.push('Transportation is self-managed by the customer.');
  } else if (isOwnCar) {
    transportRent = 0;
    transportFuel = 0;
    transportTolls = 0;
    transportDriver = driverRequired ? round(2000 * activeDays * numVehicles) : 0;
    transportCost = transportDriver;
    transportStatus = 'own-car';
  } else {
    // Rental fleet: vehicle cost = numVehicles * daily rate * days
    transportRent = round(numVehicles * vehicle.rentPerDay * activeDays);
    transportDriver = round(numVehicles * driverRatePerDay * activeDays);
    transportFuel = round(numVehicles * fuelEstimate);
    transportTolls = round(numVehicles * tollParkingEstimate);
    transportCost = transportRent + transportDriver + transportFuel + transportTolls;

    // Check transport affordability against total budget
    if (transportCost > totalBudget && totalBudget > 0) {
      const dailyTransportUnit = isCustomRate ? round(numVehicles * vehicle.rentPerDay) : round(
        (numVehicles * vehicle.rentPerDay) + (numVehicles * driverRatePerDay) + (numVehicles * fuelPerDay) + (numVehicles * 800)
      );
      const affordableDays = Math.max(1, Math.floor(totalBudget / Math.max(1, dailyTransportUnit)));

      proposals.push({
        priority: 1,
        service: 'transportation',
        type: 'duration_or_self_management',
        requiredAmount: transportCost,
        availableAmount: totalBudget,
        shortfall: transportCost - totalBudget,
        affordableDays,
        message: `Your current budget is not sufficient for a ${requestedDays}-day ${vehicle.name} trip (PKR ${transportCost.toLocaleString()}). We can arrange a ${affordableDays}-day ${vehicle.name} option (PKR ${(affordableDays * dailyTransportUnit).toLocaleString()}) within your transport budget. Food and accommodation will be included only if their actual costs fit into the remaining budget. Otherwise, you can manage those independently.`,
        suggestedOption: {
          action: 'accept_revised_days',
          days: affordableDays,
        },
      });
    }
  }

  // Deduct transport from total budget
  if (transportStatus !== 'self-managed') {
    currentRemaining = Math.max(0, currentRemaining - transportCost);
  }

  // =========================================================================
  // PRIORITY 2: HOTEL / ACCOMMODATION
  // =========================================================================
  const nights = Math.max(1, activeDays - 1);
  const personsPerRoom = 2;
  const numRooms = roomsQuantity && Number(roomsQuantity) > 0
    ? Number(roomsQuantity)
    : Math.ceil(persons / personsPerRoom);

  const hotel = selectedHotel || hotelSuggestions[0] || null;
  const roomPricePerNight = hotel
    ? round(hotel.selectedRoom?.price || hotel.defaultRoom?.price || hotel.pricePerNight || 3500)
    : 3500;
  const rawHotelCost = isHotelNeeded ? round(numRooms * roomPricePerNight * nights) : 0;

  let companyHotelCost = 0;
  let hotelStatus = 'self-managed';

  if (!isHotelNeeded || userConfirmedAdjustments?.skipHotel) {
    companyHotelCost = 0;
    hotelStatus = 'self-managed';
    appliedAdjustments.push('Accommodation will be managed independently by the customer.');
  } else if (rawHotelCost <= currentRemaining) {
    companyHotelCost = rawHotelCost;
    hotelStatus = 'included';
    currentRemaining = currentRemaining - companyHotelCost;
  } else {
    // Insufficient remaining budget for hotel
    companyHotelCost = 0;
    hotelStatus = 'self-managed';
    proposals.push({
      priority: 2,
      service: 'hotel',
      type: 'insufficient_hotel_budget',
      requiredAmount: rawHotelCost,
      availableAmount: currentRemaining,
      shortfall: rawHotelCost - currentRemaining,
      message: `Your transportation can be arranged within your budget (PKR ${transportCost.toLocaleString()}), but your remaining budget (PKR ${currentRemaining.toLocaleString()}) is not sufficient for the selected hotel stay (PKR ${rawHotelCost.toLocaleString()}). Would you like to arrange transportation through us and manage hotel accommodation independently?`,
      options: [
        { id: 'continue_without_hotel', label: 'Yes, continue without hotel' },
        { id: 'change_hotel_budget', label: 'Change hotel/budget options' },
      ],
    });
  }

  // =========================================================================
  // PRIORITY 3: FOOD / MEALS
  // =========================================================================
  const foodCalculation = calculateFoodCost({
    destination,
    numberOfPersons: persons,
    days: activeDays,
    selectedMeals: isCompany ? { breakfast: true, lunch: false, dinner: true } : selectedMeals,
    selectedItems: selectedFoodItems,
  });

  const rawFoodCost = isFoodNeeded ? foodCalculation.totalFoodCost : 0;
  let companyFoodCost = 0;
  let foodStatus = 'self-managed';

  if (!isFoodNeeded || userConfirmedAdjustments?.skipFood) {
    companyFoodCost = 0;
    foodStatus = 'self-managed';
    appliedAdjustments.push('Food will be managed independently by the customer.');
  } else if (rawFoodCost <= currentRemaining) {
    companyFoodCost = rawFoodCost;
    foodStatus = 'included';
    currentRemaining = currentRemaining - companyFoodCost;
  } else {
    // Insufficient remaining budget for food
    companyFoodCost = 0;
    foodStatus = 'self-managed';
    const coveredServices = [];
    if (transportStatus === 'included') coveredServices.push('transportation');
    if (hotelStatus === 'included') coveredServices.push('hotel stay');
    const coveredText = coveredServices.length > 0 ? `Your ${coveredServices.join(' and ')} can be arranged within your budget` : 'Your package';

    proposals.push({
      priority: 3,
      service: 'food',
      type: 'insufficient_food_budget',
      requiredAmount: rawFoodCost,
      availableAmount: currentRemaining,
      shortfall: rawFoodCost - currentRemaining,
      message: `${coveredText}, but your remaining budget (PKR ${currentRemaining.toLocaleString()}) is not sufficient for the selected food service (PKR ${rawFoodCost.toLocaleString()}). Would you like to proceed with us and manage food independently?`,
      options: [
        { id: 'continue_without_food', label: 'Yes, continue without food' },
        { id: 'modify_selections', label: 'Modify my selections' },
      ],
    });
  }

  // =========================================================================
  // PRIORITY 4: ADDITIONAL ACTIVITIES & EXPERIENCES
  // =========================================================================
  let rawActivitiesCost = 0;
  const activeActivitiesList = [];

  if (isActivitiesNeeded && Array.isArray(selectedActivities) && selectedActivities.length > 0) {
    for (const act of selectedActivities) {
      const actId = typeof act === 'string' ? act : (act.id || '');
      const catalogItem = ACTIVITY_RATES[actId] || act;
      let cost = 0;
      if (catalogItem.rateType === 'fixed') {
        cost = round(catalogItem.price || 0); // Fixed event cost, not multiplied by persons
      } else {
        cost = round((catalogItem.price || 0) * persons);
      }
      rawActivitiesCost += cost;
      activeActivitiesList.push({
        id: actId,
        name: catalogItem.name || 'Optional Activity',
        rateType: catalogItem.rateType || 'per_person',
        cost,
      });
    }
  }

  let companyActivitiesCost = 0;
  let activitiesStatus = 'none';

  if (!isActivitiesNeeded || rawActivitiesCost === 0) {
    companyActivitiesCost = 0;
    activitiesStatus = 'none';
  } else if (rawActivitiesCost <= currentRemaining) {
    companyActivitiesCost = rawActivitiesCost;
    activitiesStatus = 'included';
    currentRemaining = currentRemaining - companyActivitiesCost;
  } else {
    companyActivitiesCost = 0;
    activitiesStatus = 'omitted_due_to_budget';
    proposals.push({
      priority: 4,
      service: 'activities',
      type: 'insufficient_activity_budget',
      requiredAmount: rawActivitiesCost,
      availableAmount: currentRemaining,
      shortfall: rawActivitiesCost - currentRemaining,
      message: 'Optional activities exceed the remaining budget and have been omitted from the company package.',
    });
  }

  // Final Balance Calculations (Strictly Non-Negative)
  const totalActualPackageCost = transportCost + companyFoodCost + companyHotelCost + companyActivitiesCost;
  const remainingBudget = Math.max(0, totalBudget - totalActualPackageCost);
  const perPersonExpense = round(totalActualPackageCost / persons);
  const remainingBudgetPerPerson = round(remainingBudget / persons);

  // Actual expense tracking calculations
  const actualSpent = (Array.isArray(expenses) ? expenses : []).reduce(
    (sum, item) => sum + (Number(item?.amount) || 0),
    0
  );
  const actualRemaining = Math.max(0, totalBudget - actualSpent);
  const actualExceeded = actualSpent > totalBudget;
  const actualOverBy = Math.max(0, actualSpent - totalBudget);
  const actualPercentUsed = totalBudget > 0 ? Math.min(100, Math.round((actualSpent / totalBudget) * 100)) : 0;

  return {
    // Legacy numeric properties for complete backward compatibility
    hotels: companyHotelCost,
    hotelCost: companyHotelCost,
    food: companyFoodCost,
    foodCost: companyFoodCost,
    transportCost,
    activities: companyActivitiesCost,
    activityCost: companyActivitiesCost,
    companyProfit: Math.round(companyHotelCost * 0.10),
    totalEstimated: totalActualPackageCost,
    remaining: remainingBudget,
    budgetPerPerson: round(totalBudget / persons),
    pricePerPerson: perPersonExpense,
    exceeded: totalActualPackageCost > totalBudget,
    overBy: Math.max(0, totalActualPackageCost - totalBudget),
    percentUsed: totalBudget > 0 ? Math.min(100, Math.round((totalActualPackageCost / totalBudget) * 100)) : 0,
    actualSpent,
    actualRemaining,
    actualExceeded,
    actualOverBy,
    actualPercentUsed,

    totalBudget,
    totalActualPackageCost,
    remainingBudget,
    perPersonExpense,
    remainingBudgetPerPerson,
    numberOfPersons: persons,
    days: activeDays,
    requestedDays,
    destination,
    startLocation,

    // Legacy package details and allocation objects for controller & screen compatibility
    vehicleDetails: {
      id: vehicle.id,
      name: vehicle.name,
      capacity: vehicle.capacity,
      maxPersons: vehicle.maxPersons,
      luggage: vehicle.luggage,
      rentPerDay: vehicle.rentPerDay,
      numVehicles,
      driverIncluded: driverRequired,
      driverCharges: transportDriver,
      fuelEstimate: transportFuel,
      tollsEstimate: transportTolls,
      isOwnCar,
    },
    packageDetails: {
      totalPackageCost: totalActualPackageCost,
      pricePerPerson: perPersonExpense,
      roomType: hotel?.comfortLevel === 'Luxury' ? 'Luxury Suite' : 'Standard Double / Family Room',
      hotelName: hotel?.name || 'Verified Partner Hotel',
      vehicleName: vehicle.name,
      fuelStatus: isOwnCar ? 'Own Car (Rs. 0 rent)' : 'Dedicated AC Vehicle + Fuel + Tolls',
      inclusions: [
        'Dedicated AC Vehicle with fuel, tolls & road permits',
        'Licensed mountain driver with daily allowance',
        `${nights} Nights Hotel Stay in ${destination}`,
        'Daily complimentary morning hotel breakfast',
        'Nightly fixed-menu dinner for all travelers',
        '24/7 Tour coordination & helpline support',
      ],
    },
    foodPlan: {
      foodChoice: foodStatus === 'self-managed' ? 'self' : 'included',
      breakfastTotal: foodCalculation.breakfast.total,
      dinnerTotal: foodCalculation.dinner.total,
      lunchTotal: foodCalculation.lunch.total,
    },
    allocation: {
      transport: transportCost,
      hotels: companyHotelCost,
      food: companyFoodCost,
      activities: companyActivitiesCost,
      companyProfit: Math.round(companyHotelCost * 0.10),
      safetyMargin: Math.round(totalBudget * 0.05),
      total: totalActualPackageCost,
    },

    // Priority breakdown
    transport: {
      status: transportStatus,
      cost: transportCost,
      vehicle: {
        id: vehicle.id,
        name: vehicle.name,
        capacity: vehicle.capacity,
        maxPersons: vehicle.maxPersons,
        luggage: vehicle.luggage,
        rentPerDay: vehicle.rentPerDay,
        numVehicles,
      },
      driverIncluded: driverRequired,
      driverCharges: transportDriver,
      fuelEstimate: transportFuel,
      tollsEstimate: transportTolls,
      isOwnCar,
    },

    food: {
      status: foodStatus,
      cost: companyFoodCost,
      requestedCost: rawFoodCost,
      regionName: foodCalculation.regionName,
      breakfast: foodCalculation.breakfast,
      lunch: foodCalculation.lunch,
      dinner: foodCalculation.dinner,
      note: foodStatus === 'self-managed' ? 'Food will be managed independently by the customer.' : 'Company-managed meal package.',
    },

    hotel: {
      status: hotelStatus,
      cost: companyHotelCost,
      requestedCost: rawHotelCost,
      hotelName: hotel?.name || 'Verified Partner Hotel',
      roomType: hotel?.comfortLevel === 'Luxury' ? 'Luxury Suite' : 'Standard Double / Family Room',
      numberOfRooms: numRooms,
      nights,
      pricePerRoomPerNight: roomPricePerNight,
      note: hotelStatus === 'self-managed' ? 'Accommodation will be managed independently by the customer.' : 'Company-managed hotel stay.',
    },

    activities: {
      status: activitiesStatus,
      cost: companyActivitiesCost,
      requestedCost: rawActivitiesCost,
      list: activeActivitiesList,
    },

    proposals,
    appliedAdjustments,
    currency: 'PKR',
  };
}

module.exports = {
  calculateBudget,
  selectVehicleForGroup,
  VEHICLES,
  ACTIVITY_RATES,
};
