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

    static getDefault(picture_url)
    {
        let product = new Product();

        product.name = "New Product";
        product.description = "";
        product.price = product.category_id = 0;
        product.category_id = 1;
        product.picture = picture_url;

        return product;
    }
}