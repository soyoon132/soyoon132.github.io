let angle = 0;
let wind;
let text;

let handpose;
let video;
let thumbX, thumbY, thumbZ;
let indexX, indexY, indexZ;

function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
}

// Camera settings
let cam = {
  angle: 0,
  radius: 100,
  rotationSpeed: 0.03,
  distance: 500,
  altitude: 20,
};

function modelLoaded() {
  console.log("handpose ready");
}

function preload() {
  wind = loadModel("fractalcopy.obj", true); // Load the 3D model
  text = loadModel("texth.obj", true); // Load the 3D model
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL); // Enable 3D renderer
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();
  handpose = ml5.handpose(video, modelLoaded);
  handpose.on("predict", gotPose);

  thumbX = 0;
  thumbY = 0;
  thumbZ = 0;
}

function gotPose(results) {
  if (results.length > 0) {
    let thumb = results[0].annotations.thumb[3];
    let index = results[0].annotations.indexFinger[3];
    thumbX = thumb[0];
    thumbY = thumb[1];
    thumbZ = thumb[2];
    indexX = index[0];
    indexY = index[1];
    indexZ = index[2];
  }
}

function draw() {
  background(255,255,255);

  // Display the background image
  push();
  translate(-width / 2, -height / 2, -500); // Move the background back to avoid interfering with the 3D models

  pop();

  noStroke();
  fill(0, 153, 0);
  model(text);

  camera(0, 0, 0, 0, 0, 0, 0, 1, 0);

  // Calculate camera position based on angle and radius
  let camX = cam.radius * cos(cam.angle);
  let camY = cam.radius * sin(cam.angle) - cam.altitude;
  let camZ = cam.distance;

  // Update camera position and look at the center of the scene
  camera(camX, camY, camZ, -500, -500, -500, 0, 1, 0);

  // Increment angle for rotation
  cam.angle += cam.rotationSpeed;

  translate(-width / 2, -height / 2, 0);

  image(video, 0, 0);

  // Draw a line between thumb and index
  stroke(255);
  line(thumbX, thumbY, thumbZ, indexX, indexY, indexZ);

  // Calculate the midpoint
  let mp = midpoint(thumbX, thumbY, indexX, indexY);

  // Display the 3D model at the midpoint
  push(); // Start a new drawing state
  translate(mp[0], mp[1], -(thumbZ + indexZ) / 2); // Move to midpoint and average the Z-axis
  let scaleSize = dist(thumbX, thumbY, indexX, indexY) / 100;
  scale(scaleSize); // Scale based on the distance
  noStroke();
  fill(0, 153, 0);
  pointLight(0, 153, 0, 0, -0, 0);
  rotateX(angle);
  rotateY(angle * 0.03);
  rotateZ(angle * 1.2);
  model(wind);
  angle += 0.07;
  pop(); // Restore original state

  orbitControl(); // Allow user to rotate/zoom the scene
}

const midpoint = (x1, y1, x2, y2) => [(x1 + x2) / 2, (y1 + y2) / 2];
