import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../api/api";

export default function Success() {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Checking payment status...");
  const navigate = useNavigate();
  const pid = new URLSearchParams(window.location.search).get("pid");

  useEffect(() => {
    if (!pid) {
      setMessage("No payment ID provided");
      setTimeout(() => navigate("/dashboard"), 3000);
      return;
    }

    let redirectTimeout;
    let interval;

    const checkPaymentStatus = async () => {
      try {
        const res = await getPaymentStatus(pid);
        setStatus(res.status);
        
        if (res.status === "success") {
          clearInterval(interval);
          setMessage("Payment Successful! ✅ Redirecting to dashboard...");
          // Show success message for 3 seconds, then redirect
          redirectTimeout = setTimeout(() => {
            navigate("/dashboard");
          }, 3000);
        } else if (res.status === "failed") {
          clearInterval(interval);
          setMessage(`Payment Failed: ${res.error_description || "Payment could not be processed"} ❌ Redirecting to dashboard...`);
          // Show failure message for 4 seconds, then redirect
          redirectTimeout = setTimeout(() => {
            navigate("/dashboard");
          }, 4000);
        }
        // If still processing, continue checking
      } catch (error) {
        console.error("Error checking payment status:", error);
        clearInterval(interval);
        setMessage("Error checking payment status. Redirecting to dashboard...");
        redirectTimeout = setTimeout(() => {
          navigate("/dashboard");
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
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Payment Status</h2>
        <div style={styles.statusBox}>
          <p style={styles.status}>{status.toUpperCase()}</p>
          <p style={styles.message}>{message}</p>
          <p style={styles.pid}>Payment ID: {pid}</p>
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
