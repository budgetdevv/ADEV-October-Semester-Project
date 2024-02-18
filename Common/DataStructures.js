import { isNullOrWhitespace } from "./Helpers.js";
import { CATEGORY_FILTER_TAG_KEY, MIN_PRICE_FILTER_TAG_KEY, MAX_PRICE_FILTER_TAG_KEY, PRODUCT_ID_PREFIX } from "./Constants.js";

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

    /**
     * @param { string } filterTextUpperCased
     * @param { FilterInput } filterInput
     */
    shouldDisplay(filterTextUpperCased, filterInput)
    {
        let CATEGORY_FILTER = filterInput.tryGetTagDefinition(CATEGORY_FILTER_TAG_KEY).selectedValue;

        let filterTextMatches = 0;

        if (CATEGORY_FILTER == null || this.category_id === CATEGORY_FILTER)
        {
            for (let [fieldName, fieldValue] of Object.entries(this))
            {
                if (fieldName !== "price")
                {
                    if ((typeof fieldValue) !== "string")
                    {
                        fieldValue = `${fieldValue}`;
                    }

                    fieldValue = fieldValue.toUpperCase();

                    let FILTER_DEFINITION = filterInput.tryGetTagDefinition(fieldName);

                    if (FILTER_DEFINITION !== undefined)
                    {
                        /**
                         * @type { String }
                         */
                        const SELECTED_VALUE = FILTER_DEFINITION.selectedValue;

                        // alert(`${fieldName} | ${SELECTED_VALUE}`)

                        if (!fieldValue.includes(SELECTED_VALUE.toUpperCase()))
                        {
                            return false;
                        }
                    }

                    if (fieldValue.includes(filterTextUpperCased))
                    {
                        // alert(`${fieldName} | ${FILTER_DEFINITION?.selectedValue} | ${fieldValue} | ${filterTextUpperCased}`)

                        filterTextMatches++;
                    }
                }

                else
                {
                    const CURRENT_MIN_PRICE = filterInput.tryGetTagDefinition(MIN_PRICE_FILTER_TAG_KEY).selectedValue;
                    const CURRENT_MAX_PRICE = filterInput.tryGetTagDefinition(MAX_PRICE_FILTER_TAG_KEY).selectedValue;

                    fieldValue = Number(fieldValue);

                    // alert(`${CURRENT_MIN_PRICE} | ${CURRENT_MAX_PRICE} | ${typeof fieldValue}`);

                    if (isNaN(fieldValue) || isNaN(CURRENT_MIN_PRICE)  || isNaN(CURRENT_MAX_PRICE)  || CURRENT_MIN_PRICE > fieldValue || fieldValue > CURRENT_MAX_PRICE)
                    {
                        return false;
                    }
                }
            }

            if (filterTextMatches > 0)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * @param { Category[] } categories
     */
    getProductDisplayHTML(categories)
    {
        const ID = this.id;

        let productName = this.name;
        productName = (productName !== "") ? productName : "<i>( No product name )</i>";

        let product_desc = this.description;
        product_desc = (product_desc !== "") ? product_desc : "<b>( No product description )</b>";

        // Index are 0-based
        const CATEGORY_NAME = categories[this.category_id - 1].name;

        const PRICE = this.price;

        // It is a float, so !== will fail. It is also awkward to use !=, so I opted to cast via parseInt()
        const PRICE_TEXT = (parseInt(PRICE) !== 0) ? `${PRICE}` : "Free!";

        const IMAGE_URL = this.picture;

        const HTML =
        `
        <div class="card" id="${PRODUCT_ID_PREFIX}${ID}">
            <div class="card-image">
                <span class="tag is-medium product-image-tag">${CATEGORY_NAME}</span>
                <span class="tag is-medium product-image-tag" style="right: 0"><i class="fa-solid fa-dollar-sign"></i>&nbsp${PRICE_TEXT}</span>
              
                <a class="product-image-wrapper" onclick="onShowModalForProductImage('${productName}', '${IMAGE_URL}');">
                    <div class="product-image-hover-text">Click to preview</div>
                    <figure class="image is-4by3 product-image">
                        <img src="${IMAGE_URL}" onerror="onProductImageLoadFailure(this)" alt="Image missing" />
                    </figure>
                </a>
            </div>
            
            <header class="card-header has-background-warning">
                <p class="card-header-title is-centered truncate_text">
                    ${productName}
                </p>
            </header>
            
            <div class="card-content">
                <p class="content wrap_text truncate_text" onclick="onToggleFullDescription(this)">
                    ${product_desc}
                </p>
            </div>
        </div>
        
        <div class="buttons has-addons"">
            <button class="button is-half is-success" style="width: 50%" onClick="location.href = '/ProductDetails.html?ID=${ID}'">Details & Edit</button>
            <button class="button is-half is-danger" style="width: 50%" onclick="onDelete(${ID}, '${productName}');">Delete!!!</button>
        </div>
        `;

        return HTML;
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

export class Category
{
    /**
     * @type { number }
     * @public
     */
    id;

    /**
     * @type { string }
     * @public
     */
    name;

    constructor(jsonObject)
    {
        Object.assign(this, jsonObject);
    }
}