/*
 *    Copyright 2018 Rethink Robotics
 *
 *    Copyright 2018 Chris Smith
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

const Transform = require('./geometry/Transform.js');

class TfChain {
  constructor(from, to) {
    this._from = from;
    this._to = to;

    this._links = [];
    this._inverted = [];

    this._construct();
  }

  _construct() {
    if (this._from === this._to) {
      // short circuit for identical frames
      this._valid = true;
    }
    else {
      // get a path from the sink frame to its root
      const toChain = [];
      let link = this._to;
      while (link) {
        toChain.unshift(link);
        link = link.parent;
      }

      // get a path from the source frame to its root
      const fromChain = [];
      link = this._from;
      while (link) {
        fromChain.unshift(link);
        link = link.parent;
      }

      let numToLinks = toChain.length;
      let numFromLinks = fromChain.length;

      // if the roots don't match, you're out-a-luck
      if (fromChain[0] !== toChain[0]) {
        this._valid = false;
        return;
      }

      // delete common roots

      // walk through chains from root until we find a difference
      // this lets us find the first common ancestor and delete anything extra
      let max = Math.min(numToLinks, numFromLinks);
      let i = 0;
      while (i < max) {
        if (toChain[i] === fromChain[i]) {
          ++i;
        }
        else {
          break;
        }
      }

      toChain.splice(0, i);
      numToLinks = toChain.length;
      fromChain.splice(0, i);
      numFromLinks = fromChain.length;

      for (let i = 0; i < numFromLinks; ++i) {
        this._links.unshift(fromChain[i]);
        this._inverted.unshift(true);
      }

      for (let i = 0; i < numToLinks; ++i) {
        this._links.push(toChain[i]);
        this._inverted.push(false);
      }

      this._valid = true;
    }
  }

  getTransform(stamp) {
    let t = new Transform();
    const numLinks = this._links.length;
    for (let i = 0; i < numLinks; ++i) {
      const transform = this._links[i].getTransform(stamp);
      if (transform) {
        if (this._inverted[i]) {
          t = t.times(transform.inverse());
        }
        else {
          t = t.times(transform);
        }
      }
      else {
        return null;
      }
    }
    return t;
  }
}

module.exports = TfChain;
