import { Product } from "/Common/Data_Structures/Product.js";
import { PRODUCTS_ROUTE_NAME as ROUTE_NAME, RESET_ROUTE, PRODUCT_IMAGE_ID, PLACEHOLDER_PRODUCT_IMAGE_URL, JSON_HEADER } from "/Common/Constants.js"
import { Modal } from "./Modal.js";
import { populateCategorySelector, constructProductFromDocument } from "./Shared.js";

const PRODUCT_LIST_ID = "product_list",
      PRODUCT_PAGE_MODAL_ID = "product_page_modal";

let loadedProducts;
let currentSortFunction = defaultSort;

document.addEventListener('DOMContentLoaded', function()
{
    const _ = renderProducts(false);
});

/**
 * @param {Product} left
 * @param {Product} right
 */
function defaultSort(left, right)
{
    return left.id - right.id;
}

/**
 * @param {Product} left
 * @param {Product} right
 */
function sortByName(left, right)
{
    const L_NAME = left.name;
    const R_NAME = right.name;

    if (L_NAME < R_NAME)
    {
        return -1;
    }

    else if (L_NAME > R_NAME)
    {
        return 1;
    }

    return 0;
}

/**
 * @param {Product} left
 * @param {Product} right
 */
function sortByPrice(left, right)
{
    return left.price - right.price;
}

/**
 * @param {Product} left
 * @param {Product} right
 */
function sortByCategory(left, right)
{
    return left.category_id - right.category_id;
}

/**
 * @param {number} sortType
 * */
function setSortType(sortType)
{
    switch (sortType)
    {
        case 0:
            currentSortFunction = defaultSort;
            break;
        case 1:
            currentSortFunction = sortByName;
            break;
        case 2:
            currentSortFunction = sortByPrice;
            break;
        case 3:
            currentSortFunction = sortByCategory;
            break;
    }

    const _ = renderProducts(true, true);

    alert("Sort complete!");
}

// Export function(s). This is required if we treat this .js as a module.
window.setSortType = setSortType;

async function renderProducts(useCached, sortTypeChanged = false)
{
    let products;

    if (!useCached)
    {
        const RESPONSE = await fetch(ROUTE_NAME);

        loadedProducts = JSON.parse(await RESPONSE.text());

        // Data from DB are not ordered by the current sort type.
        sortTypeChanged = true;
    }

    products = loadedProducts;

    if (sortTypeChanged)
    {
        // sort() sorts in-place, so it doesn't create a new array.

        // Sort by ID first, so that we get consistent sort result regardless of current order.
        loadedProducts.sort(defaultSort);

        if (currentSortFunction !== defaultSort)
        {
            loadedProducts.sort(currentSortFunction);
        }
    }

    let cardBodies = "";

    for (let i = 0; i < products.length; i++)
    {
        const PRODUCT = new Product(products[i]);

        const ID = PRODUCT.id;

        let productName = PRODUCT.name;
        productName = (productName !== "") ? productName : "<i>( No product name )</i>";

        let product_desc = PRODUCT.description;
        product_desc = (product_desc !== "") ? product_desc : "<b>( No product description )</b>";

        cardBodies += `<div class="column is-one-third">
                            <div class="card">
                                <div class="card-image">
                                    <figure class="image is-4by3">
                                        <img src="${PRODUCT.picture}" onclick="onShowModalForProductImage('${productName}', this)" alt="Stock Product Image">
                                    </figure>
                                </div>
                                <header class="card-header has-background-warning">
                                    <p class="card-header-title is-centered truncate_text">
                                        ${productName}
                                    </p>
                                </header>
                                <div class="card-content">
                                    <p class="content wrap_text truncate_text" onclick="onToggleFullDescription(this)">
                                        ${product_desc}
                                    </p>
                                </div>
                            </div>
        
                            <div class="buttons has-addons"">
                                <button class="button is-half is-success" style="width: 50%" onClick="location.href = '/ProductDetails.html?ID=${ID}'">Details & Edit</button>
                                <button class="button is-half is-danger" style="width: 50%" onclick="onDelete(${ID})">Delete!!!</button>
                            </div>
                            
                        </div>`;

    }

    let html;

    if (cardBodies.length !== 0)
    {
        html =
        `
        <div class="columns is-multiline">
            ${cardBodies}
        </div>`;
    }

    else
    {
        html =
        `
        <div class="container is-fullwidth px-0 py-0">
            <image style="width: 100%" src="https://cdn.matthewjamestaylor.com/titles/empty-div.png"></image>
        </div>`;

        if (!useCached)
        {
            PROMPT_PRODUCT_CREATION_MODAL.enable();
        }
    }

    let div = document.getElementById(PRODUCT_LIST_ID);

    div.innerHTML = html;
}

const CREATE_PRODUCT_MODAL = new Modal(PRODUCT_PAGE_MODAL_ID);

CREATE_PRODUCT_MODAL.title = "Create Product!";
CREATE_PRODUCT_MODAL.body =
`
<div class="field">
    <label class="label" for="name">Name</label>
    <div class="control has-icons-left">
        <span class="icon is-small is-left">
            <i class="fa-solid fa-signature"></i>
        </span>
        <input class="input is-warning" id="name" type="text" placeholder="Enter product's name" required />
    </div>
</div>

<div class="field">
    <label class="label" for="description">Description</label>
    <div class="control">
        <textarea class="textarea is-warning" id="description" type="text" placeholder="Enter product's description"></textarea>
    </div>
</div>

<div class="field">
    <label class="label" for="price">Price</label>
    <div class="control has-icons-left">
        <span class="icon is-small is-left">
            <i class="fa-solid fa-dollar-sign"></i>
        </span>
        <input class="input is-warning" id="price" type="number" min=0 max=9999999.99 step=0.01 placeholder="Enter product's price" required />
    </div>
</div>

<div class="field">
    <label class="label" for="category_id">Category</label>
    <div class="control has-icons-left">
        <div class="select is-warning">
            <span class="icon is-small is-left">
                <i class="fa-solid fa-list"></i>
            </span>
            <select id="category_id">
                <!--Contents will be patched by JS-->
            </select>
        </div>
    </div>
</div>

<div class="field">
    <label class="label" for="picture">Image URL</label>
    <div class="control has-icons-left">
        <span class="icon is-small is-left">
            <i class="fa-solid fa-paperclip"></i>
        </span>
        <input class="input is-warning" id="picture" placeholder="Enter product's Image URL" />
    </div>
</div>
`;
CREATE_PRODUCT_MODAL.submitButtonCallbackName = "onCreateProductModalSubmit";
CREATE_PRODUCT_MODAL.submitButtonName = "Create!";

CREATE_PRODUCT_MODAL.render();

// Export function(s). This is required if we treat this .js as a module.

window.onToggleCreateProductModal = function()
{
    CREATE_PRODUCT_MODAL.enable();

    const _ = populateCategorySelector();
}

window.onCreateProductModalSubmit = async function()
{
    const PRODUCT = constructProductFromDocument();

    const RESPONSE = await fetch(ROUTE_NAME,
        {
            method: "POST",
            headers: JSON_HEADER,
            body: JSON.stringify(PRODUCT)
        });

    alert(`New product created! ID: ${await RESPONSE.text()}`);

    CREATE_PRODUCT_MODAL.disable();
    const _ = renderProducts(false);
};

const VIEW_PRODUCT_IMAGE_MODAL = new Modal(PRODUCT_PAGE_MODAL_ID);

VIEW_PRODUCT_IMAGE_MODAL.title = "Product Image Preview";
VIEW_PRODUCT_IMAGE_MODAL.body_padx = VIEW_PRODUCT_IMAGE_MODAL.body_pady = 0;
VIEW_PRODUCT_IMAGE_MODAL.enableFooter = false;

window.onShowModalForProductImage = function(productName, imageElement)
{
    VIEW_PRODUCT_IMAGE_MODAL.title = productName;
    VIEW_PRODUCT_IMAGE_MODAL.body = `<p class="image is-4by3">
                                        <img src="${imageElement.src}" alt="">
                                     </p>`;

    VIEW_PRODUCT_IMAGE_MODAL.render();
    VIEW_PRODUCT_IMAGE_MODAL.enable();
}

window.onReset = onReset;
window.onDelete = onDelete;

const PROMPT_PRODUCT_CREATION_MODAL = new Modal(PRODUCT_PAGE_MODAL_ID);

PROMPT_PRODUCT_CREATION_MODAL.title = "No Products Available!";
PROMPT_PRODUCT_CREATION_MODAL.body = `It seems like there are no products.
                                      Click on "Create" to add one.<br/>
                                      Products may also be added via Options > Create Product!`;

PROMPT_PRODUCT_CREATION_MODAL.submitButtonCallbackName = "onToggleCreateProductModal";
PROMPT_PRODUCT_CREATION_MODAL.submitButtonName = "Create!";
PROMPT_PRODUCT_CREATION_MODAL.cancelButtonName = "Skip for now";

PROMPT_PRODUCT_CREATION_MODAL.render();

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
    const _ = renderProducts(false);
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

    const _ = renderProducts(false);
}