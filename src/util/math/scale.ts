/**
 * Scales a number from one range to another.
 * @param {number} i number to be scaled
 * @param {number} iMin input range minimum
 * @param {number} iMax input range maximum
 * @param {number} oMin output range minimum
 * @param {number} oMax output range maximum
 * @return {number} scaled number
 */
function scale(i: number, iMin: number, iMax: number, oMin: number, oMax: number): number {
    const p = (i - iMin) / (iMax - iMin);
    return p * (oMax - oMin) + oMin;
}
export default scale;
