
// Gobals
var filesRead = 0;
var letterInfoArray = [];
var wordInfoArray = [];

// Constructor for LetterInfo object
function LetterInfo(letter, numPieces, numPiecesInPlay, score)
{
    this.letter = letter;
    this.numPieces = numPieces;
    this.numPiecesInPlay = numPiecesInPlay;
    this.score = score;

    this.toString = function()
    {
        return this.letter + "(" + this.numPieces + "," + this.score + ")";
    };
}

// Constructor for WordInfo object
function WordInfo(word, wordScore)
{
    this.word = word;
    this.wordScore = wordScore;
    
    this.toString = function()
    {
        return this.word + "(" + this.wordScore + ")";
    };
}

////////////////////////////////////////////////////////////////////////////////
// Name: initializeApp()
// Arguments: N/A
// Purpose: To read in the data contained in files letters.csv and
//     dictionary.txt
// Return Value: N/A
// Dependencies: readLetters() and readDictionary()
////////////////////////////////////////////////////////////////////////////////
function initializeApp()
{
    $(document).ready(function(){
        $(".formItem").hide();
        
        // Get data from letters.json file and process
        $.getJSON('letters.json', function(jsonData){
            processLetters(jsonData)});
        
        // Get data from dictionary.txt file and process
        $.get('dictionary.txt', function(data){
            processDictionary(data)}, 'text');
            
        // Assign event handlers
        $("#rackTextArea").on('input', function(){
            updateLetterTracking();
        });
        
        $("#wordTextArea").on('input', function(){
            updateLetterTracking();
        });
        
        $("#processButton").click(function(){
            processButtonClicked();
        });
        
        $("#resetButton").click(function(){
            resetButtonClicked();
        });
        
    });
}

////////////////////////////////////////////////////////////////////////////////
// Name: updateAndCheckNumFilesRead()
// Arguments: N/A
// Purpose: A global variable, filesRead, is incremented here. When both
//     files, letters.json and dictionary.txt, have finished being processed
//     the form items are displayed and the letterTrackerTextArea is
//     initialized with letterInfo data.
// Return Value: N/A
////////////////////////////////////////////////////////////////////////////////
//
function updateAndCheckNumFilesRead()
{
    filesRead++;
    if(filesRead == 2)
    {
        alert("Data files finished being processed. Close alert to continue.");
        $(".formItem").show(0);
        $("#letterTrackerTextArea").val(getLetterInfoArrayString());
    }
}

////////////////////////////////////////////////////////////////////////////////
// Name: processLetters()
// Arguments:
//     jsonData: array of JSON objects
// Purpose: Takes the the data elements from the jsonData array and stores them
//     in the letterInfoArray, which is an array of LetterInfo objects. Makes
//     call to updateAndCheckNumFilesRead().
// Return Value: N/A
////////////////////////////////////////////////////////////////////////////////
function processLetters(jsonData)
{
    for(var i = 0; i < jsonData.length; i++)
    {
        letterInfoArray.push(new LetterInfo(jsonData[i].letter,
            jsonData[i].count, 0, jsonData[i].score));
    }
            
    //alert(letterInfoArray.toString());
    updateAndCheckNumFilesRead();
}

////////////////////////////////////////////////////////////////////////////////
// Name: processDictionary()
// Arguments:
//     data: text of dictionry words
// Purpose: Calls split on data and calculates wordScore. Then stores the words
//     and wordScores in the wordInfoArray, which is an array of wordInfo
//     objects. Makes call to updateAndCheckNumFilesRead().
// Return Value: N/A
////////////////////////////////////////////////////////////////////////////////
function processDictionary(data)
{
    var textLines = data.split('\n');
    for(var i = 0; i < textLines.length; i++)
    {
        var word = textLines[i];
        var wordScore = 0;
                
        // Calculate wordScore for word
        for(var j = 0; j < word.length; j++)
        {
            for(var k = 0; k < letterInfoArray.length; k++)
            {
                if(word[j] == letterInfoArray[k].letter)
                {
                    wordScore += parseInt(letterInfoArray[k].score);
                    break;
                }
            }
        }
                
        wordInfoArray.push(new WordInfo(word, wordScore));
    }
    
    //alert(wordInfoArray.toString());
    updateAndCheckNumFilesRead();
}

////////////////////////////////////////////////////////////////////////////////
// Name: getLetterInfoArrayString()
// Arguments: N/A
// Purpose: Creates and returns a string representation of the data contained
//     in letterInfoArray
// Return Value: String value
// Dependencies: Assumes the letterInfoArray has been populated
////////////////////////////////////////////////////////////////////////////////
function getLetterInfoArrayString()
{
    var returnString = "";

    for(var i = 0; i < letterInfoArray.length; i++)
    {
        returnString += letterInfoArray[i].letter + "(" +
            (letterInfoArray[i].numPieces - letterInfoArray[i].numPiecesInPlay) +
            "," + letterInfoArray[i].score + ") ";
    }

    return returnString;
}


////////////////////////////////////////////////////////////////////////////////
// Name: updateLetterTracking()
// Arguments: N/A
// Purpose: Called on input made to both the 'Rack' and 'Word' text areas to
//     dynamically update the number of letter pieces aviable to the user
//     and displayed in letterTrackerTextArea.
// Return Value: N/A
// Dependencies: Assumes letterInfoArray has been populated
////////////////////////////////////////////////////////////////////////////////
function updateLetterTracking()
{
    var currentRackString = $("#rackTextArea").val().toUpperCase();
    var currentWordString = $("#wordTextArea").val().toUpperCase();
    
    // Reset all numPiecesInPlay values to 0
    for(var i = 0; i < letterInfoArray.length; i++)
    {
        letterInfoArray[i].numPiecesInPlay = 0;
    }
    
    // Iterate through currentRackString and update numPiecesInPlay
    for(var i = 0; i < currentRackString.length; i++)
    {
        // Find correct index in letterInfoArray for character at
        // currentRackString[i] and update numPiecesInPlay
        for(var j = 0; j < letterInfoArray.length; j++)
        {
            if(currentRackString[i] == letterInfoArray[j].letter)
            {
                letterInfoArray[j].numPiecesInPlay++;
                break;
            }
        }
    }
    
    // Iterate through currentWordString and update numPiecesInPlay
    for(var i = 0; i < currentWordString.length; i++)
    {
        // Find correct index in letterInfoArray for character at
        // currentWordString[i] and update numPiecesInPlay
        for(var j = 0; j < letterInfoArray.length; j++)
        {
            if(currentWordString[i] == letterInfoArray[j].letter)
            {
                letterInfoArray[j].numPiecesInPlay++;
                break;
            }
        }
    }
    
    // Update data in letterTrackerTextArea
    $("#letterTrackerTextArea").val(getLetterInfoArrayString());
}

////////////////////////////////////////////////////////////////////////////////
// Name: processButtonClicked()
// Arguments: N/A
// Purpose: Checks for input errors. If any found, updates the outputTextArea
//     with the error message and returns. If no errors are found, a call to
//     findHighestScoringWord() is made.
// Return Value: N/A
// Dependencies: Makes call to findHighestScoringWord()
////////////////////////////////////////////////////////////////////////////////
function processButtonClicked()
{
    $("#outputTextArea").val("");
    
    // Check rack rules
    var rackString = $("#rackTextArea").val();
    if(rackString.length < 1 || rackString.length > 7)
    {
        $("#outputTextArea").val("Invalid number of letters on rack. Must be between 1-7");
        return;
    }
    
    // If optional word provided by user, check word rules
    var wordString = $("#wordTextArea").val().toUpperCase();
    if(wordString.length > 0) // then we have something to validate
    {
        if(wordString.length < 2 || wordString.length > 15)
        {
            $("#outputTextArea").val("Invalid number of letters in word. Must be between 2-15");
            return;
        }
        
        // Check that word exists in the supplied dictionary (aka wordInfoArray)
        var wordExists = false;
        for(var i = 0; i < wordInfoArray.length; i++)
        {
            if(wordString == wordInfoArray[i].word)
            {
                wordExists = true;
                break;
            }
        }
        
        if(!wordExists)
        {
            $("#outputTextArea").val("The word provided (" + wordString + ") does not exist in dictionary");
            return;
        }
    }

    // Make sure the user hasn't entered too many of any letters
    var errorLetters = "";
    for(var i = 0; i < letterInfoArray.length; i++)
    {
        if(letterInfoArray[i].numPiecesInPlay > letterInfoArray[i].numPieces)
        {
            errorLetters += letterInfoArray[i].letter + " ";
        }
    }

    if(errorLetters.length > 0)
    {
        $("#outputTextArea").val("Error: letters with too many entries: " + errorLetters);
        return;
    }
    
    findHighestScoringWord();
}

////////////////////////////////////////////////////////////////////////////////
// Name: findHighestScoringWord()
// Arguments: N/A
// Purpose: Looks for valid scoring words in the wordInfoArray and keeps track
//     of the maxScoreIndex as maximum scoring words are found. See comments
//     below in function for the word building scenarios that are handled. The
//     'Output' and 'Word Score' text areas are updated with the results, the
//     word and wordScore stored at wordInfoArray[maxScoreIndex].
// Return Value: N/A
// Dependencies: Assumes wordInfoArray has been populated. Makes calls to
//     isScoringWord()
////////////////////////////////////////////////////////////////////////////////
function findHighestScoringWord()
{
    var maxScoreIndex = 0;
    
    // Example: AIDOORW -> DRAW (8 points, 1st word alphabetically)
    
    // Case where no word is supplied: Find all words in wordInfoArray that can
    // be made from letters in rack. Keep track of index of max scoring word found.
    if($("#wordTextArea").val().length == 0)
    {
        for(var i = 0; i < wordInfoArray.length; i++)
        {
            if(isScoringWord(wordInfoArray[i].word, $("#rackTextArea").val()))
            {
                //alert("Scoring word: " + wordInfoArray[i].word);
                
                // Keep track of index of max scoring word found
                if(wordInfoArray[i].wordScore > wordInfoArray[maxScoreIndex].wordScore)
                {
                    maxScoreIndex = i;
                }
            }
        }
    }

    // Case where word is supplied by user
    if($("#wordTextArea").val().length > 0)
    {
        var myWord = $("#wordTextArea").val().toUpperCase();
        
        // Building off of word horizontally. Scoring word must include user supplied word.
        for(var i = 0; i < wordInfoArray.length; i++)
        {
            if(wordInfoArray[i].word.includes(myWord) &&
                isScoringWord(wordInfoArray[i].word, $("#rackTextArea").val() + myWord))
            {
                //alert("Scoring word: " + wordInfoArray[i].word);
                
                // Keep track of index of max scoring word found
                if(wordInfoArray[i].wordScore > wordInfoArray[maxScoreIndex].wordScore)
                {
                    maxScoreIndex = i;
                }
            }
        }
    
        // Building off of user supplied word vertically checking each letter
        for(var i = 0; i < myWord.length; i++)
        {
            var myLetter = myWord[i];
            for(var j = 0; j < wordInfoArray.length; j++)
            {
                if(wordInfoArray[j].word.includes(myLetter) &&
                    isScoringWord(wordInfoArray[j].word, $("#rackTextArea").val() + myLetter))
                {
                    //alert("Scoring word: " + wordInfoArray[j].word);
                
                    // Keep track of index of max scoring word found
                    if(wordInfoArray[j].wordScore > wordInfoArray[maxScoreIndex].wordScore)
                    {
                        maxScoreIndex = j;
                    }
                }
            }
        }
    }
    
    // Update Output and Word Score text areas
    $("#outputTextArea").val(wordInfoArray[maxScoreIndex].word);
    $("#wordScoreTextArea").val(wordInfoArray[maxScoreIndex].wordScore + " points");
}

////////////////////////////////////////////////////////////////////////////////
// Name: isScoringWord()
// Arguments:
//     word: passed in word from wordInfoArray (dictionary words)
//     letters: string of letters from which to search for a valid scoring word
// Purpose: Returns true if passed in word if a valid scoring word and false
//     otherwise.
// Return Value: Boolean
// Dependencies: N/A
////////////////////////////////////////////////////////////////////////////////
function isScoringWord(word, letters)
{
    var index = 0;
    var myLetters = letters.toUpperCase();
    
    //alert("Inside isScoringWord: word = " + word + ", letters = " + letters);
    
    // Get out returning false if word has more characters than letters string
    if(word.length > myLetters.length)
    {
        return false;
    }
    
    // Iterate through each letter in word to see if exists in letters.
    // If no, return false. If yes, remove letter from letters and continue
    // iterating.
    for(var i = 0; i < word.length; i++)
    {
        index = myLetters.indexOf(word[i]);
        if(index == -1)
        {
            return false;
        }
        else
        {
            if(index == 0)
            {
                myLetters = myLetters.substring(1, myLetters.length);
            }
            else if(index == myLetters.length - 1)
            {
                myLetters = myLetters.substring(0, myLetters.length-1);
            }
            else
            {
                myLetters = myLetters.substring(0, index) +
                    myLetters.substring(index+1, myLetters.length);
            }
        }
    }
    
    return true;
}

////////////////////////////////////////////////////////////////////////////////
// Name: resetButtonClicked()
// Arguments: N/A
// Purpose: Clears out the ‘Rack’, ‘Word’, ‘Output’ and ‘Word Score’ text areas
//     and resets all data in the ‘Letter Tracker’ text area to original values
// Return Value: N/A
// Dependencies: Calls updateLetterTracking()
////////////////////////////////////////////////////////////////////////////////
function resetButtonClicked()
{
    // Clear out all fields
    $("#rackTextArea").val("");
    $("#wordTextArea").val("");
    $("#outputTextArea").val("");
    $("#wordScoreTextArea").val("");
    
    updateLetterTracking();
}





