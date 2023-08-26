import React, { Component } from 'react';
import {
    StyleSheet, 
    Button,
    Text,
    View,
    TouchableOpacity,
} from "react-native";
import Slider from '@react-native-community/slider';
import { FryList100 } from "../components/set100";
import { FryList200 } from "../components/set200";
import { FryList300 } from "../components/set300";
import { FryList400 } from "../components/set400";
import { FryList500 } from "../components/set500";
import { FryList600 } from "../components/set600";
import { FryList700 } from "../components/set700";  
import { FryList800 } from "../components/set800";
import { FryList900 } from "../components/set900";
import { FryList1000 } from "../components/set1000";
import { SelectList } from 'react-native-dropdown-select-list';
const DEFAULT_SPEECH_RATE = 0.5;

const selectData = [
    {key: FryList100, value: "Set 100"},
    {key: FryList200, value: "Set 200"},
    {key: FryList300, value: "Set 300"},
    {key: FryList400, value: "Set 400"},
    {key: FryList500, value: "Set 500"},
    {key: FryList600, value: "Set 600"},
    {key: FryList700, value: "Set 700"},
    {key: FryList800, value: "Set 800"},
    {key: FryList900, value: "Set 900"},
    {key: FryList1000, value: "Set 1000"},

]

var wordSetSelected = FryList100;

export default class MainScreen extends Component {
    constructor(props) {
        super(props);
        this.switchScreen = this.switchScreen.bind(this);
        this.updateRate = this.updateRate.bind(this);

        this.state = {
            speech_rate: DEFAULT_SPEECH_RATE,
            selectVal: wordSetSelected,
        }
    }

    switchScreen() {
        this.props.navigation.navigate("Game", {
            SPEECH_RATE: this.state.speech_rate,
            wordSet: wordSetSelected,                                    
        });
    }
    updateRate(rate) {
        this.setState({
            speech_rate: rate,
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={styles.titleText}>Fry Sight Words</Text>
                </View>
                <View>
                    <Text style={styles.wordOptionsText}>Word Sets</Text>
                    <View style={styles.selector}>
                        <SelectList 
                            setSelected={(key) => wordSetSelected = key}
                            data={selectData}
                            save="key"
                            defaultOption={selectData[0]}
                            width={5}
                        />
                    </View>
                   
                    <TouchableOpacity
                        style={styles.navTouchable}
                        onPress={this.switchScreen} 
                    >
                        <Text style={styles.text}>Start</Text>
                    </TouchableOpacity>
                    <View style={styles.setting}>
                        <Text style={styles.speechSpeedTitle}>Speech Speed</Text>
                        <Text style={styles.speechSpeedValue}>{this.state.speech_rate}</Text>
                        <Slider 
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={1}
                            onValueChange={this.updateRate}
                            value={DEFAULT_SPEECH_RATE}
                            minimumTrackTintColor="#FFFFFF"
                            maximumTrackTintColor="#000000"
                        />
                </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1, 
    },
    titleView: {
        top: 35,
        position: "absolute",
        alignSelf: "center",
    },
    selector: {
        width: 125  , 
        justifyContent: "center",
        alignSelf: "center",
    },
    navTouchable: {
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        height: 50,
        width: 100,
        borderRadius: 20,
        backgroundColor: "black",
        marginTop: 25,
    },
    text: {
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        lineHeight: 50,
        fontWeight: 'bold',
    },
    setting: {
        margin: 50,
    },
    resultText: {
        color: "black",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        lineHeight: 50,
        fontWeight: 'bold',
    },
    titleText: {
        fontSize: 40,
        color: "black",
        fontWeight: "bold",
        lineHeight: 50,

    },
    wordOptionsText: {
        color: "black",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32    ,
        lineHeight: 50,
        fontWeight: 'bold',
        textAlign: "center",
        margin: 5, 
    },
    slider: {
        width: 200, 
        height: 40,
    },
    speechSpeedTitle: {
        color: "black",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        lineHeight: 50,
        fontWeight: 'bold',
        textAlign: "center",
    },
    speechSpeedValue: {
        color: "black",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: "center",
    }

});
