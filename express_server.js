const express = require("express");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helper_functions");
const { urlDatabase, users } = require("./data");
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["appleshelptrollsquickly"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userId: req.session.user_id
  };
  // only logged in users can see the index of URLs
  if (!templateVars.userId) {
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "Only logged in users can see URLs. Please log in."
    });
  }
  // only show URLs that match the user id
  templateVars.urls = urlsForUser(templateVars.userId, urlDatabase);
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.session.user_id
  };
  // if user is not logged in, redirect to /login
  if (!templateVars.userId) {
    return res.redirect("/login");
  }
  return res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    users: users,
    userId: req.session.user_id
  };
  // if id does not exist in urlDatabase, render error page
  if (urlDatabase[req.params.id]) {
    templateVars.longURL = urlDatabase[templateVars.id].longURL;
  } else {
    res.status(404);
    return res.render("error", {
      ...templateVars,
      errorCode: 404,
      errorMsg: "That URL cannot be found."
    });
  }
  // if URL id does not exist, render error page
  if (!req.session.user_id) {
    res.status(403);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "You must be logged in to view URLs."
    });
  }
  // if url does not belong to user, return error page
  if (templateVars.userId !== urlDatabase[templateVars.id].userID) {
    res.status(403);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "You do not have permission to access that URL."
    });
  }
  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    users: users,
    userId: req.session.user_id
  };
  // if URL id does not exist, render error page
  if (!urlDatabase[templateVars.id]) {
    res.status(400);
    return res.render("error", {
      ...templateVars,
      errorCode: 400,
      errorMsg: `URL ID "${templateVars.id}" does not exist.`
    });
  }
  return res.redirect(`${urlDatabase[req.params.id]}`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.session.user_id
  };
  // if user is logged in, redirect to /urls
  if (templateVars.userId) {
    return res.redirect("/urls");
  }
  return res.render("user_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.session.user_id
  };
  // if user is logged in, redirect to /urls
  if (templateVars.userId) {
    return res.redirect("/urls");
  }
  return res.render("user_login", templateVars);
});

app.post("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    userId: req.session.user_id
  };
  // if user not logged in, render error page
  if (!templateVars.userId) {
    res.status(403);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "Only registered users can shorten URLs. Please register."
    });
  }
  const newId = generateRandomString();
  urlDatabase[newId] = {
    longURL: req.body.longURL,
    userID: templateVars.userId
  };
  return res.redirect(`/urls/${newId}`);
});

app.post("/urls/:id", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.session.user_id
  };
  // if user id in urlDatabase does not match cookie id, render error page
  if (!urlDatabase[req.params.id]) {
    res.status(403);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "You do not have permission to do that."
    });
  }
  const idToUpdate = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[idToUpdate].longURL = newURL;
  return res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.session.user_id
  };
  // if user id in urlDatabase does not match cookie id, render error page
  if (!urlDatabase[req.params.id]) {
    res.status(403);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "You do not have permission to do that."
    });
  }
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.session.user_id
  };
  // get input from login form
  const userInput = req.body;
  // look up user function
  const userExists = getUserByEmail(userInput.email, users);
  // go through login checks
  if (userExists) {
    // if email found, compare password, if no match, return 403
    if (!bcrypt.compareSync(userInput.password, userExists.password)) {
      res.status(403);
      return res.render("error", {
        ...templateVars,
        errorCode: 403,
        errorMsg: "Wrong password. Please try again."
      });
    }
    // if all login checks pass, set user_id and redirect to /urls
    req.session.user_id = userExists.id;
    return res.redirect("/urls");
  } else {
    // if email cannot be found, return 403
    res.status(403);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "Email not found. Please try again."
    });
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/login");
});

app.post("/register", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.session.user_id
  };
  // get input from registration form
  const userInput = req.body;
  // generate new id
  const newId = generateRandomString();
  // hash the password
  const hashedPassword = bcrypt.hashSync(userInput.password, 10);

  // return 400 error if email or password inputs are empty
  if (userInput.email === "" || userInput.password === "") {
    res.status(400);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "Empty email or password. Please try again."
    });
  }

  // if user does not exist in users object, add it
  if (getUserByEmail(userInput.email, users) === null) {
    users[newId] = {
      id: newId,
      email: userInput.email,
      password: hashedPassword
    };
    // create new cookie
    req.session.user_id = newId;
  } else {
    // otherwise, return 400 error
    res.status(400);
    return res.render("error", {
      ...templateVars,
      errorCode: 403,
      errorMsg: "User already exists. Please log in."
    });
  }

  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});