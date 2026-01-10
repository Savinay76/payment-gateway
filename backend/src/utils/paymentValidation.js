// -------- VPA VALIDATION --------
exports.isValidVPA = (vpa) => {
  const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
  return regex.test(vpa);
};

// -------- LUHN ALGORITHM --------
exports.isValidCardNumber = (number) => {
  const clean = number.replace(/[\s-]/g, "");
  if (!/^\d{13,19}$/.test(clean)) return false;

  let sum = 0;
  let doubleDigit = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i]);

    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
};

// -------- CARD NETWORK --------
exports.detectNetwork = (number) => {
  const n = number.replace(/[\s-]/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(60|65|8[1-9])/.test(n)) return "rupay";
  return "unknown";
};

// -------- EXPIRY VALIDATION --------
exports.isValidExpiry = (month, year) => {
  const m = parseInt(month);
  let y = parseInt(year);

  if (m < 1 || m > 12) return false;
  if (y < 100) y += 2000;

  const now = new Date();
  const expiry = new Date(y, m);
  return expiry >= new Date(now.getFullYear(), now.getMonth());
};
