import { Breadcrumbs, Link, Typography } from "@mui/material";

interface BreadcrumbProps {
	currentPath: string;
	onNavigate: (path: string) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentPath, onNavigate }) => {
	const paths = currentPath
		.replace(/^\/files/, "")
		.split("/")
		.filter(Boolean);

	const handleNavigate = (index: number) => {
		const newPath = "/files/" + paths.slice(0, index + 1).join("/");
		onNavigate(newPath.replace(/\/+/g, "/"));
	};

	return (
		<Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
			<Link underline="hover" color="inherit" onClick={() => onNavigate("/files/")} sx={{ cursor: "pointer" }}>
				Home
			</Link>

			{paths.map((part, index) => {
				return index === paths.length - 1 ? (
					<Typography key={index} color="text.primary" sx={{ cursor: "default" }}>
						{part}
					</Typography>
				) : (
					<Link key={index} underline="hover" color="inherit" onClick={() => handleNavigate(index)} sx={{ cursor: "pointer" }}>
						{part}
					</Link>
				);
			})}
		</Breadcrumbs>
	);
};

export default Breadcrumb;
