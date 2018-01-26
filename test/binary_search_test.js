const chai = require('chai');
const expect = chai.expect;

const BinarySearch = require('../src/BinarySearch.js');
const { binarySearchIndex, binarySearch, binarySearchBounds } = BinarySearch;

const TimeUtils = require('../src/TimeUtils.js');

describe('binarySearch', () => {
  it('Numbers', () => {

    //------------------------------------------------------------------------
    // INDEX
    //------------------------------------------------------------------------
    const TEST_ARRAY = [0, 1, 3, 5, 8, 19];

    expect(binarySearchIndex([], 12)).to.equal(-1);
    expect(binarySearchIndex([-1], 12)).to.equal(-1);

    expect(binarySearchIndex(TEST_ARRAY, 1.99)).to.equal(1);
    expect(binarySearchIndex(TEST_ARRAY, 2)).to.equal(1);
    expect(binarySearchIndex(TEST_ARRAY, 2.01)).to.equal(2);
    expect(binarySearchIndex(TEST_ARRAY, 2.0000001)).to.equal(2);

    expect(binarySearchIndex(TEST_ARRAY, 1)).to.equal(1);

    expect(binarySearchIndex(TEST_ARRAY, 0)).to.equal(0);

    expect(binarySearchIndex(TEST_ARRAY, -1)).to.equal(-1);

    expect(binarySearchIndex(TEST_ARRAY, 6.5)).to.equal(3);

    expect(binarySearchIndex(TEST_ARRAY, 18)).to.equal(5);
    expect(binarySearchIndex(TEST_ARRAY, 19)).to.equal(5);
    expect(binarySearchIndex(TEST_ARRAY, 2000)).to.equal(-1);

    //------------------------------------------------------------------------
    // BOUNDS
    //------------------------------------------------------------------------

    expect(binarySearchBounds([], 12)).to.deep.equal([]);
    expect(binarySearchBounds([-1], 12)).to.deep.equal([]);

    expect(binarySearchBounds(TEST_ARRAY, 1.99)).to.deep.equal([1, 2]);
    expect(binarySearchBounds(TEST_ARRAY, 2)).to.deep.equal([1, 2]);
    expect(binarySearchBounds(TEST_ARRAY, 2.01)).to.deep.equal([1, 2]);
    expect(binarySearchBounds(TEST_ARRAY, 2.0000001)).to.deep.equal([1, 2]);

    expect(binarySearchBounds(TEST_ARRAY, 1)).to.deep.equal([1]);

    expect(binarySearchBounds(TEST_ARRAY, 0)).to.deep.equal([0]);

    expect(binarySearchBounds(TEST_ARRAY, -1)).to.deep.equal([]);

    expect(binarySearchBounds(TEST_ARRAY, 6.5)).to.deep.equal([3, 4]);

    expect(binarySearchBounds(TEST_ARRAY, 18)).to.deep.equal([4, 5]);
    expect(binarySearchBounds(TEST_ARRAY, 19)).to.deep.equal([5]);
    expect(binarySearchBounds(TEST_ARRAY, 2000)).to.deep.equal([]);
  });

  it('Ros Times', () => {
    const times = [
      {secs: 0, nsecs: 0},
      {secs: 10, nsecs: 5},
      {secs: 12, nsecs: 13},
      {secs: 12, nsecs: 15},
      {secs: 1000, nsecs: 32}
    ];

    expect(binarySearchIndex(times, {secs: 0, nsecs: 0}, TimeUtils.distance)).to.equal(0);

    expect(binarySearchIndex(times, {secs: 12, nsecs: 0}, TimeUtils.distance)).to.equal(2);

    expect(binarySearchIndex(times, {secs: 12, nsecs: 14}, TimeUtils.distance)).to.equal(2);

    expect(binarySearchIndex(times, {secs: 2000, nsecs: 0}, TimeUtils.distance)).to.equal(-1);

    expect(binarySearchIndex(times, {secs: -1, nsecs: 0}, TimeUtils.distance)).to.equal(-1);

  })
});
