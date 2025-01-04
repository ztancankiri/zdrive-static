import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingSpinnerProps {
	message?: string;
	height?: string | number;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message, height = "50vh" }) => {
	return (
		<Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height={height}>
			<CircularProgress />
			{message && (
				<Typography variant="body2" mt={2}>
					{message}
				</Typography>
			)}
		</Box>
	);
};

export default LoadingSpinner;
