import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginWithPlex from "./components/LoginWithPlex";
import FileExplorer from "./components/FileExplorer";
import PlexCallback from "./components/PlexCallback";

interface AppProps {
	config: any;
}

const App: React.FC<AppProps> = ({ config }) => {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<LoginWithPlex config={config} />} />
				<Route path="/login/callback" element={<PlexCallback config={config} />} />
				<Route path="/files/*" element={<FileExplorer config={config} />} />

				<Route path="*" element={<Navigate to="/login" replace />} />
			</Routes>
		</Router>
	);
};

export default App;
