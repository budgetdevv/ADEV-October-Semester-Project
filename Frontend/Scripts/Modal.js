import { IS_ACTIVE_CLASS } from "/Common/Constants.js";

export class Color
{
    /**
     * @type { String } textColorHex
     * @public
     */
    textColorHex;

    /**
     * @type { String } backgroundColorHex
     * @public
     */
    backgroundColorHex;

    constructor(backgroundColorHex, textColorHex = null)
    {
        this.textColorHex = textColorHex;
        this.backgroundColorHex = backgroundColorHex;
    }
}

export class Modal
{
    /**
     * @type { String }
     * @private
     */
    #bodyPadX = null;

    /**
     * @type { String }
     * @private
     */
    #bodyPadY = null;

    /**
     * @type { function }
     * @public
     */
    submitCallback = null;

    /**
     * @type { function }
     * @public
     */
    cancelCallback = null;

    /**
     * @type { function }
     * @public
     */
    crossCallback = null;

    /**
     * @type { function }
     * @public
     */
    backgroundCallback = null;

    /**
     * @type { HTMLElement }
     * @public
     */
    mainElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    modalElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    submitButtonElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    cancelButtonElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    crossButtonElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    backgroundElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    titleElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    headerElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    bodyElement;

    /**
     * @type { HTMLElement }
     * @public
     */
    footerElement;

    /**
     * @type { boolean }
     * @public
     */
    suppressSubmitDefaultBehavior = true;

    /**
     * @type { boolean }
     * @public
     */
    closeModalOnSubmit = true;

    static #uniqueIDCount = 0;

    static #getUniqueID()
    {
        return `unique_id_${Modal.#uniqueIDCount++}`;
    }

    constructor()
    {
        const UNIQUE_ID = Modal.#getUniqueID();

        let mainElement = this.mainElement = document.createElement("form");

        mainElement.id = UNIQUE_ID;

        const HEADER_ID = `${UNIQUE_ID}_header`;

        const CROSS_BUTTON_ID = `${UNIQUE_ID}_cross`;

        // Outer div is required for using "hidden attribute
        const HEADER_HTML =
        `
        <div>
            <header class="modal-card-head" style="background-color: hsl(48, 100%, 67%)" id="${HEADER_ID}">
                <p class="modal-card-title">Placeholder Title</p>
                <button class="delete" aria-label="close" id="${CROSS_BUTTON_ID}"></button>
            </header>
        </div>`;

        const BODY_ID = `${UNIQUE_ID}_body`;

        const BODY_HTML =
        `
        <div>
            <section class="modal-card-body" id="${BODY_ID}">
                Placeholder Body
            </section>
        </div>`;

        const FOOTER_ID = `${UNIQUE_ID}_footer`;

        const SUBMIT_BUTTON_ID = `${UNIQUE_ID}_submit`;

        const CANCEL_BUTTON_ID = `${UNIQUE_ID}_cancel`;

        // Include is-success ( Or any other bulma button color, really. Even though we are replacing the colors ),
        // as they carry additional styling.
        const FOOTER_HTML =
        `
        <div>
            <footer class="modal-card-foot" style="background-color: hsl(48, 100%, 96%)" id="${FOOTER_ID}">
                <button class="button is-success" type="submit" id='${SUBMIT_BUTTON_ID}'>Submit</button>
                <button class="button is-success" type="button" id='${CANCEL_BUTTON_ID}'>Cancel</button>
            </footer>
        </div>`;

        const BACKGROUND_ID = `${UNIQUE_ID}_background`;

        mainElement.innerHTML =
        `
        <div class="modal is-active">
            <div class="modal-background" id="${BACKGROUND_ID}"></div>
            <div class="modal-card">
                ${HEADER_HTML}
                ${BODY_HTML}
                ${FOOTER_HTML}
            </div>
        </div>`;

        document.body.append(mainElement);

        this.modalElement = mainElement.children[0];

        let header = this.headerElement = document.getElementById(HEADER_ID);
        this.titleElement = header.children[0];
        this.bodyElement = document.getElementById(BODY_ID);
        this.footerElement = document.getElementById(FOOTER_ID);

        this.submitButtonElement = document.getElementById(SUBMIT_BUTTON_ID);
        this.cancelButtonElement = document.getElementById(CANCEL_BUTTON_ID);
        this.crossButtonElement = document.getElementById(CROSS_BUTTON_ID);
        this.backgroundElement = document.getElementById(BACKGROUND_ID);

        const DISABLE_CALLBACK = Modal.#disableCallback;

        this.cancelCallback = DISABLE_CALLBACK;
        this.crossCallback = DISABLE_CALLBACK;
        this.backgroundCallback = DISABLE_CALLBACK;

        const SUCCESS_COLOR_HEX = "#48C78E";
        const WARNING_COLOR_HEX = "#FFDC7D";
        const WARNING_LIGHT_COLOR_HEX = "#FFFAEB";
        const DANGER_COLOR_HEX = "#F24669";
        const WHITE_COLOR_HEX = "#FFFFFF";

        // "has-background-warning";
        this.headerColor = new Color(WARNING_COLOR_HEX);
        // "has-background-warning-light";
        this.footerColor = new Color(WARNING_LIGHT_COLOR_HEX);
        // "is-success";
        this.submitButtonColor = new Color(SUCCESS_COLOR_HEX, WHITE_COLOR_HEX);
        // "is-danger";
        this.cancelButtonColor = new Color(DANGER_COLOR_HEX, WHITE_COLOR_HEX);

        this.bindEvents();
        this.disable();
    }

    bindEvents()
    {
        this.mainElement.addEventListener("submit", this);
        this.cancelButtonElement.addEventListener("click", this);
        this.crossButtonElement.addEventListener("click", this);
        this.backgroundElement.addEventListener("click", this);
    }

    unbindEvents()
    {
        this.mainElement.removeEventListener("submit", this);
        this.cancelButtonElement.removeEventListener("click", this);
        this.crossButtonElement.removeEventListener("click", this);
        this.backgroundElement.removeEventListener("click", this);
    }
    
    // It is used by addEventListener()
    // noinspection JSUnusedGlobalSymbols
    /**
     * @param { Event } event
     */
    handleEvent(event)
    {
        const SOURCE_ELEMENT = event.currentTarget;

        switch (event.type)
        {
            case "submit":
                if (this.suppressSubmitDefaultBehavior)
                {
                    event.preventDefault();
                }

                const SUBMIT_CALLBACK = this.submitCallback;

                if (SUBMIT_CALLBACK != null)
                {
                    SUBMIT_CALLBACK(this);
                }

                if (this.closeModalOnSubmit)
                {
                    this.disable();
                }

                return;
            case "click":
                if (SOURCE_ELEMENT === this.cancelButtonElement)
                {
                    const CANCEL_CALLBACK = this.cancelCallback;

                    if (CANCEL_CALLBACK != null)
                    {
                        CANCEL_CALLBACK(this);
                    }
                }

                else if (SOURCE_ELEMENT === this.crossButtonElement)
                {
                    const CROSS_CALLBACK = this.crossCallback;

                    if (CROSS_CALLBACK != null)
                    {
                        CROSS_CALLBACK(this);
                    }
                }

                else if (SOURCE_ELEMENT === this.backgroundElement)
                {
                    const BACKGROUND_CALLBACK = this.backgroundCallback;

                    if (BACKGROUND_CALLBACK != null)
                    {
                        BACKGROUND_CALLBACK(this);
                    }
                }

                return;
        }
    }

    /**
     * @param { Color } color
     */
    set headerColor(color)
    {
        let style = this.headerElement.style;

        style.color = color.textColorHex ?? style.color;
        style.backgroundColor = color.backgroundColorHex ?? style.backgroundColor;
    }

    set bodyColor(color)
    {
        let style = this.bodyElement.style;

        style.color = color.textColorHex ?? style.color;
        style.backgroundColor = color.backgroundColorHex ?? style.backgroundColor;
    }

    set footerColor(color)
    {
        let style = this.footerElement.style;

        style.color = color.textColorHex ?? style.color;
        style.backgroundColor = color.backgroundColorHex ?? style.backgroundColor;
    }

    set submitButtonColor(color)
    {
        let style = this.submitButtonElement.style;

        style.color = color.textColorHex ?? style.color;
        style.backgroundColor = color.backgroundColorHex ?? style.backgroundColor;
    }

    set cancelButtonColor(color)
    {
        let style = this.cancelButtonElement.style;

        style.color = color.textColorHex ?? style.color;
        style.backgroundColor = color.backgroundColorHex ?? style.backgroundColor;
    }

    enable()
    {
        this.modalElement.classList.add(IS_ACTIVE_CLASS);
    }

    static #disableCallback(modal)
    {
        modal.disable();
    }

    disable()
    {
        this.modalElement.classList.remove(IS_ACTIVE_CLASS);
    }

    /**
     * @param { String } title
     */
    setTitle(title)
    {
        this.titleElement.textContent = title;
    }

    /**
     * @param { String } bodyContent
     */
    setBody(bodyContent)
    {
        this.bodyElement.innerHTML = bodyContent;
    }

    /**
     * @param { Number } padX
     * @param { Number } padY
     */
    setBodyPadding(padX, padY)
    {
        padX = `px-${padX}`;
        padY = `py-${padY}`;

        let classes = this.bodyElement.classList;

        classes.remove(this.#bodyPadX);
        classes.remove(this.#bodyPadY);

        classes.add(this.#bodyPadX = padX);
        classes.add(this.#bodyPadY = padY);
    }

    useDefaultBodyPadding()
    {
        let classes = this.bodyElement.classList;

        classes.remove(this.#bodyPadX);
        classes.remove(this.#bodyPadY);

        this.#bodyPadX = null;
        this.#bodyPadY = null;
    }

    get clickBackgroundToCancel()
    {
        return this.backgroundCallback === this.disable;
    }
    set clickBackgroundToCancel(value)
    {
        this.backgroundCallback = (value ? this.disable : null);
    }

    get headerEnabled()
    {
        // Parent is wrapper div with the hidden attribute
        return this.headerElement.parentElement.hidden;
    }
    set headerEnabled(value)
    {
        // Parent is wrapper div with the hidden attribute
        this.headerElement.parentElement.hidden = value;
    }

    get bodyEnabled()
    {
        // Parent is wrapper div with the hidden attribute
        return this.bodyElement.parentElement.hidden;
    }
    
    set bodyEnabled(value)
    {
        // Parent is wrapper div with the hidden attribute
        this.bodyElement.parentElement.hidden = value;
    }

    get footerEnabled()
    {
        // Parent is wrapper div with the hidden attribute
        return !this.footerElement.parentElement.hidden;
    }
    set footerEnabled(value)
    {
        // Parent is wrapper div with the hidden attribute
        this.footerElement.parentElement.hidden = !value;
    }

    dispose()
    {
        this.unbindEvents();
    }
}