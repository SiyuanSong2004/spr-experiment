// Configuration file for Self-Paced Reading Experiment
// Contains all configurable settings and constants

// Available stimuli files configuration
var availableStimuliFiles = [
    // { filename: 'list_a.csv', name: 'List A' },
    // { filename: 'list_b.csv', name: 'List B' },
    // { filename: 'example_stimuli.csv', name: 'Example Stimuli' },
    // { filename: 'train_trial.csv', name: 'Training Trials' },
    // { filename: 'filler.csv', name: 'Filler Sentences' },
    // { filename: 'onetrial.csv', name: 'One Trial' },
    // { filename: 'empty_stimuli.csv', name: 'Empty Stimuli' },
    { filename: 'stimuli_1.csv', name: 'Stimuli 1' },
    { filename: 'stimuli_2.csv', name: 'Stimuli 2' },
    { filename: 'stimuli_3.csv', name: 'Stimuli 3' },
    { filename: 'stimuli_4.csv', name: 'Stimuli 4' },
    { filename: 'stimuli_5.csv', name: 'Stimuli 5' },
    { filename: 'stimuli_6.csv', name: 'Stimuli 6' },
    { filename: 'stimuli_7.csv', name: 'Stimuli 7' },
    { filename: 'stimuli_8.csv', name: 'Stimuli 8' },
    { filename: 'stimuli_9.csv', name: 'Stimuli 9' },
    { filename: 'stimuli_10.csv', name: 'Stimuli 10' },
    { filename: 'stimuli_11.csv', name: 'Stimuli 11' },
    { filename: 'stimuli_12.csv', name: 'Stimuli 12' },
    { filename: 'stimuli_13.csv', name: 'Stimuli 13' },
    { filename: 'stimuli_14.csv', name: 'Stimuli 14' },
    { filename: 'stimuli_15.csv', name: 'Stimuli 15' },
    { filename: 'stimuli_16.csv', name: 'Stimuli 16' },
    { filename: 'stimuli_17.csv', name: 'Stimuli 17' },
    { filename: 'stimuli_18.csv', name: 'Stimuli 18' },
    { filename: 'stimuli_19.csv', name: 'Stimuli 19' },
    { filename: 'stimuli_20.csv', name: 'Stimuli 20' },
    { filename: 'stimuli_21.csv', name: 'Stimuli 21' },
    { filename: 'stimuli_22.csv', name: 'Stimuli 22' },
    { filename: 'stimuli_23.csv', name: 'Stimuli 23' },
    { filename: 'stimuli_24.csv', name: 'Stimuli 24' },
    { filename: 'stimuli_25.csv', name: 'Stimuli 25' },
    { filename: 'stimuli_26.csv', name: 'Stimuli 26' },
    { filename: 'stimuli_27.csv', name: 'Stimuli 27' },
    { filename: 'stimuli_28.csv', name: 'Stimuli 28' },
    { filename: 'stimuli_29.csv', name: 'Stimuli 29' },
    { filename: 'stimuli_30.csv', name: 'Stimuli 30' },
    { filename: 'stimuli_31.csv', name: 'Stimuli 31' },
    { filename: 'stimuli_32.csv', name: 'Stimuli 32' },
    { filename: 'stimuli_33.csv', name: 'Stimuli 33' },
    { filename: 'stimuli_34.csv', name: 'Stimuli 34' },
    { filename: 'stimuli_35.csv', name: 'Stimuli 35' },
    { filename: 'stimuli_36.csv', name: 'Stimuli 36' },
    { filename: 'stimuli_37.csv', name: 'Stimuli 37' },
    { filename: 'stimuli_38.csv', name: 'Stimuli 38' },
    { filename: 'stimuli_39.csv', name: 'Stimuli 39' },
    { filename: 'stimuli_40.csv', name: 'Stimuli 40' },
    { filename: 'stimuli_41.csv', name: 'Stimuli 41' },
    { filename: 'stimuli_42.csv', name: 'Stimuli 42' },
    { filename: 'stimuli_43.csv', name: 'Stimuli 43' },
    { filename: 'stimuli_44.csv', name: 'Stimuli 44' },
    { filename: 'stimuli_45.csv', name: 'Stimuli 45' }
];

// Experiment timing configuration
var experimentConfig = {
    fixationCrossDuration: 800,  // Duration in milliseconds
    readyScreenDuration: null,   // Wait for user input
    feedbackDuration: null       // Wait for user input
};

// Data saving configuration
var DATA_SAVE_ENDPOINT = "https://noisy-comp-server-311aa565092d.herokuapp.com/api/submit_experiment/108"; // Set to your server endpoint URL if using server-side saving

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
