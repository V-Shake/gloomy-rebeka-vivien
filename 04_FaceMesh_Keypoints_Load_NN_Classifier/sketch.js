/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates loading a pre-trained model with ml5.neuralNetwork.
 */

let classifier;
let faceMesh;
let video;
let faces = [];
let classification = "";
let isModelLoaded = false;
let showFaceMesh = true; // Track which mode we're in
let toggleButton;

// Add these variables at the top with your other global variables
let currentColor = { r: 0, g: 0, b: 0 }; // Start with black
let targetColor = { r: 0, g: 0, b: 0 };
let transitionSpeed = 0.05; // Adjust this value to control transition speed (0.01 for slower, 0.1 for faster)
let prevClassification = "";

// Add these variables at the top with your other global variables
let happySound, sadSound, wowSound;
let lastSoundTime = 0;
let soundCooldown = 2000; // Minimum time between sounds (2 seconds)

// Define keypoints for facial features
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

// Fix the sound loading paths - using the wrong directory structure
function preload() {
  // Load the FaceMesh model
  faceMesh = ml5.faceMesh();

  // Preload sounds with error handling
  soundFormats('mp3', 'wav');

  // Load sounds with error callbacks
  happySound = loadSound('../sounds/happy.mp3',
    () => console.log('Happy sound loaded successfully'),
    () => console.error('Failed to load happy sound'));

  sadSound = loadSound('../sounds/sad.mp3',
    () => console.log('Sad sound loaded successfully'),
    () => console.error('Failed to load sad sound'));

  wowSound = loadSound('../sounds/wow.mp3',
    () => console.log('Wow sound loaded successfully'),
    () => console.error('Failed to load wow sound'));
}

function setup() {
  // Create full window canvas instead of fixed size
  createCanvas(windowWidth, windowHeight);

  // Create toggle button
  toggleButton = createButton('Toggle View');
  toggleButton.position(20, 100);
  toggleButton.size(150, 40);
  toggleButton.style('font-size', '16px');
  toggleButton.style('background-color', '#444444');
  toggleButton.style('color', 'white');
  toggleButton.style('border', 'none');
  toggleButton.style('border-radius', '5px');
  toggleButton.style('padding', '8px');
  toggleButton.style('z-index', '100');
  toggleButton.mousePressed(toggleView);

  // Create the webcam video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480); // Keep original capture size
  video.hide();

  // For this example to work across all browsers
  // "webgl" or "cpu" needs to be set as the backend
  ml5.setBackend("webgl");

  // Set up the neural network
  let classifierOptions = {
    task: "classification",
  };
  classifier = ml5.neuralNetwork(classifierOptions);

  const modelDetails = {
    model: "emotion-model/model.json",
    metadata: "emotion-model/model_meta.json",
    weights: "emotion-model/model.weights.bin",
  };

  classifier.load(modelDetails, modelLoaded);

  // Start the faceMesh detection
  faceMesh.detectStart(video, gotFaces);
}

// Add this new function to handle the toggle
function toggleView() {
  showFaceMesh = !showFaceMesh;
  if (showFaceMesh) {
    toggleButton.html('Face Mesh');
  } else {
    toggleButton.html('Color Canvas');
  }
}

function draw() {
  // Clear background
  background(0);

  if (showFaceMesh) {
    // Scale and center the video to fill the canvas while maintaining aspect ratio
    let vidRatio = video.width / video.height;
    let canvasRatio = width / height;
    let drawWidth, drawHeight;

    if (canvasRatio > vidRatio) {
      // Canvas is wider than video
      drawHeight = height;
      drawWidth = height * vidRatio;
    } else {
      // Canvas is taller than video
      drawWidth = width;
      drawHeight = width / vidRatio;
    }

    // Center the video
    let x = (width - drawWidth) / 2;
    let y = (height - drawHeight) / 2;

    // Display the webcam video
    image(video, x, y, drawWidth, drawHeight);

    // Scale face points to match the video scaling
    let scaleX = drawWidth / video.width;
    let scaleY = drawHeight / video.height;

    // Draw all the tracked face points
    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];

      // Display all keypoints with their index numbers (scaled and offset)
      for (let j = 0; j < face.keypoints.length; j++) {
        let keypoint = face.keypoints[j];

        // Calculate scaled position
        let px = keypoint.x * scaleX + x;
        let py = keypoint.y * scaleY + y;

        // Draw the point
        noStroke();
        fill(0, 255, 255);  // Cyan to make all points visible
        circle(px, py, 3);

        // Draw the index number for ALL points
        textSize(8);
        fill(255);
        text(j, px + 5, py);
      }

      // Same scaling for mouth points
      for (let k = 0; k < mouthPoints.length; k++) {
        let idx = mouthPoints[k];
        if (idx < face.keypoints.length) {
          let keypoint = face.keypoints[idx];
          let px = keypoint.x * scaleX + x;
          let py = keypoint.y * scaleY + y;
          fill(255, 0, 0);  // Red for mouth points
          circle(px, py, 5);
        }
      }

      // Same scaling for eyebrow points
      for (let k = 0; k < eyebrowPoints.length; k++) {
        let idx = eyebrowPoints[k];
        if (idx < face.keypoints.length) {
          let keypoint = face.keypoints[idx];
          let px = keypoint.x * scaleX + x;
          let py = keypoint.y * scaleY + y;
          fill(0, 180, 255);  // Brighter blue for eyebrow points
          circle(px, py, 6);  // Slightly larger circles

          // Add index numbers next to eyebrow points in white
          textSize(8);
          fill(255);
          text(idx, px + 5, py);
        }
      }
    }

    // If the model is loaded, make a classification and display the result
    if (isModelLoaded && faces[0]) {
      let inputData = flattenFaceData();
      classifier.classify(inputData, gotClassification);
      textSize(64);
      fill(0, 255, 0);
      text(classification, 20, 60);
    }
  } else {
    // Empty canvas mode - change background color based on emotion with smooth transitions

    // If the model is loaded, make a classification and display the result
    if (isModelLoaded && faces[0]) {
      let inputData = flattenFaceData();
      classifier.classify(inputData, gotClassification);

      // Update target color when classification changes
      if (classification !== prevClassification) {
        prevClassification = classification;
        console.log("New classification:", classification); // Debug line

        // Convert classification to lowercase to handle case variations
        const lowerClassification = classification.toLowerCase();

        // Set target color based on detected emotion
        if (lowerClassification.includes("sad")) {
          targetColor = { r: 0, g: 0, b: 255 }; // Blue for sad
          playEmotionSound("sad");
        }
        else if (lowerClassification.includes("happy")) {
          targetColor = { r: 255, g: 255, b: 0 }; // Yellow for happy
          playEmotionSound("happy");
        }
        else if (lowerClassification.includes("neutral")) {
          targetColor = { r: 0, g: 250, b: 100 }; // Green for neutral
          // No sound for neutral
        }
        else if (lowerClassification.includes("surprise") || lowerClassification.includes("suprise")) {
          targetColor = { r: 255, g: 100, b: 0 }; // Orange for surprise
          playEmotionSound("suprise");
        }
      }

      // Smoothly transition current color toward target color
      currentColor.r = lerp(currentColor.r, targetColor.r, transitionSpeed);
      currentColor.g = lerp(currentColor.g, targetColor.g, transitionSpeed);
      currentColor.b = lerp(currentColor.b, targetColor.b, transitionSpeed);

      // Apply the interpolated color
      background(currentColor.r, currentColor.g, currentColor.b);

      // Display emotion text centered and large
      textSize(128);
      textAlign(CENTER, CENTER);
      fill(255);
      text(classification, width / 2, height / 2);
      textAlign(LEFT, BASELINE); // Reset alignment
    } else {
      background(0); // Default black when no face detected
    }
  }
}

// Convert the faceMesh data to a 1D array using only mouth and eyebrow points
function flattenFaceData() {
  let face = faces[0];
  let faceData = [];

  // Find a reference point (nose tip) for normalization
  let nosePoint = face.keypoints[1]; // Using point 1 as nose reference

  // Use the mouth keypoints, normalized relative to nose position
  for (let i = 0; i < mouthPoints.length; i++) {
    let idx = mouthPoints[i];
    if (idx < face.keypoints.length) {
      // Store relative positions instead of absolute ones
      faceData.push(face.keypoints[idx].x - nosePoint.x);
      faceData.push(face.keypoints[idx].y - nosePoint.y);
      faceData.push(face.keypoints[idx].z - nosePoint.z);
    }
  }

  // Also use the eyebrow keypoints, normalized relative to nose position
  for (let i = 0; i < eyebrowPoints.length; i++) {
    let idx = eyebrowPoints[i];
    if (idx < face.keypoints.length) {
      // Store relative positions instead of absolute ones
      faceData.push(face.keypoints[idx].x - nosePoint.x);
      faceData.push(face.keypoints[idx].y - nosePoint.y);
      faceData.push(face.keypoints[idx].z - nosePoint.z);
    }
  }

  return faceData;
}

// Callback function for when faceMesh outputs data
function gotFaces(results) {
  // Save the output to the faces variable
  faces = results;
}

// Add this debugging function
function gotClassification(results) {
  classification = results[0].label;
  console.log("Classification detected:", classification); // Debug line
}

// Callback function for when the pre-trained model is loaded
function modelLoaded() {
  isModelLoaded = true;
}

// Fix the playEmotionSound function to be more robust
function playEmotionSound(emotion) {
  let currentTime = millis();
  console.log("Attempting to play sound for:", emotion); // Debug line

  // Only play sounds if enough time has passed since the last sound
  if (currentTime - lastSoundTime > soundCooldown) {
    // Stop any currently playing sounds
    if (happySound && happySound.isLoaded() && happySound.isPlaying()) happySound.stop();
    if (sadSound && sadSound.isLoaded() && sadSound.isPlaying()) sadSound.stop();
    if (wowSound && wowSound.isLoaded() && wowSound.isPlaying()) wowSound.stop();

    // Play the appropriate sound based on emotion
    // Check for variations in spelling
    if ((emotion === "happy" || emotion === "Happy") && happySound && happySound.isLoaded()) {
      console.log("Playing happy sound");
      happySound.play();
      lastSoundTime = currentTime;
    } else if ((emotion === "sad" || emotion === "Sad") && sadSound && sadSound.isLoaded()) {
      console.log("Playing sad sound");
      sadSound.play();
      lastSoundTime = currentTime;
    } else if ((emotion === "suprise" || emotion === "surprise" || emotion === "Surprise")
      && wowSound && wowSound.isLoaded()) {
      console.log("Playing surprise sound");
      wowSound.play();
      lastSoundTime = currentTime;
    }
  }
}

// Add this function to handle window resizing
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}