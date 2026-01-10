import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [merchant, setMerchant] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiRequest("/merchant/me")
      .then(setMerchant)
      .catch(() => navigate("/"));
  }, []);
  const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/";
};


  if (!merchant) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {merchant.name}</h1>
      <p>Email: {merchant.email}</p>

      <button onClick={() => navigate("/transactions")}>
        View Transactions
      </button>

      <button onClick={() => navigate("/checkout")}>
        Create Payment
      </button>
      <button onClick={logout}>Logout</button>

    </div>
  );
}
