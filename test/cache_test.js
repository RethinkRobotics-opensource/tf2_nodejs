const chai = require('chai');
const expect = chai.expect;

const TransformCache = require('../src/TransformCache.js');
const Transform = require('../src/geometry/Transform.js');
const TransformStamped = require('../src/geometry/TransformStamped.js');
const Frame = require('../src/geometry/Frame.js');

const { Vector3, Quaternion } = require('three');

describe('binarySearch', () => {
  it('Inserting, Time Expiration', () => {
    const cache = new TransformCache(1);

    const t1 = new TransformStamped();
    // FIXME: use non-random change in position to prevent consolidation of data
    t1.transform.translation.x = Math.random();
    t1.header.stamp.nsecs = 2;
    cache.insert(t1);
    expect(cache.length).to.equal(1);
    expect(cache.get(0)).to.equal(t1);

    const t2 = new TransformStamped();
    t2.transform.translation.x = Math.random();

    cache.insert(t2);
    expect(cache.length).to.equal(2);
    expect(cache.get(0)).to.equal(t2);
    expect(cache.get(1)).to.equal(t1);


    const t3 = new TransformStamped();
    t3.transform.translation.x = Math.random();
    t3.header.stamp.secs = 1;
    t3.header.stamp.nsecs = 1;
    t3.header.frame_id = 't3';

    cache.insert(t3);
    expect(cache.length).to.equal(2);
    expect(cache.get(0)).to.equal(t1);
    expect(cache.get(1)).to.equal(t3);


    const t4 = new TransformStamped();
    t4.transform.translation.x = Math.random();
    t4.header.stamp.secs = 1;
    t4.header.stamp.nsecs = 1;
    t4.header.frame_id = 't4';

    cache.insert(t4);
    expect(cache.length).to.equal(2);
    expect(cache.get(0)).to.equal(t1);
    expect(cache.get(1)).to.equal(t4);


    const t5 = new TransformStamped();
    t5.transform.translation.x = Math.random();
    t5.header.stamp.nsecs = 4;

    cache.insert(t5);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(t1);
    expect(cache.get(1)).to.equal(t5);
    expect(cache.get(2)).to.equal(t4);


    const t6 = new TransformStamped();
    t6.transform.translation.x = Math.random();
    t6.header.stamp.nsecs = 7;

    cache.insert(t6);
    expect(cache.length).to.equal(4);
    expect(cache.get(0)).to.equal(t1);
    expect(cache.get(1)).to.equal(t5);
    expect(cache.get(2)).to.equal(t6);
    expect(cache.get(3)).to.equal(t4);


    const t7 = new TransformStamped();
    t7.transform.translation.x = Math.random();
    t7.header.stamp.secs = 1;
    t7.header.stamp.nsecs = 7;

    cache.insert(t7);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(t6);
    expect(cache.get(1)).to.equal(t4);
    expect(cache.get(2)).to.equal(t7);


    const t8 = new TransformStamped();
    t8.transform.translation.x = Math.random();
    t8.header.stamp.secs = 1;
    t8.header.stamp.nsecs = 14;

    cache.insert(t8);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(t4);
    expect(cache.get(1)).to.equal(t7);
    expect(cache.get(2)).to.equal(t8);

    const t9 = t7.clone();
    cache.insert(t9);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(t4);
    expect(cache.get(1)).to.equal(t9);
    expect(cache.get(2)).to.equal(t8);

    cache.clear();
    expect(cache.length).to.equal(0);
  });

  it('Inserting, Data Consolidation', () => {
    const cache = new TransformCache(1000);

    const HEAD = new TransformStamped();
    HEAD.header.stamp.secs = 20;
    HEAD.transform.translation.x = Math.random();
    const TAIL = new TransformStamped();
    TAIL.header.stamp.secs = 0;
    TAIL.transform.translation.x = Math.random();

    cache.insert(HEAD);
    cache.insert(TAIL);

    function clone(t, nsecs) {
      const c = t.clone();
      c.header.stamp.nsecs = nsecs;
      return c;
    }

    let t = new TransformStamped();
    t.transform.translation.x = Math.random();
    t.header.stamp.secs = 10;
    t.header.stamp.nsecs = 5;

    const tfList = [
      clone(t, 0),
      t,
      clone(t, 10)
    ];

    cache.insert(tfList[1]);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(tfList[1]);
    expect(cache.get(2)).to.equal(HEAD);

    cache.insert(tfList[2]);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(tfList[2]);
    expect(cache.get(2)).to.equal(HEAD);

    cache.insert(tfList[0]);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(tfList[0]);
    expect(cache.get(2)).to.equal(HEAD);



    // end, match behind
    cache.clear();

    cache.insert(tfList[0]);
    cache.insert(TAIL);

    // if we insert different data it should go in (as long as time is valid)
    t = new TransformStamped();
    t.transform.translation.x = Math.random();
    t.header.stamp.secs = 10;
    t.header.stamp.nsecs = 7;

    cache.insert(t);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(tfList[0]);
    expect(cache.get(2)).to.equal(t);

    // if we change the transform to be the same as the others and reinsert,
    // it should replace both the old data for the stamp AND the other time
    // with equivalent data
    t.transform = tfList[0].transform.clone();
    cache.insert(t);
    expect(cache.length).to.equal(2);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(t);



    // middle, match back
    cache.clear();

    cache.insert(tfList[0]);
    cache.insert(HEAD);
    cache.insert(TAIL);

    let t2 = new TransformStamped();
    t2.transform.translation.x = Math.random();
    t2.header.stamp.secs = 10;
    t2.header.stamp.nsecs = 7;

    cache.insert(t2)

    let t3 = new TransformStamped();
    t3.transform.translation.x = Math.random();
    t3.header.stamp.secs = 10;
    t3.header.stamp.nsecs = 12;

    cache.insert(t3);

    expect(cache.length).to.equal(5);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(tfList[0]);
    expect(cache.get(2)).to.equal(t2);
    expect(cache.get(3)).to.equal(t3);
    expect(cache.get(4)).to.equal(HEAD);

    t2.transform = tfList[0].transform.clone();
    cache.insert(t2);
    expect(cache.length).to.equal(4);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(t2);
    expect(cache.get(2)).to.equal(t3);
    expect(cache.get(3)).to.equal(HEAD);


    // middle, match forward
    cache.clear();

    cache.insert(tfList[2]);
    cache.insert(HEAD);
    cache.insert(TAIL);

    t2 = new TransformStamped();
    t2.transform.translation.x = Math.random();
    t2.header.stamp.secs = 10;
    t2.header.stamp.nsecs = 7;

    cache.insert(t2)

    t3 = new TransformStamped();
    t3.transform.translation.x = Math.random();
    t3.header.stamp.secs = 10;
    t3.header.stamp.nsecs = 0;

    cache.insert(t3);

    expect(cache.length).to.equal(5);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(t3);
    expect(cache.get(2)).to.equal(t2);
    expect(cache.get(3)).to.equal(tfList[2]);
    expect(cache.get(4)).to.equal(HEAD);

    t2.transform = tfList[0].transform.clone();
    cache.insert(t2);
    expect(cache.length).to.equal(4);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(t3);
    expect(cache.get(2)).to.equal(t2);
    expect(cache.get(3)).to.equal(HEAD);

    // middle, match forward and back
    cache.clear();

    cache.insert(tfList[2]);
    cache.insert(HEAD);
    cache.insert(TAIL);

    t2 = new TransformStamped();
    t2.transform.translation.x = Math.random();
    t2.header.stamp.secs = 10;
    t2.header.stamp.nsecs = 7;

    cache.insert(t2)
    // have to wait to insert tfList[1] until t2 is in
    // otherwise it will consolidate with tfList[2]
    cache.insert(tfList[1]);
    expect(cache.length).to.equal(5);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(tfList[1]);
    expect(cache.get(2)).to.equal(t2);
    expect(cache.get(3)).to.equal(tfList[2]);
    expect(cache.get(4)).to.equal(HEAD);

    t2.transform = tfList[0].transform.clone();
    cache.insert(t2);
    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(TAIL);
    expect(cache.get(1)).to.equal(t2);
    expect(cache.get(2)).to.equal(HEAD);


    // start, match forward
    cache.clear();
    cache.insert(HEAD);

    cache.insert(tfList[2]);

    t2 = new TransformStamped();
    t2.transform.translation.x = Math.random();
    t2.header.stamp.secs = 10;
    t2.header.stamp.nsecs = 7;

    cache.insert(t2)

    expect(cache.length).to.equal(3);
    expect(cache.get(0)).to.equal(t2);
    expect(cache.get(1)).to.equal(tfList[2]);
    expect(cache.get(2)).to.equal(HEAD);

    t2.transform = tfList[0].transform.clone();
    cache.insert(t2);
    expect(cache.length).to.equal(2);
    expect(cache.get(0)).to.equal(t2);
    expect(cache.get(1)).to.equal(HEAD);
  });
});
