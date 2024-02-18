import { Product } from "../../Common/DataStructures.js";
import {
    PRODUCTS_ROUTE_NAME,
    PRODUCT_PAGE_ROUTE,
    CATEGORY_ID,
    IMAGE_PREVIEW_ID,
    JSON_HEADER,
    IMAGE_INPUT_ID
} from "/Common/Constants.js";
import { populateCategorySelector, constructProductFromDocument } from "./Shared.js";
import { isNullOrWhitespace, onImageLoadFailure } from "../../Common/Helpers.js";

const FORM_ID = "product_details_form",
      BACK_BUTTON_ID = "back_button";

document.addEventListener('DOMContentLoaded', onLoad);

/**
 * @type { HTMLInputElement }
 */
let imageInputElement = document.getElementById(IMAGE_INPUT_ID);

/**
 * @type { HTMLImageElement }
 */
let imagePreviewElement = document.getElementById(IMAGE_PREVIEW_ID);

async function onLoad()
{
    let queries = new URLSearchParams(location.search);

    let productID = queries.get("ID");

    // We use a while loop to emulate jumps to a common path using break;
    // noinspection LoopStatementThatDoesntLoopJS
    while (true)
    {
        if (isNullOrWhitespace(productID))
        {
            // If there's no ID, redirect back to Product.html
            break;
        }

        document.getElementById(FORM_ID).addEventListener("submit", function (event)
        {
            onSubmit(event, productID);
        });

        let response = await fetch(`${PRODUCTS_ROUTE_NAME}/${productID}`);

        let responseText = await response.text();

        if (responseText === "{}")
        {
            // If the response body is an empty object, redirect back to Product.html as well
            break;
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

        document.getElementById(BACK_BUTTON_ID).addEventListener("click", _ =>
        {
            location.href = `/Product.html?ID=${productID}`;
        });

        imageInputElement.addEventListener("input", _ =>
        {
            renderPreview();
        });

        imagePreviewElement.addEventListener("error", _ =>
        {
            onImageLoadFailure(imagePreviewElement);
        });

        renderPreview();

        return;
    }

    // If there's no ID, redirect back to Product.html
    location.href = PRODUCT_PAGE_ROUTE;
}

function renderPreview()
{
    imagePreviewElement.src = imageInputElement.value;
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