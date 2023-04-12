const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render('Home');
});

app.get("/Server", (req, res) => {
  res.render('Server');
});

app.get("/Manager", (req, res) => {
  res.render('Manager');
});

app.get("/Customer", (req, res) => {
  res.render('Customer');
});

app.get("/Menu", (req, res) => {
  res.render('Menu');
});

app.listen(port, () => {
  console.log(`Application is listening on port ${port}!`);
});