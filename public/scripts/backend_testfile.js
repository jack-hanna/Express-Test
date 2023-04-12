const dbFunctions = require('./dbFunctions');
const functions = new dbFunctions();

//ONCE A FUNCTION HAS BEEN TESTED AND IS WORKING IT GETS COMMENTED OUT

/*
// Test the getElement function
functions.getElement('employeelist', 'id', 1, 'ename')
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  });
// Test the getColumn function
functions.getColumn('employeelist', 'ename')
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  });
// Test the getColumnLimited function
functions.getColumnLimited('saleshistory', 'orderid')
  .then(result => {
    console.log(result);
  })
  .catch(error => {
    console.error(error);
  });
// Test the addSale function and all dependent sub-functions
functions.addSale('Banana_Boat', 0, 12.34, 0001)
  .catch(error => {
    console.error(error);
  });
// Test the incrementInventory function and all dependent sub-functions
functions.incrementInventory("Matcha_Green_Tea")
  .catch(error => {
    console.error(error);
  });
// Test the addOrderSuggestion function
functions.addOrderSuggestion()
  .then(() => {
    console.log(functions.orderItems);
  })
  .catch(error => {
    console.error(error);
  });
// Test the addOrderSuggestion function for duplicate items
functions.addOrderSuggestion()
  .then(() => {
    console.log(functions.orderItems);
  })
  .catch(error => {
    console.error(error);
  });
*/

// Test the submitOrder function and dependant functions
  functions.addOrderSuggestion()
  .then(() => {
    functions.submitOrder(0001);
  })
  .catch(error => {
    console.error(error);
  });