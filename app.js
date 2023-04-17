const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const dbFunctions = require("./public/scripts/dbFunctions");
const helper = new dbFunctions();

var catItems_1 = [];
var catItems_2 = [];
var catItems_3 = [];
var catItems_4 = [];
var catItems_5 = [];
var exItems = [];

helper.getItemsFromCategory("inventory", "itemname", "Addon").then(
  function(value) {exItems = value},
  function(error) {exItems = ["Addons failed to load"]}
);
helper.getItemsFromCategory("inventory", "itemname", "Enhancer").then(
  function(value) {exItems.concat(value)},
  function(error) {exItems.concat(["Enhancers failed to load"])}
);

helper.getItemsFromCategory("menuitem", "item", "Feel_Energized_Blend").then(
  function(value) {
    value.forEach(function(item){
      /*var itemPrice = ["N/A"];
      helper.getElement("menuitem", "item", item, "sprice").then(function(price) {itemPrice.concat(price)});
      helper.getElement("menuitem", "item", item, "mprice").then(function(price) {itemPrice.concat(price)});
      helper.getElement("menuitem", "item", item, "lprice").then(function(price) {itemPrice.concat(price)});*/
      helper.getElement("menuitem", "item", item, "ingredients").then(
        function(value) {
          catItems_1 = catItems_1.concat({name: item, ingredients: value/*, prices: itemPrice*/})
        },
        function(error) {catItems_1 = catItems_1.concat({name: item, ingredients: ["Ingredients not found"]})}
      );
    });
  },
  function(error) {catItems_1 = catItems_1.concat({name: "Error", ingredients: ["Menu Item not found"]})}
);
  
helper.getItemsFromCategory("menuitem", "item", "Get_Fit_Blend").then(
  function(value) {
    value.forEach(function(item){
      helper.getElement("menuitem", "item", item, "ingredients").then(
        function(value) {catItems_2 = catItems_2.concat({name: item, ingredients: value})},
        function(error) {catItems_2 = catItems_2.concat({name: item, ingredients: ["Ingredients not found"]})}
      );
    });
  },
  function(error) {catItems_2 = catItems_2.concat({name: "Error", ingredients: ["Menu Item not found"]})}
);
  
helper.getItemsFromCategory("menuitem", "item", "Manage_Weight_Blends").then(
  function(value) {
    value.forEach(function(item){
      helper.getElement("menuitem", "item", item, "ingredients").then(
        function(value) {catItems_3 = catItems_3.concat({name: item, ingredients: value})},
        function(error) {catItems_3 = catItems_3.concat({name: item, ingredients: ["Ingredients not found"]})}
      );
    });
  },
  function(error) {catItems_3 = catItems_3.concat({name: "Error", ingredients: ["Menu Item not found"]})}
);
  
helper.getItemsFromCategory("menuitem", "item", "Be_Well_Blends").then(
  function(value) {
    value.forEach(function(item){
      helper.getElement("menuitem", "item", item, "ingredients").then(
        function(value) {catItems_4 = catItems_4.concat({name: item, ingredients: value})},
        function(error) {catItems_4 = catItems_4.concat({name: item, ingredients: ["Ingredients not found"]})}
      );
    });
  },
  function(error) {catItems_4 = catItems_4.concat({name: "Error", ingredients: ["Menu Item not found"]})}
);
  
helper.getItemsFromCategory("menuitem", "item", "Enjoy_A_Treat_Blends").then(
  function(value) {
    value.forEach(function(item){
      helper.getElement("menuitem", "item", item, "ingredients").then(
        function(value) {catItems_5 = catItems_5.concat({name: item, ingredients: value})},
        function(error) {catItems_5 = catItems_5.concat({name: item, ingredients: ["Ingredients not found"]})}
      );
    });
  },
  function(error) {catItems_5 = catItems_5.concat({name: "Error", ingredients: ["Menu Item not found"]})}
);

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render('Home');
});

app.get("/Server", (req, res) => {
  res.render('Server', {
    catItems_1: catItems_1,
    catItems_2: catItems_2,
    catItems_3: catItems_3,
    catItems_4: catItems_4,
    catItems_5: catItems_5,
    exItems: exItems
  });
});

app.get("/Manager", (req, res) => {
  res.render('Manager');
});

app.get("/Customer", (req, res) => {
  res.render('Customer', {
    catItems_1: catItems_1,
    catItems_2: catItems_2,
    catItems_3: catItems_3,
    catItems_4: catItems_4,
    catItems_5: catItems_5,
    exItems: exItems
  });
});

app.get("/Menu", (req, res) => {
  res.render('Menu', {
    catItems_1: catItems_1,
    catItems_2: catItems_2,
    catItems_3: catItems_3,
    catItems_4: catItems_4,
    catItems_5: catItems_5,
    exItems: exItems
  });
});

app.listen(port, () => {
  console.log(`Application is listening on port ${port}!`);
});