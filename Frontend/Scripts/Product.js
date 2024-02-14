import { Product } from "/Common/DataStructures.js";
import { PRODUCT_ID_PREFIX, RESET_ROUTE, JSON_HEADER, CATEGORY_FILTER_TAG_KEY, SORT_FILTER_TAG_KEY, NAME_FILTER_TAG_KEY, DESCRIPTION_FILTER_TAG_KEY, PRODUCTS_ROUTE_NAME as ROUTE_NAME } from "/Common/Constants.js"
import { Modal } from "./Modal.js";
import { getProductsViaREST, populateCategorySelector, getCategoriesViaREST, constructProductFromDocument } from "./Shared.js";
import { FilterInput } from "./FilterInput.js";

const PRODUCT_LIST_ID = "product_list";

/**
 * @type { Product[] }
 */
let loadedProducts;

/**
 * @type { FilterInput }
 */
let filterInput;

document.addEventListener('DOMContentLoaded', async _ =>
{
    filterInput = new FilterInput("header");

    let def = filterInput.addTagDefinition(CATEGORY_FILTER_TAG_KEY);
    def.autoCompleteDropdownText = "Category: ";

    for (const CATEGORY of await getCategoriesViaREST())
    {
        def.addAutoCompleteTag(CATEGORY.name, CATEGORY.id);
    }

    def = filterInput.addTagDefinition(SORT_FILTER_TAG_KEY);
    def.autoCompleteDropdownText = "Sort By: ";
    def.addDefaultSelectionTag("ID", sortByID);
    def.addAutoCompleteTag("Name", sortByName);
    def.addAutoCompleteTag("Price", sortByPrice);
    def.addAutoCompleteTag("Category", sortByCategory);

    def = filterInput.addTagDefinition(NAME_FILTER_TAG_KEY);
    def.allowCustomInput = true;
    def.autoCompleteDropdownText = `${NAME_FILTER_TAG_KEY}: `
    def.addDefaultSelectionTag("Empty", "");

    def = filterInput.addTagDefinition(DESCRIPTION_FILTER_TAG_KEY);
    def.allowCustomInput = true;
    def.autoCompleteDropdownText = `${DESCRIPTION_FILTER_TAG_KEY}: `
    def.addDefaultSelectionTag("Empty", "");

    filterInput.onTextInputCallback = (event, _) =>
    {
        renderProducts(true, null);
    }

    filterInput.onTagSelectedCallback = filterInput.onTagDeselectedCallback = (event, currentFilterDefinition) =>
    {
        renderProducts(true, currentFilterDefinition);
    }

    const PRODUCT_ID = new URLSearchParams(location.search).get("ID");

    renderProducts(false, null).then(() => scrollToProduct(PRODUCT_ID));
});

/**
 * @param { String } productID
 */
function scrollToProduct(productID)
{
    let scrollTarget;

    // noinspection LoopStatementThatDoesntLoopJS
    while (true)
    {
        if (loadedProducts.length !== 0)
        {
            // Sort type may mean that first displayed item doesn't necessarily have an ID of 1.
            const FIRST_PRODUCT = document.getElementById(`${PRODUCT_ID_PREFIX}${new Product(loadedProducts[0]).id}`);

            const PRODUCT = document.getElementById(`${PRODUCT_ID_PREFIX}${productID}`);

            // alert(FIRST_PRODUCT.parentElement.scrollHeight)
            // alert(PRODUCT.parentElement.scrollHeight)

            // User may input arbitrary product number
            // Are they on the first column? If so, we scroll to start of the page.
            if (PRODUCT != null && PRODUCT.getBoundingClientRect().y !== FIRST_PRODUCT.getBoundingClientRect().y)
            {
                // Parent element ( Which is the column ) includes padding
                scrollTarget = PRODUCT.parentElement;
                break;
            }
        }

        // Scroll to the body, which basically starts from the top
        scrollTarget = document.body;

        break;
    }

    scrollTarget.scrollIntoView({ behavior: "smooth" });
}

/**
 * @param { Product } left
 * @param { Product } right
 */
function sortByID(left, right)
{
    return left.id - right.id;
}

/**
 * @param { Product } left
 * @param { Product } right
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
 * @param { Product } left
 * @param { Product } right
 */
function sortByPrice(left, right)
{
    return left.price - right.price;
}

/**
 * @param { Product } left
 * @param { Product } right
 */
function sortByCategory(left, right)
{
    return left.category_id - right.category_id;
}

/**
 * @param { boolean } useCached
 * @param { FilterInput.FilterDefinition } currentFilterDefinition
 */
async function renderProducts(useCached, currentFilterDefinition = null)
{
    // alert(currentFilterDefinition?.key)

    /**
     * @type { Product[] }
     */
    let products
    let sortTypeChanged;

    if (!useCached)
    {
        loadedProducts = await getProductsViaREST();
    }

    // if (selectionTag != null)
    // {
    //     switch (selectionTag.key)
    //     {
    //
    //     }
    // }

    products = loadedProducts;

    // Data from DB are not ordered by the current sort type.
    sortTypeChanged = !useCached || currentFilterDefinition?.key === SORT_FILTER_TAG_KEY;

    if (sortTypeChanged)
    {
        // sort() sorts in-place, so it doesn't create a new array.

        // Sort by ID first, so that we get consistent sort result regardless of current order.
        loadedProducts.sort(sortByID);

        /**
         * @type { function(Product, Product) }
         */
        let currentSortFunction = filterInput.tryGetTagDefinition(SORT_FILTER_TAG_KEY).selectedValue;

        if (currentSortFunction !== sortByID)
        {
            loadedProducts.sort(currentSortFunction);
        }
    }

    let filterText = filterInput.text.toUpperCase();

    let cardBodies = "";

    for (const PRODUCT of products)
    {
        // Filter by name for now. We will add more options in the future
        if (!PRODUCT.shouldDisplay(filterText, filterInput))
        {
            continue;
        }

        cardBodies +=
        `
        <div class="column is-one-third">
            ${PRODUCT.getProductDisplayHTML()}
        </div>
        `;
    }

    let html;

    if (cardBodies.length !== 0)
    {
        html =
        `
        <div class="columns is-multiline">
            ${cardBodies}
        </div>
        `;
    }

    else
    {
        if (products.length === 0)
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

        else
        {
            html =
            `
            <div class="container is-fullwidth px-0 py-0">
                <h1 style="text-align: center">No matching products</h1>  
            </div>`;
        }
    }

    let div = document.getElementById(PRODUCT_LIST_ID);

    div.innerHTML = html;
}

window.renderProducts = renderProducts;

const CREATE_PRODUCT_MODAL = new Modal();

CREATE_PRODUCT_MODAL.setTitle("Create Product!");

CREATE_PRODUCT_MODAL.setBody(
`
<div class="field">
    <label class="label" for="name">Name</label>
    <div class="control has-icons-left">
        <span class="icon is-small is-left">
            <i class="fa-solid fa-signature"></i>
        </span>
            <input class="input is-warning" type="text" pattern="\\S(.*\\S)?" placeholder="Enter product's name" maxlength=100 id="name" required />
    </div>
</div>

<div class="field">
    <label class="label" for="description">Description</label>
    <div class="control">
        <textarea class="textarea is-warning" type="text" placeholder="Enter product's description" maxlength=200 id="description" ></textarea>
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
        <input class="input is-warning" placeholder="Enter product's Image URL" maxlength=200 id="picture" />
    </div>
</div>
`);

CREATE_PRODUCT_MODAL.closeModalOnSubmit = false;

CREATE_PRODUCT_MODAL.submitCallback = async function(modal)
{
    const PRODUCT = constructProductFromDocument();

    const RESPONSE = await fetch(ROUTE_NAME,
        {
            method: "POST",
            headers: JSON_HEADER,
            body: JSON.stringify(PRODUCT)
        });

    const NEW_PRODUCT_ID = await RESPONSE.text();

    const SUCCESS = RESPONSE.status === 200;

    const TEXT = `${(SUCCESS) ? "New product created! ID: " : "An error occurred!\n\n"}${NEW_PRODUCT_ID}`;

    alert(TEXT);

    if (SUCCESS)
    {
        modal.disable();

        await renderProducts(false);

        // Don't use scroll to bottom, since sort type may mean that new product is not appended to bottom of page
        scrollToProduct(NEW_PRODUCT_ID);
    }
};

CREATE_PRODUCT_MODAL.submitButtonElement.textContent = "Create!";

const VIEW_PRODUCT_IMAGE_MODAL = new Modal();

VIEW_PRODUCT_IMAGE_MODAL.setTitle("Product Image Preview");
VIEW_PRODUCT_IMAGE_MODAL.setBodyPadding(0, 0);
VIEW_PRODUCT_IMAGE_MODAL.footerEnabled = false;

window.onShowModalForProductImage = function(productName, imageElement)
{
    VIEW_PRODUCT_IMAGE_MODAL.setTitle(productName);
    VIEW_PRODUCT_IMAGE_MODAL.setBody(`<p class="image is-4by3">
                                        <img src="${imageElement.src}" alt="">
                                     </p>`);

    VIEW_PRODUCT_IMAGE_MODAL.enable();
}

window.onReset = onReset;
window.onDelete = onDelete;
window.onProductImageLoadFailure = onProductImageLoadFailure;

const PROMPT_PRODUCT_CREATION_MODAL = new Modal();

PROMPT_PRODUCT_CREATION_MODAL.setTitle("No Products Available!");
PROMPT_PRODUCT_CREATION_MODAL.setBody(`It seems like there are no products.
                                       Click on "Create" to add one.<br/>
                                       Products may also be added via Options > Create Product!`);

PROMPT_PRODUCT_CREATION_MODAL.submitCallback = onToggleCreateProductModal;

function onToggleCreateProductModal()
{
    CREATE_PRODUCT_MODAL.enable();

    const _ = populateCategorySelector();
}

window.onToggleCreateProductModal = onToggleCreateProductModal;

PROMPT_PRODUCT_CREATION_MODAL.submitButtonElement.textContent = "Create!";
PROMPT_PRODUCT_CREATION_MODAL.cancelButtonElement.textContent = "Skip for now";

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

/**
 * @param { HTMLImageElement } productImage
 */
function onProductImageLoadFailure(productImage)
{
    productImage.src = "/Frontend/Assets/PRODUCT_MISSING.png";
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

async function onReset()
{
    const RESPONSE = await fetch(RESET_ROUTE,
        {
            method: "POST"
        });

    alert(`Database has been reset! \n\n${await RESPONSE.text()}`);
    const _ = renderProducts(false);
}
