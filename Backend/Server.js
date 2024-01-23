process.on('uncaughtException', (err) =>
{
    console.log('Caught exception: ', err);
});

process.on('unhandledRejection', (reason, p) =>
{
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

import express from "express";
export { express };
import { Database } from "./Database.js";
import { promises as file } from "fs";
export { file };
import { Product } from "../Common/Data_Structures/Product.js";
export { Product };

const constructDBPromise = Database.constructDB();
export const dbs = await constructDBPromise;
const db_global = dbs.global_database;

constructDBPromise.then(async function()
{
    // Load our routes!
    const { ROUTE_NAME: products_route_name, app: products_app } = await import("./Routes/Products.js");
    // noinspection JSCheckFunctionSignatures
    app.use(products_route_name, products_app);

    const { ROUTE_NAME: categories_route_name, app: categories_app } = await import("./Routes/Categories.js");
    // noinspection JSCheckFunctionSignatures
    app.use(categories_route_name, categories_app);
});

// Constants
const ROUTE_NAME = "/", // VERY IMPORTANT: THE PRECEDING SLASH IS IMPORTANT!!!
      PATH_TO_RESET_SQL = "./project_sql.sql",
      PAGES_DIRECTORY = "/Frontend/Pages";

// Setup code
export const app = express();
app.use(express.json());
app.use(express.static("../"));
app.use(express.static("../Frontend"));
app.use(express.static(`..${PAGES_DIRECTORY}`));

app.listen(80); // Listen on port 80

// Technically `${ROUTE_NAME}/:id` could be made a constant and reused, but it is purposefully declared inline,
// as I use this project as study material

export class DBQueryResult
{
    data;
    column_definitions;
    error;
}

export async function tryQueryDB(db, query, parameters=null)
{
    let result = {};

    try
    {
        // https://www.w3schools.com/sql/sql_select.asp
        // Demonstrate param-less overload
        const resultPair = await db.query(query, parameters);
        // Second item is column definitions
        result.data = resultPair[0];
        result.column_definitions = resultPair[1];
    }

    catch (ERROR)
    {
        result.error = ERROR;
    }

    return result;
}

app.route("").get(async function (req, resp)
{
    resp.json("Hi");
});

// Reset
app.route(`${ROUTE_NAME}/reset`).post(async function (req, resp)
{
    const QUERY = await file.readFile(PATH_TO_RESET_SQL, 'utf8');

    const RESULT = await tryQueryDB(db_global, QUERY);

    const ERROR = RESULT.error;

    if (!ERROR)
    {
        const data = RESULT.data;

        resp.json(data);
    }

    else
    {
        resp.status(400).send(ERROR);
    }
});