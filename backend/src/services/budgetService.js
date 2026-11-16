function round(value) {
  return Math.max(0, Math.round(Number(value) || 0));
}

// Vehicle Catalog matching client's Pakistani vehicle options
const VEHICLES = [
  { id: 'economy-alto', name: 'Suzuki Alto 660cc / Mehran', category: 'Economy (Budget)', tier: 'Low', capacity: '1 - 3 Persons', luggage: '2 Luggage Bags', maxPersons: 3, rentPerDay: 3000, fuelPerDay: 2000, icon: 'car-outline', desc: 'Fuel efficient compact budget hatchback' },
  { id: 'economy-mira', name: 'Daihatsu Mira / Suzuki Every', category: 'Economy (Mini MPV)', tier: 'Low', capacity: '1 - 4 Persons', luggage: '3 Luggage Bags', maxPersons: 4, rentPerDay: 3800, fuelPerDay: 2200, icon: 'car-outline', desc: 'Economical Japanese Kei car / mini MPV' },
  { id: 'compact-wagonr', name: 'Suzuki Wagon R / Cultus VXL', category: 'Hatchback (Comfort)', tier: 'Low', capacity: '1 - 4 Persons', luggage: '3 Luggage Bags', maxPersons: 4, rentPerDay: 4000, fuelPerDay: 2500, icon: 'car-outline', desc: 'Spacious tall-boy hatchback' },
  { id: 'compact-vitz', name: 'Toyota Vitz / Yaris 1.3L', category: 'Hatchback / Compact', tier: 'Medium-Low', capacity: '1 - 4 Persons', luggage: '3 Luggage Bags', maxPersons: 4, rentPerDay: 4800, fuelPerDay: 2800, icon: 'car-outline', desc: 'Modern reliable compact car' },
  { id: 'sedan-city', name: 'Honda City 1.3L / 1.5L', category: 'Sedan (Economy)', tier: 'Medium', capacity: '3 - 5 Persons', luggage: '4 Luggage Bags', maxPersons: 5, rentPerDay: 5500, fuelPerDay: 3200, icon: 'car-sport-outline', desc: 'Smooth city & highway comfortable sedan' },
  { id: 'comfort-sedan', name: 'Toyota Corolla GLi / Altis', category: 'Sedan (Auto)', tier: 'Medium', capacity: '3 - 5 Persons', luggage: '4 Luggage Bags', maxPersons: 5, rentPerDay: 6500, fuelPerDay: 3600, icon: 'car-sport-outline', desc: 'Smooth highway drive, AC sedan with 4 bags boot' },
  { id: 'sedan-civic', name: 'Honda Civic Oriel 1.8L', category: 'Sedan (Executive)', tier: 'Medium-High', capacity: '3 - 5 Persons', luggage: '4 Luggage Bags', maxPersons: 5, rentPerDay: 7500, fuelPerDay: 4000, icon: 'car-sport-outline', desc: 'Executive premium sedan' },
  { id: 'mpv-karvaan', name: 'Changan Karvaan Plus MPV', category: 'MPV (Budget Van)', tier: 'Medium', capacity: '4 - 7 Persons', luggage: '5 Luggage Bags', maxPersons: 7, rentPerDay: 8000, fuelPerDay: 4200, icon: 'bus-outline', desc: 'Affordable 7-seater passenger MPV' },
  { id: 'family-brv', name: 'Honda BR-V 7-Seater MPV', category: 'Family MPV (7-Seater)', tier: 'Medium-High', capacity: '4 - 6 Persons', luggage: '5 Luggage Bags', maxPersons: 6, rentPerDay: 8800, fuelPerDay: 4600, icon: 'car-sport-outline', desc: 'Versatile 7-seater MPV for family & luggage' },
  { id: 'suv-sportage', name: 'KIA Sportage / Tucson AWD', category: 'Compact SUV', tier: 'High', capacity: '4 - 5 Persons', luggage: '5 Luggage Bags', maxPersons: 5, rentPerDay: 11000, fuelPerDay: 5200, icon: 'trail-sign-outline', desc: 'Modern AWD compact crossover' },
  { id: 'suv-fortuner', name: 'Toyota Fortuner / Revo 4x4', category: 'Full SUV 4x4', tier: 'High', capacity: '4 - 7 Persons', luggage: '6 Luggage Bags', maxPersons: 7, rentPerDay: 13000, fuelPerDay: 5800, icon: 'trail-sign-outline', desc: 'Heavy duty 4x4 SUV for extreme mountain trails' },
  { id: 'suv-4x4', name: 'Toyota Prado / Mountain 4x4 Jeep', category: '4x4 SUV (Luxury)', tier: 'High', capacity: '4 - 6 Persons', luggage: '6 Luggage Bags', maxPersons: 6, rentPerDay: 14000, fuelPerDay: 6000, icon: 'trail-sign-outline', desc: 'High ground clearance and power for mountain climbs' },
  { id: 'van-hiace', name: 'Toyota HiAce Standard Commuter', category: 'Van / Group', tier: 'Group', capacity: '7 - 11 Persons', luggage: '8 Luggage Bags', maxPersons: 11, rentPerDay: 13500, fuelPerDay: 6500, icon: 'bus-outline', desc: 'Standard high-roof passenger van' },
  { id: 'grand-cabin', name: 'Toyota HiAce Grand Cabin VIP', category: 'Van / Luxury Group', tier: 'Group', capacity: '8 - 14 Persons', luggage: '10 Luggage Bags', maxPersons: 14, rentPerDay: 16000, fuelPerDay: 7500, icon: 'bus-outline', desc: 'Executive high-roof van with dual AC for joint families' },
  { id: 'luxury-coaster', name: 'Toyota Coaster Saloon Mini-Bus', category: 'Coaster (Executive)', tier: 'Large Group', capacity: '14 - 24 Persons', luggage: '20 Luggage Bags', maxPersons: 24, rentPerDay: 22000, fuelPerDay: 9500, icon: 'bus-outline', desc: 'Spacious tourist saloon bus with luggage bay' },
];

function selectVehicleForGroup(numPersons, preferredVehicleId) {
  if (preferredVehicleId) {
    const norm = String(preferredVehicleId).toLowerCase().trim();
    const found = VEHICLES.find((v) =>
      v.id.toLowerCase() === norm ||
      v.tier.toLowerCase() === norm ||
      v.category.toLowerCase().includes(norm) ||
      v.name.toLowerCase().includes(norm) ||
      (norm.includes('mehran') && v.id === 'economy-mehran') ||
      (norm.includes('alto') && (v.id === 'economy-mehran' || v.id === 'compact-wagonr')) ||
      (norm.includes('wagon') && v.id === 'compact-wagonr') ||
      (norm.includes('corolla') && v.id === 'comfort-sedan') ||
      (norm.includes('civic') && v.id === 'comfort-sedan') ||
      (norm.includes('brv') && v.id === 'family-brv') ||
      (norm.includes('br-v') && v.id === 'family-brv') ||
      (norm.includes('prado') && v.id === 'suv-4x4') ||
      (norm.includes('jeep') && v.id === 'suv-4x4') ||
      (norm.includes('hiace') && v.id === 'grand-cabin') ||
      (norm.includes('coaster') && v.id === 'luxury-coaster')
    );
    if (found) return found;
  }
  const count = Math.max(1, Number(numPersons) || 1);
  if (count <= 3) return VEHICLES[0]; // Mehran / Alto
  if (count <= 4) return VEHICLES[1]; // Wagon R
  if (count <= 5) return VEHICLES[2]; // Corolla / Civic
  if (count <= 6) return VEHICLES[3]; // BR-V / SUV
  if (count <= 12) return VEHICLES[5]; // HiAce
  return VEHICLES[6]; // Coaster
}

// Supervisor's 4-Category Budget Allocation Rule:
// Transport 35%, Hotel/stay 35%, Food 15%, Activities & sights 10%, Safety Margin 5%
// If budget is low (or food self-arranged): Hotel ~48%, Transport ~48%, Safety ~4%, Food 0%
// Supervisor's Budget Allocation Rule:
// Customized: Transport 35%, Hotel 35%, Food 15%, Activities 10%, Safety 5%
// Company: Company Profit 10%, Transport 30%, Hotel 35%, Food 15%, Activities 5%, Safety 5%
// If low budget: Hotel & Transport managed, Food 0%
function calculateBudgetAllocation(totalBudget, isLowBudget = false, isCompany = false) {
  const total = round(totalBudget);
  if (isCompany) {
    const profit = round(total * 0.10);
    if (isLowBudget) {
      const remainingForServices = total - profit;
      const safety = round(remainingForServices * 0.04);
      const available = Math.max(0, remainingForServices - safety);
      const half = round(available / 2);
      return {
        transport: half,
        hotels: available - half,
        food: 0,
        activities: 0,
        companyProfit: profit,
        safetyMargin: safety,
        total,
        isLowBudget: true,
        isCompany: true,
      };
    }
    return {
      transport: round(total * 0.30),
      hotels: round(total * 0.35),
      food: round(total * 0.15),
      activities: round(total * 0.05),
      companyProfit: profit,
      safetyMargin: round(total * 0.05),
      total,
      isLowBudget: false,
      isCompany: true,
    };
  }
  if (isLowBudget) {
    const safety = round(total * 0.04);
    const available = Math.max(0, total - safety);
    const half = round(available / 2);
    return {
      transport: half,
      hotels: available - half,
      food: 0,
      activities: 0,
      safetyMargin: safety,
      total,
      isLowBudget: true,
    };
  }
  return {
    transport: round(total * 0.35),
    hotels: round(total * 0.35),
    food: round(total * 0.15),
    activities: round(total * 0.10),
    safetyMargin: round(total * 0.05),
    companyProfit: 0,
    total,
    isLowBudget: false,
    isCompany: false,
  };
}

function calculateBudget({
  budget,
  budgetPerPerson,
  numberOfPersons = 1,
  days = 1,
  itinerary = [],
  route,
  selectedHotel,
  hotelSuggestions = [],
  expenses = [],
  vehicleType,
  driverRequired = true,
  tripMode = 'customized',
  transportChoice = 'rental',
  foodChoice = 'included',
  hotelRequired = true,
  transportRequired = true,
  foodRequired = true,
  activitiesRequired = true,
  selectedActivities = [],
  roomsQuantity = 1,
  selectedMeals = { breakfast: true, lunch: false, dinner: true },
}) {
  const normalizedPersons = Math.max(1, Number(numberOfPersons) || 1);
  const normalizedDays = Math.max(1, Number(days) || 1);
  const nights = Math.max(1, normalizedDays - 1);

  // Target Budget
  const normalizedBudget = round(budget || (Number(budgetPerPerson) ? Number(budgetPerPerson) * normalizedPersons : 38500 * normalizedPersons));
  const perPersonTarget = round(normalizedBudget / normalizedPersons);

  // Supervisor Rule: If budget is low, system manages hotel stay & transport while customer handles food on their own
  const isLowBudget = (normalizedBudget > 0 && normalizedBudget < (normalizedPersons * normalizedDays * 3500))
    || foodChoice === 'self'
    || foodRequired === false;

  const isCompany = tripMode === 'company';
  const isTransportNeeded = Boolean(transportRequired !== false);
  const isHotelNeeded = Boolean(hotelRequired !== false);
  const isFoodNeeded = isLowBudget ? false : Boolean(foodRequired !== false);
  const isActivitiesNeeded = isLowBudget ? false : Boolean(activitiesRequired !== false);
  const isOwnCar = !isCompany && isTransportNeeded && transportChoice === 'own';

  // For 4 persons on low budget, manage room quantity so 4 persons share Family Quad Room instead of 2 separate full-rate rooms
  let effectiveRooms = Math.max(1, Number(roomsQuantity) || 1);
  if (isLowBudget && normalizedPersons <= 4 && effectiveRooms > 1) {
    effectiveRooms = 1;
  }
  const rooms = effectiveRooms;

  // 1. Budget Allocation Breakdown (Low Budget: ~48% Hotel, ~48% Transport, 0% Food, 4% Safety)
  const companyProfit = isCompany ? round(normalizedBudget * 0.10) : 0;
  // 1. Budget Allocation Breakdown (includes 10% company profit in company mode)
  const allocation = calculateBudgetAllocation(normalizedBudget, isLowBudget, isCompany);

  // 2. Hotel Calculation & Expense Controller
  let hotels = 0;
  let dailyHotelBudget = round(allocation.hotels / (nights * rooms));
  let hotel = null;

  if (isHotelNeeded) {
    hotel = selectedHotel || hotelSuggestions.find((h) => h.withinBudget) || hotelSuggestions[0];
    const hotelPricePerNight = hotel ? round(hotel.selectedRoom?.price || hotel.defaultRoom?.price || hotel.pricePerNight || 2800) : 2800;
    const computedStay = round(hotel?.totalStayCost || (hotelPricePerNight * nights * rooms));
    // In low budget mode, manage stay cost so it never exceeds allocated hotel budget
    hotels = isLowBudget ? Math.min(computedStay, allocation.hotels) : computedStay;
  } else {
    hotels = 0; // Unselected service -> Strictly PKR 0!
  }

  // 3. Transport & Vehicle Selection Controller (Licensed Mountain Driver option & charges removed)
  const vehicle = selectVehicleForGroup(normalizedPersons, vehicleType);
  const driverChargePerDay = 0;
  const routeKm = Math.max(0, Number(route?.totalDistanceMeters || 0) / 1000);
  const fuelEstimate = routeKm > 0 ? round(routeKm * 28) : round(vehicle.fuelPerDay * normalizedDays);
  const tollParkingEstimate = round(Math.max(500, (routeKm > 0 ? routeKm * 4.5 : 800 * normalizedDays)));

  let transportRent = 0;
  let transportDriver = 0;
  let transportFuel = 0;
  let transportTolls = 0;
  let transport = 0;

  if (!isTransportNeeded) {
    // Unselected transport -> Strictly PKR 0!
    transport = 0;
  } else if (isCompany) {
    transportRent = round(vehicle.rentPerDay * normalizedDays);
    transportDriver = 0;
    transportFuel = fuelEstimate;
    transportTolls = tollParkingEstimate;
    transport = transportRent + transportFuel + transportTolls;
  } else if (isOwnCar) {
    // Own Car: Rent PKR 0, Fuel self-managed, Driver fee 0
    transportRent = 0;
    transportFuel = 0;
    transportTolls = 0;
    transportDriver = 0;
    transport = 0;
  } else {
    // Rental Car (Self-Drive / No Driver Fee)
    transportRent = round(vehicle.rentPerDay * normalizedDays);
    transportDriver = 0;
    transportFuel = fuelEstimate;
    transportTolls = tollParkingEstimate;
    transport = transportRent + transportFuel + transportTolls;
  }

  // In low budget mode, manage transport so it fits within allocation
  if (isLowBudget && isTransportNeeded && !isOwnCar && transport > allocation.transport && allocation.transport > 0) {
    transport = allocation.transport;
    transportRent = round(transport * 0.55);
    transportFuel = round(transport * 0.35);
    transportTolls = transport - (transportRent + transportFuel);
  }

  // 4. Food Policy Controller (Supervisor Rule: Customer handles food on their own if budget is low)
  const breakfastRate = 450;
  const lunchRate = 850;
  const dinnerRate = 1200;
  let food = 0;
  let foodBreakdown = {
    breakfast: { selected: false, ratePerDay: isLowBudget ? 0 : breakfastRate, total: 0, menu: isLowBudget ? 'Self-Arranged (Customer handles meals on their own)' : 'Pakistani Omelette, Paratha, Chana, Toast & Chai' },
    lunch: { selected: false, ratePerDay: isLowBudget ? 0 : lunchRate, total: 0, menu: isLowBudget ? 'Self-Arranged (Customer handles meals on their own)' : 'Chicken Karahi, Biryani, Naan, Salad & Raita' },
    dinner: { selected: false, ratePerDay: isLowBudget ? 0 : dinnerRate, total: 0, menu: isLowBudget ? 'Self-Arranged (Customer handles meals on their own)' : 'Mutton Handi / Shinwari Karahi, Roghani Naan, Kheer & Green Tea' },
  };

  if (!isFoodNeeded || isLowBudget) {
    // Customer handles food on their own -> Strictly PKR 0 in package!
    food = 0;
  } else if (isCompany) {
    // Full Company Package includes Breakfast & Dinner
    foodBreakdown.breakfast.selected = true;
    foodBreakdown.breakfast.total = round(breakfastRate * normalizedPersons * normalizedDays);
    foodBreakdown.dinner.selected = true;
    foodBreakdown.dinner.total = round(dinnerRate * normalizedPersons * normalizedDays);
    food = foodBreakdown.breakfast.total + foodBreakdown.dinner.total;
  } else {
    // Customized Mode: Individual meal selections
    let dailyRate = 0;
    if (selectedMeals?.breakfast !== false) {
      foodBreakdown.breakfast.selected = true;
      foodBreakdown.breakfast.total = round(breakfastRate * normalizedPersons * normalizedDays);
      dailyRate += breakfastRate;
    }
    if (selectedMeals?.lunch === true) {
      foodBreakdown.lunch.selected = true;
      foodBreakdown.lunch.total = round(lunchRate * normalizedPersons * normalizedDays);
      dailyRate += lunchRate;
    }
    if (selectedMeals?.dinner !== false) {
      foodBreakdown.dinner.selected = true;
      foodBreakdown.dinner.total = round(dinnerRate * normalizedPersons * normalizedDays);
      dailyRate += dinnerRate;
    }
    food = round(dailyRate * normalizedPersons * normalizedDays);
  }

  // 5. Activities & Sights Controller
  let activities = 0;
  let activeActivitiesList = [];

  if (!isActivitiesNeeded) {
    // Unselected activities -> Strictly PKR 0!
    activities = 0;
  } else if (isCompany) {
    let packageActivities = 0;
    for (const day of itinerary) {
      for (const act of day.activities || []) {
        const cost = round(act.estimatedCost);
        if (cost <= 1500) packageActivities += cost;
      }
    }
    activities = packageActivities > 0 ? packageActivities : allocation.activities;
    activeActivitiesList = [
      { name: 'Standard Sights, Viewpoints & Entry Coordination', cost: activities },
      { name: 'Telenor 300 Tourist SIM Pack (30GB Data)', cost: 300 },
    ];
  } else {
    // Customized mode: user selected specific activities; unselected items cost PKR 0!
    if (Array.isArray(selectedActivities) && selectedActivities.length > 0) {
      activities = selectedActivities.reduce((sum, act) => sum + round(act.price || act.cost || 0), 0);
      activeActivitiesList = selectedActivities.map((act) => ({
        name: act.name || act.title || 'Activity',
        cost: round(act.price || act.cost || 0),
      }));
    } else {
      activities = 0;
    }
  }

  const safetyMargin = isCompany ? allocation.safetyMargin : 0;

  // Smart Package Budget Guard (Supervisor Rule: Total package must NEVER exceed user budget)
  let rawPackageCost = hotels + transport + food + activities + safetyMargin + companyProfit;
  if (rawPackageCost > normalizedBudget && normalizedBudget > 0) {
    if (isFoodNeeded && food > allocation.food) {
      food = allocation.food;
      foodBreakdown.breakfast.total = round(food * 0.35);
      foodBreakdown.lunch.total = 0;
      foodBreakdown.dinner.total = food - foodBreakdown.breakfast.total;
    }
    if (isTransportNeeded && transport > allocation.transport) {
      transport = allocation.transport;
      transportRent = round(transport * 0.50);
      transportFuel = round(transport * 0.30);
      transportTolls = round(transport * 0.05);
      transportDriver = transport - (transportRent + transportFuel + transportTolls);
    }
    if (isActivitiesNeeded && activities > allocation.activities) {
      activities = allocation.activities;
    }
    if (isHotelNeeded && hotels > allocation.hotels) {
      hotels = allocation.hotels;
    }
  }

  // Final Package Incurred / Deducted (Strictly <= normalizedBudget)
  const totalPackageCost = normalizedBudget > 0 ? Math.min(normalizedBudget, hotels + transport + food + activities + safetyMargin + companyProfit) : (hotels + transport + food + activities + safetyMargin + companyProfit);
  const pricePerPerson = round(totalPackageCost / normalizedPersons);

  const remaining = Math.max(0, normalizedBudget - totalPackageCost);
  const actualSpent = expenses.reduce((sum, expense) => sum + round(expense.amount), 0);
  const actualRemaining = normalizedBudget - actualSpent;

  // Cheaper Alternative Suggestions (When Budget Exceeded)
  const optimizationSuggestions = [];
  if (remaining < 0) {
    // 1. Vehicle downgrade suggestion
    if (isTransportNeeded && !isOwnCar && vehicle.id !== 'economy-mehran') {
      const cheaperVehicle = VEHICLES[0]; // Mehran / Alto
      const vehicleSavings = (vehicle.rentPerDay - cheaperVehicle.rentPerDay + vehicle.fuelPerDay - cheaperVehicle.fuelPerDay) * normalizedDays;
      if (vehicleSavings > 0) {
        optimizationSuggestions.push({
          id: 'opt_vehicle',
          type: 'vehicle',
          title: `Switch vehicle to ${cheaperVehicle.name}`,
          desc: `Switching to ${cheaperVehicle.name} (${cheaperVehicle.capacity}) saves fuel and rent.`,
          savings: round(vehicleSavings),
          actionPayload: { vehicleType: cheaperVehicle.id },
        });
      }
    }


    // 3. Hotel tier optimization
    if (isHotelNeeded && hotel && (hotel.pricePerNight > 3500 || hotel.comfortLevel === 'Luxury')) {
      const hotelSavings = Math.max(1000, (hotel.pricePerNight - 3200) * nights * rooms);
      optimizationSuggestions.push({
        id: 'opt_hotel',
        type: 'hotel',
        title: 'Switch to Budget Friendly Hotel / Room',
        desc: `Choosing a verified standard economy room saves stay expenses.`,
        savings: round(hotelSavings),
        actionPayload: { comfortLevel: 'Basic' },
      });
    }

    // 4. Meal optimization
    if (isFoodNeeded && foodBreakdown.lunch?.selected) {
      const lunchSavings = lunchRate * normalizedPersons * normalizedDays;
      optimizationSuggestions.push({
        id: 'opt_lunch',
        type: 'food',
        title: 'Self-arrange lunch at local dhabas',
        desc: 'Excluding lunch from pre-paid bundle saves dining cost while traveling.',
        savings: round(lunchSavings),
        actionPayload: { lunch: false },
      });
    }

    // 5. Own Car suggestion
    if (isTransportNeeded && !isCompany && !isOwnCar) {
      const ownCarSavings = transportRent + transportFuel;
      if (ownCarSavings > 0) {
        optimizationSuggestions.push({
          id: 'opt_own_car',
          type: 'transport',
          title: 'Use Personal / Own Car',
          desc: 'Travel in your own vehicle to eliminate rental car charges completely.',
          savings: round(ownCarSavings),
          actionPayload: { transportChoice: 'own' },
        });
      }
    }
  }

  // Granular budget deduction audit summary
  const budgetDeductions = {
    hotels: {
      amount: hotels,
      isIncluded: isHotelNeeded,
      roomsQuantity: rooms,
      label: isHotelNeeded ? `${nights} Nights (${rooms} Room${rooms > 1 ? 's' : ''}) at ${hotel?.name || 'Verified Hotel'}` : 'No Hotel Required (PKR 0 cut)',
      saved: isHotelNeeded ? 0 : allocation.hotels,
    },
    transport: {
      amount: transport,
      isIncluded: isTransportNeeded && transport > 0,
      choice: !isTransportNeeded ? 'None' : (isOwnCar ? 'Own Car' : 'Rental Car'),
      label: !isTransportNeeded
        ? 'No Transport Required (PKR 0 cut)'
        : (isOwnCar
          ? (transportDriver > 0 ? `Own Car (Rent PKR 0) + Driver (PKR ${transportDriver.toLocaleString()})` : 'Own Car (PKR 0 rental cut)')
          : `${vehicle.name} (Rent + Fuel + Driver + Tolls)`),
      saved: !isTransportNeeded ? allocation.transport : (isOwnCar ? allocation.transport - transport : 0),
    },
    food: {
      amount: food,
      isIncluded: isFoodNeeded && food > 0,
      label: !isFoodNeeded
        ? 'Self-Arranged Food (PKR 0 cut)'
        : (isCompany ? 'Breakfast + Dinner Included in Package' : `Custom Meal Plan (${Object.keys(foodBreakdown).filter(k => foodBreakdown[k].selected).join(' + ') || 'Self-Paid'})`),
      saved: isFoodNeeded ? 0 : allocation.food,
    },
    activities: {
      amount: activities,
      isIncluded: isActivitiesNeeded && activities > 0,
      count: activeActivitiesList.length,
      label: activities > 0 ? `${activeActivitiesList.length} Selected Activities` : 'Standard Free Sights (PKR 0 cut)',
      saved: activities > 0 ? 0 : allocation.activities,
    },
    ...(isCompany ? {
      companyProfit: {
        amount: companyProfit,
        isIncluded: true,
        label: 'Company Profit (10% of Total Budget)',
        percentage: 10,
        saved: 0,
      },
    } : {}),
    totalDeducted: totalPackageCost,
    remainingSaved: Math.max(0, remaining),
  };

  return {
    hotels,
    food,
    transport,
    activities,
    companyProfit,
    misc: safetyMargin,
    safetyMargin,
    totalEstimated: totalPackageCost,
    remaining,
    percentUsed: normalizedBudget ? Math.round((totalPackageCost / normalizedBudget) * 100) : 0,
    exceeded: remaining < 0,
    overBy: Math.max(0, -remaining),
    currency: 'PKR',
    note: isCompany
      ? 'All-inclusive Company Tour or Full Company Package.'
      : 'Customize My Trip with selective service visibility.',
    actualSpent,
    actualRemaining,
    actualPercentUsed: normalizedBudget ? Math.round((actualSpent / normalizedBudget) * 100) : 0,
    actualExceeded: actualRemaining < 0,
    actualOverBy: Math.max(0, -actualRemaining),
    optimizationSuggestions,

    // Dimensions
    numberOfPersons: normalizedPersons,
    roomsQuantity: rooms,
    budgetPerPerson: perPersonTarget,
    dailyHotelBudget,
    allocation,
    budgetDeductions,

    // Vehicle details
    vehicleDetails: {
      id: vehicle.id,
      name: !isTransportNeeded ? 'No Transport (Self-Managed)' : (isOwnCar ? 'Own Car (Personal Vehicle)' : vehicle.name),
      category: !isTransportNeeded ? 'None' : (isOwnCar ? 'Personal / Own Vehicle' : vehicle.category),
      tier: vehicle.tier,
      capacity: vehicle.capacity,
      luggage: vehicle.luggage,
      transportChoice: !isTransportNeeded ? 'none' : (isOwnCar ? 'own' : 'rental'),
      rentPerDay: (!isTransportNeeded || isOwnCar) ? 0 : vehicle.rentPerDay,
      fuelEstimate: (!isTransportNeeded || isOwnCar) ? 0 : fuelEstimate,
      driverIncluded: false,
      driverChargesPerDay: 0,
      tollParkingEstimate: (!isTransportNeeded || isOwnCar) ? 0 : tollParkingEstimate,
      totalTransportCost: transport,
    },

    // Food policy details
    foodPlan: {
      breakfast: foodBreakdown.breakfast.selected ? foodBreakdown.breakfast.menu : 'Self-arranged / Not included',
      lunch: foodBreakdown.lunch.selected ? foodBreakdown.lunch.menu : 'Self-paid (Highway dhaba / scenic lunch stop)',
      dinner: foodBreakdown.dinner.selected ? foodBreakdown.dinner.menu : 'Self-paid / Not included',
      breakfastTotal: foodBreakdown.breakfast.total,
      lunchTotal: foodBreakdown.lunch.total,
      dinnerTotal: foodBreakdown.dinner.total,
      breakdown: foodBreakdown,
      totalCost: food,
      foodChoice: isFoodNeeded ? 'included' : 'self',
    },

    // Activity inclusions
    activitiesPolicy: {
      includedSpotsTotal: activities,
      optionalActivitiesTotal: activeActivitiesList.length,
      policy: isCompany
        ? 'All standard sightseeing spots, viewpoints & connectivity included in Company Tour package.'
        : 'Only selected optional activities are charged to your budget; unselected items cost PKR 0.',
      activeList: activeActivitiesList,
    },

    // Tour Package Inclusions / Exclusions
    packageDetails: {
      tripMode: isCompany ? 'company' : 'customized',
      totalPackageCost,
      pricePerPerson,
      companyProfit,
      numberOfPersons: normalizedPersons,
      roomsQuantity: rooms,
      days: normalizedDays,
      nights,
      roomType: !isHotelNeeded
        ? 'No Hotel Required (Own Lodging)'
        : (hotel?.comfortLevel === 'Luxury' ? 'VIP Luxury Suite' : hotel?.comfortLevel === 'Basic' ? 'Budget Friendly Room' : 'Deluxe Family Room'),
      hotelName: !isHotelNeeded ? 'Self-Arranged Lodging' : (hotel?.name || 'Verified Hotel'),
      hotelLocation: hotel?.city || 'Destination Center',
      vehicleName: !isTransportNeeded ? 'No Transport (PKR 0)' : (isOwnCar ? 'Own Vehicle (PKR 0 rent)' : vehicle.name),
      driverStatus: !isTransportNeeded ? 'N/A' : 'Self-Drive (Without Driver Fee)',
      fuelStatus: !isTransportNeeded ? 'N/A' : (isOwnCar ? 'Self-Fueling (PKR 0 from budget)' : 'Fuel & Highway Motorway Tolls Included'),
      foodSummary: isLowBudget
        ? 'Customer Handles Food on Their Own (Self-Arranged to manage hotel stay & transport within budget)'
        : (!isFoodNeeded
          ? 'Self-Arranged Food & Dining (PKR 0 from budget)'
          : (isCompany
            ? 'Daily Breakfast Buffet + Fixed Menu Dinner Included (Lunch Self-Paid)'
            : `Custom Meal Plan (PKR ${food.toLocaleString()})`)),
      connectivity: isCompany
        ? 'Telenor 300 Tourist SIM Pack (30GB 4G Data + 100 All-Net Minutes)'
        : 'Standard Tourist Connectivity Available',
      inclusions: isCompany
        ? [
            `Dedicated Vehicle (${vehicle.name}, ${vehicle.luggage}) with fuel & motorway tolls`,
            `${nights} Nights accommodation (${rooms} Room${rooms > 1 ? 's' : ''}) at ${hotel?.name || 'Verified Hotel'}`,
            isLowBudget ? 'Food: Self-Arranged by Customer on their own' : 'Daily complimentary hotel breakfast buffet',
            isLowBudget ? 'Tour Manager Emergency Support' : 'Daily dinner (fixed Pakistani gourmet menu included)',
            'All scenic viewpoint stops & entry coordination',
            'Telenor 300 Tourist SIM Pack (30GB 4G Data)',
            '24/7 Tour manager assistance & emergency helpline support',
          ]
        : [
            isTransportNeeded
              ? (isOwnCar ? 'Using Own Personal Car (Vehicle rent: PKR 0)' : `Rental Vehicle (${vehicle.name}, ${vehicle.luggage}) with fuel & tolls`)
              : 'No transport service required (PKR 0 cut)',
            'Self-drive / personal driver (No driver fee deducted)',
            isHotelNeeded ? `${nights} Nights stay (${rooms} Room${rooms > 1 ? 's' : ''}) at ${hotel?.name || 'Hotel'}` : 'No hotel accommodation required (PKR 0 cut)',
            isFoodNeeded ? 'Selected Pakistani meal plan included' : 'Self-arranged meals & dining (handled by customer on their own)',
            activities > 0 ? `${activeActivitiesList.length} customized paid activities selected` : 'Self-guided free sights (PKR 0 activities cut)',
          ],
      exclusions: isCompany
        ? [
            'Midday lunch (self-paid at scenic local food stops)',
            'Personal shopping, souvenirs, and high-altitude extreme adventure passes',
          ]
        : [
            'Any unselected services or unbooked meals',
            'Personal expenses and shopping',
          ],
    },
  };
}

module.exports = {
  calculateBudget,
  calculateBudgetAllocation,
  selectVehicleForGroup,
  VEHICLES,
};
