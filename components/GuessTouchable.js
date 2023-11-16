import React, { Component, useState, useEffect } from 'react';
import {
    StyleSheet, 
    Button,
    Text,
    View,
    TouchableOpacity,
} from "react-native";

const GuessTouchable = ({onPress, buttonID, getStyle, word}) => {
    const [ID, setID] = useState(buttonID);

    return (
        <TouchableOpacity 
            style={getStyle(ID)}
            onPress={() => onPress(ID)}
        >
            <Text style={styles.opacityText}>{word}</Text>
        </TouchableOpacity>
    );

}

const styles = StyleSheet.create({
    opacityText: {
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 32,
        lineHeight: 40,
        fontWeight: 'bold',
    }
})

export default GuessTouchable;