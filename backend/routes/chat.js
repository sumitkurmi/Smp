const express = require("express");
const router = express.Router();
const wrapAsync = require("../middlewares/wrapAsync");
const { authorization } = require("../middlewares/authorization");
const chatController = require("../controllers/chat");

router.post("/", authorization, wrapAsync(chatController.postChat));
router.get("/", authorization, wrapAsync(chatController.getChat));

router.post("/group", authorization, wrapAsync(chatController.createGroup));
router.delete(
	"/deleteGroup/:chatId",
	authorization,
	wrapAsync(chatController.deleteGroup)
);
router.post("/rename", authorization, wrapAsync(chatController.renameGroup));
router.post(
	"/groupremove",
	authorization,
	wrapAsync(chatController.removeFromGroup)
);
router.post("/groupadd", authorization, wrapAsync(chatController.addToGroup));
router.post("/add-mentor", authorization, wrapAsync(chatController.addMentor));
router.post("/meeting", authorization, wrapAsync(chatController.scheduleMeeting));
router.get("/meetings/:chatId", authorization, wrapAsync(chatController.getMeetings));
router.post("/attendance", authorization, wrapAsync(chatController.updateAttendance));

module.exports = router;
