import { pxToNumber, numberToPx, elementHideScrollBar } from "../../Common/Helpers.js";

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

    constructor(textInputID)
    {
        let textInputElement = this.#textInputElement = document.getElementById(textInputID);
        let textInputElementClassList = textInputElement.classList;
        let wrapperElement = this.#wrapperElement = document.createElement("div");

        // let textInputElementStyle = window.getComputedStyle(textInputElement);
        // let wrapperElementStyle = wrapperElement.style;
        //
        // wrapperElementStyle.position = "absolute";
        //
        // wrapperElementStyle.left = textInputElement.offsetLeft + "px";
        // wrapperElementStyle.top = textInputElement.offsetTop + "px";
        //
        // wrapperElementStyle.width = textInputElementStyle.width;
        // wrapperElementStyle.height = textInputElementStyle.height;
        // wrapperElementStyle.zIndex = textInputElementStyle.zIndex + 1;

        let textInputRect = textInputElement.getBoundingClientRect();
        let textInputElementStyle = window.getComputedStyle(textInputElement);
        let wrapperElementStyle = wrapperElement.style;

        wrapperElementStyle.display = "flex";
        wrapperElementStyle.position = "absolute";
        const TEXT_INPUT_ELEMENT_Z_INDEX = textInputElementStyle.zIndex;
        wrapperElementStyle.zIndex = TEXT_INPUT_ELEMENT_Z_INDEX === "auto" ? 1 : parseInt(TEXT_INPUT_ELEMENT_Z_INDEX) + 1;
        wrapperElementStyle.left = numberToPx(textInputRect.left);
        wrapperElementStyle.top = numberToPx(textInputRect.top);
        wrapperElementStyle.width = numberToPx(textInputRect.width);
        wrapperElementStyle.height = numberToPx(textInputRect.height);
        wrapperElementStyle.alignItems = "center";
        wrapperElementStyle.overflowX = "scroll";
        // wrapperElementStyle.overflowY = "hidden";

        elementHideScrollBar(wrapperElement);
        document.body.append(wrapperElement);

        wrapperElement.append(FilterInput.#createTag("ZZZ"));
        wrapperElement.append(FilterInput.#createInnerTextInput(textInputElementClassList));
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