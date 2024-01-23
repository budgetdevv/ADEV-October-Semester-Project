import {Product} from "../../Common/Data_Structures/Product.js";

const ROUTE_NAME = "/restaurants",
      NAME_ID = "Name",
      ADDRESS_ID = "Address",
      DESCRIPTION_ID = "Description",
      RATING_ID = "Rating",
      CUISINE_TYPE_ID = "CuisineType",
      OPENING_DATE_ID = "OpeningDate",
      IMAGE_URL_ID = "ImageURL",
      SUBMIT_BUTTON_ID = "SubmitButton",
      RESTAURANT_PAGE_URL = "./Product.html";

document.addEventListener('DOMContentLoaded', onLoad);

async function onLoad()
{
    let queries = new URLSearchParams(location.search);

    let restaurantID = queries.get("ID");

    if (restaurantID == null)
    {
        // If there's no ID, redirect back to Product.html
        location.href = RESTAURANT_PAGE_URL
        return;
    }

    let submitButton = document.getElementById(SUBMIT_BUTTON_ID);

    submitButton.setAttribute("onclick", `onSubmit(${restaurantID})`)

    const RESPONSE = await fetch(`${ROUTE_NAME}/${restaurantID}`);

    let RESPONSE_TEXT = await RESPONSE.text();

    if (RESPONSE_TEXT === "{}")
    {
        location.href = RESTAURANT_PAGE_URL
        return;
    }

    let restaurant = new Product(JSON.parse(RESPONSE_TEXT));

    document.getElementById(NAME_ID).value = restaurant.name;
    document.getElementById(ADDRESS_ID).value = restaurant.address;
    document.getElementById(DESCRIPTION_ID).value = restaurant.description;
    document.getElementById(RATING_ID).value = restaurant.rating;
    document.getElementById(CUISINE_TYPE_ID).value = restaurant.cuisine_type;

    let openingDate = new Date(restaurant.opening_date);

    let day = openingDate.getDay();
    day = day.length === 2 ? day : `0${day}`;

    // Month is always 0-based
    let month = `${openingDate.getMonth() + 1}`;
    // Pad with zero if single digit
    month = month.length === 2 ? month : `0${month}`;
    let year = openingDate.getFullYear();

    document.getElementById(OPENING_DATE_ID).value = `${year}-${month}-${day}`;
    document.getElementById(IMAGE_URL_ID).value = restaurant.picture;
}

// Export this function. This is required if we treat this .js as a module.
window.onSubmit = onSubmit;

async function onSubmit(restaurantID)
{
    // Construct the restaurant object.
    let restaurant = new Product();

    restaurant.id = restaurantID;
    restaurant.name = document.getElementById(NAME_ID).value;
    restaurant.address = document.getElementById(ADDRESS_ID).value;
    restaurant.description = document.getElementById(DESCRIPTION_ID).value;
    restaurant.rating = document.getElementById(RATING_ID).value;
    restaurant.cuisine_type = document.getElementById(CUISINE_TYPE_ID).value;
    restaurant.opening_date = document.getElementById(OPENING_DATE_ID).value;
    restaurant.picture = document.getElementById(IMAGE_URL_ID).value;

    const RESPONSE = await fetch(ROUTE_NAME,
    {
        method: "PUT",
        // REMEMBER TO SET REQUEST HEADER!!!
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(restaurant)
    })

    alert(await RESPONSE.text());
    location.href = RESTAURANT_PAGE_URL;
}