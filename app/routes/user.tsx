import { useSearchParams } from "react-router";

export default function User() {
	const [searchParams] = useSearchParams();
	const id = searchParams.get("id");

	return (
		<div>
			<p>User ID: {id}</p>
		</div>
	);
}
