import React, { Component } from 'react';
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

const DEFAULT_MIME_TYPE = "text/plain";

export default class Results extends Component {
    constructor(props) {
        super(props);
        const {correct, incorrect} = this.props.route.params;
        this.correct = correct;
        this.incorrect = incorrect;
        this.switchMainScreen = this.switchMainScreen.bind(this);
        this.convertResults = this.convertResults.bind(this);
        this.toggleSaveModalVisible = this.toggleSaveModalVisible.bind(this);
        this.updateText = this.updateText.bind(this);
        this.baseUri = FileSystem.documentDirectory;
        this.state = {
            saveModalVisible: false,
            fileName: "",
            showWarningText: false,
        }
    }
    
    toggleSaveModalVisible() {
        this.setState({
            saveModalVisible: !this.state.saveModalVisible,
        });
    }
    updateText(text) {
        this.setState({
            fileName: text
        })
    }

    async switchMainScreen() {
        //this.props.navigation.navigate("Main");
        this.saveToFile("JoshuaResults");
    }

    // make output data human readable
    convertResults() {
        var fileContents = "Correct: \n";
        const disc = ", ";
        var correctLen = this.correct.length;
        for (var i=0; i<correctLen; i++) {
            fileContents += this.correct[i];
            if (i !== correctLen-1) {
                fileContents += disc;
            }
        }
        
        fileContents += "\n\nIncorrect: \n"
        var incorrectLen = this.incorrect.length;
        for (var i=0; i<incorrectLen; i++) {
            fileContents += this.incorrect[i];
            if (i !== incorrectLen-1) {
                fileContents += disc;
            }
        }
        return fileContents;
    }

    async saveToFile() {
        if (this.state.fileName == "") {
            this.setState({
                showWarningText: true,
            })
            return;
        }
        const fileData = this.convertResults();
        if (Platform.OS === "android") {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
                // save file
                await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, this.state.fileName, DEFAULT_MIME_TYPE).then(async (uri) => {
                    await FileSystem.writeAsStringAsync(uri, fileData);
                }).catch((err) => {
                    this.setState({
                        showWarningText: true,
                    })
                    console.log(err);
                }).finally(() => {
                    this.toggleSaveModalVisible();
                });
            }
            else {
               // show warning
            }
        }
        else {
            await FileSystem.StorageAccessFramework.createFileAsync(FileSystem.documentDirectory, this.state.fileName, DEFAULT_MIME_TYPE).then(async (uri) => {
                await FileSystem.writeAsStringAsync(uri, fileData);
            }).then(() => {
                shareAsync(uri)
            })
        }
    }

    render() {
        incorrectTextComponents = [];
        correctTextComponents = [];

        for (let i=0; i < this.incorrect.length; i++) {
            incorrectTextComponents.push(
                <Text style={styles.text} 
                      key={i}>
                        {this.incorrect[i]}
                </Text>
            );
        }
        for (let i=0; i < this.correct.length; i++) {
            correctTextComponents.push(
                <Text style={styles.text} 
                      key={i}>
                        {this.correct[i]}
                </Text>
            );
        }

        return (
            <View style={styles.container}>
                <View style={styles.titleView}>
                    <Text style={styles.resultTitle}>All done!</Text>
                </View>
                <ScrollView style={styles.scroller}>
                    <View Style={styles.results}>
                        <Text style={styles.headerText}>Correct Words:</Text>
                        <View Style={styles.results}>
                            { correctTextComponents }
                        </View>
                    </View>
                    <View Style={styles.results}>
                        <Text style={styles.headerText}>Incorrect Words:</Text>
                        <View Style={styles.results}>
                            { incorrectTextComponents }
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity 
                            style={styles.saveTouchable}
                            onPress={this.toggleSaveModalVisible}
                        >
                            <Text style={styles.saveText}>Save Results</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={styles.finishTouchable}
                            onPress={this.switchMainScreen}
                        >
                            <Text style={styles.finishText}>Home Screen</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <Modal style={styles.modalView}
                    visible={this.state.saveModalVisible}
                    onRequestClose={this.toggleSaveModalVisible}
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
                                onChangeText={this.updateText}
                                placeholderTextColor="white"
                                selectionColor="white"
                            >

                            </TextInput>
                        </View>
                        <TouchableOpacity 
                            style={styles.saveTouchable}
                            onPress={this.switchMainScreen}
                        >
                            <Text style={styles.saveText}>Save</Text>
                        </TouchableOpacity>
                        <Text style={styles.warningText}>
                            {this.state.showWarningText && "Warning!"}
                        </Text>
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        alignItems: "center",
    },
    inputView: {
        marginTop: 10,
    },
    modalView: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    titleView: {
        margin: 20,
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
        margin: 10,
        marginTop: 20,
    },
    finishTouchable: {
        alignItems: "center",
        justifyContent: "center",
        height: 75,
        width: 150,
        borderRadius: 20,
        backgroundColor: "black",
        margin: 10, 
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
