const cookieParser = require("cookie-parser");
const { urlDatabase, users } = require("./data");

// generate random id
const generateRandomString = () => Math.random().toString(36).substring(5);

// check if user already exists
const lookupUser = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
};

// filter the urlDatabase object based on id
const urlsForUser = (id) => {
  let userURLS = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLS[url] = urlDatabase[url];
    }
  }

  return userURLS;
};

module.exports = {
  generateRandomString,
  lookupUser,
  urlsForUser
};