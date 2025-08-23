const validator = require("validator");

const validate = (data) => {
  const mandatoryField = ["firstName", "email", "password"];

  const isAllowed = mandatoryField.every((k) => Object.keys(data).includes(k));

  if (!isAllowed) {
    throw new error("All Field required");
  }

  if (!validator.isEmail(data.email)) {
    throw new error("Invalid Email");
  }

  if (!validator.isStrongPassword(data.password)) {
    console.log(error);
    throw new Error("Weak Password");
  }
};

module.exports = validate;
