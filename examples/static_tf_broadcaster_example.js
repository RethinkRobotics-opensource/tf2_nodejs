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

const rosnodejs = require('rosnodejs');
const tf2Nodejs = require('../src/index.js');

// NOTE: rosnodejs is not a direct dependency of tf2_nodejs - if you're running the examples, make sure
// rosnodejs can be found by tf2_nodejs in your workspace

const TransformStamped = rosnodejs.require('geometry_msgs').msg.TransformStamped;
rosnodejs.initNode('/tf_static_broadcaster', { anonymous: true })
.then(() => {

  tf2Nodejs.configure({
    ros: rosnodejs
  });

  const tfBroadcaster = new tf2Nodejs.StaticTransformBroadcaster();

  const msg = new TransformStamped();
  msg.header.frame_id = 'base';
  msg.child_frame_id = 'static_child';
  msg.transform.translation = { x: 0.5, y: 0.2, z: 0.1 };
  msg.transform.rotation = { x: 1, y: 0, z: 0, w: 0 };

  const msg2 = new TransformStamped();
  msg2.header.frame_id = 'base';
  msg2.child_frame_id = 'static_child_2';
  msg2.transform.translation = { x: 0, y: 0.2, z: 0 };
  msg2.transform.rotation = { x: 0, y: 0, z: 0, w: 1 };
  tfBroadcaster.sendTransform([ msg, msg2 ]);

  setTimeout(function() {
    msg.transform.translation = { x: 0.5, y: 0.2, z: 0.2 };
    msg.transform.rotation = { x: 0, y: 1, z: 0, w: 0 };
    tfBroadcaster.sendTransform(msg);

    setTimeout(function() {
      tfBroadcaster.shutdown();
      rosnodejs.shutdown();
    }, 100);
  }, 5000);
});
