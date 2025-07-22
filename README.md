# Gloomy - Emotion-Responsive Lamp

Gloomy is an interactive lamp that responds to your facial expressions in real-time. This project was created during a 5-day university workshop to explore creative machine learning applications, with the core implementation completed in just 1 day.

## Concept

The lamp recognizes four basic facial expressions and provides feedback through both color and sound:
- **Happy** 
- **Neutral** 
- **Sad** 
- **Surprised**

Based on the detected emotion, Gloomy changes the lamp's color and plays corresponding sounds to create an atmospheric environment that reflects and supports your mood.

## Technical Implementation

This project uses neural network classification trained on facial keypoints to recognize emotions. The original implementation was enhanced to focus only on specific facial regions (mouth, eyes, and eyebrows) rather than using all facial points, improving accuracy and performance.

The system provides real-time feedback by:
- Changing the lamp's color based on detected emotion
- Playing emotion-specific sounds
- Creating an immersive mood-responsive environment

## Audio Credits

The sounds used in this project are from Pixabay:
- **Happy sound**: [Happy Logo](https://pixabay.com/de/sound-effects/happy-logo-13397/) by Muzaproduction
- **Sad sound**: [Wah Wah Sad Trombone](https://pixabay.com/de/sound-effects/wah-wah-sad-trombone-6347/) by kirbydx (Freesound)
- **Surprised sound**: [Danger!](https://pixabay.com/de/sound-effects/danger-257023/) by Andorios

## Credits

This code is based on the repository from our lecturers: https://github.com/fsewing/SG_WP_Creative_ML

We extended the original codebase by training it with different emotions to enable emotion recognition and feedback through visual and audio responses.
