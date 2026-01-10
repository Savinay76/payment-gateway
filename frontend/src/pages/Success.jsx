import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPaymentStatus } from "../api/api";

export default function Success() {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Checking payment status...");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const navigate = useNavigate();
  const pid = new URLSearchParams(window.location.search).get("pid");

  // Add global styles for animations and button hover effects
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "success-page-styles";
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .dashboard-button-hover:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5) !important;
      }
      .dashboard-button-hover:active {
        transform: translateY(0) !important;
      }
      .retry-button-hover:hover {
        transform: translateY(-2px) !important;
        background: #f0f4ff !important;
      }
      .retry-button-hover:active {
        transform: translateY(0) !important;
      }
    `;
    if (!document.getElementById("success-page-styles")) {
      document.head.appendChild(style);
    }
    return () => {
      const existingStyle = document.getElementById("success-page-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  useEffect(() => {
    if (!pid) {
      setMessage("No payment ID provided");
      return;
    }

    let interval;

    const checkPaymentStatus = async () => {
      try {
      const res = await getPaymentStatus(pid);
      setStatus(res.status);
        setPaymentDetails(res);
        
        if (res.status === "success") {
          clearInterval(interval);
          setMessage("Payment Successful! ✅");
        } else if (res.status === "failed") {
          clearInterval(interval);
          setMessage(`Payment Failed: ${res.error_description || "Payment could not be processed"} ❌`);
        } else {
          setMessage("Processing payment...");
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
        clearInterval(interval);
        setMessage("Error checking payment status");
      }
    };

    // Check immediately
    checkPaymentStatus();
    
    // Then check every 2 seconds until status is success or failed
    interval = setInterval(checkPaymentStatus, 2000);

    // Cleanup on unmount
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pid]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div style={styles.fullPage}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.iconContainer}>
            {status === "success" && (
              <div style={styles.successIcon}>✓</div>
            )}
            {status === "failed" && (
              <div style={styles.failIcon}>✗</div>
            )}
            {status === "processing" && (
              <div style={styles.processingIcon}>
                <div style={styles.spinner}></div>
              </div>
            )}
          </div>
          
          <h2 style={styles.title}>
            {status === "success" && "Payment Successful!"}
            {status === "failed" && "Payment Failed"}
            {status === "processing" && "Processing Payment"}
          </h2>
          
          <div style={styles.statusBox}>
            <p style={styles.status}>{status.toUpperCase()}</p>
            <p style={styles.message}>{message}</p>
            
            {pid && (
              <div style={styles.paymentIdContainer}>
                <span style={styles.label}>Payment ID:</span>
                <span data-test-id="payment-id" style={styles.pid}>{pid}</span>
              </div>
            )}

            {paymentDetails && status === "success" && (
              <div style={styles.details}>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Amount:</span>
                  <span style={styles.value}>₹{(paymentDetails.amount / 100).toFixed(2)}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.label}>Method:</span>
                  <span style={styles.value}>{paymentDetails.method.toUpperCase()}</span>
                </div>
                {paymentDetails.vpa && (
                  <div style={styles.detailRow}>
                    <span style={styles.label}>VPA:</span>
                    <span style={styles.value}>{paymentDetails.vpa}</span>
                  </div>
                )}
                {paymentDetails.card_last4 && (
                  <div style={styles.detailRow}>
                    <span style={styles.label}>Card:</span>
                    <span style={styles.value}>**** {paymentDetails.card_last4} ({paymentDetails.card_network})</span>
                  </div>
                )}
              </div>
            )}

            <span data-test-id="success-message" style={styles.successMessage}>
              {status === "success" 
                ? "Your payment has been processed successfully" 
                : status === "failed"
                ? "Please try again or contact support"
                : "Please wait while we process your payment"}
            </span>

            <div style={styles.buttonContainer}>
              <button
                onClick={handleGoToDashboard}
                style={styles.dashboardButton}
                className="dashboard-button-hover"
              >
                Go to Dashboard
              </button>
              {status === "failed" && (
                <button
                  onClick={() => navigate("/checkout")}
                  style={styles.retryButton}
                  className="retry-button-hover"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  fullPage: {
    width: "100vw",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    overflow: "auto",
  },
  container: {
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
  },
  card: {
    background: "#fff",
    padding: "3rem",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    maxWidth: "600px",
    width: "100%",
    textAlign: "center",
  },
  iconContainer: {
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "80px",
  },
  successIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#10b981",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "3rem",
    fontWeight: "bold",
    margin: "0 auto",
  },
  failIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "3rem",
    fontWeight: "bold",
    margin: "0 auto",
  },
  processingIcon: {
    width: "80px",
    height: "80px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    border: "6px solid #f3f3f3",
    borderTop: "6px solid #667eea",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    animation: "spin 1s linear infinite",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#1f2937",
    margin: "0 0 1rem 0",
  },
  statusBox: {
    marginTop: "1.5rem",
  },
  status: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#667eea",
    margin: "0 0 1rem 0",
    letterSpacing: "0.1em",
  },
  message: {
    fontSize: "1.1rem",
    color: "#4b5563",
    margin: "0 0 1.5rem 0",
    lineHeight: "1.6",
  },
  paymentIdContainer: {
    background: "#f3f4f6",
    padding: "1rem",
    borderRadius: "8px",
    margin: "1.5rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  pid: {
    fontSize: "1rem",
    color: "#1f2937",
    fontFamily: "monospace",
    fontWeight: "600",
  },
  details: {
    background: "#f9fafb",
    padding: "1.5rem",
    borderRadius: "8px",
    margin: "1.5rem 0",
    textAlign: "left",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.75rem 0",
    borderBottom: "1px solid #e5e7eb",
  },
  label: {
    fontSize: "0.9rem",
    color: "#6b7280",
    fontWeight: "500",
  },
  value: {
    fontSize: "0.9rem",
    color: "#1f2937",
    fontWeight: "600",
  },
  successMessage: {
    display: "block",
    fontSize: "1rem",
    color: "#6b7280",
    margin: "1.5rem 0",
    lineHeight: "1.6",
  },
  buttonContainer: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "2rem",
    flexWrap: "wrap",
  },
  dashboardButton: {
    padding: "12px 32px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  retryButton: {
    padding: "12px 32px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#667eea",
    background: "white",
    border: "2px solid #667eea",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "transform 0.2s, background 0.2s",
  },
};
