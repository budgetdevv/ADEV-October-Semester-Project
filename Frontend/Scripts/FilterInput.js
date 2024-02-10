import { elementHide, elementUnhide, elementHideScrollBar, pxToNumber } from "../../Common/Helpers.js";

export class FilterInput
{
    //#region Tag
    static Tag = class
    {
        /**
         * @type { HTMLElement }
         * @public
         */
        tagElement;

        /**
         * @type { HTMLElement }
         * @public
         */
        textElement;

        /**
         * @type { HTMLElement }
         * @public
         */
        crossButtonElement;

        /**
         * @type { function(FilterInput.Tag, String):String }
         * @public
         */
        textFormatterCallback = null;

        /**
         * @type { function(FilterInput.Tag, String):boolean }
         * @public
         */
        shouldDisplaySelectedTagCallback = null;

        /**
         * @param { FilterInput.Tag } tagInstance
         * @param { String } text
         */
        static #defaultSelectedTagTextFormatterCallback(tagInstance, text)
        {
            return text;
        }

        /**
         * @param { FilterInput.Tag } tagInstance
         * @param { String } value
         */
        static #defaultShouldDisplaySelectedTagCallback(tagInstance, value)
        {
            return value != null;
        }

        /**
         * @type { Map<HTMLElement, FilterInput.Tag> }
         * @private
         */
        static #tagElementToTagMap = new Map();

        // #eventListeners;

        constructor()
        {
            let tagElement = this.tagElement = document.createElement("span");

            let tagElementClassList = tagElement.classList;
            tagElementClassList.add("tag");
            tagElementClassList.add("is-warning");
            tagElementClassList.add("is-medium");

            let textElement = this.textElement = document.createElement("span");
            tagElement.append(textElement);

            let crossButtonElement = this.crossButtonElement = document.createElement("button");
            let crossButtonClassList = crossButtonElement.classList;
            crossButtonClassList.add("delete");
            crossButtonClassList.add("is-small");

            FilterInput.Tag.#tagElementToTagMap.set(tagElement, this);
        }

        /**
         * @param { HTMLElement } tagElement
         * @return { FilterInput.Tag }
         */
        static getTagFromHTMLElement(tagElement)
        {
            return FilterInput.Tag.#tagElementToTagMap.get(tagElement);
        }

        get crossButtonEnabled()
        {
            return this.tagElement.children.length !== 0;
        }

        set crossButtonEnabled(enabled)
        {
            let tagElement = this.tagElement;
            let crossButtonElement = this.crossButtonElement;

            if (enabled)
            {
                tagElement.append(crossButtonElement);
            }

            else
            {
                tagElement.remove(crossButtonElement)
            }
        }

        get text()
        {
            return this.textElement.innerText;
        }

        set text(text)
        {
            const SELECTED_TAG_TEXT_FORMATTER_CALLBACK = this.textFormatterCallback ?? FilterInput.Tag.#defaultSelectedTagTextFormatterCallback;
            this.textElement.innerText = SELECTED_TAG_TEXT_FORMATTER_CALLBACK(this, text);
        }

        get key()
        {
            return this.tagElement.dataset["key"];
        }

        set key(key)
        {
            this.tagElement.dataset["key"] = key;
        }

        get value()
        {
            return this.tagElement.dataset["value"];
        }

        set value(value)
        {
            const SHOULD_DISPLAY_SELECTED_TAG_CALLBACK = this.shouldDisplaySelectedTagCallback ?? FilterInput.Tag.#defaultShouldDisplaySelectedTagCallback;

            if (SHOULD_DISPLAY_SELECTED_TAG_CALLBACK(this, value))
            {
                this.unhide();
            }

            else
            {
                this.hide();
            }

            this.tagElement.dataset["value"] = value;
        }

        hide()
        {
            elementHide(this.tagElement);
        }

        unhide()
        {
            elementUnhide(this.tagElement);
        }

        /**
         * @param { String } eventName
         * @param { function(Event, FilterInput.Tag):void } callback
         */
        addEventListener(eventName, callback)
        {
            let listener = event =>
            {
                callback(event, this);
            };

            // this.#eventListeners.append(listener);
            this.tagElement.addEventListener(eventName, listener)
        }

        dispose()
        {
            let tagElement = this.tagElement;

            // Modern browsers clean up event listeners properly when the DOM element is destroyed.

            // for (let listener of this.#eventListeners)
            // {
            //     tagElement.removeEventListener(listener);
            // }

            tagElement.remove();

            FilterInput.Tag.#tagElementToTagMap.delete(tagElement);
        }
    };
    //#endregion

    //#region TagDefinition
    static TagDefinition = class
    {
        /**
         * @type { FilterInput }
         * @private
         */
        #filterInputInstance;

        /**
         * @type { String }
         * @private
         */
        #key;

        /**
         * @type { FilterInput.Tag }
         * @private
         */
        #selectionTag

        /**
         * @type { FilterInput.Tag }
         * @private
         */
        #selectedAutocompleteTag

        /**
         * @type { HTMLElement }
         * @private
         */
        #autocompleteDropdownItemElement;

        /**
         * @param { String } key
         * @param { FilterInput } filterInputInstance
         */
        constructor(key, filterInputInstance)
        {
            this.#filterInputInstance = filterInputInstance;
            this.#key = key;

            let dropdownItemElement = this.#autocompleteDropdownItemElement = document.createElement("a");
            let DropdownItemClassList = dropdownItemElement.classList;
            DropdownItemClassList.add("dropdown-item");
            DropdownItemClassList.add(FilterInput.#SEARCH_BAR_DROPDOWN_ITEM_CLASS);

            let selectedTag = this.#selectionTag = new FilterInput.Tag();
            selectedTag.key = key;
            selectedTag.value = null;
            selectedTag.textFormatterCallback = (tag, text) =>
            {
                return `${tag.key}: ${text}`
            };

            selectedTag.text = "";
            selectedTag.value = null;
            selectedTag.crossButtonEnabled = true;s
            filterInputInstance.#innerTextWrapperElement.append(selectedTag.tagElement)

            filterInputInstance.#dropdownElement.append(dropdownItemElement);
        }

        get autoCompleteDropdownText()
        {
            return this.#autocompleteDropdownItemElement.innerText;
        }

        set autoCompleteDropdownText(text)
        {
            this.#autocompleteDropdownItemElement.innerText = text;
        }

        /**
         * @param { String } text
         * @param { String } value
         */
        addTagAutocomplete(text, value)
        {
            let autocompleteTag = new FilterInput.Tag();
            autocompleteTag.key = this.#key;
            autocompleteTag.text = text;
            autocompleteTag.value = value;

            this.#autocompleteDropdownItemElement.append(autocompleteTag.tagElement);

            autocompleteTag.addEventListener("click", (_, tag) => this.#onAutoCompleteTagSelected(tag))
        }

        #onAutoCompleteTagSelected(autoCompleteTag)
        {
            let filterInputInstance = this.#filterInputInstance;
            filterInputInstance.#innerTextInputElement.blur();

            // Perhaps consider making selectedAutocompleteTag a setter property...
            let selectionTag = this.#selectionTag;
            selectionTag.text = autoCompleteTag.text;
            selectionTag.value = autoCompleteTag.value;

            this.#selectedAutocompleteTag = autoCompleteTag;
        }

        get key()
        {
            return this.#key;
        }
    };
    //#endregion

    //#region Fields
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
    onInput;

    /**
     * @type { function }
     * @private
     */
    onTagSelected;

    /**
     * @type { function }
     * @private
     */
    onTagDeselected;

    tags = [];
    //#endregion

    //#region CSS_CLASS_CONSTANTS
    static get SEARCH_BAR_CLASS()
    {
        return "search-bar";
    }

    static get SEARCH_BAR_BACKGROUND_TEXT_INPUT_CLASS()
    {
        return "search-bar-background-text-input";
    }

    static get SEARCH_BAR_INNER_WRAPPER_CLASS()
    {
        return "search-bar-inner-wrapper";
    }

    static get SEARCH_BAR_INNER_TEXT_INPUT_CLASS()
    {
        return "search-bar-inner-text-input";
    }

    static get SEARCH_BAR_DROPDOWN_WRAPPER_CLASS()
    {
        return "search-bar-dropdown-wrapper";
    }

    static get SEARCH_BAR_DROPDOWN_CLASS()
    {
        return "search-bar-dropdown";
    }

    static get #SEARCH_BAR_DROPDOWN_ITEM_CLASS()
    {
        return "search-bar-dropdown-item";
    }

    static get DROPDOWN_VISIBLE_CLASS()
    {
        return "dropdown-visible";
    }
    //#endregion

    constructor(parentID)
    {
        let wrapperElement = this.#wrapperElement = document.createElement("div");
        wrapperElement.classList.add(FilterInput.SEARCH_BAR_CLASS);

        let backgroundTextInputElement = this.#backgroundTextInputElement = document.createElement("input")
        backgroundTextInputElement.setAttribute("readonly", "");

        let backgroundTextInputElementClassList = backgroundTextInputElement.classList;
        backgroundTextInputElementClassList.add("input");
        backgroundTextInputElementClassList.add("is-black");
        backgroundTextInputElementClassList.add(FilterInput.SEARCH_BAR_BACKGROUND_TEXT_INPUT_CLASS);

        let innerTextWrapperElement = this.#innerTextWrapperElement = document.createElement("div");
        innerTextWrapperElement.classList.add(FilterInput.SEARCH_BAR_INNER_WRAPPER_CLASS);

        elementHideScrollBar(innerTextWrapperElement);

        let innerTextInputElement = this.#innerTextInputElement = FilterInput.#createInnerTextInput();
        innerTextInputElement.setAttribute("placeholder", "Input search item");
        innerTextInputElement.id = "filter";
        innerTextWrapperElement.append(innerTextInputElement);

        let dropdownWrapperElement = this.#dropdownWrapperElement = document.createElement("div");
        dropdownWrapperElement.classList.add(FilterInput.SEARCH_BAR_DROPDOWN_WRAPPER_CLASS);

        let dropdownElement = this.#dropdownElement = document.createElement("div");
        let dropdownElementClassList = dropdownElement.classList;
        dropdownElementClassList.add(FilterInput.SEARCH_BAR_DROPDOWN_CLASS);
        dropdownElementClassList.add("dropdown-content");
        dropdownWrapperElement.append(dropdownElement);

        wrapperElement.append(innerTextWrapperElement);
        wrapperElement.append(backgroundTextInputElement);
        wrapperElement.append(dropdownWrapperElement);

        let textInputParentElement = document.getElementById(parentID);
        textInputParentElement.append(wrapperElement);

        let def = this.addTagDefinition("Category");
        def.autoCompleteDropdownText = "Selected Category: ";
        def.addTagAutocomplete("None", 1);
        def.addTagAutocomplete("Food", 2);
        def.addTagAutocomplete("Tech", 3);

        def = this.addTagDefinition("Sort");
        def.autoCompleteDropdownText = "Sort By: ";
        def.addTagAutocomplete("ID", 1);
        def.addTagAutocomplete("Name", 2);
        def.addTagAutocomplete("Price", 3);
        def.addTagAutocomplete("Category", 4);

        let instance = this;

        innerTextInputElement.addEventListener("focus", function (_)
        {
            instance.#showDropdown();
        });

        innerTextInputElement.addEventListener("blur", function (_)
        {
            instance.#hideDropdown();
        });

        dropdownElement.addEventListener("mousedown", function (event)
        {
            // Prevent onblur() should the dropdown be clicked.
            event.preventDefault();
        });

        this.#hideDropdown();
    }

    addTagDefinition(key)
    {
        let def = new FilterInput.TagDefinition(key, this);
        this.tags.push(def);
        return def;
    }

    /**
     * @param { HTMLElement } element
     */
    static #autoSizeTextElement(element)
    {
        let { borderLeftWidth, borderRightWidth } = window.getComputedStyle(element);

        // Remove "px"
        const BORDER_WIDTH = pxToNumber(borderLeftWidth) + pxToNumber(borderRightWidth);

        let style = element.style;
        style.width = 0; // This line is necessary, to force element.scrollWidth to be the desired width.
        style.width = `${element.scrollWidth + BORDER_WIDTH}px`
    }

    static #createInnerTextInput(referenceClass, fullWidth = true)
    {
        let textInput = document.createElement("input");

        let classList = textInput.classList;

        classList.add("input");
        classList.add("is-black");
        classList.add(FilterInput.SEARCH_BAR_INNER_TEXT_INPUT_CLASS);

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
                FilterInput.#autoSizeTextElement(event.currentTarget);
            });
        }

        return textInput;
    }

    #showDropdown()
    {
        this.#backgroundTextInputElement.classList.add(FilterInput.DROPDOWN_VISIBLE_CLASS);
        elementUnhide(this.#dropdownElement);
    }

    #hideDropdown()
    {
        this.#backgroundTextInputElement.classList.remove(FilterInput.DROPDOWN_VISIBLE_CLASS);
        elementHide(this.#dropdownElement);
    }
}