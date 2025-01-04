import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./LoadingSpinner";
import axios from "axios";

interface PlexCallbackProps {
	config: any;
}

const PlexCallback: React.FC<PlexCallbackProps> = ({ config }) => {
	const navigate = useNavigate();

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		setLoading(true);
		axios
			.get(config.endpoints.pin.auth, {
				params: {
					pinId: localStorage.getItem("pinId"),
					pinCode: localStorage.getItem("pinCode"),
				},
			})
			.then((response) => {
				if (response.status === 200) {
					localStorage.clear();
					localStorage.setItem("jwt", response.data.token);
					setLoading(false);
					navigate("/files/");
				} else {
					console.error("Unexpected response:", response);
					alert("Failed to redirect. Please try again.");
				}
			})
			.catch((error) => {
				console.error("Error during login request:", error);
				alert("An error occurred. Please try again later.");
			});
	}, []);

	return loading && <LoadingSpinner message="Loading..." />;
};

export default PlexCallback;
