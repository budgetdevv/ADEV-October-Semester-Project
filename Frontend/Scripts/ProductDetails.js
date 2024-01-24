import { Product } from "../../Common/Data_Structures/Product.js";
import {PRODUCTS_ROUTE_NAME, CATEGORIES_ROUTE_NAME, CATEGORY_ID, PRICE_ID} from "/Common/Constants.js"

const SUBMIT_BUTTON_ID = "submit_button",
      PRODUCT_PAGE_URL = "../Pages/Product.html";

document.addEventListener('DOMContentLoaded', onLoad);


async function onLoad()
{
    let queries = new URLSearchParams(location.search);

    let productID = queries.get("ID");

    if (productID == null)
    {
        // If there's no ID, redirect back to Product.html
        location.href = PRODUCT_PAGE_URL
        return;
    }

    let submitButton = document.getElementById(SUBMIT_BUTTON_ID);

    submitButton.setAttribute("onclick", `onSubmit(${productID})`)

    let response = await fetch(`${PRODUCTS_ROUTE_NAME}/${productID}`);

    let responseText = await response.text();

    if (responseText === "{}")
    {
        location.href = PRODUCT_PAGE_URL;
        return;
    }

    let product = new Product(JSON.parse(responseText));

    for (let [fieldName, value] of Object.entries(product))
    {
        if (value === undefined)
        {
            continue;
        }

        const element = document.getElementById(fieldName);

        if (element == null)
        {
            continue;
        }

        switch (fieldName)
        {
            // case PRICE_ID:
            //     break;
            case CATEGORY_ID:
                response = await fetch(`${CATEGORIES_ROUTE_NAME}`);
                responseText = await response.text();

                const CATEGORIES = JSON.parse(responseText);

                let categorySelectorHTML = "";

                for (let i = 0; i < CATEGORIES.length; i++)
                {
                    const CATEGORY = CATEGORIES[i];
                    categorySelectorHTML += `<option value="${CATEGORY.id}">${CATEGORY.name}</option>`;
                }

                element.innerHTML = categorySelectorHTML;
                break;
        }

        element.value = value;
    }
}

// Export this function. This is required if we treat this .js as a module.
window.onSubmit = onSubmit;

async function onSubmit(restaurantID)
{
    // Construct the restaurant object.
    let product = new Product();

    product.id = restaurantID;

    for (const fieldName of  Object.keys(product))
    {
        const element = document.getElementById(fieldName);

        if (element == null)
        {
            continue;
        }

        product[fieldName] = element.value;
    }

    const RESPONSE = await fetch(PRODUCTS_ROUTE_NAME,
    {
        method: "PUT",
        // REMEMBER TO SET REQUEST HEADER!!!
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    })

    alert(await RESPONSE.text());

    // If success, return back to products page.
    if (RESPONSE.status === 200)
    {
        location.href = PRODUCT_PAGE_URL;
    }
}