// Self-Paced Reading Experiment Stimuli
// This file contains all the experimental stimuli and their associated comprehension questions

// Sample sentences for the experiment
// Each stimulus contains the sentence text and an optional comprehension question
var experimentalStimuli = [
    {
        id: 1,
        sentence: "The cat that the dog chased ran quickly across the busy street yesterday.",
        question: "What animal was being chased?",
        options: ["Cat", "Dog"],
        correct_answer: 0,
        condition: "complex"
    },
    {
        id: 2,
        sentence: "The student read the book carefully before the important exam next week.",
        question: "When is the exam?",
        options: ["Yesterday", "Next week"],
        correct_answer: 1,
        condition: "simple"
    },
    {
        id: 3,
        sentence: "The teacher who helped the students with their homework stayed late at school.",
        question: "Who stayed late at school?",
        options: ["Students", "Teacher"],
        correct_answer: 1,
        condition: "complex"
    },
    {
        id: 4,
        sentence: "The bird flew over the tall mountain during the beautiful sunset.",
        question: "What flew over the mountain?",
        options: ["Bird", "Airplane"],
        correct_answer: 0,
        condition: "simple"
    },
    {
        id: 5,
        sentence: "The doctor that the nurse called arrived immediately to treat the patient.",
        question: "Who called the doctor?",
        options: ["Patient", "Nurse"],
        correct_answer: 1,
        condition: "complex"
    },
    {
        id: 6,
        sentence: "The children played happily in the park all afternoon long.",
        question: "Where did the children play?",
        options: ["School", "Park"],
        correct_answer: 1,
        condition: "simple"
    },
    {
        id: 7,
        sentence: "The scientist who discovered the new species published the findings in a journal.",
        question: "What did the scientist discover?",
        options: ["New species", "New journal"],
        correct_answer: 0,
        condition: "complex"
    },
    {
        id: 8,
        sentence: "The baker made fresh bread early in the morning for customers.",
        question: "When did the baker make bread?",
        options: ["Evening", "Morning"],
        correct_answer: 1,
        condition: "simple"
    }
];

// Practice trials to familiarize participants with the task
var practiceStimuli = [
    {
        id: "practice1",
        sentence: "The quick brown fox jumps over the lazy dog.",
        question: "What animal jumps?",
        options: ["Fox", "Dog"],
        correct_answer: 0,
        condition: "practice"
    },
    {
        id: "practice2",
        sentence: "The girl that the boy likes sits in the front row.",
        question: "Where does the girl sit?",
        options: ["Back row", "Front row"],
        correct_answer: 1,
        condition: "practice"
    }
];

// Filler sentences (without comprehension questions)
var fillerStimuli = [
    {
        id: "filler1",
        sentence: "The weather today is absolutely beautiful and perfect for outdoor activities.",
        condition: "filler"
    },
    {
        id: "filler2",
        sentence: "Technology continues to advance rapidly in our modern digital world.",
        condition: "filler"
    },
    {
        id: "filler3",
        sentence: "Music has the power to bring people together across different cultures.",
        condition: "filler"
    }
];

// Function to randomize array order
function shuffleArray(array) {
    var shuffled = array.slice(); // Use slice() instead of spread operator
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

// Function to create a randomized stimulus list
function createStimulusList() {
    // Combine experimental stimuli with fillers
    var allStimuli = experimentalStimuli.concat(fillerStimuli);
    
    // Randomize the order
    return shuffleArray(allStimuli);
}

// Function to split sentence into words for self-paced presentation
function splitSentence(sentence) {
    // Split by spaces and remove extra whitespace
    return sentence.trim().split(/\s+/);
}

// Export functions and data for use in the main experiment
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment
    module.exports = {
        experimentalStimuli,
        practiceStimuli,
        fillerStimuli,
        shuffleArray,
        createStimulusList,
        splitSentence
    };
} 