import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Container, Box, Typography } from "@mui/material";
import FileList, { File } from "./FileList";
import Breadcrumb from "./Breadcrumb";
import LoadingSpinner from "./LoadingSpinner";
import axios from "axios";

interface FileExplorerProps {
	config: any;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ config }) => {
	const navigate = useNavigate();
	const location = useLocation();

	const [files, setFiles] = useState<File[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const currentPath = decodeURIComponent(location.pathname.replace(/^\/files/, "")) || "/files";

	useEffect(() => {
		fetchFiles(currentPath);
	}, [currentPath]);

	const fetchFiles = async (path: string) => {
		try {
			setLoading(true);
			const apiPath = path.startsWith("/") ? path : `/${path}`;
			const response = await axios.get<File[]>(config.endpoints.files, {
				params: {
					path: apiPath,
				},
				headers: {
					"x-token": localStorage.getItem("jwt"),
				},
			});
			setFiles(response.data);
		} catch (error) {
			navigate("/login");
		} finally {
			setLoading(false);
		}
	};

	const handleNavigate = (folder: string) => {
		const normalizedPath = currentPath.replace(/^\/files/, "").replace(/\/+$/, "");
		navigate(`/files/${normalizedPath}/${folder}`.replace(/\/+/g, "/"));
	};

	return (
		<Container>
			<Box mt={4}>
				<Typography variant="h4" gutterBottom>
					File Explorer
				</Typography>
				<Breadcrumb currentPath={currentPath} onNavigate={(path) => navigate(path)} />
				{loading ? <LoadingSpinner message="Loading files..." /> : <FileList files={files} onNavigate={handleNavigate} currentPath={currentPath} config={config} />}
			</Box>
		</Container>
	);
};

export default FileExplorer;
