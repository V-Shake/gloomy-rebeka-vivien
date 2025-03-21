// Interface
let dataButton;
let dataLabel;
let trainButton;
let saveButton;

let nn;

let faceMesh;
let video;
let faces = [];
let options = { maxFaces: 1, refineLandmarks: false, flipHorizontal: false };

let mouthPoints = [
  13, 14, 78, 80, 81, 82, 84, 85, 86, 87, 88, 89, 
  90, 91, 146, 178, 179, 180, 181, 183, 184, 
  185, 191, 267, 268, 269, 270, 271, 272, 291, 292, 308, 310, 311, 312, 
  317, 318, 319, 320, 321, 324, 325, 402, 405, 409, 415
];

let eyebrowPoints = [
  65, 66, 67, 68, 69, 70, 71, 63, 105, 107, 46, 53, 52, 
  296, 297, 298, 299, 300, 334, 333, 332, 331, 330, 282, 283, 284, 
  285, 336, 285, 295, 293, 335, 276, 337, 338
];

function preload() {
  // Load the faceMesh model
  faceMesh = ml5.faceMesh(options);
}

function setup() {
  createCanvas(640, 480);
  ml5.setBackend("webgl");
  
  //create a new neural net that can be trained
  nn = new NN();
  
  // dropdown menu to select the class whose hand poses are to be assigned
  dataLabel = createSelect();
  dataLabel.option('neutral');
  dataLabel.option('happy');
  dataLabel.option('sad');
  dataLabel.option('suprise');
  //dataLabel.option('C');
  //dataLabel.option('D');
  //... copy paste if you need more classes

  
  // create a Button 
  dataButton = createButton('add example');
  // assign the button to a function
  dataButton.mousePressed(addExampleButtonFunction);
  //... 
  trainButton = createButton('train model');
  trainButton.mousePressed(trainModelButtonFunction);
  //...
  saveButton = createButton('save trained Model');
  saveButton.mousePressed(saveModelButtonFunction);
  
  
  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  // Start detecting faces from the webcam video
  faceMesh.detectStart(video, gotFaces);
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  //If a nn model is trained and a hand is detected show classification results
  if (faces.length > 0 && nn.isTrained) {
    let inputs = getInputs(faces[0]);
    nn.classify(inputs);
    textSize(20);
    text(nn.label,20,20);
  }
  
  // Draw all the tracked face points
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    
    // Display all keypoints with their index numbers
    for (let j = 0; j < face.keypoints.length; j++) {
      let keypoint = face.keypoints[j];
      
      // Draw the point
      noStroke();
      fill(0, 255, 255);  // Cyan to make all points visible
      circle(keypoint.x, keypoint.y, 3);
      
      // Draw the index number for ALL points
      textSize(8);
      fill(255);
      text(j, keypoint.x + 5, keypoint.y);
    }
    
    // Highlight mouth-related points with different colors
    for (let k = 0; k < mouthPoints.length; k++) {
      let idx = mouthPoints[k];
      if (idx < face.keypoints.length) {
        let keypoint = face.keypoints[idx];
        fill(255, 0, 0);  // Red for mouth points
        circle(keypoint.x, keypoint.y, 5);
      }
    }
    
    // Highlight eyebrow-related points with bright blue
    for (let k = 0; k < eyebrowPoints.length; k++) {
      let idx = eyebrowPoints[k];
      if (idx < face.keypoints.length) {
        let keypoint = face.keypoints[idx];
        fill(0, 180, 255);  // Brighter blue for eyebrow points
        circle(keypoint.x, keypoint.y, 6);  // Slightly larger circles
        
        // Add index numbers next to eyebrow points in white
        textSize(8);
        fill(255);
        text(idx, keypoint.x + 5, keypoint.y);
      }
    }
  }
}
  
// Callback function for when faceMesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
}


// Functions when ui Button is pressed

// add a Hand keypoint list example as training data
function addExampleButtonFunction(){
  if(faces.length > 0){
    nn.addExample(getInputs(faces[0]), dataLabel.value())
  }
}

// Train the a model for classification
function trainModelButtonFunction(){
  nn.trainModel();
}

// Save the model as json file -> download
function saveModelButtonFunction(){
  nn.saveModel();
}

function getInputs(face) {
  let keypoints = face.keypoints;
  let inputs = [];
  
  // Find a reference point (nose tip) for normalization
  let nosePoint = keypoints[1]; // Using point 1 as nose reference
  
  // Only use the mouth keypoints, normalized relative to nose position
  for (let i = 0; i < mouthPoints.length; i++) {
    let idx = mouthPoints[i];
    if (idx < keypoints.length) {
      // Store relative positions instead of absolute ones
      inputs.push(keypoints[idx].x - nosePoint.x);
      inputs.push(keypoints[idx].y - nosePoint.y);
      inputs.push(keypoints[idx].z - nosePoint.z);
    }
  }
  
  // Also use the eyebrow keypoints, normalized relative to nose position
  for (let i = 0; i < eyebrowPoints.length; i++) {
    let idx = eyebrowPoints[i];
    if (idx < keypoints.length) {
      // Store relative positions instead of absolute ones
      inputs.push(keypoints[idx].x - nosePoint.x);
      inputs.push(keypoints[idx].y - nosePoint.y);
      inputs.push(keypoints[idx].z - nosePoint.z);
    }
  }
  
  return inputs;
}
