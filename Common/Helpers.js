/**
 * @param { String } text
 * @returns { boolean }
 */
export function isNullOrWhitespace(text)
{
    return text == null || text.trim().length === 0;
}