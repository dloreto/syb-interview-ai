import { useParams } from "react-router-dom";

export default function User() {
  const { id } = useParams();

  return (
    <div>
      <p>User ID: {id}</p>
    </div>
  );
}
