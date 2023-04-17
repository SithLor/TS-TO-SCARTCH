/**
 * Given an array of unique numbers,
 * returns a reduced array such that each element of the reduced array
 * represents the position of that element in a sorted version of the
 * original array.
 * E.g. [5, 19. 13, 1] => [1, 3, 2, 0]
 * @param {Array<number>} elts The elements to sort and reduce
 * @return {Array<number>} The array of reduced orderings
 */
function reducedSortOrdering(elts: any[]): Array<number> {
    const sorted = elts.slice(0).sort((a: number, b: number) => a - b);
    return elts.map((e: any) => sorted.indexOf(e));
}
export default reducedSortOrdering;
