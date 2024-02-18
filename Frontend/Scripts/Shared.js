import { PRODUCTS_ROUTE_NAME, CATEGORIES_ROUTE_NAME, CATEGORY_ID } from "../../Common/Constants.js";
import { Product, Category } from "../../Common/DataStructures.js";

/**
 * @return { Promise<Product[]> }
 */
export async function getProductsViaREST()
{
    const RESPONSE = await fetch(PRODUCTS_ROUTE_NAME);
    const RESPONSE_TEXT = await RESPONSE.text();

    let products = JSON.parse(RESPONSE_TEXT);

    for (let i = 0; i < products.length; i++)
    {
        products[i] = new Product(products[i]);
    }

    return products;
}

let categories = null; // As of today, categories will never change while the app is running, so we cache it

/**
 * @return { Promise<Category[]> }
 */
export async function getCategoriesViaCacheOrREST()
{
    if (categories != null)
    {
        return categories;
    }

    const RESPONSE = await fetch(CATEGORIES_ROUTE_NAME);
    const RESPONSE_TEXT = await RESPONSE.text();

    categories = JSON.parse(RESPONSE_TEXT);

    for (let i = 0; i < categories.length; i++)
    {
        categories[i] = new Category(categories[i]);
    }

    return categories;
}

export async function populateCategorySelector(categorySelector = null)
{
    categorySelector ??= document.getElementById(CATEGORY_ID);

    const CATEGORIES = await getCategoriesViaCacheOrREST();

    let categorySelectorHTML = "";

    for (let i = 0; i < CATEGORIES.length; i++)
    {
        const CATEGORY = CATEGORIES[i];
        categorySelectorHTML += `<option value="${CATEGORY.id}">${CATEGORY.name}</option>`;
    }

    categorySelector.innerHTML = categorySelectorHTML;
}

export function constructProductFromDocument()
{
    let product = new Product();

    for (const fieldName of Object.keys(product))
    {
        const element = document.getElementById(fieldName);

        if (element == null)
        {
            continue;
        }

        product[fieldName] = element.value;
    }

    return product;
}

export function scrollToBottomOfPage(smooth = true)
{
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: smooth ? "smooth" : "instant" });
}

