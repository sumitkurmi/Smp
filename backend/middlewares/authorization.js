const { getUserIdFromToken } = require("../config/jwtProvider");
const User = require("../models/user");
const wrapAsync = require("./wrapAsync");

const authorization = wrapAsync(async (req, res, next) => {
	const token = req.headers.authorization?.split(" ")[1];
	if (!token) {
		return res.status(401).json({ message: "Token not found" });
	}

	let userId;
	try {
		userId = getUserIdFromToken(token);
	} catch (err) {
		return res.status(401).json({ message: "Invalid token" });
	}

	if (userId) {
		req.user = await User.findById(userId).select("-password");
	}
	next();
});

module.exports = { authorization };
