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
    #textInputElement;

    /**
     * @type { HTMLElement }
     * @private
     */
    #wrapperElement;

    /**
     * @type { HTMLElement }
     * @private
     */
    #textWrapperElement;

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

    constructor(parentID)
    {
        let wrapperElement = this.#wrapperElement = document.createElement("div");
        let wrapperElementStyle = wrapperElement.style;
        wrapperElement.classList.add("hero-search-bar");

        let backgroundTextInputElement = this.#textInputElement = document.createElement("input")
        let backgroundTextInputElementClassList = backgroundTextInputElement.classList;
        backgroundTextInputElementClassList.add("input");
        backgroundTextInputElementClassList.add("is-black");
        backgroundTextInputElementClassList.add("hero-search-bar-background-text-input")
        backgroundTextInputElement.id = "filter";

        let textWrapperElement = this.#textWrapperElement = document.createElement("div");
        textWrapperElement.classList.add("hero-search-bar-inner-wrapper");
        let textWrapperElementStyle = textWrapperElement.style;

        textWrapperElementStyle.position = "relative";
        textWrapperElementStyle.zIndex = 1;

        // textWrapperElementStyle.backgroundColor = "black";
        textWrapperElementStyle.display = "flex";
        textWrapperElementStyle.alignItems = "center";
        textWrapperElementStyle.overflowX = "scroll";


        elementHideScrollBar(textWrapperElement);

        textWrapperElement.append(FilterInput.#createInnerTextInput());
        textWrapperElement.append(FilterInput.#createTag("X"));
        textWrapperElement.append(FilterInput.#createTag("ZZZ"));

        let dropdownWrapperElement = this.#dropdownWrapperElement = document.createElement("div");
        dropdownWrapperElement.classList.add("hero-search-bar-dropdown-wrapper");

        let dropdownElement = this.#dropdownElement = document.createElement("div");
        let dropdownElementClassList = dropdownElement.classList;
        dropdownElementClassList.add("hero-search-bar-dropdown");
        dropdownElementClassList.add("dropdown-content");

        dropdownWrapperElement.append(dropdownElement);

        let testDropdownItem = document.createElement("a");
        testDropdownItem.classList.add("dropdown-item");
        testDropdownItem.innerText = "Hi";

        dropdownElement.append(testDropdownItem);

        wrapperElement.append(textWrapperElement);
        wrapperElement.append(backgroundTextInputElement);
        wrapperElement.append(dropdownWrapperElement);


        let textInputParentElement = document.getElementById(parentID);
        textInputParentElement.append(wrapperElement);
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
        classList.add("hero-search-bar-inner-text-input");

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
}