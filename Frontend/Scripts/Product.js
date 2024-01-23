import { Product } from "/Common/Data_Structures/Product.js";
import { PRODUCTS_ROUTE_NAME as ROUTE_NAME, RESET_ROUTE } from "/Common/Constants.js"

const PRODUCT_LIST_ID = "product_list",
      IMAGE_WIDTH = 250,
      IMAGE_HEIGHT = 250;

document.addEventListener('DOMContentLoaded', onLoad);

async function onLoad()
{
    const RESPONSE = await fetch(ROUTE_NAME);

    renderProducts(JSON.parse(await RESPONSE.text()));
}

function renderProducts(products)
{
    let listBody = "";

    // fullRows + 1, as we include that one row that is not full
    for (let i = 0; i < products.length; i++)
    {
        const PRODUCT = new Product(products[i++]);

        const ID = PRODUCT.id;

        listBody += `<li class="product">
                        <h4>${PRODUCT.name}</h4>
                        <img src="${PRODUCT.picture}" alt="Stock Product Image" width=${IMAGE_WIDTH} height=${IMAGE_HEIGHT} /><br/>
                        <button type="button" onClick="location.href = '/ProductDetails.html?ID=${ID}'">Details</button>
                        <button type="button" onclick="onDelete(${ID})">Delete!!!</button>
                     </li>`
    }

    const HTML = `<ul class="product_container">
                     ${listBody}
                  </ul>`;

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