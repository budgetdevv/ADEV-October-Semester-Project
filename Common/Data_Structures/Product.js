export class Product
{
    id;
    name;
    description;
    price;
    category_id;
    category_name;
    picture;

    constructor(jsonObject)
    {
        Object.assign(this, jsonObject);
    }

    static getDefault()
    {
        let product = new Product();

        product.name = "New Product";
        product.description = "( Insert description here )";
        product.price = product.category_id = 0;
        product.picture = "https://dramscotland.co.uk/wp-content/uploads/2021/08/Gordon-Ramsay-.jpg";

        return product;
    }
}