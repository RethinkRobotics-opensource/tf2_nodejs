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

const { Vector3, Quaternion } = require('three');

class Transform {
  constructor(translation, rotation) {
    this.translation = translation || new Vector3();
    this.rotation = rotation || new Quaternion();
  }

  equals(otherTransform) {
    return this.translation.equals(otherTransform.translation)
      && this.rotation.equals(otherTransform.rotation);
  }

  setIdentity() {
    this.translation = new Vector3();
    this.rotation = new Quaternion();
  }

  translate(t) {
    this.translation.add(t.clone().applyQuaternion());
  }

  rotate(r) {
    this.rotation.multiplyQuaternions(this.rotation, r);
  }

  inverse() {
    const t = this.translation.clone().multiplyScalar(-1);
    const r = this.rotation.clone().inverse();
    return new Transform(t.applyQuaternion(r), r);
  }

  times(rhs) {
    if (rhs instanceof Transform) {
      const r = this.rotation.clone();
      const t = this.translation.clone();

      let result = new Transform(
        t.add(rhs.translation.clone().applyQuaternion(this.rotation)),
        r.multiply(rhs.rotation)
      );

      return result;
    }
  }

  clone() {
    return new Transform(this.translation.clone(), this.rotation.clone());
  }

  static fromRos(tf) {
    const { translation: t, rotation: q } = tf;
    return new Transform(
      new Vector3(t.x, t.y, t.z),
      new Quaternion(q.x, q.y, q.z, q.w)
    );
  }

}

module.exports = Transform;
