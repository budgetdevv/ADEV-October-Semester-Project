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
    let cardBodies = "";

    // fullRows + 1, as we include that one row that is not full
    for (let i = 0; i < products.length; i++)
    {
        const PRODUCT = new Product(products[i]);

        const ID = PRODUCT.id;

        // cardBodies += `<div class="product">
        //                 <img class="product_image" src="${PRODUCT.picture}" alt="Stock Product Image" /><br/>
        //                 <div class="product_descriptor">
        //                     <label class="product_label">${PRODUCT.name}</label>
        //                     <button class="product_buttons" type="button" onClick="location.href = '/ProductDetails.html?ID=${ID}'">Details</button>
        //                     <button class="product_buttons" type="button" onclick="onDelete(${ID})">Delete!!!</button>
        //                 </div>
        //              </div>`

        cardBodies += `<div class="column is-one-third">
                            <div class="card">
                                <div class="card-image">
                                    <figure class="image is-4by3">
                                        <img src="${PRODUCT.picture}" alt="Stock Product Image">
                                    </figure>
                                </div>
                                <header class="card-header">
                                    <p class="card-header-title is-centered">
                                        ${PRODUCT.name}
                                    </p>
                                </header>
                                <div class="card-content">
                                    <p class="content">
                                        ${PRODUCT.description}
                                    </p>
                                </div>
                                <footer class="card-footer">
                                    <div class="column is-half px-0 py-0">
                                        <button class="button is-success is-fullwidth" type="button" onClick="location.href = '/ProductDetails.html?ID=${ID}'">Details & Edit</button>
                                    </div>

                                    <div class="column is-half px-0 py-0">
                                        <button class="button is-danger is-fullwidth" type="button" onclick="onDelete(${ID})">Delete!!!</button>
                                    </div>
                                 </footer>
                            </div>
                        </div>`;

    }

    const HTML = `<div class="columns is-multiline">
                    ${cardBodies}
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