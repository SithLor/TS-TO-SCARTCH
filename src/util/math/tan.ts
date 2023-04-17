/**
 * Convert a value from tan function in degrees.
 * @param {!number} angle in degrees
 * @return {!number} Correct tan value
 */
function tan(angle: number): number {
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
export default tan;
