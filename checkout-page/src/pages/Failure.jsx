import { useEffect } from "react";

export default function Failure() {
  useEffect(() => {
    // Redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = "http://localhost:3002/dashboard";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div data-test-id="error-state" style={styles.container}>
      <div style={styles.card}>
        <h2>Payment Failed ❌</h2>
        <span data-test-id="error-message">
          Your payment could not be processed. Redirecting to dashboard...
        </span>
        <button
          data-test-id="retry-button"
          onClick={() => window.history.back()}
          style={styles.retryButton}
        >
          Try Again
        </button>
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
  retryButton: {
    padding: "10px 20px",
    margin: "20px 10px",
    cursor: "pointer",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
  },
};
