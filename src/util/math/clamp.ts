/**
 * Clamp a number between two limits.
 * If n < min, return min. If n > max, return max. Else, return n.
 * @param {!number} n Number to clamp.
 * @param {!number} min Minimum limit.
 * @param {!number} max Maximum limit.
 * @return {!number} Value of n clamped to min and max.
 */
function clamp(n: number, min: number, max: number): number {
    return Math.min(Math.max(n, min), max);
}
export default clamp;
