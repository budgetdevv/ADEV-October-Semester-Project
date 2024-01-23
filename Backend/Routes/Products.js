import { express, dbs, file, Product, tryQueryDB } from "../Server.js";

export const app = express.Router();
const db = dbs.main_database;

// Constants
import { PRODUCTS_TABLE_NAME as DB_TABLE_NAME, CATEGORIES_TABLE_NAME as CATEGORY_DB_TABLE_NAME } from "../../Common/Constants.js";


// GET WITH ID
app.route("/:id").get(async function(req, resp)
{
    const URL_PARAMS = req.params;

    const QUERY = `SELECT ${DB_TABLE_NAME}.*, ${CATEGORY_DB_TABLE_NAME}.name AS category_name FROM ${DB_TABLE_NAME}
                   JOIN ${CATEGORY_DB_TABLE_NAME} ON ${CATEGORY_DB_TABLE_NAME}.id = category_id
                   WHERE ${DB_TABLE_NAME}.id = ${URL_PARAMS.id}
                   ORDER BY ${DB_TABLE_NAME}.id ASC`;

    const RESULT = await tryQueryDB(db, QUERY);

    const ERROR = RESULT.error;

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
app.route("").get(async function (req, resp)
{
    const QUERY = `SELECT ${DB_TABLE_NAME}.*, ${CATEGORY_DB_TABLE_NAME}.name AS category_name FROM ${DB_TABLE_NAME}
                   JOIN ${CATEGORY_DB_TABLE_NAME} ON ${CATEGORY_DB_TABLE_NAME}.id = ${DB_TABLE_NAME}.category_id
                   ORDER BY ${DB_TABLE_NAME}.id ASC`;


    const RESULT = await tryQueryDB(db, QUERY);

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

// UPDATE
app.route("").put(async function (req, resp)
{
    let product = new Product(req.body);

    const QUERY = `UPDATE ${DB_TABLE_NAME}
                   SET
                   name = ?,
                   description = ?,
                   price = ?,
                   category_id = ?,
                   picture = ?
                   WHERE id = ?`

    const PARAMS = [product.name,
                    product.description,
                    product.price,
                    product.category_id,
                    product.picture,
                    product.id];

    const RESULT = await tryQueryDB(db, QUERY, PARAMS);

    const ERROR = RESULT.error;

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
app.route("").post(async function (req, resp)
{
    let product = new Product(req.body);

    // id is auto-increment
    const QUERY = `INSERT INTO ${DB_TABLE_NAME}
                   (name, description, price, category_id, picture)
                   VALUES
                   (?, ?, ?, ?, ?)`;

    const PARAMS = [product.name,
                    product.description,
                    product.price,
                    product.category_id,
                    product.picture];

    const RESULT = await tryQueryDB(db, QUERY, PARAMS);

    const ERROR = RESULT.error;

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
app.route("/:id").delete(async function (req, resp)
{
    const ROUTE_PARAMS = req.params;

    const QUERY = `DELETE FROM ${DB_TABLE_NAME}
                   WHERE id = ?`

    const PARAMS = [ROUTE_PARAMS.id];

    const RESULT = await tryQueryDB(db, QUERY, PARAMS);

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