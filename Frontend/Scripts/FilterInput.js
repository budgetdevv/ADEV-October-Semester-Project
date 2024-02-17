import { elementHide, elementHideAsync, elementHideScrollBar, elementShow, elementShowAsync, pxToNumber } from "../../Common/Helpers.js";
import { CSSClassConstants } from "../../Common/Constants.js";

// We not only avoid an allocation, but we now can check to see if a click is real via reference equality.
const FAKE_CLICK_EVENT = new Event("click");

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
            tagElementClassList.add(CSSClassConstants.SEARCH_BAR_TAG);

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
            elementShow(this.tagElement);
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
        //#region Fields
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
         * @type { HTMLElement }
         * @private
         */
        #autocompleteDropdownItemLabelWrapperElement;

        /**
         * @type { HTMLElement }
         * @private
         */
        #autocompleteDropdownItemLabelElement;

        /**
         * @type { HTMLElement }
         * @private
         */
        #autocompleteDropdownItemDescriptionElement;

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
        //#endregion

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
            DropdownItemClassList.add(CSSClassConstants.SEARCH_BAR_DROPDOWN_ITEM);

            let dropdownItemLabelWrapperElement = this.#autocompleteDropdownItemLabelWrapperElement = document.createElement("div");
            dropdownItemLabelWrapperElement.classList.add(CSSClassConstants.SEARCH_BAR_DROPDOWN_ITEM_LABEL_WRAPPER);
            dropdownItemElement.append(dropdownItemLabelWrapperElement);

            let dropdownItemLabelElement = this.#autocompleteDropdownItemLabelElement = document.createElement("span");
            let dropdownItemLabelElementClassList = dropdownItemLabelElement.classList;
            dropdownItemLabelElementClassList.add("tag");
            dropdownItemLabelElementClassList.add("is-rounded");
            dropdownItemLabelElementClassList.add(CSSClassConstants.SEARCH_BAR_DROPDOWN_ITEM_LABEL);
            dropdownItemLabelWrapperElement.append(dropdownItemLabelElement);

            let dropdownItemDescriptionElement = this.#autocompleteDropdownItemDescriptionElement = document.createElement("span");
            let dropdownItemDescriptionElementClassList = dropdownItemDescriptionElement.classList;
            dropdownItemDescriptionElementClassList.add("tag");
            dropdownItemDescriptionElementClassList.add("is-rounded");
            dropdownItemDescriptionElementClassList.add(CSSClassConstants.SEARCH_BAR_DROPDOWN_ITEM_DESCRIPTION);
            // let dropdownItemDescriptionIconElement = document.createElement("i");
            // let dropdownItemDescriptionIconElementClassList = dropdownItemDescriptionIconElement.classList;
            // dropdownItemDescriptionIconElementClassList.add("fa");
            // dropdownItemDescriptionIconElementClassList.add("fa-info-circle");
            // dropdownItemDescriptionElement.append(dropdownItemDescriptionIconElement);
            dropdownItemLabelWrapperElement.append(dropdownItemDescriptionElement);

            this.autoCompleteDropdownDescription = null;

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

            dropdownItemElement.addEventListener("click", event =>
            {
                // Only respond if the clicked element is the dropdown item itself
                // ( event.target may point to its child, such as the tags )
                if (event.target === event.currentTarget)
                {
                    let filterInputInstance = this.#filterInputInstance;
                    let textInputElement = filterInputInstance.#innerTextInputElement;
                    textInputElement.value = `${this.key}${filterInputInstance.separator} `;
                    textInputElement.focus();
                }
            });

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

        get autoCompleteDropdownLabel()
        {
            return this.#autocompleteDropdownItemLabelElement.innerText;
        }

        set autoCompleteDropdownLabel(text)
        {
            this.#autocompleteDropdownItemLabelElement.innerText = text;
        }

        get autoCompleteDropdownDescription()
        {
            return this.#autocompleteDropdownItemDescriptionElement.innerText;
        }

        set autoCompleteDropdownDescription(text)
        {
            let descriptionElement = this.#autocompleteDropdownItemDescriptionElement;

            if (text != null)
            {
                // Too lazy to make another new element via code...
                this.#autocompleteDropdownItemDescriptionElement.innerHTML =
                `
                <i class="fa fa-info-circle" aria-hidden="true"></i>
                &nbsp
                ${text}
                `;
                elementShow(descriptionElement);
            }

            else
            {
                elementHide(descriptionElement);
            }
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

            this.#autoCompleteTextMap.set(text.toUpperCase(), autocompleteTag);

            return autocompleteTag;
        }

        /**
         * @param { string } text
         * @return { FilterInput.Tag }
         */
        tryGetAutoCompleteTag(text)
        {
            return this.#autoCompleteTextMap.get(text.toUpperCase());
        }

        /**
         * @param { Event } event
         * @param { FilterInput.Tag } autoCompleteTag
         */
        #onAutoCompleteTagSelected(event, autoCompleteTag)
        {
            // This method also un-hides the previous auto-complete selection, if any.
            this.#setSelectionTagData(autoCompleteTag.text, autoCompleteTag.value, event);

            // Do not reorder this, as #setSelectionTagData() have a dependency on this.#selectedAutocompleteTag.
            // It uses it to access the old value of this.#selectedAutocompleteTag prior to this.
            this.#selectedAutocompleteTag = autoCompleteTag;
            autoCompleteTag.hide();
        }

        // This method also un-hides the previous auto-complete selection, if any.
        #setSelectionTagData(text, value, event)
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

            this.#filterInputInstance.#onSelectionTagUpdated(event, this);
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

            this.#filterInputInstance.#onSelectionTagDeselected(event, this);
        }

        handleEnterInput(input, VALUE)
        {
            const ORIGINAL_TEXT = input.value;

            // Clear the input. Do this before sending event, as we want the callback to register that the input is empty.
            input.value = "";

            let TAG = this.tryGetAutoCompleteTag(VALUE);

            if (TAG !== undefined)
            {
                this.#onAutoCompleteTagSelected(FAKE_CLICK_EVENT, TAG);

                // // alert(TAG.value);
                //
                // TAG.tagElement.dispatchEvent(FAKE_CLICK_EVENT);
            }

            else if (this.allowCustomInput)
            {
                this.#setSelectionTagData(VALUE, VALUE);
                this.#filterInputInstance.#onSelectionTagUpdated(FAKE_CLICK_EVENT, this);
            }

            else
            {
                input.value = ORIGINAL_TEXT;
            }
        }

        hideAutoCompleteDropdown()
        {
            elementHide(this.#autocompleteDropdownItemElement);
        }

        showAutoCompleteDropdown()
        {
            elementShow(this.#autocompleteDropdownItemElement);
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

    constructor(parentID, separator = ":")
    {
        this.#separator = separator;

        let wrapperElement = this.#wrapperElement = document.createElement("div");
        wrapperElement.classList.add(CSSClassConstants.SEARCH_BAR);

        let backgroundTextInputElement = this.#backgroundTextInputElement = document.createElement("input")
        backgroundTextInputElement.setAttribute("readonly", "");

        let backgroundTextInputElementClassList = backgroundTextInputElement.classList;
        backgroundTextInputElementClassList.add("input");
        backgroundTextInputElementClassList.add("is-black");
        backgroundTextInputElementClassList.add(CSSClassConstants.SEARCH_BAR_BACKGROUND_TEXT_INPUT);

        let innerTextWrapperElement = this.#innerTextWrapperElement = document.createElement("div");
        innerTextWrapperElement.classList.add(CSSClassConstants.SEARCH_BAR_INNER_WRAPPER);
        elementHideScrollBar(innerTextWrapperElement);

        let innerTextInputElement = this.#innerTextInputElement = FilterInput.#createInnerTextInput();
        innerTextInputElement.setAttribute("placeholder", "Input search terms!");
        innerTextInputElement.id = "filter";
        innerTextWrapperElement.append(innerTextInputElement);

        let dropdownWrapperElement = this.#dropdownWrapperElement = document.createElement("div");
        dropdownWrapperElement.classList.add(CSSClassConstants.SEARCH_BAR_DROPDOWN_WRAPPER);

        let dropdownElement = this.#dropdownElement = document.createElement("div");
        let dropdownElementClassList = dropdownElement.classList;
        dropdownElementClassList.add(CSSClassConstants.SEARCH_BAR_DROPDOWN);
        dropdownElementClassList.add("dropdown-content");
        elementHideScrollBar(dropdownElement);
        dropdownWrapperElement.append(dropdownElement);

        wrapperElement.append(innerTextWrapperElement);
        wrapperElement.append(backgroundTextInputElement);
        wrapperElement.append(dropdownWrapperElement);

        let textInputParentElement = document.getElementById(parentID);
        textInputParentElement.append(wrapperElement);

        // Global event handler that enables dropdown if any of its regions are clicked,
        // or disables the dropdown otherwise.
        document.addEventListener("click", event =>
        {
            if (wrapperElement.contains(event.target))
            {
                this.#showDropdown();
            }

            else
            {
                this.#hideDropdown();
            }
        });

        innerTextInputElement.addEventListener("focus", _ =>
        {
            this.#showDropdown();
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
     * @param { string } key
     * @return { FilterInput.FilterDefinition }
     */
    addTagDefinition(key)
    {
        let def = new FilterInput.FilterDefinition(key, this);
        this.#tagDefinitions.set(key.toUpperCase(), def);
        return def;
    }

    /**
     * @param { String } key
     * @return { FilterInput.FilterDefinition }
     */
    tryGetTagDefinition(key)
    {
        return this.#tagDefinitions.get(key.toUpperCase());
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
        classList.add(CSSClassConstants.SEARCH_BAR_INNER_TEXT_INPUT);

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
        this.#updateFilterDefinitionsVisibility(this.#innerTextInputElement.value);

        const CALLBACK = this.onTextInputCallback;

        if (CALLBACK != null)
        {
            CALLBACK(event, this);
        }
    }

    #updateFilterDefinitionsVisibility(text)
    {
        let indexOfSeparator = text.indexOf(this.#separator);

        const KEY = ((indexOfSeparator !== -1) ? text.slice(0, indexOfSeparator).trim() : text).toUpperCase();

        const KEY_LENGTH = KEY.length;

        for (let [currentKey, currentValue] of this.#tagDefinitions)
        {
            // const CURRENT_KEY_LENGTH = currentKey.length;

            if (KEY_LENGTH <= currentKey.length && currentKey.slice(0, KEY_LENGTH) === KEY)
            {
                currentValue.showAutoCompleteDropdown();
            }

            else
            {
                currentValue.hideAutoCompleteDropdown();
            }
        }
    }

    /**
     * @param { Event } event
     */
    #onEnterKeyPressed(event)
    {
        let input = this.#innerTextInputElement;

        const TEXT = input.value;

        let indexOfSeparator = TEXT.indexOf(this.#separator);

        if (indexOfSeparator === -1)
        {
            return;
        }

        const KEY = TEXT.slice(0, indexOfSeparator).trim();
        // + 1 because we want to take contents after the separator
        const VALUE = TEXT.slice(indexOfSeparator + 1).trim();

        if (KEY.length === 0 || VALUE.length === 0)
        {
            return;
        }

        // alert(`${KEY} | ${VALUE}`);

        let foundDefinition = this.tryGetTagDefinition(KEY);

        if (foundDefinition === undefined)
        {
            return;
        }

        foundDefinition.handleEnterInput(input, VALUE);
    }

    get separator()
    {
        return this.#separator;
    }

    static get #DROPDOWN_TRANSITION_STYLE()
    {
        return "visibility 0s, opacity 0.2s linear";
    }

    /**
     * @param { Event } event
     * @param { FilterInput.FilterDefinition } filterDefinition
     */
    #onSelectionTagUpdated(event, filterDefinition)
    {
        let textInput = this.#innerTextInputElement;
        textInput.value = "";
        textInput.focus();

        const TAG_SELECTED_CALLBACK = this.onTagSelectedCallback;

        if (TAG_SELECTED_CALLBACK != null)
        {
            TAG_SELECTED_CALLBACK(event, filterDefinition);
        }

        this.#updateFilterDefinitionsVisibility(this.#innerTextInputElement.value);
    }

    /**
     * @param { Event } event
     * @param { FilterInput.FilterDefinition } filterDefinition
     */
    #onSelectionTagDeselected(event, filterDefinition)
    {
        const TAG_DESELECTED_CALLBACK = this.onTagDeselectedCallback;

        if (TAG_DESELECTED_CALLBACK != null)
        {
            TAG_DESELECTED_CALLBACK(event, filterDefinition);
        }

        this.#innerTextInputElement.focus();
    }

    #showDropdown(instant = false)
    {
        const TRANSITION_STYLE = !instant ? FilterInput.#DROPDOWN_TRANSITION_STYLE: null;
        this.#backgroundTextInputElement.classList.add(CSSClassConstants.DROPDOWN_VISIBLE);
        const _ = elementShowAsync(this.#dropdownElement, TRANSITION_STYLE);
    }

    #hideDropdown(instant = false)
    {
        const TRANSITION_STYLE = !instant ? FilterInput.#DROPDOWN_TRANSITION_STYLE: null;
        this.#backgroundTextInputElement.classList.remove(CSSClassConstants.DROPDOWN_VISIBLE);
        const _ = elementHideAsync(this.#dropdownElement, TRANSITION_STYLE);
    }

    /**
     * @param { Event } event
     */
    static TagIsUpdatedByUserClick(event)
    {
        return event !== FAKE_CLICK_EVENT;
    }
}