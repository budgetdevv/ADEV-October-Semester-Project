import { CSSClassConstants } from "./Constants.js";
export { delay };

/**
 * @param { String } text
 * @returns { boolean }
 */
export function isNullOrWhitespace(text)
{
    return text == null || text.trim().length === 0;
}

/**
 * @param { String } text
 * @returns { number }
 */
export function pxToNumber(text)
{
    return parseInt(text.slice(0, -2));
}

/**
 * @param { number } number
 * @returns {String  }
 */
export function numberToPx(number)
{
    return `${number}px`;
}

/**
 * @param { HTMLElement } element
 */
export function elementHideScrollBar(element)
{
    element.classList.add('hide_scrollbar');
}

/**
 * @return { Promise<DOMHighResTimeStamp> }
 */
export function requestAnimationFrameAsync()
{
    return new Promise((resolve) =>
    {
        window.requestAnimationFrame(timestamp =>
        {
            resolve(timestamp);
        });
    });
}

/**
 * @param { HTMLElement } element
 * @return { Promise<Event> }
 */
export function transitionEndAsync(element)
{
    return new Promise((resolve) =>
    {
        let transitionEndListener = event =>
        {
            element.removeEventListener("transitionend", transitionEndListener);
            resolve(event);
        };

        element.addEventListener("transitionend", transitionEndListener);
    });
}

/**
 * @param { HTMLElement } element
 */
export function elementHide(element)
{
    const _ = elementHideAsync(element);
}

/**
 * @param { HTMLElement } element
 * @param { string } transitionStyle
 * @return { Promise }
 */
export async function elementHideAsync(element, transitionStyle = null)
{
    let classList = element.classList;

    if (!classList.contains(CSSClassConstants.HIDDEN))
    {
        if (transitionStyle != null)
        {
            let elementStyle = element.style;
            elementStyle.transition = transitionStyle;
            elementStyle.opacity = 1;

            await requestAnimationFrameAsync();

            elementStyle.opacity = 0;

            await transitionEndAsync(element);

            elementStyle.transition = elementStyle.opacity = undefined;
        }

        classList.add(CSSClassConstants.HIDDEN);
    }
}

/**
 * @param { HTMLElement } element
 */
export function elementShow(element)
{
    const _ = elementShowAsync(element);
}

/**
 * @param { HTMLElement } element
 * @param { string } transitionStyle
 * @return { Promise }
 */
export async function elementShowAsync(element, transitionStyle = null)
{
    let classList = element.classList;

    let classListOldLength = classList.length;

    classList.remove(CSSClassConstants.HIDDEN);

    if (classList.length !== classListOldLength && transitionStyle != null)
    {
        let elementStyle = element.style;
        elementStyle.transition = transitionStyle;
        elementStyle.opacity = 0;

        await requestAnimationFrameAsync();

        // window.requestAnimationFrame(_ =>
        // {
        //     elementStyle.opacity = 1;
        // });

        await requestAnimationFrameAsync();

        elementStyle.opacity = 1;

        // let transitionEndListener = _ =>
        // {
        //     element.removeEventListener("transitionend", transitionEndListener);
        //     elementStyle.transition = elementStyle.opacity = undefined;
        // };
        //
        // element.addEventListener("transitionend", transitionEndListener);

        await transitionEndAsync(element);

        elementStyle.transition = elementStyle.opacity = undefined;
    }
}

function delay(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}