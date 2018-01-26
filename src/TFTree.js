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

const TransformStamped = require('./geometry/TransformStamped.js');
const StaticFrame = require('./StaticFrame.js');
const DynamicFrame = require('./DynamicFrame.js');
const TfChain = require('./TfChain.js');

function cleanId(frameId) {
  if (frameId[0] === '/') {
    return frameId.substr(1);
  }
  // else
  return frameId;
}

class TFTree {
  constructor(maxAgeS = 10) {
    this._maxAgeS = maxAgeS;

    this._frames = {};
    this._frames['base'] = new StaticFrame('base');

    this._waitingForParents = {};
  }
  
  destroy() {
    this._frames = {};
    this._waitingForParents = {};
  }

  handleTFMessage(msg, isStatic = false) {
    const { transforms } = msg;
    const len = transforms.length;
    for (let i = 0; i < len; ++i) {
      const tf = transforms[i];
      let frameId = cleanId(tf.child_frame_id);
      let parentId = cleanId(tf.header.frame_id);

      let frame = this._frames[frameId];
      if (!frame) {
        // if the frame doesn't exist create it. Ignore the parenting for now - it will be set later
        if (isStatic) {
          frame = new StaticFrame(frameId)
        }
        else {
          frame = new DynamicFrame(frameId, { maxAgeS: this._maxAgeS });
        }
        this._frames[frameId] = frame;
      }

      // set parent, child links
      const parent = this._frames[parentId];
      if (parent) {
        // if the parent has changed, delete from the old parent
        if (frame.parent && frame.parent !== parent) {
          frame.parent.children.delete(frame);

          parent.children.add(frame);
          frame.parent = parent;
        }
        // otherwise if this frame has no parent, set it
        else if (!frame.parent) {
          parent.children.add(frame);
          frame.parent = parent;
        }
      }
      else {
        // if the parent frame doesn't exist yet, cache this frame to be hooked up later
        frame.parent = null;
        let waiting = this._waitingForParents[parentId];
        if (!waiting) {
          waiting = [];
          this._waitingForParents[parentId] = waiting;
        }

        // FIXME: make waiting a Set? What if two messages come in with the same child frame
        // before a parent frame comes in
        waiting.push(frame);
      }

      // see if this frame has children waiting for it to exist
      let waitingForThis = this._waitingForParents[frameId];
      if (waitingForThis) {
        waitingForThis.forEach((child) => {
          child.parent = frame;
          frame.children.add(child);
        });
        delete this._waitingForParents[frameId];
      }

      frame.addTransform(TransformStamped.fromRos(tf));
    }
  }

  getFrame(frameId) {
    return this._frames[cleanId(frameId)];
  }

  getFrameIds() {
    return Object.keys(this._frames);
  }

  getOrphanFrameIds() {
    const orphans = [];
    Object.keys(this._waitingForParents).forEach((parentId) => {
      orphans.push(...this._waitingForParents[parentId]);
    });

    return Array.from(Set.from(orphans));
  }

  hasFrame(frameId) {
    return !!this.getFrame(frameId);
  }

  getChain(fromId, toId) {
    const from = this.getFrame(fromId);
    const to = this.getFrame(toId);
    if (from && to) {
      const chain = new TfChain(from, to);
      if (chain._valid) {
        return chain;
      }
    }

    return null;
  }

  getTransform(fromId, toId, stamp) {
    const chain = this.getChain(fromId, toId);
    if (chain) {
      return chain.getTransform(stamp);
    }
    // else
    return null;
  }
}

module.exports = TFTree;
