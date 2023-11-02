const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  u29dzi: {
    id: "u29dzi",
    email: "lionel@baking.com",
    password: "jellynicegarage",
  },
  ved0901: {
    id: "ved0901",
    email: "joanna@hilton.com",
    password: "kangarooyelpsgravely",
  },
};

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

app.get("/", (req, res) => {
  return res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  return res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    users: users,
    userId: req.cookies.user_id
  };
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    users: users,
    userId: req.cookies.user_id
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
    longURL: urlDatabase[req.params.id],
    users: users,
    userId: req.cookies.user_id
  };
  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    users: users,
    userId: req.cookies.user_id
  };
  if (!urlDatabase[templateVars.id]) {
    res.render("error", {
      ...templateVars,
      errorCode: 400,
      errorMsg: `URL ID "${templateVars.id}" does not exist.`
    })
  }
  return res.redirect(`${urlDatabase[req.params.id]}`);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    users: users,
    userId: req.cookies.user_id 
  };
  // if user is logged in, redirect to /urls
  if (templateVars.userId) {
    return res.redirect("/urls");
  }
  return res.render("user_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    users: users,
    userId: req.cookies.user_id 
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
    userId: req.cookies.user_id 
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
  urlDatabase[newId] = req.body.longURL;
  return res.redirect(`/urls/${newId}`);
});

app.post("/urls/:id", (req, res) => {
  const idToUpdate = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[idToUpdate] = newURL;
  return res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.cookies.user_id
  };
  // get input from login form
  const userInput = req.body;
  // look up user function
  const userExists = lookupUser(userInput.email);
  // go through login checks
  if (userExists) {
    // if email found, compare password, if no match, return 403
    if (userExists.password !== userInput.password) {
      res.status(403);
      return res.render("error", {
        ...templateVars, 
        errorCode: 403,
        errorMsg: "Wrong password. Please try again."
      });
    }
    // if all login checks pass, set user_id and redirect to /urls
    res.cookie("user_id", userExists.id);
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
  res.clearCookie("user_id");
  return res.redirect("/login");
});

app.post("/register", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.cookies.user_id
  };
  // get input from registration form
  const userInput = req.body;
  // generate new id
  const newId = generateRandomString();

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
  if (lookupUser(userInput.email) === null) {
    users[newId] = {
      id: newId,
      email: userInput.email,
      password: userInput.password
    };
    // create new cookie
    res.cookie("user_id", newId);
  } else {
    // otherwise, return 400 error
    res.status(400);
    return res.render("error", {
      ...templateVars, 
      errorCode: 403,
      errorMsg: "User already exists. Please log in."
    })
  }

  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});