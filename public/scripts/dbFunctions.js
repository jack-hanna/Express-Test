const dbConnection = require('./dbConnection');

class dbFunctions {
    constructor() {
        this.orderItems = [];
        this.connection = new dbConnection();
        this.connection.connect();
    }

    /**
    This method retrieves a specific element from a table in the database by its row key and column name.
    @author Ethan Masters
    @param tableName a String representing the name of the table in the database
    @param keyColName a String representing the name of the key column in the table
    @param rowKey a String representing the row key value to search for
    @param colName a String representing the name of the column to retrieve the element from
    @return a String representing the retrieved element from the specified column and row
    @throw SQLException if a database access error occurs
    */
    async getElement(tableName, keyColName, rowKey, colName) {
        let element;
        try {
            const client = await this.connection.pool.connect();
            const sqlStatement = `SELECT ${colName} FROM ${tableName} WHERE ${keyColName} = '${rowKey}'`;
            const result = await client.query(sqlStatement);
            if (result.rows.length > 0) {
                client.release();
                return result.rows[0][colName];
            }
            client.release();
        } catch (err) {
            console.error('Error getElement:', err);
        }
        return element;
    }

    /** 
    Retrieves the data from a specified column of a specified table in the database.
    @author Ethan Masters 
    @param tableName the name of the table from which to retrieve the column data.
    @param colName the name of the column from which to retrieve the data.
    @return an ArrayList of String values containing the data from the specified column.
    @throws SQLException if there is an error executing the SQL statement or accessing the database.
    */
    async getColumn(tableName, colName) {
        const columnData = [];

        try {
            const client = await this.connection.pool.connect();
            const sqlStatement = `SELECT ${colName} FROM ${tableName}`;
            const result = await client.query(sqlStatement);
    
            for (const row of result.rows) {
                const element = row[colName];
                columnData.push(element);
            }
        
            client.release();
        } catch (err) {
            console.error('getColumn: Error accessing database: ', err);
        }
    
        return columnData;
    }


    /** 
    Retrieves the data from a specified column of a specified table in the database. Limits number of elements to 50. 
    ONLY used for dispaying sales history
    @author Ethan Masters 
    @param tableName the name of the table from which to retrieve the column data.
    @param colName the name of the column from which to retrieve the data.
    @return an ArrayList of String values containing the data from the specified column.
    @throws SQLException if there is an error executing the SQL statement or accessing the database.
    */
    async getColumnLimited(tableName, colName) {
        const columnData = [];

        try {
            const client = await this.connection.pool.connect();
            const sqlStatement = `SELECT ${colName} FROM ${tableName} ORDER BY orderid DESC LIMIT 50`;
            const result = await client.query(sqlStatement);
    
            for (const row of result.rows) {
                const element = row[colName];
                columnData.push(element);
            }

            client.release();
        } catch (err) {
            console.error('getColumnLimited: Error accessing database: ', err);
        }
    
        return columnData;
    }


    /**
    Checks if there is enough inventory to fulfill a sale order for a given menu item with a given size.
    @author Ethan Masters 
    @param menuItem the name of the menu item to be checked
    @param size the size of the menu item to be checked
    @return true if there is enough inventory to fulfill the sale order, false otherwise
    */
    async inStock(ingredient, sizeIndex) {
        try {
            const client = await this.connection.pool.connect();
            const client2 = await this.connection.pool.connect();
            
            // Create SQL statement for sizing
            const sizingQuery = `SELECT sizing FROM inventory WHERE itemname = '${ingredient}'`;
            const sizingResult = await client.query(sizingQuery);
        
            // Create SQL statement for total inventory size
            const totalSizeQuery = `SELECT totalsize FROM inventory WHERE itemname = '${ingredient}'`;
            const totalSizeResult = await client2.query(totalSizeQuery);
        
            let size = "";
            let totalSize = "";
            
            if (sizingResult.rows.length > 0 && totalSizeResult.rows.length > 0) {
                // Get sizing list as a string
                size = sizingResult.rows[0].sizing;
        
                // Get total size as a string
                totalSize = totalSizeResult.rows[0].totalsize;
        
                // Split sizing list string into an array
                const sizingList = size.split(", ");
        
                // Convert to numbers
                const totalSizeNumber = parseFloat(totalSize);
                const sizingNumber = parseFloat(sizingList[sizeIndex]);
        
                // Compute boolean
                if (totalSizeNumber > sizingNumber) {
                    console.log("Item in stock");
                    client.release();
                    return true;
                }
            }
            client.release();
        } catch (err) {
                console.error('inStock: Error accessing database:', err.message);
        }
        
        console.log(ingredient, "Not in Stock")
        return false;
    }


    /**
    Adds the sale information of a menu item to the sales history table in the database.
    @author Ethan Masters 
    @param menuItem the name of the menu item being sold
    @param sizePrice the price of the size of the menu item being sold
    @param ID the ID of the customer who purchased the menu item
    @throws IllegalArgumentException if the menuItem or sizePrice are invalid
    */
    async addToSaleHistory(menuItem, sizeIndex, salePrice, ID) {
        // get local date and time
        const today = new Date();
        const now = new Date();
        const nowString = now.toLocaleTimeString().substring(0, 8);
    
        const gameday = today.getDay() === 0;
    
        try {
            const client = await this.connection.pool.connect();

            const result = await client.query("SELECT COUNT(*) FROM saleshistory");
            const orderNum = result.rows[0].count;

            const sqlStatement = `INSERT INTO saleshistory(orderid, serverid, orderitem, size, date, time, ordercost, gameday) 
            VALUES (${orderNum}, ${ID}, '${menuItem}', '${sizeIndex}', '${today.toISOString().substring(0, 10)}', 
            '${nowString}', '${salePrice}', '${gameday}')`;
            
            const res = await client.query(sqlStatement);
            console.log("added order to sale history");
            client.release();
        } catch (e) {
            console.error("Error accessing database. addToSaleHistory");
            console.error(e);
        }
    }


    /**
    Checks if there are enough ingredients in stock to fulfill a sale order of the specified menu item and size.
    @author Ethan Masters 
    @param menuItem the name of the menu item
    @param sizeIndex the size of the menu item
    @return true if there are enough ingredients in stock, false otherwise
    @throws Exception if there is an error accessing the database
    */
    async checkSaleOrder(menuItem, sizeIndex) {
        try {
            const ingredients = await this.getElement("menuitem", "item", menuItem, "ingredients");
        
            if (ingredients !== null) {
                const ingredientList = ingredients.split(", ");
        
                for (const ingredient of ingredientList) {
                    if (!(await this.inStock(ingredient, sizeIndex))) {
                        console.log("Not All Ingredients in Stock")
                        return false;
                    }
                }
            }
        } catch (error) {
            console.log("Error accessing Database. checksaleorder");
            throw error;
        }
        return true;
    }


    /**
    Deducts the inventory for a specified menu item and size from the database.
    @author Ethan Masters 
    @param menuItem the name of the menu item
    @param sizeIndex the index of the size in the sizing list of the menu item
    @throws Exception if there is an error accessing the database
    */
    async deductInventory(menuItem, sizeIndex) {
        try {
            const conn = await this.connection.pool.connect();

            const ingredients = await this.getElement("menuitem", "item", menuItem, "ingredients");
        
            if (ingredients !== null) {
                const ingredientList = ingredients.split(", ");
        
                for (const ingredient of ingredientList) {
                    const sizingSqlStatement = `SELECT sizing FROM inventory WHERE itemname = '${ingredient}'`;
                    const totalSizeSqlStatement = `SELECT totalsize FROM inventory WHERE itemname = '${ingredient}'`;
                    
                    const sizingResult = await conn.query(sizingSqlStatement);
                    const totalSizeResult = await conn.query(totalSizeSqlStatement);
                
                    let size = '';
                    let totalSize = '';
                
                    if (sizingResult.rowCount && totalSizeResult.rowCount) {
                        size = sizingResult.rows[0].sizing;
                        totalSize = totalSizeResult.rows[0].totalsize;
                        
                        const sizingList = size.split(', ');
                        const totalSizeDouble = parseFloat(totalSize);
                        const sizingDouble = parseFloat(sizingList[sizeIndex]);
                        const totalSizeNew = totalSizeDouble - sizingDouble;
                    
                        const updateSqlStatement = `UPDATE inventory SET totalsize = ${totalSizeNew} WHERE itemname = '${ingredient}'`;
                        await conn.query(updateSqlStatement);
                        console.log("deducted from inventory");
                    }
                }
            }
            conn.release();
        } catch (err) {
            console.error('Error accessing Database. DeductInventory', err.stack);
        }
    }


    /**
    Deducts inventory for a given menuItem and sizeIndex, adds the sale to the sale history, and increments the order number.
    @author Ethan Masters
    @param menuItem the name of the menu item being sold
    @param size the size of the menu item being sold
    @param sizeIndex the index of the size of the menu item being sold
    @param sizePrice the price of the size of the menu item being sold
    @param ID the ID of the customer who purchased the menu item
    @throws IllegalArgumentException if the menuItem or sizeIndex are invalid
    */
    async addSale(menuItem, sizeIndex, salePrice, ID) {
        if (!menuItem) {
            console.log("No menu item provided");
            return;
        }
        
        // check if enough inventory to make drink
        if (await this.checkSaleOrder(menuItem, sizeIndex)) {
            // deduct from inventory
            await this.deductInventory(menuItem, sizeIndex);
        
            const salePriceString = salePrice.toFixed(2);
        
            // add to sale history
            await this.addToSaleHistory(menuItem, sizeIndex, salePriceString, ID);
            console.log("Sale Completed");
            return;
        }
        console.log("Sale Could Not be Completed");
    }


    /**
    This method increments the inventory of a specified item by its bulk size.
    It retrieves the bulk size and total size of the item from the inventory database,
    calculates the new total size by adding the bulk size, and updates the total size in the database.
    @author Ethan Masters 
    @param itemName a String representing the name of the item to increment inventory for
    @throws Exception if there is an error accessing the database
    */
    async incrementInventory(itemName) {
        try {
            const conn = await this.connection.pool.connect();

            const bulkSizeQuery = `SELECT bulksize FROM inventory WHERE itemname = '${itemName}'`;
            const totalSizeQuery = `SELECT totalsize FROM inventory WHERE itemname = '${itemName}'`;
            let bulkSize = 0;
            let totalSize = 0;
                    
            const bulkSizeResult = await conn.query(bulkSizeQuery);
            const totalSizeResult = await conn.query(totalSizeQuery);

            if (bulkSizeResult.rowCount && totalSizeResult.rowCount) {
                bulkSize = bulkSizeResult.rows[0].bulksize;
                totalSize = totalSizeResult.rows[0].totalsize;
            
                const totalSizeDouble = parseFloat(totalSize);
                const bulkSizeDouble = parseFloat(bulkSize);
                const totalSizeNew = totalSizeDouble + bulkSizeDouble;
            
                const updateSqlStatement = `UPDATE inventory SET totalsize = ${totalSizeNew} WHERE itemname = '${itemName}'`;
                await conn.query(updateSqlStatement);
                console.log(`Inventory for item '${itemName}' has been incremented by ${bulkSize} units`);
                conn.release();
            }
        } catch (error) {
            console.error(`Increment Inventory: Error accessing database. ${error.message}`);
        }
    }


    /**
    This method adds suggestions to the orderItems list for items that have inventory levels below 3 times their bulk size.
    It retrieves the item name, bulk size, and total size of each item from the inventory database,
    and calculates if the total size is less than 3 times the bulk size.
    If the condition is true, the item is added to the orderItems list.
    @author Ethan Masters 
    @throws Exception if there is an error accessing the database
    */
    async addOrderSuggestion() {
        try {
            const conn = await this.connection.pool.connect();
        
            // create an SQL statement
            const sqlStatement = 'SELECT itemname, bulksize, totalsize FROM inventory';
        
            // send statement to DBMS
            const result = await conn.query(sqlStatement);
        
            let ingredient = '';
            let bulkSize = '';
            let totalSize = '';
            let itemsAdded = 0;
        
            // iterate over the result set
            for (const row of result.rows) {
                // get item name, bulk size, and total size
                ingredient = row.itemname;
                bulkSize = row.bulksize;
                totalSize = row.totalsize;

                //check if ingredient is already in orderItems
                if (this.orderItems.indexOf(ingredient) !== -1) {
                    console.log("Ingredient is already in orderItems");
                    continue;
                }

                // convert to double
                const totalSizeDouble = parseFloat(totalSize);
                const bulkSizeDouble = parseFloat(bulkSize);
        
                // check if inventory is less than 3x bulk size
                if (totalSizeDouble < 3 * bulkSizeDouble) {
                    this.orderItems.push(ingredient);
                    itemsAdded++;
                }
            }
            console.log("Added suggestions to orderItems: Items Added = ", itemsAdded);
            conn.release();
        } catch (err) {
            console.error(`Error accessing Database. addOrderSuggestion: ${err}`);
        }
    }


    /**
    Adds an entry to the reorder history table with the specified manager ID, cost, and order items string.
    @param managerID the ID of the manager who placed the order
    @param cost the cost of the order
    @author Ethan Masters 
    */
    async addToOrderHistory(managerID, cost) {
        try {
            const conn = await this.connection.pool.connect();

            const ingredients = this.orderItems;

            const today = new Date().toISOString().slice(0, 10);
            const now = new Date().toLocaleTimeString('en-US', {hour12: false});

            const result = await conn.query("SELECT COUNT(*) FROM reorderhistory");
            const reorderNum = result.rows[0].count;

            const sqlStatement = `INSERT INTO reorderhistory(orderid, ingredients, ordercost, date, time, managerid)
                                                VALUES (${reorderNum}, '${ingredients}', '${cost}', '${today}', '${now}', ${managerID})`;

            await conn.query(sqlStatement);
            console.log("Added Order to Order History");
            conn.release();
        } catch (err) {
            console.error(`Error accessing Database. addToOrderHistory: ${err}`);
        }
    }


    /**
    This method submits an order by incrementing the inventory for each item in the orderItems list.
    It calls the incrementInventory method for each item in the orderItems list to increment their inventory.
    After the inventory has been incremented for all items in the order, it is expected to add the order to 
    the order history database, but this functionality is not yet implemented.
    @author Ethan Masters 
    */
    async submitOrder(managerID) {
        let totalCost = 0;
        if (this.orderItems.length === 0) {
            console.log("No ingredients provided");
            return;
        }
        for (const t of this.orderItems) {
            const ingredientCost = await this.getElement("inventory", "itemname", t, "bulkcost");
            totalCost += parseFloat(ingredientCost);
            this.incrementInventory(t);
        }
        this.addToOrderHistory(managerID, totalCost.toFixed(2));
        console.log("Order Fully Submitted");
    }


    /**
    This method checks if a specified ingredient is in the orderItems list.
    It iterates through the orderItems list and checks if each item is equal to the specified ingredient.
    If the specified ingredient is found in the orderItems list, the method returns true.
    If the specified ingredient is not found in the orderItems list, the method returns false.
    @author Ethan Masters 
    @param ingredient a String representing the name of the ingredient to check for in the orderItems list
    @return true if the ingredient is in the orderItems list, false otherwise
    */
    async isInOrderItems(ingredient) {
        return this.orderItems.includes(ingredient);
    }


    /**
    This method adds a specified ingredient to the orderItems list if it is not already in the list.
    It calls the isInOrderItems method to check if the ingredient is already in the orderItems list.
    If the ingredient is not already in the list, it is added to the list.
    @author Ethan Masters 
    @param ingredient a String representing the name of the ingredient to add to the orderItems list
    */
    async addOrderItem(ingredient) {
        if (!this.isInOrderItems(ingredient)) {
            this.orderItems.push(ingredient);
        }
    }


    /**
    This method removes a specified ingredient from the orderItems list if it is in the list.
    It calls the isInOrderItems method to check if the ingredient is in the orderItems list.
    If the ingredient is in the list, it is removed from the list.
    @author Ethan Masters 
    @param ingredient a String representing the name of the ingredient to remove from the orderItems list
    */
    async removeOrderItem(ingredient) {
        if (this.isInOrderItems(ingredient)) {
            const index = orderItems.indexOf(ingredient);
            this.orderItems.splice(index, 1);
        }
    }


    /**
    This method changes the price of a specified menu item size in the database.
    It creates an SQL statement that updates the price of a specified menu item size with a new price.
    The method takes in three parameters: the name of the menu item, the name of the size/price field to update, and the new price value.
    @author Ethan Masters 
    @param menuItem a String representing the name of the menu item to change the price of
    @param sizePrice a String representing the name of the size/price field to update in the database
    @param newPrice a String representing the new price to set for the specified menu item size
    */
    async changePriceMenu(menuItem, sizePrice, newPrice) {
        if (parseFloat(newPrice) <= 0) {
            console.log("Cannot set price to be $0 or less");
            return;
          }
          try {
            const conn = await this.connection.getConnection();
            const sqlStatement = `UPDATE menuitem SET ${sizePrice} = ${newPrice} WHERE item = '${menuItem}'`;
            await conn.query(sqlStatement);
          } catch (e) {
            console.log("Error accessing Database. changePriceMenu");
          }
    }


    /**
    This method changes the bulk price of a specified ingredient in the database.
    It creates an SQL statement that updates the bulk price of the specified ingredient with a new price.
    The method takes in two parameters: the name of the ingredient to change the price of, and the new price value.
    @author Ethan Masters 
    @param ingredient a String representing the name of the ingredient to change the bulk price of
    @param newPrice a String representing the new bulk price to set for the specified ingredient
    */
    async changePriceBulk(ingredient, newPrice) {
        if (parseFloat(newPrice) <= 0) {
            console.log("Cannot set price to be $0 or less");
            return;
          }
          try {
            const conn = await this.connection.getConnection();
            const sqlStatement = `UPDATE inventory SET bulkcost = ${newPrice} WHERE itemname = '${ingredient}'`;
            await conn.query(sqlStatement);
          } catch (e) {
            console.log("Error accessing Database. changePriceBulk");
          }
    }


    /**
    Updates the information for an inventory item, including the bulk cost, total size, bulk size, bulk units, and sizing.
    @param ingredient the name of the inventory item to be updated
    @param newAmount the new total size for the inventory item
    @param newBulkSize the new bulk size for the inventory item
    @param newBulkUnits the new units for the bulk size of the inventory item
    @param newPrice the new bulk cost for the inventory item
    @param newSizing the new sizing for the inventory item
    @author Ethan Masters 
    */
    async updateInventoryInfo(ingredient, newAmount, newBulkSize, newBulkUnits, newPrice, newSizing) {
        if (parseFloat(newPrice) <= 0) {
            console.log("Cannot set price to be $0 or less");
            return;
          }
          if (parseFloat(newAmount) < 0) {
            console.log("Cannot set amount to be less than 0");
            return;
          }
          if (parseFloat(newBulkSize) <= 0) {
            console.log("Cannot set amount to be less than or equal to 0");
            return;
          }
          try {
            const conn = await this.connection.getConnection();
            let sqlStatement = `UPDATE inventory SET bulkcost = ${newPrice} WHERE itemname = '${ingredient}'`;
            await conn.query(sqlStatement);
            sqlStatement = `UPDATE inventory SET totalsize = ${newAmount} WHERE itemname = '${ingredient}'`;
            await conn.query(sqlStatement);
            sqlStatement = `UPDATE inventory SET bulksize = ${newBulkSize} WHERE itemname = '${ingredient}'`;
            await conn.query(sqlStatement);
            sqlStatement = `UPDATE inventory SET bulkunits = '${newBulkUnits}' WHERE itemname = '${ingredient}'`;
            await conn.query(sqlStatement);
            sqlStatement = `UPDATE inventory SET sizing = '${newSizing}' WHERE itemname = '${ingredient}'`;
            await conn.query(sqlStatement);
          } catch (e) {
            console.log("Error accessing Database. updateInventoryInfo");
          }
    }


    /**
    Adds a new menu item to the database.
    Checks if the item already exists and if it does, it will print an error message and return.
    It also checks if the ingredients for the new item are available in inventory.
    If the item does not already exist and the ingredients are available, a new row is created in the menuitem table of the database.
    @param item the name of the menu item to be added
    @param sprice the price of the small size of the menu item
    @param mprice the price of the medium size of the menu item
    @param lprice the price of the large size of the menu item
    @param ingredients a string of the ingredients for the menu item separated by commas
    @param category the category of the menu item
    @author Ethan Masters 
    */
    async addMenuItem(item , sprice, mprice, lprice, ingredients, category) {}


    /**
    This function checks if the ingredients of a menu item exist in the inventory.
    If an ingredient does not exist in the inventory, it is added to the inventory.
    @param ingredients A string of comma-separated ingredients
    @author Ethan Masters 
    */
    async checkInventory(ingredients) {}


    /**
    This method adds a new ingredient to the inventory table
    @param ingredient the name of the ingredient to be added to the inventory
    @throws Exception if there is an error accessing the database
    @author Ethan Masters 
    */
    async addToInventory(ingredient) {}


    /**
    Removes an item from the inventory table in the database. Checks that the item
    is in the inventory before attempting to remove.
    @param item the name of the item to be removed from the inventory
    @throws SQLException if there is an error accessing the database
    @author Ethan Masters 
    */
    async removeInventoryItem(item) {}


    /**
    Removes an item from the menu table in the database. Checks that the item
    is in the menu before attempting to remove.
    @param item the name of the item to be removed from the inventory
    @throws SQLException if there is an error accessing the database
    @author Ethan Masters 
    */
    async removeMenuItem(item) {}


    /**
    Adds a new employee to the employeelist table with the given ID, name, and position.
    Checks to make sure the new ID isn't already taken.
    @param ID the ID of the new employee to be added.
    @param name the name of the new employee to be added.
    @param position the position of the new employee to be added.
    @throws SQLException if there is an error accessing the database.
    @author Ethan Masters 
    */
    async addEmployee(ID, name, position) {}


    /**
    Removes an employee to the employeelist table with the given ID.
    Checks to make sure the employee ID exists
    @param ID the ID of the new employee to be added.
    @throws SQLException if there is an error accessing the database.
    @author Ethan Masters 
    */
    async removeEmployee(ID) {}


    /**
    Generates a report of inventory items that are running low on stock and need to be restocked.
    Adds the name of each item that needs to be restocked to the ArrayList restockItems.
    This report is generated by querying the "inventory" table in the database and comparing the total size of each
    item to 3 times the bulk size of the item. If the total size is less than 3 times the bulk size, the item is added
    to the restockItems ArrayList.
    @throws SQLException if there is an error accessing the database
    @author Ethan Masters 
    */
    async restockReport() {}


    /**
    Retrieves a list of items belonging to a specific category from a table in the database.
    @param table the table the items are retrieved from
    @param colName the column of the items to be collected
    @param category the category of the items to be retrieved
    @return an ArrayList of Strings containing the names of the items belonging to the specified category
    @author Jack Hanna
    */
    async getItemsFromCategory(table, colName, category){
        const columnData = [];
        try {
            const conn = await this.connection.pool.connect();
            const sqlStatement = `SELECT ${colName} FROM ${table} WHERE category = '${category}'`;
            const result = await conn.query(sqlStatement);

            const columnData = result.rows.map(row => row[colName]);
            conn.release();
            return columnData;
        } catch (e) {
            console.log('Error accessing Database. getItemsFromCategory');
            throw new Error(e);
        }
    }


    /**
    Generates a sales report for a specified time frame.
    The function queries the sales history table for all order items sold between the specified times,
    and generates a count of the number of occurrences of each item. The results are printed to the console.
    If there is an error accessing the database, an error message is printed to the console.
    @param time1 a String representing the starting time of the report in the format "yyyy-MM-dd"
    @param time2 a String representing the ending time of the report in the format "yyyy-MM-dd"
    @throws SQLException if there is an error accessing the database
    @author Ethan Masters 
    */
    async salesReport(time1, time2) {}


    /**
    Calculates the total sales since the last z report and returns it as a double.
    The function accesses the database to retrieve the date and time of the last z report,
    and then calculates the total sales from the sales history table since that date and time.
    If there are no sales since the last z report, the function returns 0.
    @return a double value representing the total sales since the last z report.
    @throws RuntimeException if there is an error accessing the database.
    @author Ethan Masters 
    */
    async xReport() {}


    /**
    This method generates a new z report with the total sales since the last z report and inserts it into the zreports table in the database.
    It first calls the xReport() method to calculate the total sales since the last z report.
    It then retrieves the current local date and time and creates a new row in the zreports table with these values along with the total sales.
    If there is an error accessing the database, an error message is printed to the console.
    @return the total sales since the last z report as a double
    @author Ethan Masters 
    */
    async zReport() {}


    /**
    This method generates a report of excess inventory items based on the amount used in the
    sales history for a given date and time. It returns an ArrayList of Strings containing the names
    of the excess inventory items. The method takes in two parameters, a date and a time in the format
    of a String. It throws a ParseException if the given date or time String is in an incorrect format.
    The method first creates a HashMap to keep track of the amount used for each ingredient in
    the sales history. It then creates an SQL statement to retrieve all sales history records
    for the given date and time. It processes each record to extract the order item and size,
    and then uses this information to retrieve the ingredients and their corresponding sizing
    information from the menu item and inventory tables. It updates the amount used HashMap with
    the amount used for each ingredient in each order.
    The method then retrieves the entire list of ingredients from the inventory table and checks
    each one to see if it is excess based on the amount used and the current total inventory
    amount. If the amount used is less than 10% of the starting amount (current inventory amount
    plus amount used), the ingredient is considered excess and added to the ArrayList of excess
    inventory items. If the ingredient is not in the amount used HashMap, it is also considered
    excess and added to the ArrayList.
    @param date a String representing the date for the sales history records to be retrieved in the format "yyyy-MM-dd"
    @param time a String representing the time for the sales history records to be retrieved in the format "HH:mm:ss"
    @return an ArrayList of Strings representing the excess inventory items
    @throws ParseException if the given date or time String is in an incorrect format
    @author Ethan Masters 
    */
    async excessReport(date, time) {}
}

module.exports = dbFunctions;