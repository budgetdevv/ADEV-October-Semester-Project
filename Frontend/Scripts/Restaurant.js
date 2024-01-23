import { Product } from "/Common/Data_Structures/Product.js";

const ROUTE_NAME = "/restaurants",
      RESET_ROUTE_NAME = `${ROUTE_NAME}/reset`,
      RESTAURANT_LIST_ID = "restaurant_list",
      RESTAURANT_PAGE_URL = "./Product.html",
      MAX_RESTAURANTS_PER_ROW = 2,
      IMAGE_WIDTH = 150,
      IMAGE_HEIGHT = 150;

document.addEventListener('DOMContentLoaded', onLoad);

async function onLoad()
{
    const RESPONSE = await fetch(ROUTE_NAME);

    renderRestaurants(JSON.parse(await RESPONSE.text()));
}

function renderRestaurants(restaurants)
{
    const RESTAURANT_COUNT = restaurants.length;

    const FULL_ROWS = Math.floor(RESTAURANT_COUNT / MAX_RESTAURANTS_PER_ROW);

    const REM = RESTAURANT_COUNT - (FULL_ROWS * MAX_RESTAURANTS_PER_ROW);

    const PARTIAL_ROWS = (REM !== 0) ? 1 : 0;

    let tableBody = "";

    let restaurantIndex = 0;

    // fullRows + 1, as we include that one row that is not full
    for (let rowNumber = 1; rowNumber <= (FULL_ROWS + PARTIAL_ROWS); rowNumber++)
    {
        let tableData = "";

        let rowRestaurantCount = (rowNumber <= FULL_ROWS) ? MAX_RESTAURANTS_PER_ROW : REM;

        for (let restaurantNum = 1; restaurantNum <= rowRestaurantCount; restaurantNum++)
        {
            let restaurant = new Product(restaurants[restaurantIndex++]);

            tableData += `<td>
                            <h4>${restaurant.name}</h4>
                            <img src="${restaurant.picture}" width=${IMAGE_WIDTH} height=${IMAGE_HEIGHT} /><br/>
                            <a href="./RestaurantDetails.html?ID=${restaurant.id}">
                                <button type="button">Details</button>
                            </a>
                          <td>`
        }

        tableBody += `<tr>${tableData}</tr>`;
    }

    const HTML = `<div id = ${RESTAURANT_LIST_ID}>
                    <table>
                        <tbody>${tableBody}</tbody>
                    </table>
                  </div>`;

    let div = document.getElementById(RESTAURANT_LIST_ID);

    div.innerHTML = HTML;
}

// Export functions. This is required if we treat this .js as a module.
window.onAdd = onAdd;
window.onReset = onReset;

async function onAdd()
{
    const RESTAURANT = Product.getDefault();

    const RESPONSE = await fetch(ROUTE_NAME,
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(RESTAURANT)
    });

    alert(`New restaurant created! ID: ${await RESPONSE.text()}`);
    let _ = onLoad();
}

async function onReset()
{
    const RESPONSE = await fetch(RESET_ROUTE_NAME,
    {
            method: "POST"
    });

    alert(`Database has been reset! \n\n${await RESPONSE.text()}`);
    let _ = onLoad();
}