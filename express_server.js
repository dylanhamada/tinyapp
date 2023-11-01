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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    users: users,
    userId: req.cookies.user_id
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    users: users,
    userId: req.cookies.user_id
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    users: users,
    userId: req.cookies.user_id
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  res.redirect(`${urlDatabase[req.params.id]}`);
});

app.get("/register", (req, res) => {
  const templateVars = {
    users: users,
    userId: req.cookies.user_id
  };
  res.render("user_login", templateVars);
});

app.post("/urls", (req, res) => {
  const newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
});

app.post("/urls/:id", (req, res) => {
  const idToUpdate = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[idToUpdate] = newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const idToDelete = req.params.id;
  delete urlDatabase[idToDelete];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.userId);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  // placeholder object for new user
  const newUser = {
    id: "",
    email: "",
    password: ""
  };
  // get input from registration form
  const userInput = req.body;

  // set properties for new user
  newUser.id = generateRandomString();
  newUser.email = userInput.email;
  newUser.password = userInput.password;

  // create new property in users object with new registration details
  users[newUser.id] = newUser;

  console.log(users);

  // create new cookie "user_id"
  res.cookie("user_id", newUser.id);

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});