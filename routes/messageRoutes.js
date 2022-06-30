const express = require('express');
const router = express.Router();
const {addMessage, getMessages} = require('./../controllers/messageController')
const auth = require('./../middlewares/auth');

router.route('/').post(auth.protectedAPI, addMessage)
router.route('/:id').get(auth.protectedAPI, getMessages)

module.exports = router;