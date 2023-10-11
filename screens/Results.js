import React, { useState, useEffect} from 'react';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';

import {
    StyleSheet, 
    Button,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Platform,
    Modal,
    TextInput,
} from "react-native";

// file types
const DEFAULT_MIME_TYPE = "text/plain"; // for android
const UTI = "public.text"; // for IOS

// consts
const FILE_WARNING_MSG = "Filename cannot be blank";
const MAIN_SCREEN_NAME = "Main";

// user performance data
var incorrectWordElements = [];
var correctWordElements = [];

const Results = ({navigation, route}) => {

    // extract route params
    var correctWords = route.params.correct;
    var incorrectWords = route.params.incorrect;

    // establish base filepath
    const baseUri = FileSystem.documentDirectory;

    // set state variables
    const [saveModalVisible, setSaveModalVisible] = useState(false);
    const [fileName, setFileName] = useState("");
    const [showWarningText, setShowWarningText] = useState(false);
    
    // make sure user performance lists are empty
    useEffect(() => {
        incorrectWordElements = [];
        correctWordElements = [];
    }, [])

    const switchMainScreen = () => {
        navigation.navigate(MAIN_SCREEN_NAME);
    }

    // Stringify user performance data for writing to file
    const convertResults = () => {
        var fileContents = "Correct: \n";
        const disc = ", ";
        var correctLen = correctWords.length;
        for (var i=0; i<correctLen; i++) {
            fileContents += correctWords[i];
            if (i !== correctLen-1) {
                fileContents += disc;
            }
        }
        
        fileContents += "\n\nIncorrect: \n"
        var incorrectLen = incorrectWords.length;
        for (var i=0; i<incorrectLen; i++) {
            fileContents += incorrectWords[i];
            if (i !== incorrectLen-1) {
                fileContents += disc;
            }
        }
        return fileContents;
    }

    // save user performance data to disk with a specified file name
    const saveToFile = async () => {
        // if the user didn't select a filename, show a warning
        if (fileName == "") {
            setShowWarningText(!showWarningText);
            return;
        }

        const fileData = convertResults();

        // API code differs based on platform
        if (Platform.OS === "android") {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
                // save file
                await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, DEFAULT_MIME_TYPE).then(async (uri) => {
                    await FileSystem.writeAsStringAsync(uri, fileData);
                }).catch((err) => {
                    setShowWarningText(true);
                    console.log(err);
                }).finally(() => {
                    setSaveModalVisible(!saveModalVisible);
                });
            }
        }
        else {
            const fileUri = FileSystem.documentDirectory + fileName + ".txt";

            await FileSystem.writeAsStringAsync(fileUri, fileData);

            await shareAsync(fileUri, {UTI}).catch((error) => {
                console.log(error);
            }).finally(() => {
                setSaveModalVisible(!saveModalVisible);
            })
        }
    }

    // create text components out of user performance data for render
    const createParamTextComponents = () => {
        if (incorrectWordElements.length == 0 && correctWordElements.length == 0) {
            for (let i=0; i < incorrectWords.length; i++) {
                incorrectWordElements.push(
                    <Text style={styles.text} 
                            key={i}>
                            {incorrectWords[i]}
                    </Text>
                );
            }
            for (let i=0; i < correctWords.length; i++) {
                correctWordElements.push(
                    <Text style={styles.text} 
                            key={i}>
                            {correctWords[i]}
                    </Text>
                );
            }
        }
    }
    
    createParamTextComponents();
    return (
        <View style={styles.container}>
            <View>
                <Text style={styles.resultTitle}>All done!</Text>
            </View>
            <ScrollView style={styles.scroller}>
                <View Style={styles.results}>
                    <Text style={styles.headerText}>Correct Words:</Text>
                    <View Style={styles.results}>
                        { correctWordElements }
                    </View>
                </View>
                <View Style={styles.results}>
                    <Text style={styles.headerText}>Incorrect Words:</Text>
                    <View Style={styles.results}>
                        { incorrectWordElements }
                    </View>
                </View>
                <View style={styles.resultsView}>
                
                    <TouchableOpacity 
                        style={styles.saveTouchable}
                        onPress={() => setSaveModalVisible(!saveModalVisible)}
                    >
                        <Text style={styles.saveText}>Save Results</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity 
                        style={styles.finishTouchable}
                        onPress={switchMainScreen}
                    >
                        <Text style={styles.finishText}>Home Screen</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Modal style={styles.modalView}
                visible={saveModalVisible}
                onRequestClose={() => setSaveModalVisible(!saveModalVisible)}
            >
                <View style={styles.container}>
                    <Text style={styles.resultTitle}>
                        Save Results
                    </Text>
                    <View style={styles.inputView}>
                        <Text style={styles.headerText}>
                            Filename
                        </Text>
                        <TextInput style={styles.nameInput}
                            placeholder='Filename'
                            onChangeText={setFileName}
                            placeholderTextColor="white"
                            selectionColor="white"
                        >

                        </TextInput>
                    </View>
                    <TouchableOpacity 
                        style={styles.saveTouchable}
                        onPress={saveToFile}
                    >
                        <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                    <Text style={styles.warningText}>
                        {showWarningText && FILE_WARNING_MSG}
                    </Text>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 35,
    },
    inputView: {
        // default: 15
        marginTop: 15,
    },
    resultsView: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    modalView: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        marginTop: 50,
    },
    results: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    scroller: {
        marginBottom: 35,
    },
    nameInput: {
        marginTop: 2,
        width: 200,
        height: 40,
        borderColor: "black",
        backgroundColor: "black",
        color: "white",
    },
    saveTouchable: {
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        width: 150,
        borderRadius: 20,
        backgroundColor: "black",
        marginTop: 20,
    },
    finishTouchable: {
        alignItems: "center",
        justifyContent: "center",
        height: 75,
        width: 150,
        borderRadius: 20,
        backgroundColor: "black",
        marginTop: 20
    },
    text: {
        color: "black",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        textAlign: "center",
    },
    finishText: {
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 25,
        textAlign: "center",
        fontWeight: 'bold',
    },
    saveText: {
        color: "white",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        textAlign: "center",
        fontWeight: 'bold',
    },
    resultTitle: {
        color: "black",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 40,
        lineHeight: 50,
        fontWeight: 'bold',
    },
    headerText: {
        color: "black",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        fontWeight: 'bold',
    },
    warningText: {
        color: "red",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 20,
        fontWeight: 'bold',
    },
})
export default Results;