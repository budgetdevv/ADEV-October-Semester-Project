export class Modal
{
    targetID;
    originalHTML;
    html;
    constructor(targetID, title, body, submitButtonCallbackName, cancelButtonCallbackName, crossButtonCallbackName, submitButtonName = "Submit", cancelButtonName = "Cancel")
    {
        this.targetID = targetID;
        this.html = `<div class="modal is-active" id="${targetID}">
                        <div class="modal-background"></div>
                        <div class="modal-card">
                            <header class="modal-card-head">
                                <p class="modal-card-title">${title}</p>
                                <button class="delete" aria-label="close" onclick="${crossButtonCallbackName}()"></button>
                            </header>
                            <section class="modal-card-body">
                                ${body}
                            </section>
                            <footer class="modal-card-foot">
                                <button class="button is-success" onclick="${submitButtonCallbackName}()">${submitButtonName}</button>
                                <button class="button" onclick="${cancelButtonCallbackName}()">${cancelButtonName}</button>
                            </footer>
                        </div>
                     </div>`;
    }

    enable()
    {
        let target = document.getElementById(this.targetID);

        this.originalHTML = target.outerHTML;
        target.outerHTML = this.html;
    }

    disable()
    {
        document.getElementById(this.targetID).outerHTML = this.originalHTML;
    }
}