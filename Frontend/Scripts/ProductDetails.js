import { Product } from "../../Common/Data_Structures/Product.js";
import { PRODUCTS_ROUTE_NAME, CATEGORIES_ROUTE_NAME } from "/Common/Constants.js"

const SUBMIT_BUTTON_ID = "submit_button",
      CATEGORY_ID = "category_id",
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

        if (fieldName !== CATEGORY_ID)
        {
            switch (typeof value)
            {
                case "string":
                    break;
                case "number":
                    value = `${value}`;
                    break;
            }

            element.value = value;
        }

        else
        {
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
            element.value = value;
        }
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
    location.href = PRODUCT_PAGE_URL;
}