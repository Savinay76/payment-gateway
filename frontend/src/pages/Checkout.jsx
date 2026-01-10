import { useState } from "react";
import { createPayment } from "../api/api";

export default function Checkout() {
  const [amount, setAmount] = useState(100);

  const pay = async () => {
    const res = await createPayment(amount);
    if (res.id) {
      window.location.href = `/success?pid=${res.id}`;
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={pay}>Pay Now</button>
    </div>
  );
}
