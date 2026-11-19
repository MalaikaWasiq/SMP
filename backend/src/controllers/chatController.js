const ChatSession = require('../models/ChatSession');
const Trip = require('../models/Trip');
const httpError = require('../utils/httpError');
const { answerTravelQuestion } = require('../services/chatService');
const { buildAppContext } = require('../services/appContextService');

const DEFAULT_STARTER_PROMPTS = [
  'Explore Pakistan',
  'Find peaceful destinations',
  'Travel safety tips',
  'Best time to visit Northern Areas',
  'Family travel suggestions',
  'Learn about Pakistani culture',
];

async function handleDirectChat(req, res, next) {
  try {
    const message = String(req.body.message || '').trim();
    if (!message || message.length > 1000) {
      throw httpError(400, 'Message must be between 1 and 1000 characters');
    }

    const conversation = Array.isArray(req.body.conversation)
      ? req.body.conversation.map((c) => ({ role: c.role, content: c.content }))
      : [];

    let activeTrip = null;
    let context = {};

    if (req.user) {
      const built = await buildAppContext({
        user: req.user,
        activeTripId: req.body.context?.tripId,
      });
      activeTrip = built.activeTrip;
      context = built.context;
    } else {
      context = {
        screen: req.body.context?.screen || null,
        destinationId: req.body.context?.destinationId || null,
        category: req.body.context?.category || null,
      };
    }

    const reply = await answerTravelQuestion({
      message,
      trip: activeTrip,
      appContext: context,
      history: conversation,
    });

    res.json({
      reply: reply.content,
      model: reply.model,
      fallbackUsed: reply.fallbackUsed,
      recommendedDestinations: reply.recommendedDestinations || [],
      suggestedActions: DEFAULT_STARTER_PROMPTS,
    });
  } catch (error) {
    next(error);
  }
}

async function createSession(req, res, next) {
  try {
    let trip = null;
    if (req.body.tripId) {
      trip = await Trip.findOne({ _id: req.body.tripId, userId: req.user._id });
      if (!trip) throw httpError(404, 'Trip not found');
    }
    const session = await ChatSession.create({
      userId: req.user._id,
      tripId: trip?._id,
      title: String(req.body.title || (trip ? `${trip.destination} assistant` : 'SafarSaathi AI')).slice(0, 100),
    });
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
}

async function listSessions(req, res, next) {
  try {
    res.json({ sessions: await ChatSession.find({ userId: req.user._id }).sort({ updatedAt: -1 }).limit(30) });
  } catch (error) {
    next(error);
  }
}

async function getSession(req, res, next) {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) throw httpError(404, 'Chat session not found');
    res.json({ session });
  } catch (error) {
    next(error);
  }
}

async function postMessage(req, res, next) {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id });
    if (!session) throw httpError(404, 'Chat session not found');
    const message = String(req.body.message || '').trim();
    if (!message || message.length > 1000) {
      throw httpError(400, 'Message must be between 1 and 1000 characters');
    }
    const { activeTrip, context } = await buildAppContext({
      user: req.user,
      activeTripId: session.tripId,
      currentSessionId: session._id,
    });
    const history = session.messages.map((item) => ({ role: item.role, content: item.content }));
    session.messages.push({ role: 'user', content: message });

    const reply = await answerTravelQuestion({ message, trip: activeTrip, appContext: context, history });
    const suggestedActions = activeTrip
      ? ['Show my current budget', 'Summarize my trip history', 'What should I pack?', 'Show active alerts']
      : DEFAULT_STARTER_PROMPTS;

    session.messages.push({
      role: 'assistant',
      ...reply,
      suggestedActions,
      recommendedDestinations: reply.recommendedDestinations || [],
    });
    await session.save();
    res.json({ session, message: session.messages.at(-1) });
  } catch (error) {
    next(error);
  }
}

async function deleteSession(req, res, next) {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) throw httpError(404, 'Chat session not found');
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  handleDirectChat,
  createSession,
  listSessions,
  getSession,
  postMessage,
  deleteSession,
};
