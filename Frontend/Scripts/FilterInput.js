import {elementHide, elementHideScrollBar, elementUnhide, pxToNumber} from "../../Common/Helpers.js";

export class FilterInput
{
    static TagData = class
    {
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

        constructor(text, value)
        {
            this.text = text;
            this.value = value;
        }

        /**
         * @param { HTMLElement } tagElement
         * @return { FilterInput.TagData }
         */
        static fromTagElement(tagElement)
        {
            return new FilterInput.TagData(tagElement.children[0].innerText, tagElement.dataset["value"]);
        }

        /**
         * @param { FilterInput.TagDefinition.TagElementWrapper } tag
         */
        writeToAutocompleteTag(tag)
        {
            tag.text = this.text;
            tag.value = this.value;
        }

        /**
         * @param { FilterInput.TagDefinition.TagElementWrapper } tag
         */
        writeToSelectedTag(tag)
        {
            tag.value = this.value;
        }
    }

    static TagDefinition = class
    {
        static TagElementWrapper = class
        {
            tagElement;
            textElement;
            crossButtonElement;

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
                this.textElement.innerText = text;
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
        };

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
         * @type { FilterInput.TagDefinition.TagElementWrapper }
         * @private
         */
        #selectedTagElementWrapper

        /**
         * @type { HTMLElement }
         * @private
         */
        #autocompleteDropdownItemElement;

        /**
         * @type { FilterInput.TagData }
         * @private
         */
        #selectedTagData;

        /**
         * @type { Function }
         * @private
         */
        selectedTagTextFormatterCallback;

        /**
         * @type { Function }
         * @private
         */
        shouldDisplaySelectedTagCallback;

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

            // dropdownItemElement.innerText = ``

            // dropdownItemElement.append(FilterInput.#createTag("Test"));
            // dropdownItemElement.append(FilterInput.#createTag("Test"));
            // dropdownItemElement.append(FilterInput.#createTag("Test"));

            // elementHide(dropdownItemElement);

            // tag = FilterInput.FilterTagDefinition.#createTag(`${key}:`, key, null, true)

            let selectedTag = this.#selectedTagElementWrapper = FilterInput.TagDefinition.#createTag();

            this.selectedTagData = new FilterInput.TagData("", null);

            selectedTag.crossButtonEnabled = true;

            filterInputInstance.#innerTextWrapperElement.append(selectedTag.tagElement)

            filterInputInstance.#dropdownElement.append(dropdownItemElement);

            this.selectedTagTextFormatterCallback = this.shouldDisplaySelectedTagCallback = null;
        }

        get autoCompleteDropdownText()
        {
            return this.#autocompleteDropdownItemElement.innerText;
        }

        set autoCompleteDropdownText(text)
        {
            this.#autocompleteDropdownItemElement.innerText = text;
        }

        // static #createTag(text, key, value, includeCross)
        static #createTag()
        {
            return new FilterInput.TagDefinition.TagElementWrapper();

            // let tag = document.createElement("span");
            // // tag.style.height = "auto";
            //
            // let tagClassList = tag.classList;
            // tagClassList.add("tag");
            // tagClassList.add("is-warning");
            // tagClassList.add("is-medium");
            //
            // let dataset = tag.dataset;
            // dataset["key"] = key;
            // dataset["value"] = value;
            //
            // tag.textContent = text;
            //
            // if (includeCross)
            // {
            //     let crossButton = document.createElement("button");
            //     let crossButtonClassList = crossButton.classList;
            //     crossButtonClassList.add("delete");
            //     crossButtonClassList.add("is-small");
            //
            //     tag.append(crossButton);
            // }
            //
            // return tag;
        }

        /**
         * @param { FilterInput.TagData } tagAutocompleteDef
         */
        addTagAutocomplete(tagAutocompleteDef)
        {
            let autocompleteTag = FilterInput.TagDefinition.#createTag();
            autocompleteTag.text = tagAutocompleteDef.text;
            autocompleteTag.key = this.#key;
            autocompleteTag.value = tagAutocompleteDef.value;
            let autocompleteTagElement = autocompleteTag.tagElement;

            this.#autocompleteDropdownItemElement.append(autocompleteTagElement);

            autocompleteTagElement.addEventListener("click", event => this.#onTagAutocompleteSelected(event));

            // // mousedown event has higher priority than blur, unlike click
            // autocompleteTagElement.addEventListener("mousedown", this.#onTagAutocompleteSelected);
        }

        #onTagAutocompleteSelected(event)
        {
            const TAG_ELEMENT = event.currentTarget;

            this.selectedTagData = FilterInput.TagData.fromTagElement(TAG_ELEMENT);

            let filterInputInstance = this.#filterInputInstance;

            filterInputInstance.#hideDropdown();

            alert(this.constructor.name);

            // Cheap hack to remove focus for now
            let innerTextInputElement = filterInputInstance.#innerTextInputElement;
            innerTextInputElement.setAttribute("disabled", "");
            innerTextInputElement.removeAttribute("disabled");

            // this.#filterInputInstance.#innerTextInputElement.setAttribute("disabled", "");
        }

        get key()
        {
            return this.#key;
        }

        get selectedTagData()
        {
            return this.#selectedTagData;
        }

        /**
         * @param { FilterInput.TagData } tagData
         */
        set selectedTagData(tagData)
        {
            let selectedTag = this.#selectedTagElementWrapper;

            this.#selectedTagData = tagData;
            tagData.writeToSelectedTag(selectedTag);

            const SELECTED_TAG_TEXT_FORMATTER_CALLBACK = this.selectedTagTextFormatterCallback ?? FilterInput.TagDefinition.#defaultSelectedTagTextFormatterCallback;
            const SHOULD_DISPLAY_SELECTED_TAG_CALLBACK = this.shouldDisplaySelectedTagCallback ?? FilterInput.TagDefinition.#defaultShouldDisplaySelectedTagCallback;

            selectedTag.text = SELECTED_TAG_TEXT_FORMATTER_CALLBACK(this);

            if (SHOULD_DISPLAY_SELECTED_TAG_CALLBACK(this))
            {
                selectedTag.unhide();
            }

            else
            {
                selectedTag.hide();
            }
        }

        static #defaultSelectedTagTextFormatterCallback(filterInputInstance)
        {
            return `${filterInputInstance.key}: ${filterInputInstance.selectedTagData.text}`;
        }

        static #defaultShouldDisplaySelectedTagCallback(filterInputInstance)
        {
            return filterInputInstance.selectedTagData.value != null;
        }
    };

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

    // // Technically possible to make it a set instead of "dictionary", but set in JS doesn't support custom equality comparison
    // tags = {};

    tags = [];

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

    constructor(parentID)
    {
        let wrapperElement = this.#wrapperElement = document.createElement("div");
        wrapperElement.classList.add(FilterInput.SEARCH_BAR_CLASS);

        let backgroundTextInputElement = this.#backgroundTextInputElement = document.createElement("input")
        let backgroundTextInputElementClassList = backgroundTextInputElement.classList;
        backgroundTextInputElementClassList.add("input");
        backgroundTextInputElementClassList.add("is-black");
        backgroundTextInputElementClassList.add(FilterInput.SEARCH_BAR_BACKGROUND_TEXT_INPUT_CLASS)
        backgroundTextInputElement.id = "filter";

        let innerTextWrapperElement = this.#innerTextWrapperElement = document.createElement("div");
        innerTextWrapperElement.classList.add(FilterInput.SEARCH_BAR_INNER_WRAPPER_CLASS);

        elementHideScrollBar(innerTextWrapperElement);

         let innerTextInputElement = this.#innerTextInputElement = FilterInput.#createInnerTextInput();
        innerTextWrapperElement.append(innerTextInputElement);

        // innerTextWrapperElement.append(FilterInput.#createTag("Name: Chicken"));
        // innerTextWrapperElement.append(FilterInput.#createTag("Price >= $5"));
        //
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

        let def = new FilterInput.TagDefinition("Category", this);
        def.autoCompleteDropdownText = "Selected Category: ";
        def.addTagAutocomplete(new FilterInput.TagData("None", 1));
        def.addTagAutocomplete(new FilterInput.TagData("Food", 2));
        def.addTagAutocomplete(new FilterInput.TagData("Tech", 3));

        def = new FilterInput.TagDefinition("Sort", this);
        def.autoCompleteDropdownText = "Sort By: ";
        def.addTagAutocomplete(new FilterInput.TagData("ID", 1));
        def.addTagAutocomplete(new FilterInput.TagData("Name", 2));
        def.addTagAutocomplete(new FilterInput.TagData("Price", 3));
        def.addTagAutocomplete(new FilterInput.TagData("Category", 4));

        let instance = this;

        innerTextInputElement.addEventListener("focus", function (_)
        {
            instance.#showDropdown();
        });

        innerTextInputElement.addEventListener("blur", function (event)
        {
            instance.#hideDropdown();
        });

        dropdownElement.addEventListener("mousedown", function (event)
        {
            event.preventDefault();
        });

        this.#hideDropdown();
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
                FilterInput.#autoSizeTextElement(lement);
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

    // #toggleDropdown()
    // {
    //     this.#backgroundTextInputElement.classList.toggle(FilterInput.DROPDOWN_VISIBLE_CLASS);
    //     this.#dropdownElement.toggleAttribute("hidden");
    // }
}