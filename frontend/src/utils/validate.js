// validate.js

const mnnitEmailPattern = /^([a-z0-9-]+)\.([0-9]{8})@mnnit\.ac\.in$/i;

// Sign In validation
export const checkValidSignInFrom = (email, password) => {
  if (!mnnitEmailPattern.test(email)) {
    return "Email must be in the format name.regNo@mnnit.ac.in";
  }
  if (password.length < 4) return "Password should be at least 4 characters";
  return null;
};

// Sign Up validation
export const checkValidSignUpFrom = (firstName, lastName, email, password, regNo) => {
  const isFirstValid = /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/.test(firstName);
  const isLastValid = /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/.test(lastName);

  const match = email.match(mnnitEmailPattern);
  const isEmailValid = Boolean(match) && match[2] === regNo;

  if (!isFirstValid) return "Invalid First Name format";
  if (!isLastValid) return "Invalid Last Name format";
  if (!/^\d{8}$/.test(regNo)) return "Registration Number must be exactly 8 digits";
  if (!isEmailValid) return "Email must be in the format name.regNo@mnnit.ac.in";
  if (password.length < 4) return "Password must be at least 4 characters";

  return null;
};

// Forgot Password validation
export const checkValidForgotFrom = (email) => {
  const isEmailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
  if (!isEmailValid) return "Invalid email format";
  return null;
};
  