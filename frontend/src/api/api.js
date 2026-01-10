export const API_BASE = "http://localhost:8000/api/v1";

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("token");
  
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || error.description || "Request failed");
  }
  
  return response.json();
}

export async function createPayment(amount) {
  const res = await fetch(`${API_BASE}/payments/simple`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ 
      amount: parseInt(amount),
      method: "upi",
      vpa: "test@paytm" // Default test VPA
    }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.description || error.message || "Payment creation failed");
  }
  
  return res.json();
}

export async function getPaymentStatus(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return res.json();
}
