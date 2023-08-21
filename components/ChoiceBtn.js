import React, { Component } from 'react';

import {
    StyleSheet, 
    Button,
    Text,
    View,
    TouchableOpacity,
} from "react-native";


export default class ChoiceBtn extends Component {
    constructor(props) {
        super(props);
        this.state = {
            red: false,
            green: false,
            currentText: "",
        }
        this._id = this.props._id;
        this.pressed = this.pressed.bind(this);
    }

    componentDidMount() {
        this.props.onRef(this);
    }

    async pressed() {
        await this.props.comp(this._id);
        //await this.handleStateChange();
    }

    async parentCall() {
        await this.handleStateChange();
    }

    async handleStateChange() {
        var thisPnState = this.props.pnState;
        var text = "";
        var red = false;
        var green = false;
        if (this._id == 1) {
            text = thisPnState.Option1;
            if (thisPnState.btn1State == 1) {
                green = true;
            }
            else if (thisPnState.btn1State == 2) {
                red = true;
            }
        }
        else if (this._id == 2) {
            text = thisPnState.Option2;
            if (thisPnState.btn2State == 1) {
                green = true;
            }
            else if (thisPnState.btn2State == 2) {
                red = true;
            }
        }
        else if (this._id == 3) {
            text = thisPnState.Option3;
            if (thisPnState.btn3State == 1) {
                green = true;
            }
            else if (thisPnState.btn3State == 2) {
                red = true;
            }
        }
        await this.setState({
            currentText: text,
            red: red,
            green: green,
        });
    }

    render() {
        if (this.state.red) {
            return (
                <TouchableOpacity 
                    style={styles.guessTouchableRed}
                    onPress={this.pressed}
                >
                    <Text style={styles.text}>{this.state.currentText}</Text>
                </TouchableOpacity>
            );
        }
        else if (this.state.green) {
            return (
                <TouchableOpacity 
                    style={styles.guessTouchableGreen}
                    onPress={this.pressed}
                >
                    <Text style={styles.text}>{this.state.currentText}</Text>
                </TouchableOpacity>
            );
        }
        else {
            return (
                <TouchableOpacity 
                    style={styles.guessTouchableNormal}
                    onPress={this.pressed}
                >
                    <Text style={styles.text}>{this.state.currentText}</Text>
                </TouchableOpacity>
            );
        }
    }
}
const styles = StyleSheet.create({
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
    text: {
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        lineHeight: 40,
        fontWeight: 'bold',
    }
})
