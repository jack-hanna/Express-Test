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
var catItems_2 = [];
var catItems_3 = [];
var catItems_4 = [];
var catItems_5 = [];
var catItems_6 = [];

app.get("/Customer", (req, res) => {
  loadCustomerMenu().then(
    res.render('Customer', {
      catItems_1: catItems_1,
      catItems_2: catItems_2,
      catItems_3: catItems_3,
      catItems_4: catItems_4,
      catItems_5: catItems_5,
      catItems_6: catItems_6
    })
  );
});

app.get("/Menu", (req, res) => {
  res.render('Menu');
});

app.listen(port, () => {
  console.log(`Application is listening on port ${port}!`);
});

async function loadCustomerMenu(){
  helper.getItemsFromCategory("menuitem", "item", "Feel_Energized_Blend").then(
    function(value) {
      value.forEach(function(item){
        helper.getElement("menuitem", "item", item, "ingredients").then(
          function(value) {catItems_1 = catItems_1.concat([{name: item, ingredients: value}])},
          function(error) {catItems_1 = catItems_1.concat([{name: item, ingredients: ["Ingredients not found"]}])}
        );
      });
    },
    function(error) {catItems_1 += [{name: "Error", ingredients: ["Menu Item not found"]}]}
  );
  
  helper.getItemsFromCategory("menuitem", "item", "Get_Fit_Blend").then(
    function(value) {
      value.forEach(function(item){
        helper.getElement("menuitem", "item", item, "ingredients").then(
          function(value) {catItems_2 = catItems_2.concat([{name: item, ingredients: value}])},
          function(error) {catItems_2 = catItems_2.concat([{name: item, ingredients: ["Ingredients not found"]}])}
        );
      });
    },
    function(error) {catItems_2 += [{name: "Error", ingredients: ["Menu Item not found"]}]}
  );
  
  helper.getItemsFromCategory("menuitem", "item", "Manage_Weight_Blends").then(
    function(value) {
      value.forEach(function(item){
        helper.getElement("menuitem", "item", item, "ingredients").then(
          function(value) {catItems_3 = catItems_3.concat([{name: item, ingredients: value}])},
          function(error) {catItems_3 = catItems_3.concat([{name: item, ingredients: ["Ingredients not found"]}])}
        );
      });
    },
    function(error) {catItems_3 += [{name: "Error", ingredients: ["Menu Item not found"]}]}
  );
  
  helper.getItemsFromCategory("menuitem", "item", "Be_Well_Blends").then(
    function(value) {
      value.forEach(function(item){
        helper.getElement("menuitem", "item", item, "ingredients").then(
          function(value) {catItems_4 = catItems_4.concat([{name: item, ingredients: value}])},
          function(error) {catItems_4 = catItems_4.concat([{name: item, ingredients: ["Ingredients not found"]}])}
        );
      });
    },
    function(error) {catItems_4 += [{name: "Error", ingredients: ["Menu Item not found"]}]}
  );
  
  helper.getItemsFromCategory("menuitem", "item", "Enjoy_A_Treat_Blends").then(
    function(value) {
      value.forEach(function(item){
        helper.getElement("menuitem", "item", item, "ingredients").then(
          function(value) {catItems_5 = catItems_5.concat([{name: item, ingredients: value}])},
          function(error) {catItems_5 = catItems_5.concat([{name: item, ingredients: ["Ingredients not found"]}])}
        );
      });
    },
    function(error) {catItems_5 += [{name: "Error", ingredients: ["Menu Item not found"]}]}
  );

  return 0;
}