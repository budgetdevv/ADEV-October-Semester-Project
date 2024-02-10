import { Product } from "../../Common/DataStructures.js";
import { PRODUCTS_ROUTE_NAME, PRODUCT_PAGE_ROUTE, CATEGORY_ID, JSON_HEADER } from "/Common/Constants.js";
import { populateCategorySelector, constructProductFromDocument } from "./Shared.js";

const FORM_ID = "product_details_form",
      BACK_BUTTON_ID = "back_button";

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

    document.getElementById(FORM_ID).addEventListener("submit", function (event)
    {
        onSubmit(event, productID);
    });

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

    document.getElementById(BACK_BUTTON_ID).addEventListener("click", function (_)
    {
        location.href = `/Product.html?ID=${productID}`;
    });
}

async function onSubmit(event, productID)
{
    // Prevent submit from navigating away
    event.preventDefault();

    let product = constructProductFromDocument();

    product.id = productID;

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
        location.href = `${PRODUCT_PAGE_ROUTE}?ID=${productID}`;
    }
}