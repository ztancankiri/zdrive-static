import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import axios from "axios";

interface LoginWithPlexProps {
	config: any;
}

const LoginWithPlex: React.FC<LoginWithPlexProps> = ({ config }) => {
	const navigate = useNavigate();

	useEffect(() => {
		const jwt = localStorage.getItem("jwt");

		if (!jwt) {
			return;
		}

		axios
			.get(config.endpoints.auth, {
				headers: {
					"x-token": jwt,
				},
			})
			.then((response) => {
				if (response.status === 200) {
					navigate("/files/");
					return;
				}
			})
			.catch((error) => {
				console.error("Error during login request:", error);
			});
	}, []);

	const handleLogin = async () => {
		try {
			const response = await axios.get(config.endpoints.pin.req);

			if (response.status === 200 && response?.data?.url) {
				localStorage.setItem("pinId", response?.data?.pinId);
				localStorage.setItem("pinCode", response?.data?.pinCode);
				window.location.href = response.data.url;
			} else {
				console.error("Unexpected response:", response);
				alert("Failed to redirect. Please try again.");
			}
		} catch (error) {
			console.error("Error during login request:", error);
			alert("An error occurred. Please try again later.");
		}
	};

	return (
		<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh">
			<Typography variant="h4" mb={4}>
				Login with Plex
			</Typography>
			<Button variant="contained" color="primary" onClick={handleLogin} sx={{ textTransform: "none" }}>
				Connect with Plex
			</Button>
		</Box>
	);
};

export default LoginWithPlex;
