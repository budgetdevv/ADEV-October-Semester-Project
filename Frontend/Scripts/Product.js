import { Product } from "/Common/Data_Structures/Product.js";
import { PRODUCTS_ROUTE_NAME as ROUTE_NAME, RESET_ROUTE } from "/Common/Constants.js"

const PRODUCT_LIST_ID = "product_list",
      MAX_PRODUCTS_PER_ROW = 2,
      IMAGE_WIDTH = 150,
      IMAGE_HEIGHT = 150;

document.addEventListener('DOMContentLoaded', onLoad);

async function onLoad()
{
    const RESPONSE = await fetch(ROUTE_NAME);

    renderProducts(JSON.parse(await RESPONSE.text()));
}

function renderProducts(restaurants)
{
    const RESTAURANT_COUNT = restaurants.length;

    const FULL_ROWS = Math.floor(RESTAURANT_COUNT / MAX_PRODUCTS_PER_ROW);

    const REM = RESTAURANT_COUNT - (FULL_ROWS * MAX_PRODUCTS_PER_ROW);

    const PARTIAL_ROWS = (REM !== 0) ? 1 : 0;

    let tableBody = "";

    let restaurantIndex = 0;

    // fullRows + 1, as we include that one row that is not full
    for (let rowNumber = 1; rowNumber <= (FULL_ROWS + PARTIAL_ROWS); rowNumber++)
    {
        let tableData = "";

        let rowRestaurantCount = (rowNumber <= FULL_ROWS) ? MAX_PRODUCTS_PER_ROW : REM;

        for (let restaurantNum = 1; restaurantNum <= rowRestaurantCount; restaurantNum++)
        {
            const PRODUCT = new Product(restaurants[restaurantIndex++]);

            const ID = PRODUCT.id;

            tableData += `<td>
                            <h4>${PRODUCT.name}</h4>
                            <img src="${PRODUCT.picture}" alt="Stock Product Image" width=${IMAGE_WIDTH} height=${IMAGE_HEIGHT} /><br/>
     
                            <button type="button" onclick="location.href = '/ProductDetails.html?ID=${ID}'">Details</button>
                            &nbsp&nbsp&nbsp&nbsp&nbsp
                            <button type="button" onclick="onDelete(${ID})">Delete!!!</button>
                          <td>`
        }

        tableBody += `<tr>${tableData}</tr>`;
    }

    const HTML = `<div id = ${PRODUCT_LIST_ID}>
                    <table>
                        <tbody>${tableBody}</tbody>
                    </table>
                  </div>`;

    let div = document.getElementById(PRODUCT_LIST_ID);

    div.innerHTML = HTML;
}

// Export function(s). This is required if we treat this .js as a module.
window.onReset = onReset;
window.onDelete = onDelete;

async function onReset()
{
    const RESPONSE = await fetch(RESET_ROUTE,
    {
            method: "POST"
    });

    alert(`Database has been reset! \n\n${await RESPONSE.text()}`);
    let _ = onLoad();
}

async function onDelete(productID)
{
    const RESPONSE = await fetch(`${ROUTE_NAME}/${productID}`,
    {
        method: "DELETE"
    });

    let text = await RESPONSE.text();

    text = `${(RESPONSE.status === 200) ? "Product Deleted!" : "An error occurred!"}\n\n${text}`;

    alert(text);

    const _ = onLoad();
}