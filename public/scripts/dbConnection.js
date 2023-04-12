const { Pool } = require('pg');

class dbConnection {
    constructor() {
        this.pool = new Pool({
            user: "csce315331_team_32_master",
            host: "csce-315-db.engr.tamu.edu",
            database: "csce315331_team_32",
            password: "TEAM_32",
            port: 5432,
        });

        // Add process hook to shutdown pool
        process.on('SIGINT', () => {
            this.pool.end();
            console.log('dbConnection: Application successfully shutdown');
            process.exit(0);
        })
    }

    async connect() {
        try {
            await this.pool.connect();
            //console.log('dbConnection: Connected to PostgreSQL server');
        } catch (err) {
            console.error('dbConnection: Connection error', err.stack);
        }
    }

    disconnect() {
        this.pool.end();
        console.log('dbConnection: Application successfully shutdown');
        process.exit(0);
    }
}

module.exports = dbConnection;