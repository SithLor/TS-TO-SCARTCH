import HSVObject from "../type/HSVObject";
import RGBObject from "../type/RGBObject";

const formatMessage = require('format-message');

/**
 * Used internally by compare()
 * @param {*} val A value that evaluates to 0 in JS string-to-number conversation such as empty string, 0, or tab.
 * @returns {boolean} True if the value should not be treated as the number zero.
 */
const isNotActuallyZero = (val: string): boolean => {
  if (typeof val !== "string") return false;
  for (let i = 0; i < val.length; i++) {
    const code = val.charCodeAt(i);
    // '0'.charCodeAt(0) === 48
    // '\t'.charCodeAt(0) === 9
    // We include tab for compatibility with scratch-www's broken trim() polyfill.
    // https://github.com/TurboWarp/scratch-vm/issues/115
    // https://scratch.mit.edu/projects/788261699/
    if (code === 48 || code === 9) {
      return false;
    }
  }
  return true;
};
const soup_ = '!#%()*+,-./:;=?@[]^_`{|}~' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
/**
 * Generate a unique ID, from Blockly.  This should be globally unique.
 * 87 characters ^ 20 length > 128 bits (better than a UUID).
 * @return {string} A globally unique ID string.
 */
const uid = function (): string {
    const length = 20;
    const soupLength = soup_.length;
    const id = [];
    for (let i = 0; i < length; i++) {
        // @ts-ignore
        id[i] = soup_.charAt(Math.random() * soupLength);
    }
    return id.join('');
};

/**
 * Check if `maybeMessage` looks like a message object, and if so pass it to `formatMessage`.
 * Otherwise, return `maybeMessage` as-is.
 * @param {*} maybeMessage - something that might be a message descriptor object.
 * @param {object} [args] - the arguments to pass to `formatMessage` if it gets called.
 * @param {string} [locale] - the locale to pass to `formatMessage` if it gets called.
 * @return {string|*} - the formatted message OR the original `maybeMessage` input.
 */
const maybeFormatMessage = function (maybeMessage: any, args: object, locale: string): string | any {
    if (maybeMessage && maybeMessage.id && maybeMessage.default) {
        return formatMessage(maybeMessage, args, locale);
    }
    return maybeMessage;
};
type Target = any;

class util {
    static _mergeVarRefObjects (accum: { [x: string]: any; }, obj2: { [x: string]: any; }): any {
        for (const id in obj2) {
            if (accum[id]) {
                accum[id] = accum[id].concat(obj2[id]);
            } else {
                accum[id] = obj2[id];
            }
        }
        return accum;
    }

    /**
     * Get all variable/list references in the given list of targets
     * in the project.
     * @param {Array.<Target>} targets The list of targets to get the variable
     * and list references from.
     * @param {boolean} shouldIncludeBroadcast Whether to include broadcast message fields.
     * @return {object} An object with variable ids as the keys and a list of block fields referencing
     * the variable.
     */
    static getAllVarRefsForTargets (targets: Array<Target>, shouldIncludeBroadcast: boolean): object {
        return targets
            .map(t => t.blocks.getAllVariableAndListReferences(null, shouldIncludeBroadcast))
            .reduce(this._mergeVarRefObjects, {});
    }

    /**
     * Give all variable references provided a new id and possibly new name.
     * @param {Array<object>} referencesToUpdate Context of the change, the object containing variable
     * references to update.
     * @param {string} newId ID of the variable that the old references should be replaced with
     * @param {?string} optNewName New variable name to merge with. The old
     * variable name in the references being updated should be replaced with this new name.
     * If this parameter is not provided or is '', no name change occurs.
     */
    static updateVariableIdentifiers (referencesToUpdate: Array<object>, newId: string, optNewName: string | null) {
        referencesToUpdate.map(ref => {
            ref.referencingField.id = newId;
            if (optNewName) {
                ref.referencingField.value = optNewName;
            }
            return ref;
        });
    }


  /** @type {RGBObject} */
  static  RGB_BLACK(): RGBObject {
    return { r: 0, g: 0, b: 0 };
  }

  /** @type {RGBObject} */
  static  RGB_WHITE(): RGBObject {
    return { r: 255, g: 255, b: 255 };
  }

  /**
   * Convert a Scratch decimal color to a hex string, #RRGGBB.
   * @param {number} decimal RGB color as a decimal.
   * @return {string} RGB color as #RRGGBB hex string.
   */
  static decimalToHex(decimal: number): string {
    if (decimal < 0) {
      decimal += 0xffffff + 1;
    }
    let hex = Number(decimal).toString(16);
    hex = `#${"000000".substr(0, 6 - hex.length)}${hex}`;
    return hex;
  }

  /**
   * Convert a Scratch decimal color to an RGB color object.
   * @param {number} decimal RGB color as decimal.
   * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
   */
  static decimalToRgb(decimal: number): RGBObject {
    const a = (decimal >> 24) & 0xff;
    const r = (decimal >> 16) & 0xff;
    const g = (decimal >> 8) & 0xff;
    const b = decimal & 0xff;
    //@ts-ignore
    return { r: r, g: g, b: b, a: a > 0 ? a : 255 };
  }

  /**
   * Convert a hex color (e.g., F00, #03F, #0033FF) to an RGB color object.
   * @param {!string} hex Hex representation of the color.
   * @return {RGBObject} null on failure, or rgb: {r: red [0,255], g: green [0,255], b: blue [0,255]}.
   */
  static hexToRgb(hex: string): RGBObject {
    if (hex.startsWith("#")) {
      hex = hex.substring(1);
    }
    const parsed = parseInt(hex, 16);
    if (isNaN(parsed)) {
      //@ts-ignore
      return null;
    }
    if (hex.length === 6) {
      return {
        r: (parsed >> 16) & 0xff,
        g: (parsed >> 8) & 0xff,
        b: parsed & 0xff,
      };
    } else if (hex.length === 3) {
      const r = (parsed >> 8) & 0xf;
      const g = (parsed >> 4) & 0xf;
      const b = parsed & 0xf;
      return {
        r: (r << 4) | r,
        g: (g << 4) | g,
        b: (b << 4) | b,
      };
    }
    return null;
  }

  /**
   * Convert an RGB color object to a hex color.
   * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
   * @return {!string} Hex representation of the color.
   */
  static rgbToHex(rgb: any): string {
    return this.decimalToHex(this.rgbToDecimal(rgb));
  }

  /**
   * Convert an RGB color object to a Scratch decimal color.
   * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
   * @return {!number} Number representing the color.
   */
  static rgbToDecimal(rgb: { r: number; g: number; b: number; } | null): number {
    //@ts-ignore
    return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
  }

  /**
   * Convert a hex color (e.g., F00, #03F, #0033FF) to a decimal color number.
   * @param {!string} hex Hex representation of the color.
   * @return {!number} Number representing the color.
   */
  static hexToDecimal(hex: any): number {
    return this.rgbToDecimal(this.hexToRgb(hex));
  }

  /**
   * Convert an HSV color to RGB format.
   * @param {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
   * @return {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
   */
  static hsvToRgb(hsv: { h: number; s: number; v: number; }): RGBObject {
    let h = hsv.h % 360;
    if (h < 0) h += 360;
    const s = Math.max(0, Math.min(hsv.s, 1));
    const v = Math.max(0, Math.min(hsv.v, 1));

    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));

    let r: number;
    let g: number;
    let b: number;

    switch (i) {
      default:
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
    }

    return {
      r: Math.floor(r * 255),
      g: Math.floor(g * 255),
      b: Math.floor(b * 255),
    };
  }

  /**
   * Convert an RGB color to HSV format.
   * @param {RGBObject} rgb - {r: red [0,255], g: green [0,255], b: blue [0,255]}.
   * @return {HSVObject} hsv - {h: hue [0,360), s: saturation [0,1], v: value [0,1]}
   */
  static rgbToHsv(rgb: { r: number; g: number; b: number; }): HSVObject {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const x = Math.min(Math.min(r, g), b);
    const v = Math.max(Math.max(r, g), b);

    // For grays, hue will be arbitrarily reported as zero. Otherwise, calculate
    let h = 0;
    let s = 0;
    if (x !== v) {
      const f = r === x ? g - b : g === x ? b - r : r - g;
      const i = r === x ? 3 : g === x ? 5 : 1;
      h = ((i - f / (v - x)) * 60) % 360;
      s = (v - x) / v;
    }

    return { h: h, s: s, v: v };
  }

  /**
   * Linear interpolation between rgb0 and rgb1.
   * @param {RGBObject} rgb0 - the color corresponding to fraction1 <= 0.
   * @param {RGBObject} rgb1 - the color corresponding to fraction1 >= 1.
   * @param {number} fraction1 - the interpolation parameter. If this is 0.5, for example, mix the two colors equally.
   * @return {RGBObject} the interpolated color.
   */
  static mixRgb(rgb0: { r: number; g: number; b: number; }, rgb1: { r: number; g: number; b: number; }, fraction1: number): RGBObject {
    if (fraction1 <= 0) return rgb0;
    if (fraction1 >= 1) return rgb1;
    const fraction0 = 1 - fraction1;
    return {
      r: fraction0 * rgb0.r + fraction1 * rgb1.r,
      g: fraction0 * rgb0.g + fraction1 * rgb1.g,
      b: fraction0 * rgb0.b + fraction1 * rgb1.b,
    };
  }

  static simple(original: any) {
    return JSON.parse(JSON.stringify(original));
  }
  /**
   * Scratch cast to number.
   * Treats NaN as 0.
   * In Scratch 2.0, this is captured by `interp.numArg.`
   * @param {*} value Value to cast to number.
   * @return {number} The Scratch-casted number value.
   */
  static toNumber(value: unknown): number {
    // If value is already a number we don't need to coerce it with
    // Number().
    if (typeof value === "number") {
      // Scratch treats NaN as 0, when needed as a number.
      // E.g., 0 + NaN -> 0.
      if (Number.isNaN(value)) {
        return 0;
      }
      return value;
    }
    const n = Number(value);
    if (Number.isNaN(n)) {
      // Scratch treats NaN as 0, when needed as a number.
      // E.g., 0 + NaN -> 0.
      return 0;
    }
    return n;
  }

  /**
   * Scratch cast to boolean.
   * In Scratch 2.0, this is captured by `interp.boolArg.`
   * Treats some string values differently from JavaScript.
   * @param {*} value Value to cast to boolean.
   * @return {boolean} The Scratch-casted boolean value.
   */
  static toBoolean(value: string): boolean {
    // Already a boolean?
    if (typeof value === "boolean") {
      return value;
    }
    if (typeof value === "string") {
      // These specific strings are treated as false in Scratch.
      if (value === "" || value === "0" || value.toLowerCase() === "false") {
        return false;
      }
      // All other strings treated as true.
      return true;
    }
    // Coerce other values and numbers.
    return Boolean(value);
  }

  /**
   * Scratch cast to string.
   * @param {*} value Value to cast to string.
   * @return {string} The Scratch-casted string value.
   */
  static toString(value: any): string {
    return String(value);
  }

  /**
   * Cast any Scratch argument to an RGB color array to be used for the renderer.
   * @param {*} value Value to convert to RGB color array.
   * @return {Array.<number>} [r,g,b], values between 0-255.
   */
  static toRgbColorList(value: any): Array<number> {
    const color = this.toRgbColorObject(value);
    return [color.r, color.g, color.b];
  }

  /**
   * Cast any Scratch argument to an RGB color object to be used for the renderer.
   * @param {*} value Value to convert to RGB color object.
   * @return {RGBOject} [r,g,b], values between 0-255.
   */
  static toRgbColorObject(value: string): RGBObject {
    let color: { r: number; g: number; b: number; a: number; };
    if (typeof value === "string" && value.substring(0, 1) === "#") {
      //@ts-ignore
        color = this.hexToRgb(value);

      // If the color wasn't *actually* a hex color, cast to black
      if (!color) color = { r: 0, g: 0, b: 0, a: 255 };
    } else {
        //@ts-ignore
      color = this.decimalToRgb(this.toNumber(value));
    }
    return color;
  }

  /**
   * Determine if a Scratch argument is a white space string (or null / empty).
   * @param {*} val value to check.
   * @return {boolean} True if the argument is all white spaces or null / empty.
   */
  static isWhiteSpace(val: { trim: () => { (): any; new(): any; length: number; }; } | null): boolean {
    return val === null || (typeof val === "string" && val.trim().length === 0);
  }

  /**
   * Compare two values, using Scratch cast, case-insensitive string compare, etc.
   * In Scratch 2.0, this is captured by `interp.compare.`
   * @param {*} v1 First value to compare.
   * @param {*} v2 Second value to compare.
   * @returns {number} Negative number if v1 < v2; 0 if equal; positive otherwise.
   */
  static compare(v1: any, v2: any): number {
    let n1 = Number(v1);
    let n2 = Number(v2);
    if (n1 === 0 && isNotActuallyZero(v1)) {
      n1 = NaN;
    } else if (n2 === 0 && isNotActuallyZero(v2)) {
      n2 = NaN;
    }
    if (isNaN(n1) || isNaN(n2)) {
      // At least one argument can't be converted to a number.
      // Scratch compares strings as case insensitive.
      const s1 = String(v1).toLowerCase();
      const s2 = String(v2).toLowerCase();
      if (s1 < s2) {
        return -1;
      } else if (s1 > s2) {
        return 1;
      }
      return 0;
    }
    // Handle the special case of Infinity
    if (
      (n1 === Infinity && n2 === Infinity) ||
      (n1 === -Infinity && n2 === -Infinity)
    ) {
      return 0;
    }
    // Compare as numbers.
    return n1 - n2;
  }

  /**
   * Determine if a Scratch argument number represents a round integer.
   * @param {*} val Value to check.
   * @return {boolean} True if number looks like an integer.
   */
  static isInt(val: string | number | string[]): boolean {
    // Values that are already numbers.
    if (typeof val === "number") {
      if (isNaN(val)) {
        // NaN is considered an integer.
        return true;
      }
      // True if it's "round" (e.g., 2.0 and 2).
      return val === Math.floor(val);
    } else if (typeof val === "boolean") {
      // `True` and `false` always represent integer after Scratch cast.
      return true;
    } else if (typeof val === "string") {
      // If it contains a decimal point, don't consider it an int.
      return val.indexOf(".") < 0;
    }
    return false;
  }

  static LIST_INVALID() {
    return "INVALID";
  }

  static  LIST_ALL() {
    return "ALL";
  }

  /**
   * Compute a 1-based index into a list, based on a Scratch argument.
   * Two special cases may be returned:
   * LIST_ALL: if the block is referring to all of the items in the list.
   * LIST_INVALID: if the index was invalid in any way.
   * @param {*} index Scratch arg, including 1-based numbers or special cases.
   * @param {number} length Length of the list.
   * @param {boolean} acceptAll Whether it should accept "all" or not.
   * @return {(number|string)} 1-based index for list, LIST_ALL, or LIST_INVALID.
   */
  static toListIndex(index: string | number, length: number, acceptAll: any): (number | string) {
    if (typeof index !== "number") {
      if (index === "all") {
        //@ts-ignore
        return acceptAll ? this.LIST_ALL : this.LIST_INVALID;
      }
      if (index === "last") {
        if (length > 0) {
          return length;
        }
        //@ts-ignore
        return this.LIST_INVALID;
      } else if (index === "random" || index === "any") {
        if (length > 0) {
          return 1 + Math.floor(Math.random() * length);
        }
        //@ts-ignore
        return this.LIST_INVALID;
      }
    }
    index = Math.floor(this.toNumber(index));
    if (index < 1 || index > length) {
        //@ts-ignore
      return this.LIST_INVALID;
    }
    return index;
  }
  /**
   * Convert a base64 encoded string to a Uint8Array.
   * @param {string} base64 - a base64 encoded string.
   * @return {Uint8Array} - a decoded Uint8Array.
   */
  static base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const array = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      array[i] = binaryString.charCodeAt(i);
    }
    return array;
  }

  /**
   * Convert a Uint8Array to a base64 encoded string.
   * @param {Uint8Array} array - the array to convert.
   * @return {string} - the base64 encoded string.
   */
  static uint8ArrayToBase64(array: number[] | Uint8Array): string {
    let binary = "";
    const len = array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(array[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert an array buffer to a base64 encoded string.
   * @param {array} buffer - an array buffer to convert.
   * @return {string} - the base64 encoded string.
   */
  static arrayBufferToBase64(buffer: Iterable<number>): string {
    return this.uint8ArrayToBase64(new Uint8Array(buffer));
  }
      /**
     * Convert a value from degrees to radians.
     * @param {!number} deg Value in degrees.
     * @return {!number} Equivalent value in radians.
     */
      static degToRad (deg: number): number {
        return deg * Math.PI / 180;
    }

    /**
     * Convert a value from radians to degrees.
     * @param {!number} rad Value in radians.
     * @return {!number} Equivalent value in degrees.
     */
    static radToDeg (rad: number): number {
        return rad * 180 / Math.PI;
    }

    /**
     * Clamp a number between two limits.
     * If n < min, return min. If n > max, return max. Else, return n.
     * @param {!number} n Number to clamp.
     * @param {!number} min Minimum limit.
     * @param {!number} max Maximum limit.
     * @return {!number} Value of n clamped to min and max.
     */
    static clamp (n: number, min: number, max: number): number {
        return Math.min(Math.max(n, min), max);
    }

    /**
     * Keep a number between two limits, wrapping "extra" into the range.
     * e.g., wrapClamp(7, 1, 5) == 2
     * wrapClamp(0, 1, 5) == 5
     * wrapClamp(-11, -10, 6) == 6, etc.
     * @param {!number} n Number to wrap.
     * @param {!number} min Minimum limit.
     * @param {!number} max Maximum limit.
     * @return {!number} Value of n wrapped between min and max.
     */
    static wrapClamp (n: number, min: number, max: number): number {
        const range = (max - min) + 1;
        return n - (Math.floor((n - min) / range) * range);
    }


    /**
     * Convert a value from tan function in degrees.
     * @param {!number} angle in degrees
     * @return {!number} Correct tan value
     */
    static tan (angle: number): number {
        angle = angle % 360;
        switch (angle) {
        case -270:
        case 90:
            return Infinity;
        case -90:
        case 270:
            return -Infinity;
        default:
            return Math.round(Math.tan((Math.PI * angle) / 180) * 1e10) / 1e10;
        }
    }

    /**
     * Given an array of unique numbers,
     * returns a reduced array such that each element of the reduced array
     * represents the position of that element in a sorted version of the
     * original array.
     * E.g. [5, 19. 13, 1] => [1, 3, 2, 0]
     * @param {Array<number>} elts The elements to sort and reduce
     * @return {Array<number>} The array of reduced orderings
     */
    static reducedSortOrdering (elts: any[]): Array<number> {
        const sorted = elts.slice(0).sort((a: number, b: number) => a - b);
        return elts.map((e: any) => sorted.indexOf(e));
    }

    /**
     * Return a random number given an inclusive range and a number in that
     * range that should be excluded.
     *
     * For instance, (1, 5, 3) will only pick 1, 2, 4, or 5 (with equal
     * probability)
     *
     * @param {number} lower - The lower bound (inlcusive)
     * @param {number} upper - The upper bound (inclusive), such that lower <= upper
     * @param {number} excluded - The number to exclude (MUST be in the range)
     * @return {number} A random integer in the range [lower, upper] that is not "excluded"
     */
    static inclusiveRandIntWithout (lower: number, upper: number, excluded: number): number {
        // Note that subtraction is the number of items in the
        // inclusive range [lower, upper] minus 1 already
        // (e.g. in the set {3, 4, 5}, 5 - 3 = 2).
        const possibleOptions = upper - lower;

        const randInt = lower + Math.floor(Math.random() * possibleOptions);
        if (randInt >= excluded) {
            return randInt + 1;
        }

        return randInt;
    }

    /**
     * Scales a number from one range to another.
     * @param {number} i number to be scaled
     * @param {number} iMin input range minimum
     * @param {number} iMax input range maximum
     * @param {number} oMin output range minimum
     * @param {number} oMax output range maximum
     * @return {number} scaled number
     */
    static scale (i: number, iMin: number, iMax: number, oMin: number, oMax: number): number {
        const p = (i - iMin) / (iMax - iMin);
        return (p * (oMax - oMin)) + oMin;
    }

    static withoutTrailingDigits (s: string) {
        let i = s.length - 1;
        while ((i >= 0) && ('0123456789'.indexOf(s.charAt(i)) > -1)) i--;
        return s.slice(0, i + 1);
    }

    static unusedName (name: number, existingNames: string | any[]) {
        if (existingNames.indexOf(name) < 0) return name;
        name = this.withoutTrailingDigits(name);
        let i = 2;
        while (existingNames.indexOf(name + i) >= 0) i++;
        return name + i;
    }

    /**
     * Split a string on the first occurrence of a split character.
     * @param {string} text - the string to split.
     * @param {string} separator - split the text on this character.
     * @returns {string[]} - the two parts of the split string, or [text, null] if no split character found.
     * @example
     * // returns ['foo', 'tar.gz']
     * splitFirst('foo.tar.gz', '.');
     * @example
     * // returns ['foo', null]
     * splitFirst('foo', '.');
     * @example
     * // returns ['foo', '']
     * splitFirst('foo.', '.');
     */
    static splitFirst (text: string, separator: string): string[] {
        const index = text.indexOf(separator);
        if (index >= 0) {
            return [text.substring(0, index), text.substring(index + 1)];
        }
        return [text, null];

    }

    /**
     * A customized version of JSON.stringify that sets Infinity/NaN to 0,
     * instead of the default (null).
     * Needed because null is not of type number, but Infinity/NaN are, which
     * can lead to serialization producing JSON that isn't valid based on the parser schema.
     * It is also consistent with the behavior of saving 2.0 projects.
     * This is only needed when stringifying an object for saving.
     *
     * @param {!object} obj - The object to serialize
     * @return {!string} The JSON.stringified string with Infinity/NaN replaced with 0
     */
    static stringify (obj: object): string {
        return JSON.stringify(obj, (_key, value) => {
            if (typeof value === 'number' &&
               (value === Infinity || value === -Infinity || isNaN(value))){
                return 0;
            }
            return value;
        });
    }
    /**
     * A function to replace unsafe characters (not allowed in XML) with safe ones. This is used
     * in cases where we're replacing non-user facing strings (e.g. variable IDs).
     * When replacing user facing strings, the xmlEscape utility function should be used
     * instead so that the user facing string does not change how it displays.
     * @param {!string | !Array.<string>} unsafe Unsafe string possibly containing unicode control characters.
     * In some cases this argument may be an array (e.g. hacked inputs from 2.0)
     * @return {string} String with control characters replaced.
     */
    static replaceUnsafeChars (unsafe: string | Array<string>): string {
        if (typeof unsafe !== 'string') {
            if (Array.isArray(unsafe)) {
                // This happens when we have hacked blocks from 2.0
                // See #1030
                unsafe = String(unsafe);
            } else {
                console.error('Unexpected input recieved in replaceUnsafeChars');
                return unsafe;
            }
        }
        return unsafe.replace(/[<>&'"]/g, c => {
            switch (c) {
            case '<': return 'lt';
            case '>': return 'gt';
            case '&': return 'amp';
            case '\'': return 'apos';
            case '"': return 'quot';
            }
        });
    }

}

util.