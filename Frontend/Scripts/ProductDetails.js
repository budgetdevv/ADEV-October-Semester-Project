import { Product } from "../../Common/Data_Structures/Product.js";
import { PRODUCTS_ROUTE_NAME, CATEGORY_ID, JSON_HEADER } from "/Common/Constants.js";
import { populateCategorySelector, constructProductFromDocument } from "./Shared.js";

const FORM_ID = "product_details_form",
      PRODUCT_PAGE_URL = "/Product.html";

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

    let submitButton = document.getElementById(FORM_ID);
    submitButton.setAttribute("onsubmit", `onSubmit(${productID})`);

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
            case CATEGORY_ID:
                await populateCategorySelector(element);
                break;
        }

        element.value = value;
    }
}

// Export this function. This is required if we treat this .js as a module.
window.onSubmit = onSubmit;

async function onSubmit(restaurantID)
{
    // Prevent submit from navigating away
    event.preventDefault();

    let product = constructProductFromDocument();

    product.id = restaurantID;

    const RESPONSE = await fetch(PRODUCTS_ROUTE_NAME,
    {
        method: "PUT",
        // REMEMBER TO SET REQUEST HEADER!!!
        headers: JSON_HEADER,
        body: JSON.stringify(product)
    })

    alert(await RESPONSE.text());

    // If success, return back to products page.
    if (RESPONSE.status === 200)
    {
        location.href = PRODUCT_PAGE_URL;
    }
}