import { Product } from "/Common/Data_Structures/Product.js";
import { PRODUCTS_ROUTE_NAME as ROUTE_NAME, RESET_ROUTE, PRODUCT_IMAGE_ID, PLACEHOLDER_PRODUCT_IMAGE_URL, JSON_HEADER } from "/Common/Constants.js"
import { Modal } from "./Modal.js";

const PRODUCT_LIST_ID = "product_list";

document.addEventListener('DOMContentLoaded', onLoad);

const CREATE_PRODUCT_MODAL = new Modal(
    "create_product_modal",
    "Create Product!",
    `<div class="field">
                <label class="label" for="${PRODUCT_IMAGE_ID}">Image URL</label>
                <div class="control has-icons-left">
                    <span class="icon is-small is-left">
                        <i class="fa-solid fa-paperclip"></i>
                    </span>
                    <input class="input is-warning" id="${PRODUCT_IMAGE_ID}" type="url" placeholder="Enter product's Image URL" value="${PLACEHOLDER_PRODUCT_IMAGE_URL}" />
                </div>
            </div>`,
    "onCreateProductModalSubmit",
    "onCreateProductModalCancel",
    "onCreateProductModalCancel",
    "Create!");

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

        let productName = PRODUCT.name;
        productName = (productName !== "") ? productName : "( No product name )";

        let product_desc = PRODUCT.description;
        product_desc = (product_desc !== "") ? product_desc : "( No product description )";

        cardBodies += `<div class="column is-one-third">
                            <div class="card">
                                <div class="card-image">
                                    <figure class="image is-4by3">
                                        <img src="${PRODUCT.picture}" alt="Stock Product Image">
                                    </figure>
                                </div>
                                <header class="card-header">
                                    <p class="card-header-title is-centered truncate_text">
                                        ${productName}
                                    </p>
                                </header>
                                <div class="card-content">
                                    <p class="content wrap_text truncate_text" onclick="onToggleFullDescription(this)">
                                        ${product_desc}
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
window.onToggleProductModal = function() { CREATE_PRODUCT_MODAL.enable(); }

window.onCreateProductModalSubmit = async function()
{
    const PRODUCT = Product.getDefault(document.getElementById(PRODUCT_IMAGE_ID).value);

    const RESPONSE = await fetch(ROUTE_NAME,
        {
            method: "POST",
            headers: JSON_HEADER,
            body: JSON.stringify(PRODUCT)
        });

    alert(`New product created! ID: ${await RESPONSE.text()}`);

    CREATE_PRODUCT_MODAL.disable();
    let _ = onLoad();
};

window.onCreateProductModalCancel = function()
{
    CREATE_PRODUCT_MODAL.disable();
};

window.onToggleFullDescription = function(descriptionElement)
{
    let classList = descriptionElement.classList;

    const TRUNCATE_CLASS_NAME = "truncate_text";

    const ENABLE = !classList.contains(TRUNCATE_CLASS_NAME);

    if (ENABLE)
    {
        classList.add(TRUNCATE_CLASS_NAME);
    }

    else
    {
        classList.remove(TRUNCATE_CLASS_NAME);
    }
}

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