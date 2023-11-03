// generate random id
const generateRandomString = () => Math.random().toString(36).substring(5);

// check if user already exists
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

// filter the database object based on id
const urlsForUser = (id, database) => {
  let userURLS = {};
  for (let url in database) {
    if (database[url].userID === id) {
      userURLS[url] = database[url];
    }
  }

  return userURLS;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  urlsForUser
};