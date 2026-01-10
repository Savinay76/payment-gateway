import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000";

export default function Success() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Checking payment status...");
  const pid = new URLSearchParams(window.location.search).get("pid");

  useEffect(() => {
    if (!pid) {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get("pid") || urlParams.get("payment_id");
      if (!paymentId) {
        setMessage("No payment ID provided");
        setTimeout(() => window.location.href = "http://localhost:3002/dashboard", 3000);
        return;
      }
      // Redirect with proper pid
      window.location.href = `/success?pid=${paymentId}`;
      return;
    }

    let redirectTimeout;
    let interval;

    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/payments/${pid}/public`);
        const data = await res.json();

        if (data.error) {
          setMessage("Payment not found. Redirecting to dashboard...");
          redirectTimeout = setTimeout(() => {
            window.location.href = "http://localhost:3002/dashboard";
          }, 3000);
          return;
        }

        setStatus(data.status);
        
        if (data.status === "success") {
          clearInterval(interval);
          setMessage("Payment Successful! ✅ Redirecting to dashboard...");
          redirectTimeout = setTimeout(() => {
            window.location.href = "http://localhost:3002/dashboard";
          }, 3000);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setMessage(`Payment Failed: ${data.error_description || "Payment could not be processed"} ❌ Redirecting to dashboard...`);
          redirectTimeout = setTimeout(() => {
            window.location.href = "http://localhost:3002/dashboard";
          }, 4000);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        clearInterval(interval);
        setMessage("Error checking payment status. Redirecting to dashboard...");
        redirectTimeout = setTimeout(() => {
          window.location.href = "http://localhost:3002/dashboard";
        }, 3000);
      }
    };

    // Check immediately
    checkPaymentStatus();
    
    // Then check every 2 seconds until status is success or failed
    interval = setInterval(checkPaymentStatus, 2000);

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
      if (redirectTimeout) clearTimeout(redirectTimeout);
    };
  }, [pid, navigate]);

  return (
    <div data-test-id="success-state" style={styles.container}>
      <div style={styles.card}>
        <h2>Payment Status</h2>
        <div style={styles.statusBox}>
          <p style={styles.status}>{status.toUpperCase()}</p>
          <p style={styles.message}>{message}</p>
          {pid && (
            <p style={styles.pid}>
              Payment ID: <span data-test-id="payment-id">{pid}</span>
            </p>
          )}
          <span data-test-id="success-message">
            {status === "success" 
              ? "Your payment has been processed successfully" 
              : "Checking payment status..."}
          </span>
        </div>
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
  statusBox: {
    marginTop: "1rem",
  },
  status: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
    margin: "1rem 0",
  },
  message: {
    fontSize: "1rem",
    color: "#666",
    margin: "1rem 0",
  },
  pid: {
    fontSize: "0.875rem",
    color: "#999",
    marginTop: "1rem",
    fontFamily: "monospace",
  },
};
