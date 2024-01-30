export class Modal
{
    targetID;
    disabledHTML;
    disabledHTMLForOnClick;
    title = "";
    body = "";
    body_padx = null;
    body_pady = null;
    submitButtonCallbackName = null;
    cancelButtonCallbackName = null;
    crossButtonCallbackName = null;
    submitButtonName = "Submit";
    cancelButtonName = "Cancel";
    titleBackgroundColor = "has-background-warning";
    footerBackgroundColor = "has-background-warning-light";
    submitButtonColor = "is-success";
    cancelButtonColor = "is-danger";
    enableTitle = true;
    enableBody = true;
    enableFooter = true;
    renderedHTML;

    constructor(targetID)
    {
        this.targetID = targetID;
        this.disabledHTML = `<div id="${targetID}"></div>`;
        // How it looks: onclick = 'document.getElementById("product_page_modal").outerHTML = "<div id=\"( The target ID )\"></div>"'
        this.disabledHTMLForOnClick = `<div id=\\"${targetID}\\"></div>`;
    }

    render()
    {
        const TARGET_ID = this.targetID;

        const DEFAULT_CLOSE_CODE = `document.getElementById("${TARGET_ID}").outerHTML = "${this.disabledHTMLForOnClick}"`;

        const CROSS_BUTTON_CALLBACK_NAME = this.crossButtonCallbackName;
        const CROSS_BUTTON_ON_CLICK_CODE = (CROSS_BUTTON_CALLBACK_NAME != null) ? `${CROSS_BUTTON_CALLBACK_NAME}()` : DEFAULT_CLOSE_CODE;

        const HEADER_HTML = this.enableTitle ?
        `
        <header class="modal-card-head ${this.titleBackgroundColor}">
            <p class="modal-card-title">${this.title}</p>
            <button class="delete" aria-label="close" onclick='${CROSS_BUTTON_ON_CLICK_CODE}'></button>
        </header>` : "";


        let padx = this.body_padx;
        // Prefixing gap is intended
        padx = (padx != null) ? ` px-${padx}` : "";

        let pady = this.body_pady;
        // Prefixing gap is intended
        pady = (pady != null) ? ` py-${pady}` : "";

        const BODY_HTML = this.enableBody ?
        `
        <section class="modal-card-body${padx}${pady}">
            ${this.body}
        </section>` : "";

        const CANCEL_BUTTON_CALLBACK_NAME = this.cancelButtonCallbackName;
        const CANCEL_BUTTON_ON_CLICK_CODE = (CANCEL_BUTTON_CALLBACK_NAME != null) ? `${CANCEL_BUTTON_CALLBACK_NAME}()` : DEFAULT_CLOSE_CODE;

        const FOOTER_HTML = this.enableFooter ?
        `
        <footer class="modal-card-foot ${this.footerBackgroundColor}">
            <button class="button ${this.submitButtonColor}" type="submit">${this.submitButtonName}</button>
            <button class="button ${this.cancelButtonColor}" type="button" onclick='${CANCEL_BUTTON_ON_CLICK_CODE}'>${this.cancelButtonName}</button>
        </footer>` : "";

        const SUBMIT_BUTTON_CALLBACK_NAME = this.submitButtonCallbackName;
        const SUBMIT_BUTTON_ON_CLICK_CODE = (SUBMIT_BUTTON_CALLBACK_NAME != null) ? `${SUBMIT_BUTTON_CALLBACK_NAME}()` : "";

        this.renderedHTML = `
        <form onsubmit='${SUBMIT_BUTTON_ON_CLICK_CODE}'>
            <div class="modal is-active" id="${TARGET_ID}">
                <div class="modal-background"></div>
                <div class="modal-card">
                    ${HEADER_HTML}
                    ${BODY_HTML}
                    ${FOOTER_HTML}
                </div>
            </div>
        </form>`;
    }

    enable()
    {
        document.getElementById(this.targetID).outerHTML = this.renderedHTML;
    }

    disable()
    {
        document.getElementById(this.targetID).outerHTML = this.disabledHTML;
    }
}