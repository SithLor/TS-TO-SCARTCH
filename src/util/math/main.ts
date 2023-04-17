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
  function inclusiveRandIntWithout(lower: number, upper: number, excluded: number): number {
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
  export default inclusiveRandIntWithout;

