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



    constructor(textInputID)
    {
        let wrapperElement = this.#wrapperElement = document.createElement("div");
        let wrapperElementStyle = wrapperElement.style;
        wrapperElementStyle.position = "relative";

        let textInputElement = this.#textInputElement = document.getElementById(textInputID);
        let textInputElementClassList = textInputElement.classList;

        let textInputElementStyle = textInputElement.style;
        textInputElementStyle.position = "absolute";
        textInputElementStyle.top = textInputElementStyle.left = 0;

        let textWrapperElement = this.#textWrapperElement = document.createElement("div");
        let textWrapperElementStyle = textWrapperElement.style;

        const TEXT_INPUT_ELEMENT_Z_INDEX = window.getComputedStyle(textInputElement).zIndex;
        textWrapperElementStyle.position = "relative";
        textWrapperElementStyle.zIndex = TEXT_INPUT_ELEMENT_Z_INDEX === "auto" ? 1 : parseInt(TEXT_INPUT_ELEMENT_Z_INDEX) + 1;

        // textWrapperElementStyle.backgroundColor = "black";
        textWrapperElementStyle.display = "flex";
        textWrapperElementStyle.alignItems = "center";
        textWrapperElementStyle.overflowX = "scroll";
        elementHideScrollBar(textWrapperElement);

        textWrapperElement.append(FilterInput.#createInnerTextInput(textInputElementClassList));
        textWrapperElement.append(FilterInput.#createTag("ZZZ"));

        let dropdownElement = this.#dropdownElement = document.createElement("div");

        dropdownElement.classList.add("dropdown-content");

        let testDropdownItem = document.createElement("a");
        testDropdownItem.classList.add("dropdown-item");
        testDropdownItem.innerText = "Hi";

        dropdownElement.append(testDropdownItem);

        let textInputParentElement = textInputElement.parentElement;

        wrapperElement.append(textWrapperElement);
        wrapperElement.append(textInputElement);
        wrapperElement.append(dropdownElement);

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
        textInput.classList = referenceClass;

        let style = textInput.style;
        // style.display = "inline-block";
        // style.border = "none";
        style.borderColor = "transparent";
        style.background = "none";
        // style.height = "100%";

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