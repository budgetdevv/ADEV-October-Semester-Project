import { PRODUCTS_ROUTE_NAME as ROUTE_NAME } from "/Common/Constants.js"
import { Product } from "../../Common/Data_Structures/Product.js";

// Export function(s). This is required if we treat this .js as a module.
window.onCreate = onCreate;
async function onCreate()
{
    const RESTAURANT = Product.getDefault(document.getElementById("image_url").value);

    const RESPONSE = await fetch(ROUTE_NAME,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(RESTAURANT)
        });

    alert(`New product created! ID: ${await RESPONSE.text()}`);
    location.href = "../Pages/Product.html"
}