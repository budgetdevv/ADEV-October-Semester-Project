import { isNullOrWhitespace } from "../Helpers.js";

export class Product
{
    id;
    name;
    description;
    price;
    category_id;
    // category_name;
    picture;

    constructor(jsonObject)
    {
        Object.assign(this, jsonObject);
    }

    validateAndReturnErrorsIfAny()
    {
        let errors = "";

        // if (isNullOrWhitespace(self.name))
        // {
        //     errors += "Product name cannot be null or empty! \n";
        // }

        if (this.price < 0)
        {
            errors += "Product price may NOT be negative!"
        }

        return errors;
    }
}