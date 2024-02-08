import { pxToNumber, numberToPx, elementHideScrollBar } from "../../Common/Helpers.js";

export class FilterTag
{
    /**
     * @type { String }
     * @private
     */
    id;

    /**
     * @type { String }
     * @private
     */
    text;

    /**
     * @type { String }
     * @private
     */
    value;

    /**
     * @type { String }
     * @private
     */
    allowDupe;

    // Too lazy to implement click for now
    onclick;

    constructor(id, text, value, allowDupe)
    {
        this.id = id;
        this.text = text;
        this.value = value;
        this.allowDupe = allowDupe;
    }
}

export class FilterInput
{
    /**
     * @type { HTMLElement }
     * @private
     */
    #backgroundTextInputElement;

    /**
     * @type { HTMLElement }
     * @private
     */
    #wrapperElement;

    /**
     * @type { HTMLElement }
     * @private
     */
    #innerTextWrapperElement;

    /**
     * @type { HTMLElement }
     * @private
     */
    #innerTextInputElement

    /**
     * @type { HTMLElement }
     * @private
     */
    #dropdownWrapperElement

    /**
     * @type { HTMLElement }
     * @private
     */
    #dropdownElement;

    /**
     * @type { ResizeObserver }
     * @private
     */
    #resizeObserver;

    /**
     * @type { MutationObserver }
     * @private
     */
    #mutationObserver;

    /**
     * @type { function }
     * @private
     */
    oninput;

    /**
     * @type { function }
     * @private
     */
    ontagadded;

    /**
     * @type { function }
     * @private
     */
    ontagremoved;

    // // Technically possible to make it a set instead of "dictionary", but set in JS doesn't support custom equality comparison
    // tags = {};

    tags = [];

    static get #SEARCH_BAR_CLASS()
    {
        return "search-bar";
    }

    static get #SEARCH_BAR_BACKGROUND_TEXT_INPUT_CLASS()
    {
        return "search-bar-background-text-input";
    }

    static get #SEARCH_BAR_INNER_WRAPPER_CLASS()
    {
        return "search-bar-inner-wrapper";
    }

    static get #SEARCH_BAR_INNER_TEXT_INPUT_CLASS()
    {
        return "search-bar-inner-text-input";
    }

    static get #SEARCH_BAR_DROPDOWN_WRAPPER_CLASS()
    {
        return "search-bar-dropdown-wrapper";
    }

    static get #SEARCH_BAR_DROPDOWN_CLASS()
    {
        return "search-bar-dropdown";
    }

    static get #DROPDOWN_VISIBLE_CLASS()
    {
        return "dropdown-visible";
    }

    constructor(parentID)
    {
        let wrapperElement = this.#wrapperElement = document.createElement("div");
        let wrapperElementStyle = wrapperElement.style;
        wrapperElement.classList.add(FilterInput.#SEARCH_BAR_CLASS);

        let backgroundTextInputElement = this.#backgroundTextInputElement = document.createElement("input")
        let backgroundTextInputElementClassList = backgroundTextInputElement.classList;
        backgroundTextInputElementClassList.add("input");
        backgroundTextInputElementClassList.add("is-black");
        backgroundTextInputElementClassList.add(FilterInput.#SEARCH_BAR_BACKGROUND_TEXT_INPUT_CLASS)
        backgroundTextInputElement.id = "filter";

        let innerTextWrapperElement = this.#innerTextWrapperElement = document.createElement("div");
        innerTextWrapperElement.classList.add(FilterInput.#SEARCH_BAR_INNER_WRAPPER_CLASS);

        elementHideScrollBar(innerTextWrapperElement);

        let innerTextInputElement = this.#innerTextInputElement = FilterInput.#createInnerTextInput();

        innerTextWrapperElement.append(innerTextInputElement);
        innerTextWrapperElement.append(FilterInput.#createTag("X"));
        innerTextWrapperElement.append(FilterInput.#createTag("ZZZ"));

        let dropdownWrapperElement = this.#dropdownWrapperElement = document.createElement("div");
        dropdownWrapperElement.classList.add(FilterInput.#SEARCH_BAR_DROPDOWN_WRAPPER_CLASS);

        let dropdownElement = this.#dropdownElement = document.createElement("div");
        let dropdownElementClassList = dropdownElement.classList;
        dropdownElementClassList.add(FilterInput.#SEARCH_BAR_DROPDOWN_CLASS);
        dropdownElementClassList.add("dropdown-content");
        dropdownElement.setAttribute("hidden", "");

        dropdownWrapperElement.append(dropdownElement);

        let testDropdownItem = document.createElement("a");
        testDropdownItem.classList.add("dropdown-item");
        testDropdownItem.innerText = "Hi";

        dropdownElement.append(testDropdownItem);

        wrapperElement.append(innerTextWrapperElement);
        wrapperElement.append(backgroundTextInputElement);
        wrapperElement.append(dropdownWrapperElement);

        let textInputParentElement = document.getElementById(parentID);
        textInputParentElement.append(wrapperElement);

        // this.#toggleDropdown();

        let instance = this;

        innerTextInputElement.addEventListener("focus", function (_)
        {
            instance.#toggleDropdown();
        });

        innerTextInputElement.addEventListener("blur", function (_)
        {
            instance.#toggleDropdown();
        });
    }

    /**
     * @param { HTMLElement } element
     */
    static #autoSizeTextElement(element)
    {
        // let { borderLeftWidth, borderRightWidth } = window.getComputedStyle(element);

        // // Get rid of "px"
        // borderLeftWidth = borderLeftWidth.slice(0, -2);
        // borderRightWidth = borderLeftWidth.slice(0, -2);

        let { borderLeftWidth, borderRightWidth } = window.getComputedStyle(element);

        // Remove "px"
        const BORDER_WIDTH = pxToNumber(borderLeftWidth) + pxToNumber(borderRightWidth);

        let style = element.style;
        style.width = 0;

        // console.log(`${borderLeftWidth.slice(0, -2)} | ${borderRightWidth.slice(0, -2)} | ${element.scrollWidth}`);

        style.width = `${element.scrollWidth + BORDER_WIDTH}px`
    }

    static #createInnerTextInput(referenceClass, fullWidth = true)
    {
        let textInput = document.createElement("input");

        let classList = textInput.classList;

        classList.add("input");
        classList.add("is-black");
        classList.add(FilterInput.#SEARCH_BAR_INNER_TEXT_INPUT_CLASS);

        let style = textInput.style;

        if (fullWidth)
        {
            style.flexGrow = 1;
        }

        else
        {
            FilterInput.#autoSizeTextElement(textInput);
            textInput.addEventListener("input", function (event)
            {
                FilterInput.#autoSizeTextElement(event.srcElement);
            });
        }

        return textInput;
    }

    static #createTag(text, value)
    {
        let tag = document.createElement("span");
        // tag.style.height = "auto";

        let tagClassList = tag.classList;
        tagClassList.add("tag");
        tagClassList.add("is-success");
        tagClassList.add("is-medium");
        tag.dataset["value"] = value;

        let crossButton = document.createElement("button");
        let crossButtonClassList = crossButton.classList;
        crossButtonClassList.add("delete");
        crossButtonClassList.add("is-small");
        tag.textContent = text;

        tag.append(crossButton);

        return tag;
    }

    #toggleDropdown()
    {
        this.#backgroundTextInputElement.classList.toggle(FilterInput.#DROPDOWN_VISIBLE_CLASS);
        this.#dropdownElement.toggleAttribute("hidden");
    }
}