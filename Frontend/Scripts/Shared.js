import { CATEGORIES_ROUTE_NAME, CATEGORY_ID } from "../../Common/Constants.js";
import {Product} from "../../Common/Data_Structures/Product.js";

export async function populateCategorySelector(categorySelector = null)
{
    categorySelector ??= document.getElementById(CATEGORY_ID);

    const RESPONSE = await fetch(`${CATEGORIES_ROUTE_NAME}`);
    const RESPONSE_TEXT = await RESPONSE.text();

    const CATEGORIES = JSON.parse(RESPONSE_TEXT);

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
    // Construct the restaurant object.
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

