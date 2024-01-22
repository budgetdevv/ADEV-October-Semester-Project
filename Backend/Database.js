import mysql from "mysql2/promise";
import { promises as file } from "fs";

class DBConfig
{
    constructor(host, port, username, password, databaseName)
    {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.databaseName = databaseName;
    }

    static getDefaultConfig()
    {
        return new DBConfig("localhost", "3306", "( Insert username here )", "( Insert password here )", "( Insert database name here )");
    }
}

const DB_CONFIG_PATH = "../db_config.json";

export class Database
{
    restaurants_database;
    global_database;

    static async constructDB()
    {
        let configFile;

        try
        {
            configFile = await file.readFile(DB_CONFIG_PATH);
        }

        catch
        {
            // Pretty JSON: https://stackoverflow.com/questions/4810841/pretty-print-json-using-javascript
            let text = JSON.stringify(DBConfig.getDefaultConfig(), null, 2);

            const MISSING_DB_FILE_TEXT = "Missing DB config file!";

            try
            {
                await file.writeFile(DB_CONFIG_PATH, text);
            }

            catch (error)
            {
                throw `${MISSING_DB_FILE_TEXT} Tried generating file but failed with error: ${error}`;
            }

            throw `${MISSING_DB_FILE_TEXT} New one generated in ${DB_CONFIG_PATH}`;
        }

        let config = JSON.parse(configFile.toString());

        const global_connection = await mysql.createConnection({
            host: config.host, // IP of database server
            port: config.port, // port of database server
            user: config.username, // user of database server
            password: config.password, // password of database server
            multipleStatements: true
        });

        const restaurant_connection = await mysql.createConnection({
            host: config.host, // IP of database server
            port: config.port, // port of database server
            user: config.username, // user of database server
            password: config.password, // password of database server
            database: config.databaseName // database we are connecting to
        });

        let db = new Database();

        db.global_database = global_connection;
        db.restaurants_database = restaurant_connection;

        // Test Connections
        await global_connection.connect();
        await restaurant_connection.connect();

        console.log('Connected to DB!');

        return db;
    }
}