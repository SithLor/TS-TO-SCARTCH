/**
 * Convert a value from radians to degrees.
 * @param {!number} rad Value in radians.
 * @return {!number} Equivalent value in degrees.
 */
function radToDeg(rad: number): number {
    return (rad * 180) / Math.PI;
}
export default radToDeg;
