const httpError = require('../utils/httpError');
const { calculateBudget } = require('../services/budgetService');
const { getFoodMenuForDestination } = require('../services/foodMenuService');

function calculate(req, res, next) {
  try {
    const {
      budget,
      budgetPerPerson,
      numberOfPersons,
      days,
      destination,
      startLocation,
      itinerary,
      route,
      selectedHotel,
      hotelSuggestions,
      expenses,
      vehicleType,
      vehicleDailyRate,
      driverRequired,
      tripMode,
      transportChoice,
      foodChoice,
      hotelRequired,
      transportRequired,
      foodRequired,
      activitiesRequired,
      selectedActivities,
      roomsQuantity,
      selectedMeals,
      selectedFoodItems,
      userConfirmedAdjustments,
    } = req.body;

    const cleanBudget = Number(budget) || (Number(budgetPerPerson) && Number(numberOfPersons) ? Number(budgetPerPerson) * Number(numberOfPersons) : 0);
    if (!Number.isFinite(cleanBudget) || cleanBudget <= 0) {
      throw httpError(400, 'A positive trip budget in PKR is required');
    }

    const budgetBreakdown = calculateBudget({
      budget: cleanBudget,
      budgetPerPerson,
      numberOfPersons,
      days,
      destination,
      startLocation,
      itinerary,
      route,
      selectedHotel,
      hotelSuggestions,
      expenses,
      vehicleType,
      vehicleDailyRate,
      driverRequired,
      tripMode,
      transportChoice,
      foodChoice,
      hotelRequired,
      transportRequired,
      foodRequired,
      activitiesRequired,
      selectedActivities,
      roomsQuantity,
      selectedMeals,
      selectedFoodItems,
      userConfirmedAdjustments,
    });

    res.json({ budgetBreakdown });
  } catch (error) {
    next(error);
  }
}

function getDestinationFoodMenu(req, res, next) {
  try {
    const destination = req.query.destination || req.query.city || '';
    const menu = getFoodMenuForDestination(destination);
    res.json({ menu });
  } catch (error) {
    next(error);
  }
}

module.exports = { calculate, getDestinationFoodMenu };
