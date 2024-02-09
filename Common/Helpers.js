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
    let style = element.style;

    // Hide scrollbar for Chrome, Safari and Opera
    style['::-webkit-scrollbar'] = 'display: none';

    // Hide scrollbar for Firefox
    style['scrollbar-width'] = 'none';

    // Hide scrollbar for IE and Edge
    style['-ms-overflow-style'] = 'none';
}

/**
 * @param { HTMLElement } element
 */
export function elementHide(element)
{
    element.setAttribute("hidden", "");
}

/**
 * @param { HTMLElement } element
 */
export function elementUnhide(element)
{
    element.removeAttribute("hidden");
}