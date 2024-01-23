import { express, dbs, file, Product, tryQueryDB } from "../Server.js";

export const app = express.Router();
const db = dbs.main_database;

// Constants
import { CATEGORIES_TABLE_NAME as DB_TABLE_NAME } from "../../Common/Constants.js";
export { DB_TABLE_NAME }

// GET WITH ID
app.route("/:id").get(async function (req, resp)
{
    const URL_PARAMS = req.params;

    const QUERY = `SELECT * FROM ${DB_TABLE_NAME}
                   WHERE id = ${URL_PARAMS.id}`;

    // https://www.w3schools.com/sql/sql_select.asp
    // Demonstrate param-less overload

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

// GET ALL
app.route("").get(async function (req, resp)
{
    const QUERY = `SELECT * FROM ${DB_TABLE_NAME}`;

    // https://www.w3schools.com/sql/sql_select.asp
    // Demonstrate param-less overload

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