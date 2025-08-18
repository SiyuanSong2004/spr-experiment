// Configuration file for Self-Paced Reading Experiment
// Contains all configurable settings and constants

// Available stimuli files configuration
var availableStimuliFiles = [
    { filename: 'list_a.csv', name: 'List A' },
    { filename: 'list_b.csv', name: 'List B' },
    { filename: 'example_stimuli.csv', name: 'Example Stimuli' },
    { filename: 'train_trial.csv', name: 'Training Trials' },
    { filename: 'filler.csv', name: 'Filler Sentences' },
    { filename: 'onetrial.csv', name: 'One Trial' },
    { filename: 'empty_stimuli.csv', name: 'Empty Stimuli' }
];

// Experiment timing configuration
var experimentConfig = {
    fixationCrossDuration: 800,  // Duration in milliseconds
    readyScreenDuration: null,   // Wait for user input
    feedbackDuration: null       // Wait for user input
};

// Data saving configuration
var DATA_SAVE_ENDPOINT = null; // Set to your server endpoint URL if using server-side saving

// Default practice stimuli (fallback if train_trial.csv fails to load)
var defaultPracticeStimuli = [
    {
        id: "practice1",
        sentence: "The quick brown fox jumps over the lazy dog.",
        question: "Did the fox jump over the dog?",
        answer1: "Yes",
        answer2: "No",
        correct_answer: 0,
        with_question: true,
        condition: "practice"
    },
    {
        id: "practice2", 
        sentence: "The girl that the boy likes sits in the front row.",
        question: "Did the girl sit in the front row?",
        answer1: "Yes",
        answer2: "No", 
        correct_answer: 0,
        with_question: true,
        condition: "practice"
    }
];
