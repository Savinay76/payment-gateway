import { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000";

export default function Checkout() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("order_id");

  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [state, setState] = useState("idle"); // idle, processing, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!orderId) {
      setErrorMessage("Order ID is required");
      setState("error");
      return;
    }

    fetch(`${API_BASE}/api/v1/orders/${orderId}/public`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMessage(data.error.description || "Order not found");
          setState("error");
        } else {
          setOrder(data);
        }
      })
      .catch(err => {
        setErrorMessage("Failed to load order");
        setState("error");
      });
  }, [orderId]);

  const showUPIForm = () => {
    setSelectedMethod("upi");
  };

  const showCardForm = () => {
    setSelectedMethod("card");
  };

  const handleUPISubmit = async (e) => {
    e.preventDefault();
    const vpa = e.target.vpa.value.trim();
    
    if (!vpa) {
      setErrorMessage("VPA is required");
      setState("error");
      return;
    }

    setState("processing");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, method: "upi", vpa })
      });

      const data = await res.json();

      if (data.error) {
        setErrorMessage(data.error.description || "Payment failed");
        setState("error");
        return;
      }

      setPaymentId(data.id);
      pollPaymentStatus(data.id);
    } catch (error) {
      setErrorMessage("Payment request failed");
      setState("error");
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    const cardNumber = e.target["card-number"].value.trim().replace(/\s+/g, "");
    const expiry = e.target.expiry.value.trim();
    const cvv = e.target.cvv.value.trim();
    const holderName = e.target["cardholder-name"].value.trim();

    if (!cardNumber || !expiry || !cvv || !holderName) {
      setErrorMessage("All card fields are required");
      setState("error");
      return;
    }

    // Parse expiry MM/YY
    const [expiryMonth, expiryYear] = expiry.split("/");
    if (!expiryMonth || !expiryYear) {
      setErrorMessage("Expiry must be in MM/YY format");
      setState("error");
      return;
    }

    setState("processing");
    setErrorMessage("");

    try {
      const res = await fetch(`${API_BASE}/api/v1/payments/public`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId,
          method: "card",
          card: {
            number: cardNumber,
            expiry_month: expiryMonth,
            expiry_year: expiryYear.length === 2 ? `20${expiryYear}` : expiryYear,
            cvv: cvv,
            holder_name: holderName
          }
        })
      });

      const data = await res.json();

      if (data.error) {
        setErrorMessage(data.error.description || "Payment failed");
        setState("error");
        return;
      }

      setPaymentId(data.id);
      pollPaymentStatus(data.id);
    } catch (error) {
      setErrorMessage("Payment request failed");
      setState("error");
    }
  };

  const pollPaymentStatus = (id) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/payments/${id}/public`);
        const data = await res.json();

        if (data.status === "success") {
          clearInterval(interval);
          // Redirect to success page with payment ID
          window.location.href = `/success?pid=${id}`;
        } else if (data.status === "failed") {
          clearInterval(interval);
          setErrorMessage(data.error_description || "Payment failed");
          setState("error");
        }
        // If still processing, continue polling
      } catch (error) {
        clearInterval(interval);
        setErrorMessage("Failed to check payment status");
        setState("error");
      }
    }, 2000);

    // Clear interval after 5 minutes to prevent infinite polling
    setTimeout(() => clearInterval(interval), 300000);
  };

  const retryPayment = () => {
    setState("idle");
    setSelectedMethod(null);
    setErrorMessage("");
    setPaymentId(null);
  };

  if (!order && state !== "error") {
    return (
      <div data-test-id="checkout-container">
        <div>Loading order...</div>
      </div>
    );
  }

  const formatAmount = (amount) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  return (
    <div data-test-id="checkout-container">
      {/* Order Summary */}
      <div data-test-id="order-summary" style={{ display: state === "success" || state === "error" ? "none" : "block" }}>
        <h2>Complete Payment</h2>
        <div>
          <span>Amount: </span>
          <span data-test-id="order-amount">{order ? formatAmount(order.amount) : ""}</span>
        </div>
        <div>
          <span>Order ID: </span>
          <span data-test-id="order-id">{order?.id}</span>
        </div>
      </div>

      {/* Payment Method Selection */}
      {state === "idle" && (
        <div data-test-id="payment-methods">
          <button
            data-test-id="method-upi"
            data-method="upi"
            onClick={showUPIForm}
            style={{ margin: "10px", padding: "10px 20px" }}
          >
            UPI
          </button>
          <button
            data-test-id="method-card"
            data-method="card"
            onClick={showCardForm}
            style={{ margin: "10px", padding: "10px 20px" }}
          >
            Card
          </button>
        </div>
      )}

      {/* UPI Payment Form */}
      {selectedMethod === "upi" && state === "idle" && (
        <form
          data-test-id="upi-form"
          onSubmit={handleUPISubmit}
          style={{ margin: "20px 0" }}
        >
          <input
            data-test-id="vpa-input"
            name="vpa"
            placeholder="username@bank"
            type="text"
            required
            style={{ padding: "10px", margin: "10px 0", width: "300px", display: "block" }}
          />
          <button
            data-test-id="pay-button"
            type="submit"
            style={{ padding: "10px 20px", margin: "10px 0" }}
          >
            Pay {order ? formatAmount(order.amount) : ""}
          </button>
        </form>
      )}

      {/* Card Payment Form */}
      {selectedMethod === "card" && state === "idle" && (
        <form
          data-test-id="card-form"
          onSubmit={handleCardSubmit}
          style={{ margin: "20px 0" }}
        >
          <input
            data-test-id="card-number-input"
            name="card-number"
            placeholder="Card Number"
            type="text"
            required
            maxLength="19"
            style={{ padding: "10px", margin: "10px 0", width: "300px", display: "block" }}
          />
          <input
            data-test-id="expiry-input"
            name="expiry"
            placeholder="MM/YY"
            type="text"
            required
            maxLength="5"
            style={{ padding: "10px", margin: "10px 0", width: "150px", display: "block" }}
          />
          <input
            data-test-id="cvv-input"
            name="cvv"
            placeholder="CVV"
            type="text"
            required
            maxLength="4"
            style={{ padding: "10px", margin: "10px 0", width: "150px", display: "block" }}
          />
          <input
            data-test-id="cardholder-name-input"
            name="cardholder-name"
            placeholder="Name on Card"
            type="text"
            required
            style={{ padding: "10px", margin: "10px 0", width: "300px", display: "block" }}
          />
          <button
            data-test-id="pay-button"
            type="submit"
            style={{ padding: "10px 20px", margin: "10px 0" }}
          >
            Pay {order ? formatAmount(order.amount) : ""}
          </button>
        </form>
      )}

      {/* Processing State */}
      {state === "processing" && (
        <div data-test-id="processing-state">
          <div className="spinner" style={{ border: "4px solid #f3f3f3", borderTop: "4px solid #3498db", borderRadius: "50%", width: "40px", height: "40px", animation: "spin 1s linear infinite", margin: "20px auto" }}></div>
          <span data-test-id="processing-message">
            Processing payment...
          </span>
        </div>
      )}


      {/* Error State */}
      {state === "error" && (
        <div data-test-id="error-state">
          <h2>Payment Failed</h2>
          <span data-test-id="error-message">
            {errorMessage || "Payment could not be processed"}
          </span>
          <button
            data-test-id="retry-button"
            onClick={retryPayment}
            style={{ padding: "10px 20px", margin: "20px 10px", cursor: "pointer" }}
          >
            Try Again
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
