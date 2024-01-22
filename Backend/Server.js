process.on('uncaughtException', (err) =>
{
    console.log('Caught exception: ', err);
});

process.on('unhandledRejection', (reason, p) =>
{
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

import express from "express";
import { Database } from "./Database.js";
import { promises as file } from "fs";
import { Restaurant } from "../Common/Data_Structures/Restaurant.js";
import path from "path";

const dbs = await Database.constructDB();
const db = dbs.restaurants_database;
const db_global = dbs.global_database;

// Constants
const ROUTE_NAME = "/restaurants", // VERY IMPORTANT: THE PRECEDING SLASH IS IMPORTANT!!!
      DB_TABLE_NAME = "restaurant",
      PATH_TO_RESET_SQL = "./restaurant_review_with_data.sql",
      PAGES_DIRECTORY = "/Frontend/Pages";

// Setup code
let app = express();
app.use(express.json());
app.use(express.static("../"));
app.use(express.static("../Frontend"));
app.use(express.static(`..${PAGES_DIRECTORY}`));

// app.use(express.static("../"));
// // Middleware to handle redirection
// app.use((req, res, next) =>
// {
//     const URL = req.url;
//
//     const LAST_SLASH_INDEX = URL.lastIndexOf('/');
//
//     const LAST_URL_SEGMENT = (LAST_SLASH_INDEX !== -1) ? URL.slice(LAST_SLASH_INDEX + 1) : URL;
//
//     if (LAST_URL_SEGMENT.includes('.html'))
//     {
//         res.redirect(`${PAGES_DIRECTORY}/${LAST_URL_SEGMENT}`);
//     }
//
//     else
//     {
//         // Continue to the next middleware
//         next();
//     }
// });

app.listen(80); // Listen on port 80

// Technically `${ROUTE_NAME}/:id` could be made a constant and reused, but it is purposefully declared inline,
// as I use this project as study material

class DBQueryRESULT
{
    data;
    column_definitions;
    ERROR;
}

async function tryQueryDB(db, query, parameters=null)
{
    let RESULT = {};

    try
    {
        // https://www.w3schools.com/sql/sql_select.asp
        // Demonstrate param-less overload
        const RESULTPair = await db.query(query, parameters);
        // Second item is column definitions
        RESULT.data = RESULTPair[0];
        RESULT.column_definitions = RESULTPair[1];
    }

    catch (ERROR)
    {
        RESULT.ERROR = ERROR;
    }

    return RESULT;
}

// GET WITH ID
app.route(`${ROUTE_NAME}/:id`).get(async function(req, resp)
{
    const URL_PARAMS = req.params;

    const QUERY = `SELECT * FROM ${DB_TABLE_NAME}
                   WHERE id = ${URL_PARAMS.id}`;

    const RESULT = await tryQueryDB(db, QUERY);

    const ERROR = RESULT.ERROR;

    if (!ERROR)
    {
        const data = RESULT.data;

        if (data.length !== 0)
        {
            // Remember that RESULT from SELECT is ALWAYS an array, even if there's only a single item.
            resp.json(data[0]);
        }

        else
        {
            // Respond with empty object
            resp.json({});
        }
    }

    else
    {
        resp.status(400).send(ERROR);
    }
});

// GET ALL
app.route(`${ROUTE_NAME}`).get(async function (req, resp)
{
    const QUERY = `SELECT * FROM ${DB_TABLE_NAME}`;

    // https://www.w3schools.com/sql/sql_select.asp
    // Demonstrate param-less overload

    const RESULT = await tryQueryDB(db, QUERY);

    const ERROR = RESULT.ERROR;

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

// UPDATE
app.route(ROUTE_NAME).put(async function (req, resp)
{
    let restaurant = new Restaurant(req.body);

    // https://www.w3schools.com/sql/sql_update.asp
    // REMEMBER to include comma between SET items!!! E.x. SET name = "TrumpMcDonaldz", address = "McDonalds"
    const QUERY = `UPDATE ${DB_TABLE_NAME}
                   SET
                   name = ?,
                   address = ?,
                   description = ?,
                   rating = ?,
                   cuisine_type = ?,
                   opening_date = ?,
                   image_url = ?
                   WHERE id = ?`

    const PARAMS = [restaurant.name,
                    restaurant.address,
                    restaurant.description,
                    restaurant.rating,
                    restaurant.cuisine_type,
                    restaurant.opening_date,
                    restaurant.image_url,
                    restaurant.id];

    const RESULT = await tryQueryDB(db, QUERY, PARAMS);

    const ERROR = RESULT.ERROR;

    if (!ERROR)
    {
        const data = RESULT.data;

        if (data.length !== 0)
        {
            // Remember that RESULT from SELECT is ALWAYS an array, even if there's only a single item.
            resp.json(data);
        }

        else
        {
            // Respond with empty object
            resp.json({});
        }
    }

    else
    {
        resp.status(400).send(ERROR);
    }
});

// CREATE
app.route(ROUTE_NAME).post(async function (req, resp)
{
    let restaurant = new Restaurant(req.body);

    // https://www.w3schools.com/sql/sql_insert.asp
    const QUERY = `INSERT INTO ${DB_TABLE_NAME}
                   (name, address, description, rating, cuisine_type, opening_date, image_url)
                   VALUES
                   (?, ?, ?, ?, ?, ?, ?)`;

    const PARAMS = [restaurant.name, restaurant.address, restaurant.description, restaurant.rating, restaurant.cuisine_type, restaurant.opening_date, restaurant.image_url];

    const RESULT = await tryQueryDB(db, QUERY, PARAMS);

    const ERROR = RESULT.ERROR;

    if (!ERROR)
    {
        const data = RESULT.data;

        resp.json(data.insertId);
    }

    else
    {
        resp.status(400).send(ERROR);
    }
});

// DELETE
app.route(`${ROUTE_NAME}/:id`).delete(async function (req, resp)
{
    const ROUTE_PARAMS = req.params;

    // https://www.w3schools.com/sql/sql_delete.asp
    const QUERY = `DELETE FROM ${DB_TABLE_NAME}
                   WHERE id = ?`

    const PARAMS = [ROUTE_PARAMS.id];

    const RESULT = await tryQueryDB(db, QUERY, PARAMS);

    const ERROR = RESULT.ERROR;

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

// Reset
app.route(`${ROUTE_NAME}/reset`).post(async function (req, resp)
{
    const QUERY = await file.readFile(PATH_TO_RESET_SQL, 'utf8');

    const RESULT = await tryQueryDB(db_global, QUERY);

    const ERROR = RESULT.ERROR;

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