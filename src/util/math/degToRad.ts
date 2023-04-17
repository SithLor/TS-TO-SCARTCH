/**
 * Convert a value from degrees to radians.
 * @param {!number} deg Value in degrees.
 * @return {!number} Equivalent value in radians.
 */
function degToRad(deg: number): number {
    return (deg * Math.PI) / 180;
}
export default degToRad;
