import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import axios from "axios";
import App from "./App.tsx";

const fetchConfig = async () => {
	try {
		const response = await axios.get("/config.json");
		return response.data;
	} catch (error: any) {
		throw new Error(`Failed to load config: ${error.message}`);
	}
};

const loadApp = async () => {
	try {
		const config = await fetchConfig();

		createRoot(document.getElementById("root")!).render(
			<StrictMode>
				<App config={config} />
			</StrictMode>
		);
	} catch (error: unknown) {
		if (error instanceof Error) {
			console.error("Error loading app configuration:", error.message);
		} else {
			console.error("Unknown error occurred while loading app configuration");
		}
	}
};

loadApp();
