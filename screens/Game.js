import React, { Component } from 'react';
import * as Speech from "expo-speech";
import * as Random from "expo-random";

import {
    StyleSheet, 
    Button,
    Text,
    View,
    TouchableOpacity,
} from "react-native";

import ChoiceBtn from "../components/ChoiceBtn";
const resultScreenName = "Results"


//var tmpLst = ["go", "had", "will", "which"];
var SPEECH_RATE;
var wordSet = [];

const WORD_COUNT = 100;
var tempProps;
var correct_words;
var incorrect_words;

export default class Game extends Component {
    constructor(props) {
        super(props);
        const route_params = this.props.route.params;
        SPEECH_RATE = route_params.SPEECH_RATE;
        wordSet = route_params.wordSet;
        this.state = {
            currentWord: "",
            Option1: "",
            Option2: "",
            Option3: "",
            btn1State: 0,
            btn2State: 0,
            btn3State: 0,
            ReserveList: wordSet,
            activeList: wordSet,
            //activeList: tmpLst,
            activeListLength: wordSet.length,
            //activeListLength: tmpLst.length,
            showNext: false,
            correct: null,
            wordsRemaining: 100,
        }
        this.speak = this.speak.bind(this);
        this.refresh = this.refresh.bind(this);
        this.compareChoice = this.compareChoice.bind(this);
        this.assignButtons = this.assignButtons.bind(this);
        this.switchToResults = this.switchToResults.bind(this);
        correct_words = [];
        incorrect_words = [];
    }

    async componentDidMount() {
        await this.assignButtons();
        await this.childStateChange();
        tempProps = this.props;
    }

    // updates the render of the child objects
    async childStateChange() {
        await this.btn1.handleStateChange();
        await this.btn2.handleStateChange();
        await this.btn3.handleStateChange();
    }

    switchToResults() {
        tempProps = "";
        this.props.navigation.navigate(resultScreenName, 
            {
                incorrect: incorrect_words,
                correct: correct_words,
            });
    }

    speak() {
        Speech.speak(this.state.currentWord, {rate: SPEECH_RATE});
    }

    getRandomChoice(lst, mod) {
        return lst[Random.getRandomBytes(1)[0] % mod];
    }

    getWords() {
        var word1 = "";
        var word2 = "";
        while (word1 == word2) {
            word1 = this.getRandomChoice(this.state.ReserveList, WORD_COUNT);
            word2 = this.getRandomChoice(this.state.ReserveList, WORD_COUNT);
        }
        return [word1, word2];
    }

    async getSolutionWord() {
        const word = this.getRandomChoice(this.state.activeList, this.state.activeListLength);

        var wordList = this.state.activeList;
        wordList = wordList.filter(item => item !== word);
        await this.setState({
            currentWord: word,
            activeList: wordList,
            activeListLength: this.state.activeListLength - 1,
        });
        return word;
    }

    shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    filterList(lst, item) {
        lst = lst.filter(val => val !== item);
        return lst;
    }

    async createWordArray() {
        const wrongWords = this.getWords();
        const wordArr = [await this.getSolutionWord(), wrongWords[0], wrongWords[1]];
        const shuffledArray = this.shuffleArray(wordArr);
        return shuffledArray
    } 

    getButtonWord(lst, max) {
        const word = this.getRandomChoice(lst, max);
        return [this.filterList(lst, word), word];
    }

    async assignButtons() {
        var lst = await this.createWordArray();

        const val1 = lst[0];
        const val2 = lst[1];
        const val3 = lst[2];

        await this.setState({
            Option1: val1,
            Option2: val2,
            Option3: val3,
        });
    }

    async compareChoice(buttonID) {
        //this.refresh_state();
        var correct = false;

        // don't update buttons when user has already selected one
        if (this.state.showNext) return;

        if (this.state.Option1 === this.state.currentWord) {
            await this.setState({
                btn1State: 1,
                btn2State: 2,
                btn3State: 2,
            });
            if (buttonID == 1) {
                correct = true;
                correct_words.push(this.state.currentWord);
            }        
        }
        else if (this.state.Option2 === this.state.currentWord) {
            await this.setState({
                btn1State: 2,
                btn2State: 1,
                btn3State: 2,
            });
            if (buttonID == 2) {
                correct = true;
                correct_words.push(this.state.currentWord);
            }        
        }
        else if (this.state.Option3 === this.state.currentWord) {
            await this.setState({
                btn1State: 2,
                btn2State: 2,
                btn3State: 1,
            });
            if (buttonID == 3) {
                correct = true;
                correct_words.push(this.state.currentWord);
            }        
        }
        if (!correct) incorrect_words.push(this.state.currentWord);

        await this.childStateChange();
        await this.setState({
            showNext: true,
            correct: correct,            
        });
    }

    async refresh() {
        await this.assignButtons();
        await this.setState({
            showNext: false,
            correct: false,
            btn1State: 0,
            btn2State: 0,
            btn3State: 0,
            wordsRemaining: this.state.wordsRemaining-1,
        });
        await this.childStateChange();
    }

    _toggleResultText() {
        if (this.state.showNext) {
            if (this.state.correct) {
                return (
                    <View style={styles.choiceContainer}>
                        <Text style={styles.resultText}>Well done!</Text> 
                    </View>
                );
            }
            else {
                return (
                    <View style={styles.choiceContainer}>
                        <Text style={styles.resultText}>Incorrect!</Text> 
                    </View>
                );
            }
        }
    }
    _toggleResultButton() {
        if (this.state.showNext) {
            if (this.state.activeListLength < 1) {
                return (
                    <View style={styles.choiceContainer}>
                        <TouchableOpacity 
                            style={styles.resultTouchable}
                            onPress={this.switchToResults}
                        >
                            <Text style={styles.text}>Next</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
            else {
                return (
                    <View style={styles.navContainer}>
                        <TouchableOpacity 
                            style={styles.resultTouchable}
                            onPress={this.refresh}
                        >
                            <Text style={styles.text}>Next</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.dangerTouchable}
                            onPress={this.switchToResults}
                        >
                            <Text style={styles.dangerText}>Exit</Text>
                        </TouchableOpacity>
                    </View>
                );
            }
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.counterView}>
                    <Text style={styles.progressCounter}>Words remaining: {this.state.wordsRemaining}</Text>
                </View>
                {this._toggleResultText()}
                <View style={styles.speakButton}>
                    <TouchableOpacity style={styles.speakTouchable} onPress={this.speak}>
                        <Text style={styles.text}>Speak</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.choiceContainer}>
                    <ChoiceBtn 
                        _id={1}
                        comp={this.compareChoice}
                        pnState={this.state}
                        onRef={ref => (this.btn1=ref)}
                    />
                    <ChoiceBtn 
                        _id={2}
                        comp={this.compareChoice}
                        pnState={this.state}
                        onRef={ref => (this.btn2=ref)}
                    />
                </View>
                <View style={styles.choiceContainer}>
                    <ChoiceBtn 
                        _id={3}
                        comp={this.compareChoice}
                        pnState={this.state}
                        onRef={ref => (this.btn3=ref)}
                    />
                </View>
                {this._toggleResultButton()}
            </View>
        );
    }
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
        top: 30,
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
})
