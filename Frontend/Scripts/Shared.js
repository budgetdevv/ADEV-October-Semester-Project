import { CATEGORIES_ROUTE_NAME, CATEGORY_ID } from "../../Common/Constants.js";
import { Product, Category } from "../../Common/DataStructures.js";

/**
 * @return { Promise<Category[]> }
 */
export async function getCategoriesViaREST()
{
    const RESPONSE = await fetch(CATEGORIES_ROUTE_NAME);
    const RESPONSE_TEXT = await RESPONSE.text();

    let categories = JSON.parse(RESPONSE_TEXT);

    for (let i = 0; i < categories.length; i++)
    {
        categories[i] = new Category(categories[i]);
    }

    return categories;
}

export async function populateCategorySelector(categorySelector = null)
{
    categorySelector ??= document.getElementById(CATEGORY_ID);

    const CATEGORIES = await getCategoriesViaREST();

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
    // Construct the product object.
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

