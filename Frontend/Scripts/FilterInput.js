import { elementHide, elementHideAsync, elementHideScrollBar, elementUnhide, elementUnhideAsync, pxToNumber } from "../../Common/Helpers.js";

export class FilterInput
{
    //#region Tag
    static Tag = class
    {
        //#region Fields
        /**
         * @type { Object }
         * @private
         */
        #value;

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
         * @type { function(FilterInput.Tag, Object):boolean }
         * @public
         */
        shouldDisplaySelectedTagCallback = null;

        // noinspection ES6ClassMemberInitializationOrder
        /**
         * @type { Map<HTMLElement, FilterInput.Tag> }
         * @private
         */
        static #tagElementToTagMap = new Map();
        //#endregion

        /**
         * @param { HTMLElement } parentElement
         */
        constructor(parentElement)
        {
            let tagElement = this.tagElement = document.createElement("span");

            let tagElementClassList = tagElement.classList;
            tagElementClassList.add("tag");
            tagElementClassList.add("is-warning");
            tagElementClassList.add("is-medium");
            tagElementClassList.add(FilterInput.SEARCH_BAR_TAG_CLASS);

            let textElement = this.textElement = document.createElement("span");
            tagElement.append(textElement);

            let crossButtonElement = this.crossButtonElement = document.createElement("button");
            let crossButtonClassList = crossButtonElement.classList;
            crossButtonClassList.add("delete");
            crossButtonClassList.add("is-small");

            FilterInput.Tag.#tagElementToTagMap.set(tagElement, this);

            if (parentElement != null)
            {
                parentElement.append(tagElement);
            } // Otherwise it exists only as an object, and is NOT rendered in HTML.
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
            return this.#value;
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

            this.#value = value;
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
        tagAddEventListener(eventName, callback)
        {
            let listener = event =>
            {
                callback(event, this);
            };

            // this.#eventListeners.append(listener);
            this.tagElement.addEventListener(eventName, listener)
        }

        /**
         * @param { String } eventName
         * @param { function(Event, FilterInput.Tag):void } callback
         */
        crossButtonAddEventListener(eventName, callback)
        {
            let listener = event =>
            {
                callback(event, this);
            };

            // this.#eventListeners.append(listener);
            this.crossButtonElement.addEventListener(eventName, listener)
        }

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
         * @param { Object } value
         */
        static #defaultShouldDisplaySelectedTagCallback(tagInstance, value)
        {
            return value != null;
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

    //#region FilterDefinition
    static FilterDefinition = class
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
         * @type { FilterInput.Tag }
         * @private
         */
        #defaultSelectionTag;


        /**
         * @type { Map<string, FilterInput.Tag> }
         * @private
         */
        #autoCompleteTextMap = new Map();

        /**
         * @type { boolean}
         * @public
         */
        allowCustomInput = false;

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

            let selectedTag = this.#selectionTag = new FilterInput.Tag(filterInputInstance.#innerTextWrapperElement);
            selectedTag.key = key;
            let defaultTagValue = selectedTag.value = null;
            let defaultTagText = selectedTag.text = "";
            selectedTag.crossButtonEnabled = true;
            selectedTag.crossButtonAddEventListener("click", (event, tag) => this.#onSelectionTagCrossed(event, tag));

            selectedTag.textFormatterCallback = (tag, text) =>
            {
                return `${tag.key}${filterInputInstance.separator} ${text}`
            };

            selectedTag.shouldDisplaySelectedTagCallback = (tag, value) =>
            {
                return !this.#valueIsThatOfDefaultSelection(value);
            }

            filterInputInstance.#dropdownElement.append(dropdownItemElement);

            // Pre-initialize it with default values.
            // This is so that we don't have to check if defaultSelectionTag is null and handle such cases separately...
            let defaultSelectionTag = this.#defaultSelectionTag = new FilterInput.Tag(null);
            defaultSelectionTag.text = defaultTagText;
            defaultSelectionTag.value = defaultTagValue;
        }

        get key()
        {
            return this.#key;
        }

        get selectedValue()
        {
            return this.#selectionTag.value;
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
         * @param { Object } value
         * @return { boolean }
         */
        #valueIsThatOfDefaultSelection(value)
        {
            return this.#defaultSelectionTag.value === value;
        }

        /**
         * @param { String } text
         * @param { Object } value
         * @return { FilterInput.Tag }
         */
        addDefaultSelectionTag(text, value)
        {
            let selectionTag = this.#selectionTag;
            let selectionTagValueWasDefault = this.#valueIsThatOfDefaultSelection(selectionTag.value);

            let tag = this.addAutoCompleteTag(text, value);
            this.#defaultSelectionTag = tag;
            // TODO: Hide it for now, we do not handle default selection being an auto-complete tag yet.
            tag.hide();

            if (selectionTagValueWasDefault)
            {
                selectionTag.text = text;
                selectionTag.value = value;
            }

            return tag;
        }

        /**
         * @param { string } text
         * @param { Object } value
         * @return { FilterInput.Tag }
         */
        addAutoCompleteTag(text, value)
        {
            let autocompleteTag = new FilterInput.Tag(this.#autocompleteDropdownItemElement);

            autocompleteTag.key = this.#key;
            autocompleteTag.text = text;
            autocompleteTag.value = value;
            autocompleteTag.tagAddEventListener("click", (event, tag) => this.#onAutoCompleteTagSelected(event, tag));

            this.#autoCompleteTextMap.set(text, autocompleteTag);

            return autocompleteTag;
        }

        /**
         * @param { string } text
         * @return { FilterInput.Tag }
         */
        tryGetAutoCompleteTag(text)
        {
            return this.#autoCompleteTextMap.get(text);
        }

        /**
         * @param { Event } event
         * @param { FilterInput.Tag } autoCompleteTag
         */
        #onAutoCompleteTagSelected(event, autoCompleteTag)
        {
            let filterInputInstance = this.#filterInputInstance;
            filterInputInstance.#innerTextInputElement.blur();

            // This method also un-hides the previous auto-complete selection, if any.
            this.setSelectionTagData(autoCompleteTag.text, autoCompleteTag.value);

            autoCompleteTag.hide();
            this.#selectedAutocompleteTag = autoCompleteTag;

            this.#onSelectionTagUpdated(event);
        }

        // This method also un-hides the previous auto-complete selection, if any.
        setSelectionTagData(text, value)
        {
            let selectionTag = this.#selectionTag;
            selectionTag.text = text;
            selectionTag.value = value;

            let previousAutoCompleteTag = this.#selectedAutocompleteTag;

            if (previousAutoCompleteTag != null)
            {
                // If there was an auto-complete tag selected previously, restore its visibility.
                previousAutoCompleteTag.unhide();
            }
        }

        /**
         * @param { Event } event
         */
        #onSelectionTagUpdated(event)
        {
            const TAG_SELECTED_CALLBACK = this.#filterInputInstance.onTagSelectedCallback;

            if (TAG_SELECTED_CALLBACK != null)
            {
                TAG_SELECTED_CALLBACK(event, this);
            }
        }

        /**
         * @param { Event } event
         * @param { FilterInput.Tag } selectionTag
         */
        #onSelectionTagCrossed(event, selectionTag)
        {
            const DEFAULT_SELECTION_TAG = this.#defaultSelectionTag;
            // This hides it
            selectionTag.value = DEFAULT_SELECTION_TAG.value;
            selectionTag.text = DEFAULT_SELECTION_TAG.text;

            let SELECTED_AUTOCOMPLETE_TAG = this.#selectedAutocompleteTag;

            // It may be null if we allow custom input for FilterDefinition
            if (SELECTED_AUTOCOMPLETE_TAG != null)
            {
                SELECTED_AUTOCOMPLETE_TAG.unhide();
                this.#selectedAutocompleteTag = null;
            }

            const TAG_DESELECTED_CALLBACK = this.#filterInputInstance.onTagDeselectedCallback;

            if (TAG_DESELECTED_CALLBACK != null)
            {
                TAG_DESELECTED_CALLBACK(event, this);
            }
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
     * @type { HTMLInputElement }
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
     * @type { function(Event, FilterInput) }
     * @public
     */
    onTextInputCallback;

    /**
     * @type { function(Event, FilterInput.FilterDefinition) }
     * @public
     */
    onTagSelectedCallback = null;

    /**
     * @type { function(Event, FilterInput.FilterDefinition) }
     * @public
     */
    onTagDeselectedCallback = null;

    /**
     * @type { Map<string, FilterInput.FilterDefinition> }
     * @public
     */
    #tagDefinitions = new Map();

    // For now, it is readonly
    #separator;
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

    static get SEARCH_BAR_TAG_CLASS()
    {
        return "search-bar-tag";
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

    constructor(parentID, separator = ":")
    {
        this.#separator = separator;

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
        innerTextInputElement.setAttribute("placeholder", "Input search terms!");
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

        innerTextInputElement.addEventListener("focus", _ =>
        {
            this.#showDropdown();
        });

        innerTextInputElement.addEventListener("blur", _ =>
        {
            this.#hideDropdown();
        });

        innerTextInputElement.addEventListener("input", event =>
        {
            this.#onTextInput(event);
        });

        innerTextInputElement.addEventListener("keydown", event =>
        {
            if (event.key === "Enter")
            {
                this.#onEnterKeyPressed(event);
            }
        });

        dropdownElement.addEventListener("mousedown", event =>
        {
            // Prevent onblur() should the dropdown be clicked.
            event.preventDefault();
        });

        this.#hideDropdown(true);
    }

    get text()
    {
        return this.#innerTextInputElement.value;
    }

    set text(text)
    {
        this.#innerTextInputElement.value = text;
    }

    /**
     * @param { String } key
     * @return { FilterInput.FilterDefinition }
     */
    addTagDefinition(key)
    {
        let def = new FilterInput.FilterDefinition(key, this);
        this.#tagDefinitions.set(key, def);
        return def;
    }

    /**
     * @param { String } key
     * @return { FilterInput.FilterDefinition }
     */
    getTagDefinition(key)
    {
        return this.#tagDefinitions.get(key);
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

    /**
     * @param { Event } event
     */
    #onTextInput(event)
    {
        const CALLBACK = this.onTextInputCallback;

        if (CALLBACK != null)
        {
            CALLBACK(event, this);
        }
    }

    /**
     * @param { Event } event
     */
    #onEnterKeyPressed(event)
    {
        let input = this.#innerTextInputElement;

        let text = input.value;

        let indexOfSeparator = text.indexOf(this.#separator);

        if (indexOfSeparator === -1)
        {
            return;
        }

        let KEY = text.slice(0, indexOfSeparator).trim();
        // + 1 because we want to take contents after the separator
        let VALUE = text.slice(indexOfSeparator + 1).trim();

        if (KEY.length === 0 || VALUE.length === 0)
        {
            return;
        }

        // alert(`${KEY} | ${VALUE}`);

        let foundDefinition = this.#tagDefinitions.get(KEY);

        if (foundDefinition === undefined)
        {
            return;
        }

        let TAG = foundDefinition.tryGetAutoCompleteTag(VALUE);

        if (TAG !== undefined)
        {
            // alert(TAG.value);

            event = new Event("click");

            TAG.tagElement.dispatchEvent(event);
        }

        else if (foundDefinition.allowCustomInput)
        {
            foundDefinition.setSelectionTagData(VALUE, VALUE);
        }

        else
        {
            return;
        }

        // Clear the input
        input.value = "";
    }

    get separator()
    {
        return this.#separator;
    }

    static get #DROPDOWN_TRANSITION_STYLE()
    {
        return "visibility 0s, opacity 0.2s linear";
    }

    #showDropdown(instant = false)
    {
        const TRANSITION_STYLE = !instant ? FilterInput.#DROPDOWN_TRANSITION_STYLE: null;
        this.#backgroundTextInputElement.classList.add(FilterInput.DROPDOWN_VISIBLE_CLASS);
        const _ = elementUnhideAsync(this.#dropdownElement, TRANSITION_STYLE);
    }

    #hideDropdown(instant = false)
    {
        const TRANSITION_STYLE = !instant ? FilterInput.#DROPDOWN_TRANSITION_STYLE: null;
        this.#backgroundTextInputElement.classList.remove(FilterInput.DROPDOWN_VISIBLE_CLASS);
        const _ = elementHideAsync(this.#dropdownElement, TRANSITION_STYLE);
    }
}