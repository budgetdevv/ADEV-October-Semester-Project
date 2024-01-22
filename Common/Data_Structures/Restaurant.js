export class Restaurant
{
    id;
    name;
    address;
    description;
    rating;
    cuisine_type;
    opening_date;
    image_url;

    constructor(jsonObject)
    {
        Object.assign(this, jsonObject);
    }

    static getDefaultRestaurant()
    {
        let restaurant = new Restaurant();

        restaurant.name = "New Restaurant";
        restaurant.address = "( Insert address here )";
        restaurant.description = "( Insert description here )";
        restaurant.rating = 0;
        restaurant.cuisine_type = "( Insert cuisine here )";
        // Date.now() will NOT work due to improper format. Too lazy to convert, so just let SQL initialize it
        // restaurant.opening_date = Date.now();
        restaurant.image_url = "https://dramscotland.co.uk/wp-content/uploads/2021/08/Gordon-Ramsay-.jpg";

        return restaurant;
    }
}