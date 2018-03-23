# tf2_nodejs

Work In Progress

## Work with rosnodejs
```
const rosnodejs = require('rosnodejs');
const TransformStamped = rosnodejs.require('geometry_msgs').msg.TransformStamped;

rosnodejs.initNode('/tfListener', { anonymous: true })
.then(() => {

  tf2Nodejs.configure({
    ros: rosnodejs
  });

  const buffer = new tf2Nodejs.Buffer(10);
  const listener = new tf2Nodejs.TransformListener(buffer);
  const staticTfBroadcaster = new tf2Nodejs.StaticTransformBroadcaster();
  const tfBroadcaster = new tf2Nodejs.TransformBroadcaster();
  
  const msg = new TransformStamped();
  msg.header.frame_id = 'base';
  msg.child_frame_id = 'moving_child';
  msg.transform.translation = { x: 0.5, y: 0.2, z: 0.1 };
  msg.transform.rotation = { x: 1, y: 0, z: 0, w: 0 };
  tfBroadcaster.sendTransform(msg);
  
  buffer.lookupTransform('base', 'right_hand', {secs: 0, nsecs: 0});
```
