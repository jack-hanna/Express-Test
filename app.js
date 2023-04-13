const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const helperFunctions = require("./public/scripts/dbFunctions");

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

var items = [
  {name: "item1"},
  {name: "item2"},
  {name: "item3"},
  {name: "item4"},
  {name: "item5"}
];

var dBItems = helperFunctions.getColumn("employeelist", "ename");

app.get("/Customer", (req, res) => {
  res.render('Customer', {
    items: items,
    dbItems: dbItems
  });
});

app.get("/Menu", (req, res) => {
  res.render('Menu');
});

app.listen(port, () => {
  console.log(`Application is listening on port ${port}!`);
});