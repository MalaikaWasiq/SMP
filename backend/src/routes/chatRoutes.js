const express = require('express');
const requireAuth = require('../middleware/authMiddleware');
const {
  handleDirectChat,
  createSession,
  listSessions,
  getSession,
  postMessage,
  deleteSession,
} = require('../controllers/chatController');

const router = express.Router();

// Direct conversational query endpoint (accessible for instant AI chat & exploration)
router.post('/query', handleDirectChat);

// If POST / has message, process as direct query; otherwise create session
router.post('/', (req, res, next) => {
  if (req.body && req.body.message && !req.headers.authorization) {
    return handleDirectChat(req, res, next);
  }
  return requireAuth(req, res, () => {
    if (req.body && req.body.message && req.body.conversation) {
      return handleDirectChat(req, res, next);
    }
    return createSession(req, res, next);
  });
});

// Authenticated session-based chat routes
router.use(requireAuth);
router.get('/', listSessions);
router.get('/:id', getSession);
router.post('/:id/messages', postMessage);
router.delete('/:id', deleteSession);

module.exports = router;
