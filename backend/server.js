const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const fs = require("fs");
const mime = require("mime-types");
const qs = require("querystring");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

const ROOT_DIR = process.env.ROOT_DIR;

const APP_NAME = process.env.APP_NAME;
const UNIQUE_CLIENT_ID = process.env.UNIQUE_CLIENT_ID;
const SERVER_ID = process.env.SERVER_ID;

const TOKEN_SECRET = process.env.TOKEN_SECRET;

const PLEX_PINS_ENDPOINT = process.env.PLEX_PINS_ENDPOINT;
const PLEX_USER_ENDPOINT = process.env.PLEX_USER_ENDPOINT;
const PLEX_RESOURCES_ENDPOINT = process.env.PLEX_RESOURCES_ENDPOINT;

const REDIRECT_URI = process.env.REDIRECT_URI;

const authenticateToken = async (req, res, next) => {
	const token = req.headers["x-token"];

	if (!token) {
		return res.status(401).json({ reason: "Token is invalid." });
	}

	try {
		const { authToken } = jwt.verify(token, TOKEN_SECRET);

		const isValid = await isAuthTokenValid(authToken);
		const hasAccess = isValid ? await hasAccessToServer(authToken, SERVER_ID) : false;

		if (hasAccess) {
			return next();
		}

		return res.status(401).json({ reason: "Token is invalid." });
	} catch (error) {
		return res.status(401).json({ reason: "Token is invalid." });
	}
};

async function requestPIN() {
	try {
		const response = await axios.post(
			PLEX_PINS_ENDPOINT,
			{
				strong: "true",
				"X-Plex-Product": APP_NAME,
				"X-Plex-Client-Identifier": UNIQUE_CLIENT_ID,
			},
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/x-www-form-urlencoded",
				},
			}
		);

		const pinId = response?.data?.id;
		const pinCode = response?.data?.code;

		if (!pinId || !pinCode) {
			throw new Error("Pin ID or Pin Code is missing!");
		}

		const encodedParams = qs.stringify({
			clientID: UNIQUE_CLIENT_ID,
			code: pinCode,
			"context[device][product]": APP_NAME,
			forwardUrl: REDIRECT_URI,
		});

		const url = `https://app.plex.tv/auth#?${encodedParams}`;

		return { url, pinId, pinCode };
	} catch (error) {
		console.error("Error requesting PIN:", error.message);
	}
}

async function authorizePIN(pinId, pinCode) {
	try {
		const response = await axios.get(`${PLEX_PINS_ENDPOINT}/${pinId}`, {
			headers: { Accept: "application/json" },
			params: {
				code: pinCode,
				"X-Plex-Client-Identifier": UNIQUE_CLIENT_ID,
			},
		});

		if (!response?.data?.authToken) {
			throw new Error("Authentication failed. PIN not authorized yet.");
		}

		return response?.data?.authToken;
	} catch (error) {
		console.error("Cannot authorize Pin:", error.message);
	}
}

async function isAuthTokenValid(authToken) {
	try {
		const response = await axios.get(PLEX_USER_ENDPOINT, {
			headers: {
				"X-Plex-Token": authToken ?? "",
				"X-Plex-Client-Identifier": UNIQUE_CLIENT_ID,
				Accept: "application/json",
			},
		});

		return response.status === 200;
	} catch (error) {
		console.error("Auth token validation failed:", error.message);
	}

	return false;
}

async function hasAccessToServer(authToken, serverId) {
	try {
		const resources = await axios.get(PLEX_RESOURCES_ENDPOINT, {
			headers: {
				Accept: "application/json",
				"X-Plex-Token": authToken,
				"X-Plex-Client-Identifier": UNIQUE_CLIENT_ID,
			},
		});

		return resources?.status === 200 && !!resources.data.find((resource) => resource.clientIdentifier === serverId);
	} catch (error) {
		res.status(500).json({ reason: "Cannot get resources.", error: error.message });
	}

	return false;
}

function generateAccessToken(authToken) {
	return jwt.sign(authToken, TOKEN_SECRET, { expiresIn: "1800s" });
}

app.get("/req-pin", async (req, res) => {
	const request = await requestPIN();
	return res.status(200).json(request);
});

app.get("/auth-pin", async (req, res) => {
	if (!req?.query?.pinId || !req?.query?.pinCode) {
		return res.status(400).json({ reason: "Missing parameters." });
	}

	const authToken = await authorizePIN(req?.query?.pinId, req?.query?.pinCode);

	const isValid = await isAuthTokenValid(authToken);
	const hasAccess = isValid ? await hasAccessToServer(authToken, SERVER_ID) : false;

	if (hasAccess) {
		const token = generateAccessToken({ authToken });
		return res.status(200).json({ token });
	}

	return res.status(401).json({ reason: "Pin is unauthorized." });
});

app.get("/auth", authenticateToken, async (req, res) => {
	return res.status(200).send("OK");
});

app.get("/files", authenticateToken, (req, res) => {
	const currentPath = req.query.path || "/";
	const fullPath = path.join(ROOT_DIR, currentPath);

	fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
		if (err) {
			return res.status(500).json({ error: "Error reading directory" });
		}

		const fileList = files.map((file) => {
			const filePath = path.join(fullPath, file.name);

			let size = null;
			let mimeType = null;

			if (!file.isDirectory()) {
				const stats = fs.statSync(filePath);
				size = stats.size;
				mimeType = mime.lookup(filePath) || "unknown";
			}

			return {
				name: file.name,
				isDirectory: file.isDirectory(),
				size,
				mimeType,
			};
		});

		res.json(fileList);
	});
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
