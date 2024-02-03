// export class BulmaColor
// {
//     static #SUCCESS = new BulmaColor("success");
//
//     static get SUCCESS()
//     {
//         return BulmaColor.#SUCCESS;
//     };
//
//     static #WARNING = new BulmaColor("warning");
//
//     static get WARNING()
//     {
//         return BulmaColor.#WARNING;
//     };
//
//     static #DANGER= new BulmaColor("danger");
//
//     static get DANGER()
//     {
//         return BulmaColor.#DANGER;
//     };
//
//     static #PRIMARY = new BulmaColor("primary");
//
//     static get PRIMARY()
//     {
//         return BulmaColor.#SUCCESS;
//     };
//
//     static #LINK = new BulmaColor("link");
//
//     static get LINK()
//     {
//         return BulmaColor.#LINK;
//     };
//
//     static #INFO = new BulmaColor("info");
//
//     static get INFO()
//     {
//         return BulmaColor.#INFO;
//     };
//
//     static #WHITE = new BulmaColor("white");
//
//     static get WHITE()
//     {
//         return BulmaColor.#WHITE;
//     };
//
//     static #BLACK = new BulmaColor("black");
//
//     static get BLACK()
//     {
//         return BulmaColor.#BLACK;
//     };
//
//     /**
//      * @type { String }
//      * @public
//      */
//     representation;
//     buttonRepresentation;
//
//     /**
//      * @param { String } representation
//      */
//     constructor(representation)
//     {
//         this.representation = representation;
//         this.buttonRepresentation = `$is-${representation}`;
//
//         // Prevent mutation
//         Object.freeze(this);
//     }
// }
//
// export class CustomColor
// {
//     /**
//      * @type { String }
//      * @public
//      */
//     hex;
//
//     constructor(hex)
//     {
//         this.hex = hex;
//     }
// }