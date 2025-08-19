// Self-Paced Reading Experiment - Static Version for GitHub Pages
// This version works without a backend server

// Experiment variables
var stimulusList = [];

// Simple hash function for seed generation
function hashCode(str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
}

// Seeded random number generator
function SeededRandom(seed) {
    this.seed = seed;
}
SeededRandom.prototype.next = function() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
};

// Shuffle array with seeded random
function shuffleWithSeed(array, seed) {
    var rng = new SeededRandom(seed);
    var shuffled = array.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(rng.next() * (i + 1));
        var temp = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
    }
    return shuffled;
}

// Custom fixation cross plugin for jsPsych v6
jsPsych.plugins['fixation-cross'] = (function() {
    var plugin = {};

    plugin.info = {
        name: 'fixation-cross',
        parameters: {
            duration: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Duration',
                default: 1000,
                description: 'Duration to display fixation cross in milliseconds.'
            }
        }
    };

    plugin.trial = function(display_element, trial) {
        // Display fixation cross
        display_element.innerHTML = '<div class="fixation-cross">+</div>';
        
        // End trial after specified duration
        jsPsych.pluginAPI.setTimeout(function() {
            jsPsych.finishTrial({});
        }, trial.duration);
    };

    return plugin;
})();

// Custom ready screen plugin for jsPsych v6
jsPsych.plugins['ready-screen'] = (function() {
    var plugin = {};

    plugin.info = {
        name: 'ready-screen',
        parameters: {
            message: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Message',
                default: 'Press any button to show the next sentence',
                description: 'The message to display on the ready screen.'
            }
        }
    };

    plugin.trial = function(display_element, trial) {
        // Display ready message
        display_element.innerHTML = '<div class="ready-screen">' + 
                                  '<p>' + trial.message + '</p>' +
                                  '</div>';
        
        // Wait for any key press
        var keyHandler = function(e) {
            // Clean up and end trial
            document.removeEventListener('keydown', keyHandler);
            jsPsych.finishTrial({
                key_pressed: e.code,
                rt: performance.now() - startTime
            });
        };
        
        document.addEventListener('keydown', keyHandler);
        var startTime = performance.now();
    };

    return plugin;
})();

// Custom self-paced reading plugin for jsPsych v6
jsPsych.plugins['self-paced-reading'] = (function() {
    var plugin = {};

    plugin.info = {
        name: 'self-paced-reading',
        parameters: {
            sentence: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Sentence',
                default: undefined,
                description: 'The sentence to be displayed word by word.'
            },
            stimulus_id: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Stimulus ID',
                default: undefined,
                description: 'Unique identifier for the stimulus.'
            },
            sentence_number: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Sentence Number',
                default: null,
                description: 'Current sentence number.'
            },
            total_sentences: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Total Sentences',
                default: null,
                description: 'Total number of sentences.'
            }
        }
    };

    plugin.trial = function(display_element, trial) {
        // Initialize variables for this trial (local scope)
        var currentWordIndex = 0;
        var wordTimings = [];
        var trialStartTime = performance.now();
        var trialActive = true;
        
        // Split sentence into words
        var words = splitSentence(trial.sentence);
        
        // Clear any existing event listeners on document
        var oldHandlers = document.cloneNode(true);
        
        // Show initial word immediately
        showCurrentWord();
        
        // Handle keypress with explicit cleanup
        var keyHandler = function(e) {
            if (!trialActive) return;
            
            if (e.code === 'Space') {
                e.preventDefault();
                e.stopPropagation();
                
                // Record timing for current word and advance
                var currentTime = performance.now();
                wordTimings.push({
                    word: words[currentWordIndex],
                    word_position: currentWordIndex,
                    reading_time: currentTime - (wordTimings.length > 0 ? 
                        wordTimings[wordTimings.length - 1].timestamp : trialStartTime),
                    timestamp: currentTime
                });
                
                currentWordIndex++;
                
                if (currentWordIndex < words.length) {
                    showCurrentWord();
                } else {
                    // Trial complete - explicit cleanup
                    trialActive = false;
                    cleanupAndEnd();
                }
            }
        };
        
        // Clean removal function
        function cleanupAndEnd() {
            document.removeEventListener('keydown', keyHandler, true);
            document.removeEventListener('keydown', keyHandler, false);
            endTrial();
        }
        
        // Add listener with capture to ensure it gets priority
        document.addEventListener('keydown', keyHandler, true);
        
        function showCurrentWord() {
            // Create minimal HTML for current word only
            var html = '<div class="spr-container">';
            html += '<div class="spr-word-display">';
            if (currentWordIndex < words.length) {
                html += '<span class="spr-current-word">' + words[currentWordIndex] + '</span>';
            }
            html += '</div>';
            html += '</div>';
            
            display_element.innerHTML = html;
        }
        
        function endTrial() {
            var trialData = {
                stimulus_id: trial.stimulus_id,
                sentence: trial.sentence,
                word_timings: wordTimings,
                total_reading_time: performance.now() - trialStartTime,
                word_count: words.length
            };
            
            // Merge with any data from the trial configuration
            if (trial.data) {
                Object.keys(trial.data).forEach(function(key) {
                    trialData[key] = trial.data[key];
                });
            }
            
            jsPsych.finishTrial(trialData);
        }
    };

    return plugin;
})();

// Global variables to store loaded stimuli
var loadedStimuli = null;
var loadedFillers = null;
var loadedTrainTrials = null;

// Global variable to store user information
var userInfo = {
    userId: null,
    stimuliFile: null,
    experimentStartTime: null,
    experimentEndTime: null,
    seed: null // For randomization
};


// Function to load CSV from static files
function loadCSVFromStaticFile(filename, callback) {
    fetch(filename)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error! status: ' + response.status);
            }
            return response.text();
        })
        .then(function(csvText) {
            var lines = csvText.trim().split('\n');
            var headers = lines[0].split(',').map(function(h) { return h.replace(/"/g, ''); });
            var data = [];
            
            for (var i = 1; i < lines.length; i++) {
                var values = parseCSVLine(lines[i]);
                var obj = {};
                for (var j = 0; j < headers.length; j++) {
                    obj[headers[j]] = values[j] || '';
                }
                
                // Convert boolean fields
                if (obj.with_question === 'true' || obj.with_question === true) obj.with_question = true;
                if (obj.with_question === 'false' || obj.with_question === false) obj.with_question = false;

                // Convert question_delay to number
                if (obj.question_delay) obj.question_delay = parseInt(obj.question_delay);
                
                // Convert correct_answer to number
                if (obj.correct_answer !== undefined && obj.correct_answer !== '') {
                    obj.correct_answer = parseInt(obj.correct_answer);
                }
                
                data.push(obj);
            }
            
            callback(null, data);
        })
        .catch(function(error) {
            callback(error, null);
        });
}

// Simple CSV line parser
function parseCSVLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    
    for (var i = 0; i < line.length; i++) {
        var char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// User ID and stimuli selection screen
var userIdInput = {
    type: 'html-keyboard-response',
    stimulus: function() {
        return '<div style="max-width: 600px; margin: 0 auto; text-align: center; padding: 50px;">' +
               '<h2>Self-Paced Reading Experiment</h2>' +
               '<p>Please enter your participant ID and select a stimuli file to begin the experiment.</p>' +
               
               '<div style="margin: 30px 0;">' +
               '<label for="userId" style="display: block; margin-bottom: 10px; font-weight: bold;">Participant ID:</label>' +
               '<input type="text" id="userId" style="padding: 10px; font-size: 16px; border: 2px solid #007bff; border-radius: 5px; width: 200px; text-align: center;" placeholder="Enter ID here">' +
               '</div>' +
               
               '<div style="margin: 30px 0;">' +
               '<label for="stimuliSelect" style="display: block; margin-bottom: 10px; font-weight: bold;">Stimuli File:</label>' +
               '<select id="stimuliSelect" style="padding: 10px; font-size: 16px; border: 2px solid #007bff; border-radius: 5px; width: 220px;">' +
               '<option value="">Select a stimuli file...</option>' +
               '</select>' +
               '</div>' +
               
               '<button id="startExperiment" class="jspsych-btn" style="margin-top: 20px;" disabled>Start Experiment</button>' +
               '<div id="errorMessage" style="color: red; margin-top: 15px; font-weight: bold;"></div>' +
               '</div>';
    },
    choices: jsPsych.NO_KEYS,
    on_load: function() {
        var userIdInput = document.getElementById('userId');
        var stimuliSelect = document.getElementById('stimuliSelect');
        var startButton = document.getElementById('startExperiment');
        var errorDiv = document.getElementById('errorMessage');
        
        // Focus on input field
        userIdInput.focus();
        
        // Load available stimuli files (static list)
        availableStimuliFiles.forEach(function(file) {
            var option = document.createElement('option');
            option.value = file.filename;
            option.textContent = file.name + ' (' + file.filename + ')';
            stimuliSelect.appendChild(option);
        });
        
        // Function to update start button state
        function updateStartButton() {
            var userId = userIdInput.value.trim();
            var selectedFile = stimuliSelect.value;
            startButton.disabled = !(userId && selectedFile);
        }
        
        // Handle input changes
        userIdInput.addEventListener('input', updateStartButton);
        stimuliSelect.addEventListener('change', updateStartButton);
        
        // Handle Enter key in input field
        userIdInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !startButton.disabled) {
                startButton.click();
            }
        });
        
        // Handle start button click
        startButton.onclick = function() {
            var userId = userIdInput.value.trim();
            var selectedFile = stimuliSelect.value;
            
            if (userId === '') {
                errorDiv.textContent = 'Please enter a valid participant ID.';
                userIdInput.focus();
                return;
            }
            
            if (selectedFile === '') {
                errorDiv.textContent = 'Please select a stimuli file.';
                stimuliSelect.focus();
                return;
            }
            
            // Store user information
            userInfo.userId = userId;
            userInfo.stimuliFile = selectedFile;
            userInfo.experimentStartTime = new Date().toISOString();
            // Generate a seed based on user ID and timestamp for reproducible randomization
            userInfo.seed = Math.abs(hashCode(userId + userInfo.experimentStartTime)) % 10000;
            
            console.log('Experiment started for user:', userId, 'with stimuli:', selectedFile, 'seed:', userInfo.seed);
            jsPsych.finishTrial({
                user_id: userId,
                stimuli_file: selectedFile,
                start_time: userInfo.experimentStartTime,
                seed: userInfo.seed
            });
        };
    },
    data: {
        trial_type: 'user_setup'
    }
};

// Welcome screen
var welcome = {
    type: 'instructions',
    pages: [
        '<h2>Welcome to the Self-Paced Reading Experiment</h2>' +
        '<p>Thank you for participating in our experiment!</p>' +
        '<p>In this experiment, you will read sentences word by word and answer comprehension questions.</p>' +
        '<p>Click "Next" to continue to the instructions.</p>'
    ],
    show_clickable_nav: true,
    button_label_next: 'Next',
    button_label_previous: 'Previous'
};

// Instructions
var instructions = {
    type: 'instructions',
    pages: [
        '<h2>Experiment Instructions</h2>' +
        '<p>In this task, you will read a series of sentences.</p>' +
        '<p><strong>Reading procedure:</strong></p>' +
        '<ul style="text-align: left; max-width: 500px; margin: 0 auto;">' +
        '<li>Each sentence will be displayed one word at a time</li>' +
        '<li>Press the <strong>SPACE</strong> to advance to the next word</li>' +
        '<li>Read at your natural pace</li>' +
        '<li>You cannot go back to previous words</li>' +
        '</ul>' +
        '<p>Please read each sentence carefully, as there may be comprehension questions.</p>',
        
        '<h2>Comprehension Questions</h2>' +
        '<p>After reading some sentences, you will see a question about the sentence content.</p>' +
        '<p><strong>How to respond:</strong></p>' +
        '<ul style="text-align: left; max-width: 600px; margin: 0 auto;">' +
        '<li>Read the question carefully</li>' +
        '<li>Choose the correct answer from the given options</li>' +
        '<li>You can click on your choice with the mouse</li>' +
        '<li><strong>Or use keyboard shortcuts:</strong></li>' +
        '<li style="margin-left: 20px;">Press <strong>Left Shift</strong> to select the left option</li>' +
        '<li style="margin-left: 20px;">Press <strong>Right Shift</strong> to select the right option</li>' +
        '</ul>' +
        '<p>Please answer as accurately as possible, but don\'t overthink it.</p>',
         
        '<h2>Practice Session</h2>' +
        '<p>We will now do a few practice trials to help you become familiar with the task.</p>' +
        '<p><strong>Remember:</strong></p>' +
        '<ul style="text-align: left; max-width: 500px; margin: 0 auto;">' +
        '<li>Press SPACE to advance to the next word</li>' +
        '<li>Read at your natural pace</li>' +
        '<li>Answer comprehension questions carefully</li>' +
        '</ul>' +
        '<p>Are you ready? Click "Next" to begin.</p>'
    ],
    show_clickable_nav: true,
    button_label_next: 'Next',
    button_label_previous: 'Previous',
    button_label_finish: 'Start Practice'
};

// Function to create practice trials from loaded train trials
function createPracticeTrials() {
    var practiceTrials = [];
    var stimuliToUse = loadedTrainTrials || defaultPracticeStimuli; // Fallback to config default if loading fails
    
    stimuliToUse.forEach(function(stimulus, index) {
        // Add fixation cross before each practice sentence
        practiceTrials.push({
            type: 'fixation-cross',
            duration: experimentConfig.fixationCrossDuration || 1000
        });
        
        // Add ready screen
        practiceTrials.push({
            type: 'ready-screen',
            message: 'Press any button to show the next sentence'
        });
        
        // Self-paced reading trial
        practiceTrials.push({
            type: 'self-paced-reading',
            sentence: stimulus.sentence,
            stimulus_id: stimulus.item_id || stimulus.id,
            sentence_number: index + 1,
            total_sentences: stimuliToUse.length,
            data: {
                trial_type: 'practice_reading',
                stimulus_id: stimulus.item_id || stimulus.id,
                condition: stimulus.condition || 'practice'
            }
        });
        
        // Comprehension question (if exists)
        if (stimulus.with_question === true || stimulus.with_question === 'true') {
            practiceTrials.push({
                type: 'html-keyboard-response',
                stimulus: function() {
                    return '<div class="comprehension-question">' +
                           '<p>' + stimulus.question + '</p>' +
                           '<p>' +
                           '<button class="jspsych-btn option-left" onclick="selectAnswer(0)">' + stimulus.answer1 + '</button>' +
                           '<button class="jspsych-btn option-right" onclick="selectAnswer(1)">' + stimulus.answer2 + '</button>' +
                           '</p>' +
                           '</div>';
                },
                choices: jsPsych.NO_KEYS,
                on_load: function() {
                    window.selectAnswer = function(answer) {
                        document.removeEventListener('keydown', window.questionKeyHandler);
                        jsPsych.finishTrial({
                            response: answer,
                            correct: answer === stimulus.correct_answer,
                            rt: performance.now() - window.questionStartTime
                        });
                    };
                    
                    // Add keyboard handler for shift keys
                    window.questionKeyHandler = function(e) {
                        if (e.code === 'ShiftLeft') {
                            e.preventDefault();
                            document.querySelector('.option-left').style.backgroundColor = '#0056b3';
                            setTimeout(function() {
                                selectAnswer(0);
                            }, 100);
                        } else if (e.code === 'ShiftRight') {
                            e.preventDefault();
                            document.querySelector('.option-right').style.backgroundColor = '#0056b3';
                            setTimeout(function() {
                                selectAnswer(1);
                            }, 100);
                        }
                    };
                    
                    document.addEventListener('keydown', window.questionKeyHandler);
                    window.questionStartTime = performance.now();
                },
                data: {
                    trial_type: 'practice_comprehension',
                    stimulus_id: stimulus.item_id || stimulus.id,
                    correct_answer: stimulus.correct_answer
                }
            });
        
            // Feedback for practice
            practiceTrials.push({
                type: 'html-keyboard-response',
                stimulus: function() {
                    var lastResponse = jsPsych.data.get().last(1).values()[0];
                    var isCorrect = lastResponse.correct;
                    return '<div class="feedback ' + (isCorrect ? 'correct' : 'incorrect') + '">' +
                           '<p>' + (isCorrect ? 'Correct!' : 'Incorrect.') + '</p>' +
                           '<p>The correct answer is: ' + (stimulus.correct_answer === 0 ? stimulus.answer1 : stimulus.answer2) + '</p>' +
                           '<p><em>Press any key to continue</em></p>' +
                           '</div>';
                },
                choices: jsPsych.ALL_KEYS,
                data: {
                    trial_type: 'practice_feedback'
                }
            });
        }
    });
    
    return practiceTrials;
}

// Transition to main experiment
var startMainExperiment = {
    type: 'instructions',
    pages: [
        function() {
            var stimuliToUse = loadedStimuli || createStimulusList();
            var fillersToUse = loadedFillers || [];
            var totalItems = stimuliToUse.length + fillersToUse.length;
            
            return '<h2>Practice Complete!</h2>' +
                   '<p>Great! You have completed the practice session.</p>' +
                   '<p>Now we will begin the main experiment. The experiment contains ' + totalItems + ' sentences.</p>' +
                   '<p>Please stay focused and read in the same way as during practice.</p>' +
                   '<p>When you are ready, click "Start Experiment".</p>';
        }
    ],
    show_clickable_nav: true,
    button_label_finish: 'Start Experiment'
};

// Create main experiment trials with mixed stimuli and fillers
function createMainTrials() {
    var mainTrials = [];
    
    // Combine stimuli and fillers
    var stimuliToUse = loadedStimuli || createStimulusList();
    var fillersToUse = loadedFillers || [];
    
    // Create combined array with type indicators
    var allItems = [];
    stimuliToUse.forEach(function(item) {
        if (item.type !== 'delayed_question') {
            var newItem = Object.assign({}, item);
            newItem.item_type = 'stimulus';
            allItems.push(newItem);
        }
    });
    
    fillersToUse.forEach(function(item) {
        var newItem = Object.assign({}, item);
        newItem.item_type = 'filler';
        allItems.push(newItem);
    });
    
    // Shuffle the combined array using the user's seed
    var shuffledItems = shuffleWithSeed(allItems, userInfo.seed);
    
    // Add delayed questions back at the end if they exist
    var delayedQuestions = [];
    stimuliToUse.forEach(function(item) {
        if (item.type === 'delayed_question') {
            delayedQuestions.push(item);
        }
    });
    
    var sentenceCount = 0;
    var totalSentences = shuffledItems.length;
    
    // Create trials for shuffled items
    shuffledItems.forEach(function(stimulus, index) {
        sentenceCount++;
        
        // Add fixation cross before each sentence
        mainTrials.push({
            type: 'fixation-cross',
            duration: experimentConfig.fixationCrossDuration || 800
        });
        
        // Add ready screen
        mainTrials.push({
            type: 'ready-screen',
            message: 'Press any button to show the next sentence'
        });
        
        // Self-paced reading trial
        mainTrials.push({
            type: 'self-paced-reading',
            sentence: stimulus.sentence,
            stimulus_id: stimulus.item_id || stimulus.id,
            sentence_number: sentenceCount,
            total_sentences: totalSentences,
            data: {
                trial_type: 'main_reading',
                stimulus_id: stimulus.item_id || stimulus.id,
                condition: stimulus.condition || stimulus.item_type,
                item_type: stimulus.item_type
            }
        });
        
        // Immediate comprehension question (if exists)
        if (stimulus.with_question === true || stimulus.with_question === 'true') {
            mainTrials.push(createQuestionTrial(stimulus, 'main_comprehension'));
        }
    });
    
    // Add delayed questions at the end
    delayedQuestions.forEach(function(stimulus) {
        mainTrials.push(createQuestionTrial(stimulus, 'delayed_comprehension'));
    });
    
    return mainTrials;
}

// Helper function to create question trials (both immediate and delayed)
function createQuestionTrial(stimulus, trialType) {
    return {
        type: 'html-keyboard-response',
        stimulus: function() {
            var questionText = stimulus.question;
            var answer1 = stimulus.answer1 || (stimulus.options && stimulus.options[0]) || '';
            var answer2 = stimulus.answer2 || (stimulus.options && stimulus.options[1]) || '';
            var title = trialType === 'delayed_comprehension' ? 
                       'Comprehension Question (Sentence ' + (stimulus.originalItemId || stimulus.item_id) + '):' : 
                       'Comprehension Question:';
            
            return '<div class="comprehension-question">' +
                   '<p>' + questionText + '</p>' +
                   '<p>' +
                   '<button class="jspsych-btn option-left" onclick="selectAnswer(0)">' + answer1 + '</button>' +
                   '<button class="jspsych-btn option-right" onclick="selectAnswer(1)">' + answer2 + '</button>' +
                   '</p>' +
                   '</div>';
        },
        choices: jsPsych.NO_KEYS,
        on_load: function() {
            window.selectAnswer = function(answer) {
                document.removeEventListener('keydown', window.questionKeyHandler);
                jsPsych.finishTrial({
                    response: answer,
                    correct: answer === stimulus.correct_answer,
                    rt: performance.now() - window.questionStartTime
                });
            };
            
            // Add keyboard handler for shift keys
            window.questionKeyHandler = function(e) {
                if (e.code === 'ShiftLeft') {
                    e.preventDefault();
                    document.querySelector('.option-left').style.backgroundColor = '#0056b3';
                    setTimeout(function() {
                        selectAnswer(0);
                    }, 100);
                } else if (e.code === 'ShiftRight') {
                    e.preventDefault();
                    document.querySelector('.option-right').style.backgroundColor = '#0056b3';
                    setTimeout(function() {
                        selectAnswer(1);
                    }, 100);
                }
            };
            
            document.addEventListener('keydown', window.questionKeyHandler);
            window.questionStartTime = performance.now();
        },
        data: {
            trial_type: trialType,
            stimulus_id: stimulus.item_id || stimulus.id,
            original_item_id: stimulus.originalItemId || stimulus.item_id || stimulus.id,
            correct_answer: stimulus.correct_answer
        }
    };
}

// End of experiment
var debrief = {
    type: 'instructions',
    pages: [
        '<h2>Experiment Complete!</h2>' +
        '<p>Thank you for participating in our self-paced reading experiment!</p>' +
        '<p>Your data will be available for download on the next screen.</p>' +
        '<p>If you have any questions or feedback, please contact the experimenter.</p>'
    ],
    show_clickable_nav: true,
    button_label_finish: 'Finish Experiment'
};

// Function to display and save results (with server saving)
function displayResults() {
    var data = jsPsych.data.get();
    
    // Filter reading and comprehension data
    var readingData = data.filter(function(trial) {
        return trial.trial_type === 'self-paced-reading' && 
               trial.total_reading_time && 
               trial.word_timings &&
               trial.stimulus_id &&
               trial.sentence;
    });
    
    var allComprehensionData = data.filter(function(trial) {
        return trial.trial_type === 'html-keyboard-response' && 
               trial.hasOwnProperty('correct') && 
               trial.hasOwnProperty('response') &&
               trial.stimulus_id &&
               !trial.stimulus;
    });
    
    // Calculate summary statistics
    var totalTrials = readingData.count();
    var avgReadingTime = 0;
    var comprehensionAccuracy = 0;
    
    if (readingData.count() > 0) {
        var sum = 0;
        var validTimes = 0;
        readingData.values().forEach(function(trial) {
            if (trial.total_reading_time && typeof trial.total_reading_time === 'number' && !isNaN(trial.total_reading_time)) {
                sum += trial.total_reading_time;
                validTimes++;
            }
        });
        if (validTimes > 0) {
            avgReadingTime = sum / validTimes;
        }
    }
    
    if (allComprehensionData.count() > 0) {
        var correctAnswers = 0;
        var totalQuestions = 0;
        allComprehensionData.values().forEach(function(trial) {
            if (typeof trial.correct === 'boolean') {
                totalQuestions++;
                if (trial.correct) {
                    correctAnswers++;
                }
            }
        });
        if (totalQuestions > 0) {
            comprehensionAccuracy = (correctAnswers / totalQuestions) * 100;
        }
    }
    
    // Check if server saving is configured
    if (DATA_SAVE_ENDPOINT && DATA_SAVE_ENDPOINT !== null && DATA_SAVE_ENDPOINT !== '') {
        // Show initial results with saving status
        displayResultsWithSaving(totalTrials, avgReadingTime, comprehensionAccuracy);
        
        // Auto-save data to server
        saveDataToServer(function(success, messageOrFilename) {
            // Update the display with save result
            updateSaveStatus(success, messageOrFilename);
        });
    } else {
        // Show results with local saving status
        displayResultsWithLocalSaving(totalTrials, avgReadingTime, comprehensionAccuracy);
    }
}

// Data saving endpoint configuration is now in config.js

// Function to save data to backend server
function saveDataToServer(callback) {
    userInfo.experimentEndTime = new Date().toISOString();
    
    // Prepare summary data for JSONL
    var data = jsPsych.data.get();
    
    // Filter reading and comprehension data for summary
    var readingData = data.filter(function(trial) {
        return trial.trial_type === 'self-paced-reading' && 
               trial.total_reading_time && 
               trial.word_timings &&
               trial.stimulus_id &&
               trial.sentence;
    });
    
    var comprehensionData = data.filter(function(trial) {
        return trial.trial_type === 'html-keyboard-response' && 
               trial.hasOwnProperty('correct') && 
               trial.hasOwnProperty('response') &&
               trial.stimulus_id &&
               !trial.stimulus;
    });
    
    // Calculate summary statistics
    var totalReadingTime = 0;
    var validTimes = 0;
    readingData.values().forEach(function(trial) {
        if (trial.total_reading_time && typeof trial.total_reading_time === 'number' && !isNaN(trial.total_reading_time)) {
            totalReadingTime += trial.total_reading_time;
            validTimes++;
        }
    });
    var avgReadingTime = validTimes > 0 ? totalReadingTime / validTimes : 0;
    
    var correctAnswers = 0;
    var totalQuestions = 0;
    comprehensionData.values().forEach(function(trial) {
        if (typeof trial.correct === 'boolean') {
            totalQuestions++;
            if (trial.correct) {
                correctAnswers++;
            }
        }
    });
    var comprehensionAccuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Create data payload for backend
    var dataPayload = {
        user_id: userInfo.userId,
        stimuli_file: userInfo.stimuliFile,
        experiment_start_time: userInfo.experimentStartTime,
        experiment_end_time: userInfo.experimentEndTime,
        experiment_duration_ms: new Date(userInfo.experimentEndTime) - new Date(userInfo.experimentStartTime),
        sentences_completed: readingData.count(),
        average_reading_time_ms: Math.round(avgReadingTime),
        comprehension_accuracy_percent: Math.round(comprehensionAccuracy * 100) / 100,
        total_comprehension_questions: totalQuestions,
        correct_comprehension_answers: correctAnswers,
        seed: userInfo.seed,
        full_data: data.values() // Include all trial data
    };
    
    // Send data to remote server using XMLHttpRequest (following save_result_demo.js pattern)
    console.log('Saving data to remote server for user:', userInfo.userId);
    
    var xhr = new XMLHttpRequest();
    var endpoint = DATA_SAVE_ENDPOINT;
    xhr.open(
        "POST",
        endpoint,
        true
    );
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            console.log("Data saved successfully:", xhr.responseText);
            if (callback) callback(true, 'Data saved to remote server');
        } else {
            console.error("Request failed with status: " + xhr.status);
            if (callback) callback(false, 'HTTP error: ' + xhr.status);
        }
    };
    
    xhr.onerror = function() {
        console.error("Network error occurred");
        if (callback) callback(false, 'Network error occurred');
    };
    
    xhr.send(JSON.stringify([dataPayload]));
}

// Function to display initial results page
function displayResultsWithSaving(totalTrials, avgReadingTime, comprehensionAccuracy) {
    document.body.innerHTML = '<div style="text-align: center; padding: 40px;">' +
                              '<h2>Experiment Complete!</h2>' +
                              '<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
                              '<p><strong>Participant ID:</strong> ' + userInfo.userId + '</p>' +
                              '<p><strong>Stimuli File:</strong> ' + userInfo.stimuliFile + '</p>' +
                              '<p><strong>Sentences completed:</strong> ' + totalTrials + '</p>' +
                              '<p><strong>Average reading time:</strong> ' + Math.round(avgReadingTime) + ' milliseconds</p>' +
                              '<p><strong>Comprehension accuracy:</strong> ' + Math.round(comprehensionAccuracy) + '%</p>' +
                              '</div>' +
                              '<div id="saveStatus" style="margin: 20px 0;">' +
                              '<p style="color: orange; font-weight: bold;">⏳ Saving data to server...</p>' +
                              '</div>' +
                              '<div>' +
                              '<button onclick="downloadData()" class="jspsych-btn" style="margin: 10px;">Download CSV Backup</button>' +
                              '<button onclick="retrySave()" class="jspsych-btn" style="margin: 10px;">Retry Save</button>' +
                              '</div>' +
                              '<p style="margin-top: 30px; color: #666; font-size: 14px;">Thank you for participating!</p>' +
                              '</div>';
}

// Function to update save status
function updateSaveStatus(success, messageOrFilename) {
    var statusDiv = document.getElementById('saveStatus');
    if (statusDiv) {
        if (success) {
            statusDiv.innerHTML = '<p style="color: green; font-weight: bold;">✓ Data saved successfully!</p>' +
                                 '<p style="color: #666; font-size: 14px;">File: ' + messageOrFilename + '</p>';
        } else {
            statusDiv.innerHTML = '<p style="color: red; font-weight: bold;">✗ Save failed: ' + messageOrFilename + '</p>' +
                                 '<p style="color: #666; font-size: 14px;">Please try again or download CSV backup.</p>';
        }
    }
}

// Function to retry saving
function retrySave() {
    updateSaveStatus(null, 'Retrying...');
    document.getElementById('saveStatus').innerHTML = '<p style="color: orange; font-weight: bold;">⏳ Retrying save...</p>';
    
    saveDataToServer(function(success, messageOrFilename) {
        updateSaveStatus(success, messageOrFilename);
    });
}

// Function to display results with download only (no server saving)
function displayResultsDownloadOnly(totalTrials, avgReadingTime, comprehensionAccuracy) {
    userInfo.experimentEndTime = new Date().toISOString();
    
    document.body.innerHTML = '<div style="text-align: center; padding: 40px;">' +
                              '<h2>Experiment Complete!</h2>' +
                              '<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">' +
                              '<p><strong>Participant ID:</strong> ' + userInfo.userId + '</p>' +
                              '<p><strong>Stimuli File:</strong> ' + userInfo.stimuliFile + '</p>' +
                              '<p><strong>Sentences completed:</strong> ' + totalTrials + '</p>' +
                              '<p><strong>Average reading time:</strong> ' + Math.round(avgReadingTime) + ' milliseconds</p>' +
                              '<p><strong>Comprehension accuracy:</strong> ' + Math.round(comprehensionAccuracy) + '%</p>' +
                              '</div>' +
                              '<div style="margin: 20px 0;">' +
                              '<button onclick="downloadData()" class="jspsych-btn" style="margin: 10px;">Download CSV Data</button>' +
                              '<button onclick="downloadJSONL()" class="jspsych-btn" style="margin: 10px;">Download JSONL Data</button>' +
                              '</div>' +
                              '<p style="margin-top: 30px; color: #666; font-size: 14px;">Thank you for participating!</p>' +
                              '</div>';
}

// Function to download data as CSV (backup option)
function downloadData() {
    var data = jsPsych.data.get().csv();
    var timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    var filename = userInfo.userId + '_' + timestamp + '.csv';
    
    var blob = new Blob([data], { type: 'text/csv' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Function to download data as JSONL
function downloadJSONL() {
    var data = jsPsych.data.get();
    
    // Create summary data for JSONL
    var dataPayload = {
        user_id: userInfo.userId,
        stimuli_file: userInfo.stimuliFile,
        experiment_start_time: userInfo.experimentStartTime,
        experiment_end_time: userInfo.experimentEndTime,
        experiment_duration_ms: new Date(userInfo.experimentEndTime) - new Date(userInfo.experimentStartTime),
        seed: userInfo.seed,
        full_data: data.values()
    };
    
    var jsonlContent = JSON.stringify(dataPayload);
    var timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    var filename = userInfo.userId + '_' + timestamp + '.jsonl';
    
    var blob = new Blob([jsonlContent], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// Function to start the experiment after loading stimuli
function startExperiment() {
    // Build the complete timeline
    var timeline = [
        welcome,
        instructions
    ].concat(createPracticeTrials()).concat([
        startMainExperiment
    ]).concat(createMainTrials()).concat([
        debrief
    ]);

    // Start the experiment
    jsPsych.init({
        timeline: timeline,
        display_element: 'jspsych-target',
        on_finish: function() {
            displayResults();
        }
    });
}

// Function to load selected stimuli and start experiment (static version)
function loadSelectedStimuliAndStart() {
    if (!userInfo.stimuliFile) {
        console.error('No stimuli file selected');
        return;
    }
    
    console.log('Loading files: stimuli, fillers, and train trials');
    
    var loadCount = 0;
    var totalLoads = 3;
    var errors = [];
    
    function checkComplete() {
        loadCount++;
        if (loadCount === totalLoads) {
            if (errors.length > 0) {
                console.warn('Some files failed to load:', errors);
            }
            console.log('File loading complete. Starting experiment.');
            startExperiment();
        }
    }
    
    // Load main stimuli
    loadCSVFromStaticFile('stimuli/' + userInfo.stimuliFile, function(error, stimuli) {
        if (error) {
            console.error('Error loading main stimuli:', error);
            errors.push('stimuli: ' + error);
            loadedStimuli = createStimulusList(); // Fallback
        } else {
            loadedStimuli = stimuli;
            console.log('Main stimuli loaded successfully:', stimuli.length, 'items');
        }
        checkComplete();
    });
    
    // Load filler sentences
    loadCSVFromStaticFile('stimuli/filler.csv', function(error, fillers) {
        if (error) {
            console.error('Error loading fillers:', error);
            errors.push('fillers: ' + error);
            loadedFillers = [];
        } else {
            loadedFillers = fillers;
            console.log('Fillers loaded successfully:', fillers.length, 'items');
        }
        checkComplete();
    });
    
    // Load training trials
    loadCSVFromStaticFile('stimuli/train_trial.csv', function(error, trainTrials) {
        if (error) {
            console.error('Error loading train trials:', error);
            errors.push('train_trials: ' + error);
            loadedTrainTrials = null;
        } else {
            loadedTrainTrials = trainTrials;
            console.log('Train trials loaded successfully:', trainTrials.length, 'items');
        }
        checkComplete();
    });
}

// Function to start user setup and then experiment
function startUserSetupAndExperiment() {
    var setupTimeline = [userIdInput];
    
    jsPsych.init({
        timeline: setupTimeline,
        display_element: 'jspsych-target',
        on_finish: function() {
            // After user setup, load stimuli and start main experiment
            loadSelectedStimuliAndStart();
        }
    });
}

// Start the experiment setup
document.addEventListener('DOMContentLoaded', function() {
    console.log('Static experiment system ready');
    // Start with user setup (ID and stimuli selection)
    startUserSetupAndExperiment();
}); 