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
const readline = require('readline');

// NOTE: rosnodejs is not a direct dependency of tf2_nodejs - if you're running the examples, make sure
// rosnodejs can be found by tf2_nodejs in your workspace

rosnodejs.initNode('/tfListener', { anonymous: true })
.then(() => {

  tf2Nodejs.configure({
    ros: rosnodejs
  });

  const buffer = new tf2Nodejs.Buffer(10);
  const listener = new tf2Nodejs.TransformListener(buffer);
  listener.init();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function query() {
    rl.question('Transform between which frames?\n', (answer) => {
      const frames = answer.split(' ');
      if (frames.length === 2) {
        // const now = rosnodejs.Time.now();
        // now.secs -= 1;
        const now = {secs: 0, nsecs: 0};
        const tf = buffer.lookupTransform(frames[0], frames[1], now);
        console.log('%j', tf);
      }

      setTimeout(query, 1000);
    });
  }

  query();
});
