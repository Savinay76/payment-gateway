import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Failure() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Payment Failed ❌</h2>
        <p style={styles.message}>Your payment could not be processed.</p>
        <p style={styles.redirect}>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    minWidth: "400px",
    textAlign: "center",
  },
  title: {
    color: "#d32f2f",
    marginBottom: "1rem",
  },
  message: {
    color: "#666",
    margin: "1rem 0",
  },
  redirect: {
    color: "#999",
    fontSize: "0.875rem",
    marginTop: "1rem",
  },
};

