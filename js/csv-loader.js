// CSV Loader for Self-Paced Reading Experiment
// Handles loading stimuli from CSV files with support for delayed questions

// Function to parse CSV content
function parseCSV(csvText) {
    var lines = csvText.trim().split('\n');
    var headers = lines[0].split(',').map(function(header) {
        return header.trim().replace(/"/g, '');
    });
    
    var data = [];
    for (var i = 1; i < lines.length; i++) {
        var values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            var item = {};
            for (var j = 0; j < headers.length; j++) {
                item[headers[j]] = values[j].trim().replace(/"/g, '');
            }
            data.push(item);
        }
    }
    return data;
}

// Helper function to properly parse CSV lines (handles commas within quotes)
function parseCSVLine(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    
    for (var i = 0; i < line.length; i++) {
        var char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Function to process CSV data into stimuli format
function processCSVData(csvData) {
    var stimuli = [];
    var delayedQuestions = [];
    
    // First pass: create stimuli and collect delayed questions
    csvData.forEach(function(row) {
        var stimulus = {
            id: parseInt(row.item_id) || row.item_id,
            sentence: row.sentence,
            condition: 'main'
        };
        
        // Check if this item has a question
        if (row.with_question && row.with_question.toLowerCase() === 'true' && row.question) {
            var questionDelay = parseInt(row.question_delay) || 0;
            
            if (questionDelay === 0) {
                // Immediate question
                stimulus.question = row.question;
                stimulus.options = [row.answer1, row.answer2];
                stimulus.correct_answer = 0; // Default to first answer, can be enhanced later
            } else {
                // Delayed question
                delayedQuestions.push({
                    originalItemId: stimulus.id,
                    question: row.question,
                    options: [row.answer1, row.answer2],
                    correct_answer: 0,
                    delay: questionDelay,
                    targetPosition: stimuli.length + questionDelay
                });
            }
        }
        
        stimuli.push(stimulus);
    });
    
    // Second pass: sort delayed questions by target position (earliest first)
    delayedQuestions.sort(function(a, b) {
        return a.targetPosition - b.targetPosition;
    });
    
    // Third pass: insert delayed questions at appropriate positions
    var processedStimuli = [];
    var questionQueue = [];
    
    for (var i = 0; i < stimuli.length; i++) {
        // Add the current stimulus
        processedStimuli.push(stimuli[i]);
        
        // Check if any delayed questions should appear after this position
        delayedQuestions.forEach(function(delayedQ) {
            if (delayedQ.targetPosition === i + 1) {
                questionQueue.push(delayedQ);
            }
        });
        
        // Sort question queue by original item ID (earlier sentences first)
        questionQueue.sort(function(a, b) {
            return a.originalItemId - b.originalItemId;
        });
        
        // Add questions from queue
        while (questionQueue.length > 0) {
            var nextQuestion = questionQueue.shift();
            processedStimuli.push({
                id: 'delayed_q_' + nextQuestion.originalItemId,
                type: 'delayed_question',
                originalItemId: nextQuestion.originalItemId,
                question: nextQuestion.question,
                options: nextQuestion.options,
                correct_answer: nextQuestion.correct_answer,
                condition: 'delayed_question'
            });
        }
    }
    
    return processedStimuli;
}

// Function to load CSV file
function loadCSVFile(file, callback) {
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var csvData = parseCSV(e.target.result);
            var processedStimuli = processCSVData(csvData);
            callback(null, processedStimuli);
        } catch (error) {
            callback(error, null);
        }
    };
    reader.onerror = function() {
        callback(new Error('Failed to read file'), null);
    };
    reader.readAsText(file);
}

// Function to load CSV from URL/path
function loadCSVFromURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                try {
                    var csvData = parseCSV(xhr.responseText);
                    var processedStimuli = processCSVData(csvData);
                    callback(null, processedStimuli);
                } catch (error) {
                    callback(error, null);
                }
            } else {
                callback(new Error('Failed to load CSV file'), null);
            }
        }
    };
    xhr.send();
}

// Create example CSV content for testing
function createExampleCSV() {
    return 'item_id,sentence,with_question,question,answer1,answer2,question_delay\n' +
           '1,"The cat sat on the mat",true,"What sat on the mat?","Cat","Dog",0\n' +
           '2,"The dog ran in the park",false,"","","",0\n' +
           '3,"The bird flew over the house",true,"What flew over the house?","Bird","Plane",2\n' +
           '4,"The sun was shining brightly",false,"","","",0\n' +
           '5,"The children played outside",true,"Where did the children play?","Inside","Outside",0\n';
} 