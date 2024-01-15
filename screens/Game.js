import React, { Component, useState, useEffect, onRef } from 'react';
import * as Speech from "expo-speech";
import * as Crypto from 'expo-crypto';

import {
    StyleSheet, 
    Button,
    Text,
    View,
    TouchableOpacity,
} from "react-native";

import GuessTouchable from '../components/GuessTouchable';

const RESULTS_SCREEN_NAME = "Results";

var DEFAULT_WORD_OPTIONS = [];
var DEFAULT_BUTTON_STATES = []; // 0 for normal, 1 for correct, 2 for incorrect

// store user performance data for display in results
var correctWords = [];
var incorrectWords = [];

const Game = ({navigation, route}) => {

    // State variables
    const [wordPoolListLength, setWordPoolListLength] = useState(route.params.wordSet.length);
    const [wordSetListLength, setWordSetListLength] = useState(route.params.wordSet.length);
    const [speechRate, setSpeechRate] = useState(route.params.SPEECH_RATE);
    const [fieldLength, setFieldLength] = useState(route.params.FIELD_LENGTH);
    const [wordOptions, setWordOptions] = useState([]);
    const [wordSet, setWordSet] = useState([...route.params.wordSet]);
    const [wordPool, setWordPool] = useState([...route.params.wordSet]);
    const [choiceButtonStates, setChoiceButtonStates] = useState([]);
    const [showResults, setShowResults] = useState(false); // for toggling "well Done!" or "Incorrect!" text
    const [userAnsweredCorrectly, setUserAnsweredCorrectly] = useState(false); // determines whether to show "Well Done!" or "Incorrect!"
    const [solutionWordIndex, setSolutionWordIndex] = useState(-1);

    // reset user performance and set word choices for first render
    useEffect(() => {        
        // extract params

        for (var i=0; i<fieldLength; i++) {
            DEFAULT_WORD_OPTIONS.push("");
        }
        for (var i=0; i<fieldLength; i++) {
            DEFAULT_BUTTON_STATES.push(0);
        }

        setChoiceButtonStates([...DEFAULT_BUTTON_STATES]);

        correctWords = [];
        incorrectWords = [];
        
        createWordChoices();

    }, [route.params]);

    // change state back to default: clear button colors, next buttons are hidden, create new word choices
    const reset = () => {
        setChoiceButtonStates(DEFAULT_BUTTON_STATES);
        if (userAnsweredCorrectly) setUserAnsweredCorrectly(!userAnsweredCorrectly);
        setShowResults(false);
        createWordChoices();
    }

    const switchToResults = () => {
        navigation.navigate(RESULTS_SCREEN_NAME, 
            {
                incorrect: incorrectWords,
                correct: correctWords,
            });
    }

    // use TTS to have user audibly hear what word they should press
    const speak = () => {
        Speech.speak(wordOptions[solutionWordIndex], {rate: speechRate});
    }

    // given a list and index terminator, get a random element from that list
    const getRandomChoice = (lst, mod) => {
        return lst[Crypto.getRandomBytes(1)[0] % mod];
    }

    // create a list of words that will be displayed to the user
    const getWordArray = (solutionWord) => {
        var wordMap = {};
        var newWordArray = [];
        for (var index=0; index<fieldLength; index++) {
            while (true) {
                var word = getRandomChoice(wordSet, wordSetListLength);
                if (wordMap[word] == undefined && word !== solutionWord) {
                    wordMap[word] = index; 
                    break;
                }
            }
        };
        for (const [word, index] of Object.entries(wordMap)) {
            newWordArray[index] = word;
        }
        return newWordArray;
    }
    
    // choose a solution word from the Fry Sight Words list. 
    const getSolutionWord = () => {
        var solutionWord = getRandomChoice(wordPool, wordPoolListLength);

        // remove the solution word from the pool of available solution words
        const newWordPool = wordPool.filter(item => item !== solutionWord);
        setWordPool(newWordPool);
        
        setWordPoolListLength(wordPoolListLength-1);
        return solutionWord;
    }

    // get a word choice array, choose a random index from it, and replace the element at that index with a solution word.
    // this solution provides more distributed randomness
    const createWordChoices = () => {
        const correctWord = getSolutionWord();
        var wordChoices = getWordArray(correctWord);
        
        //console.log("fieldlength", fieldLength);
        var correctWordIndex = Crypto.getRandomBytes(1)[0] % fieldLength;
        wordChoices[correctWordIndex] = correctWord;
        setWordOptions(wordChoices);
        setSolutionWordIndex(correctWordIndex);
    } 

    // given a buttonID of a pressed word choice, determine the button with the answer and set the button colors accordingly
    const onTouchablePress = (buttonID) => {

        // don't update buttons when user has already selected one
        if (showResults) return;
        
        var btnStates = [...DEFAULT_BUTTON_STATES];
        btnStates.forEach((state, index) => {
            if (index == solutionWordIndex) btnStates[index] = 1;
            else btnStates[index] = 2;
        });
        setChoiceButtonStates(btnStates);
        setShowResults(!showResults);

        // set "Well Done!" or "Incorrect!" and save performance data

        if (buttonID == solutionWordIndex) {
            setUserAnsweredCorrectly(!userAnsweredCorrectly);
            correctWords.push(wordOptions[solutionWordIndex]);
        }
        else incorrectWords.push(wordOptions[solutionWordIndex]);
    }

    // set button color based on the state saved for a buttonID
    const _getTouchableColor = (btnID) => {
        if (choiceButtonStates[btnID] == 0) return styles.guessTouchableNormal
        else if (choiceButtonStates[btnID] == 1) return styles.guessTouchableGreen;
        else if (choiceButtonStates[btnID] == 2) return styles.guessTouchableRed;
    }

    // control behavior of next button press. Only when all 100 words are exhausted should the next button toggle the results screen
    const _toggleResultsPress = () => {
        if (wordPoolListLength > 0) return reset;
        else return switchToResults;
    }

    const _buttonRender = () => {
        var renderedButtons = [];
        var j = 0;
        
        for (var i=0; i<fieldLength/2; i++) {
            renderedButtons.push(
                <View style={styles.choiceContainer} key={i}>
                    
                    <GuessTouchable 
                        onPress={onTouchablePress}
                        buttonID={j}
                        getStyle={_getTouchableColor}
                        word={wordOptions[j]}
                        key={j}
                    />
                    
                    {
                        wordOptions[j+1] !== undefined &&
                        <GuessTouchable 
                            onPress={onTouchablePress}
                            buttonID={j+1}
                            getStyle={_getTouchableColor}
                            word={wordOptions[j+1]}
                            key={j+1}
                        />
                    }
                </View>
            ); 
            j += 2;
        }
        return renderedButtons;       
    }

    return (
        <View style={styles.container}>
            <View style={styles.counterView}>
                <Text style={styles.progressCounter}>Words remaining: {wordPoolListLength}</Text>
            </View>
            <View style={styles.choiceContainer}>
                {showResults && ((userAnsweredCorrectly && <Text style={styles.resultText}>Well Done!</Text>) || 
                    <Text style={styles.resultText}>Incorrect!</Text> )}
            </View>
            <View style={styles.speakButton}>
                <TouchableOpacity style={styles.speakTouchable} onPress={speak}>
                    <Text style={styles.text}>Speak</Text>
                </TouchableOpacity>
            </View>
            {_buttonRender()}

            <View style={styles.navContainer}>
                {showResults && 
                <TouchableOpacity 
                        style={styles.resultTouchable}
                        onPress={_toggleResultsPress()}
                    >
                        <Text style={styles.text}>Next</Text>
                    </TouchableOpacity>
                }
                {showResults &&
                    <TouchableOpacity 
                        style={styles.dangerTouchable}
                        onPress={switchToResults}
                    >
                        <Text style={styles.dangerText}>Exit</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
    },
    speakButton: {
        justifyContent: "center",
        alignSelf: "center",
        margin: 15,
    },
    counterView: {
        top: 35, 
        position: "absolute",
        alignSelf: "center",
    },
    progressCounter: {
        color: "black",
        fontSize: 20,
    },
    choiceContainer: {
        justifyContent: "center",
        flexDirection: "row",
    },
    navContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    speakTouchable: {
        alignItems: "center",
        justifyContent: "center",
        height: 75,
        width: 150,
        borderRadius: 20,
        backgroundColor: "orange",
        margin: 40,
    },
    resultTouchable: {
        alignItems: "center",
        justifyContent: "center",
        height: 75,
        width: 200,
        borderRadius: 20,
        backgroundColor: "black",
        marginTop: 25,
    },
    guessTouchable: {
        alignItems: "center",
        justifyContent: "center",
        height: 40,
        width: 70,
        borderRadius: 20,
        backgroundColor: "green",
    },
    dangerTouchable: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        marginTop: 10,
    },
    dangerText: {
        color: "red",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 13,
        fontWeight: 'bold',
    },
    text: {
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        lineHeight: 50,
        fontWeight: 'bold',
    },
    resultText: {
        color: "black",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        lineHeight: 50,
        fontWeight: 'bold',
    },
    guessTouchableNormal: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 65,
        maxWidth: 185,
        borderRadius: 20,
        backgroundColor: "black",
        margin: 15,
    },
    guessTouchableRed: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 65,
        maxWidth: 185,
        borderRadius: 20,
        backgroundColor: "red",
        margin: 15,
    },
    guessTouchableGreen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        height: 65,
        maxWidth: 185,
        borderRadius: 20,
        backgroundColor: "green",
        margin: 15,
    },
    opacityText: {
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        lineHeight: 40,
        fontWeight: 'bold',
    }
})
export default Game;
