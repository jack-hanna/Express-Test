const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  const data = {name: 'Jack'};
  res.render('index', data);
});

app.get("/test", (req, res) => {
  res.send("Hello Test")
});

app.listen(port, () => {
  console.log(`Application is listening on port ${port}!`)
});