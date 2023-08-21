import React, { Component } from 'react';
import * as Speech from "expo-speech";
import * as Random from "expo-random";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
    StyleSheet, 
    Button,
    Text,
    View,
    TouchableOpacity,
} from "react-native";

import ChoiceBtn from "../components/ChoiceBtn";
const resultScreenName = "Results"

var SPEECH_RATE;

var FryList300 = ["above", "add", "almost", "along", "always", "began", "begin", "being", "below", "between", "book", "both", "car", "carry", "children", "city", "close", "country", "cut", "don’t", "earth", "eat", "enough", "every", "example", "eyes", "face", "family", "far", "father", "feet", "few", "food", "four", "girl", "got", "group", "grow", "hard", "head", "hear", "high", "idea", "important", "Indian", "it’s", "keep", "last", "late", "leave", "left", "let", "life", "light", "list", "might", "mile", "miss", "mountains", "near", "never", "next", "night", "often", "once", "open", "own", "paper", "plant", "real", "river", "run", "saw", "school", "sea", "second", "seem", "side", "something", "sometimes", "song", "soon", "start", "state", "stop", "story", "talk", "those", "thought", "together", "took", "tree", "under", "until", "walk", "watch", "while", "white", "without", "young"];

var tempState;
var tempProps;
var correct_words;
var incorrect_words;

export default class WordScreen300 extends Component {
    constructor(props) {
        super(props);
        const rate_param = this.props.route.params;
        SPEECH_RATE = rate_param.SPEECH_RATE;
        this.state = {
            currentWord: "",
            Option1: "",
            Option2: "",
            Option3: "",
            btn1State: 0,
            btn2State: 0,
            btn3State: 0,
            ReserveList: FryList300,
            activeList: FryList300,
            activeListLength: FryList300.length,
            showNext: false,
            correct: null,
        }
        this.compareChoice = this.compareChoice.bind(this);
        this.assignButtons = this.assignButtons.bind(this);
        this.refresh = this.refresh.bind(this);
        correct_words = [];
        incorrect_words = [];
        //console.log(this.props);
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
        this.props = tempProps;
        tempProps = "";
        this.props.navigation.navigate(resultScreenName, 
            {
                incorrect: incorrect_words,
                correct: correct_words,
            });
    }

    refresh_state() {
        this.state = tempState;
    }

    speak() {
        this.state = tempState;
        Speech.speak(this.state.currentWord, {rate: SPEECH_RATE});
    }

    getRandomChoice(lst, mod) {
        return lst[Random.getRandomBytes(1)[0] % mod];
    }

    getWord() {
        return this.getRandomChoice(this.state.ReserveList, 100);
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

    filterList(lst, item) {
        lst = lst.filter(val => val !== item);
        return lst;
    }

    async createWordArray() {
        return [await this.getSolutionWord(), this.getWord(), this.getWord()];
    } 

    getButtonWord(lst, max) {
        const word = this.getRandomChoice(lst, max);
        return [this.filterList(lst, word), word];
    }

    async assignButtons() {
        var lst = await this.createWordArray();
        var [lst, val1] = this.getButtonWord(lst, 3);
        var [lst, val2] = this.getButtonWord(lst, 2);
        var [lst, val3] = this.getButtonWord(lst, 1);
        console.log(val1 + "-" + val2 + "-" + val3);
        await this.setState({
            Option1: val1,
            Option2: val2,
            Option3: val3,
        });
        tempState = this.state;
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
        });
        await this.childStateChange();
        console.log(correct_words);
        console.log(incorrect_words);
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
                {this._toggleResultText()}
                <View style={styles.choiceContainer}>
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
        marginTop: 5,
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
