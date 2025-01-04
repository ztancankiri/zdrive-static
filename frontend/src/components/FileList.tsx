import { List, ListItem, ListItemIcon, Typography, Box, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

export interface File {
	name: string;
	isDirectory: boolean;
	size: number | null;
	mimeType: string | null;
}

interface FileListProps {
	files: File[];
	onNavigate: (path: string) => void;
	currentPath: string;
	config: any;
}

const formatFileSize = (size: number | null): string => {
	if (size === null) return "";
	const i = Math.floor(Math.log(size) / Math.log(1024));
	return (size / Math.pow(1024, i)).toFixed(2) + " " + ["B", "KB", "MB", "GB"][i];
};

const FileList: React.FC<FileListProps> = ({ files, onNavigate, currentPath, config }) => {
	const navigate = useNavigate();
	const isPortrait = useMediaQuery("(orientation: portrait)");

	const handleItemClick = (file: File) => {
		if (file.isDirectory) {
			onNavigate(file.name);
		} else {
			const jwt = localStorage.getItem("jwt");

			if (!jwt) {
				navigate("/login");
				return;
			}

			const fileUrl = `${config.endpoints.nginx}${currentPath === "/" ? "" : currentPath}/${file.name}?token=${jwt}`;
			window.open(fileUrl, "_blank");
		}
	};

	return (
		<List>
			{files.map((file) => (
				<ListItem
					key={file.name}
					disablePadding
					onClick={() => handleItemClick(file)}
					sx={{
						cursor: "pointer",
						display: "flex",
						py: 1,
						flexDirection: isPortrait ? "column" : "row",
						alignItems: isPortrait ? "flex-start" : "center",
					}}
				>
					<Box
						sx={{
							flex: isPortrait ? undefined : 3,
							display: "flex",
							alignItems: "center",
							fontSize: "1rem",
						}}
					>
						<ListItemIcon sx={{ minWidth: "40px" }}>{file.isDirectory ? <FolderIcon /> : <InsertDriveFileIcon />}</ListItemIcon>
						<Typography variant="body1">{file.name}</Typography>
					</Box>

					{!isPortrait && (
						<>
							<Box sx={{ flex: 1, textAlign: "center", fontSize: "0.875rem" }}>
								<Typography variant="body2">{file.isDirectory ? "--" : formatFileSize(file.size)}</Typography>
							</Box>

							<Box sx={{ flex: 2, textAlign: "center", fontSize: "0.875rem" }}>
								<Typography variant="body2" color="text.secondary">
									{file.isDirectory ? "--" : file.mimeType || "Unknown"}
								</Typography>
							</Box>
						</>
					)}

					{isPortrait && !file.isDirectory && (
						<Typography variant="body2" color="text.secondary" mt={1}>
							{formatFileSize(file.size)} - {file.mimeType || "Unknown"}
						</Typography>
					)}
				</ListItem>
			))}
		</List>
	);
};

export default FileList;
