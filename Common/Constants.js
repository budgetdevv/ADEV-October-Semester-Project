export const PRODUCTS_ROUTE_NAME = "/products",
             PRODUCTS_TABLE_NAME = "product",
             CATEGORIES_ROUTE_NAME = "/categories",
             CATEGORIES_TABLE_NAME = "category",
             RESET_ROUTE = `/reset`;

export const PRODUCT_PAGE_ROUTE = "/Product.html";

// We make HTML elements' IDs the same as their class field representation, which in turn, is the same as field name in DB.
export const CATEGORY_ID = "category_id",
             IMAGE_INPUT_ID = "picture",
             IMAGE_PREVIEW_ID = "image_preview";

export const NAVBAR_BURGER_ID = "navbar_burger",
             NAVBAR_MENU_ID = "navbar_menu";

export const JSON_HEADER = { "Content-Type": "application/json" };

export const PRODUCT_ID_PREFIX = "product_";

export const CATEGORY_FILTER_TAG_KEY = "Category",
             SORT_FILTER_TAG_KEY = "Sort",
             ID_FILTER_TAG_KEY = "ID",
             NAME_FILTER_TAG_KEY = "Name",
             DESCRIPTION_FILTER_TAG_KEY = "Description",
             MIN_PRICE_FILTER_TAG_KEY = "Price ( Min )",
             MAX_PRICE_FILTER_TAG_KEY = "Price ( Max )";

export const MAX_PRICE = 9_999_999.99;

export class CSSClassConstants
{
    static get IS_ACTIVE()
    {
        return "is-active";
    }

    static get HIDDEN()
    {
        return "hidden";
    }

    static get SEARCH_BAR()
    {
        return "search-bar";
    }

    static get SEARCH_BAR_BACKGROUND_TEXT_INPUT()
    {
        return "search-bar-background-text-input";
    }

    static get SEARCH_BAR_INNER_WRAPPER()
    {
        return "search-bar-inner-wrapper";
    }

    static get SEARCH_BAR_INNER_TEXT_INPUT()
    {
        return "search-bar-inner-text-input";
    }

    static get SEARCH_BAR_TAG()
    {
        return "search-bar-tag";
    }

    static get SEARCH_BAR_DROPDOWN_WRAPPER()
    {
        return "search-bar-dropdown-wrapper";
    }

    static get SEARCH_BAR_DROPDOWN()
    {
        return "search-bar-dropdown";
    }

    static get SEARCH_BAR_DROPDOWN_ITEM()
    {
        return "search-bar-dropdown-item";
    }

    static get DROPDOWN_VISIBLE()
    {
        return "dropdown-visible";
    }

    static get SEARCH_BAR_DROPDOWN_ITEM_LABEL_WRAPPER()
    {
        return "search-bar-dropdown-item-label-wrapper";
    }
    
    static get SEARCH_BAR_DROPDOWN_ITEM_LABEL()
    {
        return "search-bar-dropdown-item-label";
    }

    static get SEARCH_BAR_DROPDOWN_ITEM_DESCRIPTION()
    {
        return "search-bar-dropdown-item-description";
    }
}