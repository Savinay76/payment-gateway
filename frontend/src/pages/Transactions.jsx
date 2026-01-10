import { useEffect, useState } from "react";
import { apiRequest } from "../api/api";

export default function Transactions() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    apiRequest("/payments")
      .then((res) => setPayments(res))
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Transactions</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.amount}</td>
              <td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
