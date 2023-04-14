const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const dbFunctions = require("./public/scripts/dbFunctions");
const helper = new dbFunctions();

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

var catItems_1 = [];
/*var catItems_2 = ["Items not Retrieved",];
var catItems_3 = ["Items not Retrieved",];
var catItems_4 = ["Items not Retrieved",];
var catItems_5 = ["Items not Retrieved",];
var catItems_6 = ["Items not Retrieved",];*/

helper.getItemsFromCategory("menuitem", "item", "Feel_Energized_Blend").then(
  function(value) {
    value.forEach(function(item){
      helper.getElement("menuitem", "item", item, "ingredients").then(
        function(value) {catItems_1 += [{name: item, ingredients: value}]},
        function(error) {catItems_1 += [{name: item, ingredients: ["Ingredients not found"]}]}
      );
    });
  },
  function(error) {catItems_1 += [{name: "Error", ingredients: ["Menu Item not found"]}]}
);

/*helper.getItemsFromCategory("menuitem", "item", "Get_Fit_Blend").then(
  function(value) {catItems_2 = value},
  function(error) {catItems_2 = ["An error has occured"]}
);
helper.getItemsFromCategory("menuitem", "item", "Manage_Weight_Blends").then(
  function(value) {catItems_3 = value},
  function(error) {catItems_3 = ["An error has occured"]}
);
helper.getItemsFromCategory("menuitem", "item", "Be_Well_Blends").then(
  function(value) {catItems_4 = value},
  function(error) {catItems_4 = ["An error has occured"]}
);
helper.getItemsFromCategory("menuitem", "item", "Enjoy_A_Treat_Blends").then(
  function(value) {catItems_5 = value},
  function(error) {catItems_5 = ["An error has occured"]}
);

var menuItems = [];
helper.getColumn("menuitem", "item").then(
  function(value) {menuItems = value},
  //function(error) {catItems_5 = ["An error has occured"]}
);

var menu = [];
menuItems.forEach(function(item){
  helper.getElement("menuitem", "ingredients").then(
    function(value) {menu += [{name: item, ingredients: value}]},
    function(error) {menu += [{name: "Error", ingredients: ["Ingredients not found"]}]}
  );
});*/

app.get("/Customer", (req, res) => {
  res.render('Customer', {
    catItems_1: catItems_1
    /*catItems_2: catItems_2,
    catItems_3: catItems_3,
    catItems_4: catItems_4,
    catItems_5: catItems_5,
    catItems_6: catItems_6*/
  });
});

app.get("/Menu", (req, res) => {
  res.render('Menu');
});

app.listen(port, () => {
  console.log(`Application is listening on port ${port}!`);
});