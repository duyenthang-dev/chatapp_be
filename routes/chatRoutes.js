const express = require('express');
const router = express.Router();
const {createChat, getChat, uploadFile} = require('./../controllers/chatController')
const auth = require('./../middlewares/auth');

router.route('/').post(auth.protectedAPI, createChat)
router.route('/:id').get(auth.protectedAPI, getChat)
router.route('/upload-file').post(auth.protectedAPI, uploadFile)

module.exports = router;