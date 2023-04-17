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
function wrapClamp(n: number, min: number, max: number): number {
    const range = max - min + 1;
    return n - Math.floor((n - min) / range) * range;
}
export default wrapClamp;
