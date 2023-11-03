const { assert } = require('chai');

const { getUserByEmail } = require('../helper_functions');
const { users } = require("../data");

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("lionel@baking.com", users);
    assert.deepEqual({
      id: "u29dzi",
      email: "lionel@baking.com",
      password: "$2a$10$IrpFqUBcXbEaXm0.gAADEOE3noitGBh392ZVqSGB4LlrwDI.N/x5a",
    },
    user);
  });
  it('should return null with an invalid email', function() {
    const user = getUserByEmail("fred@flintstone.com", users);
    assert.equal(null, user);
  });
});