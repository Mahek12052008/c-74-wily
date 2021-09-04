import React, { Component } from 'react';
import { StyleSheet, Text, View , TouchableOpacity, TextInput, Image ,KeyboardAvoidingView ,ToastAndroid} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import db from '../config';
import firebase from 'firebase';

export default class BookTransactionScreen extends React.Component{
constructor(){
    super();
    this.state ={
        hasCameraPermission : null ,
        scanned : false ,
        scannedData : '',
        buttonState : 'normal',
        scannedBookId : '',
        scannedStudentId : '',
        transactionMessage : ''
    }
}

initiateBookIssue = async() =>{
    db.collection('transaction').add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : 'Issue'
    })
    db.collection('books').doc(this.state.scannedBookId).update({
        'bookAvailability' : false
    })
    db.collection('students').doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
        scannedBookId: '',
        scannedStudentId: ''
    })
}

initiateBookReturn = async()=>{
    db.collection('transaction').add({
        'studentId' : this.state.scannedStudentId,
        'bookId' : this.state.scannedBookId,
        'date' : firebase.firestore.Timestamp.now().toDate(),
        'transactionType' : 'Return'
    })
    db.collection('books').doc(this.state.scannedBookId).update({
        'bookAvailability' : true
    })
    db.collection('students').doc(this.state.scannedStudentId).update({
        'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
        scannedStudentId: '',
        scannedBookId: ''
    })
}
checkStudentEligibilityForBookIssue = async()=>{
    const studentRef = await db.collection('students').where('studentId','==',this.state.scannedStudentId).get()
    var isStudentEligible = ''
    if(studentRef.docs.length == 0){
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
        isStudentEligible = false
        alert('the student id doesnt exist in the library database')
    }else{
        studentRef.docs.map((doc)=>{
            var student = doc.data();
            if(student.numberOfBooksIssued < 2){
                isStudentEligible = true
            }else{
                isStudentEligible= false
                alert('the student has already issued 2 books');
                this.setState({
                    scannedStudentId: '',
                    scannedBookId: ''
                })
            }
        })
    }
    return isStudentEligible;
}

checkStudentEligibilityForBookReturn= async()=>{
    const transactionRef = await db.collection('transaction').where('bookId','==',this.state.scannedBookId).limit(1).get()
    var isStudentEligible = ''
    transactionRef.docs.map((doc)=>{
        var lastBookTransaction = doc.data()
        if(lastBookTransaction.studentId === this.state.scannedStudentId){
            isStudentEligible = true
        }else{
            isStudentEligible = false
            alert('the book wasnt issued by this student');
            this.setState({
                scannedStudentId: '',
                scannedBookId: ''
            })
        }
    })
    return isStudentEligible
}

checkBookEligibility = async() =>{
    const bookRef = await db.collection('books').where('bookId','==',this.state.scannedBookId).get()
    var transactionType = '';
    if(bookRef.docs.length == 0){
        transactionType = false;
    }else{
        bookRef.docs.map(doc=>{
            var book = doc.data();
            if(book.bookAvailability){
                transactionType = 'Issue';
            }else{
                transactionType = 'Return'
            }
        })
    }
    return transactionType;
}

handleTransaction = async()=>{
    var transactionType = await this.checkBookEligibility();
    if(!transactionType){
        alert('the book doesnt exist in the library database')
        this.setState({
            scannedBookId: '',
            scannedStudentId: ''
        })
    }else if(transactionType === 'Issue'){
        var isStudentEligible = await this.checkStudentEligibilityForBookIssue();
        if(isStudentEligible){
            this.initiateBookIssue()
            alert('book issued to the student');
            }
        }else{
            var isStudentEligible = await this.checkStudentEligibilityForBookReturn();
            if(isStudentEligible){
                this.initiateBookReturn();
                alert('book returned to the library');
            }
    }
}

handleBarCodeScanned = async({type,data})=>{
    const {buttonState} = this.state

    if(buttonState === 'bookId'){
        this.setState({
            scanned: true ,
            scannedData: data,
            buttonState: 'normal'
        })
    }else if(buttonState === 'studentId'){
        this.setState({
            scanned: true ,
            scannedData: data,
            buttonState: 'normal'
        })
    }
}

getCameraPermission = async(id) =>{
    const {status} = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
        hasCameraPermission: status === 'granted',
        buttonState : id,
        scanned: false
    })
}

    render(){
        const hasCameraPermission = this.state.hasCameraPermission;
        const scanned = this.state.scanned ;
        const buttonState = this.state.buttonState;

        if(buttonState !== 'normal' && hasCameraPermission){
            return(
                <BarCodeScanner 
                onBarCodeScanned ={scanned ? undefined : this.handleBarCodeScanned }
                style = {StyleSheet.absoluteFillObject } />
            )
        } else if(buttonState === 'normal'){
        
        return(
            
            <KeyboardAvoidingView style={styles.container}
                behavior='padding' enabled >
                <View>
                    <Image source={require('../assets/booklogo.jpg')}
                    style={{
                        width:200,
                        height:200
                    }}/>
                    <Text style={{
                        textAlign: 'center',
                        fontSize:30
                    }} >Wily</Text>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                    style={styles.inputBox}
                    placeholder='book id'
                    onChangeText={(text)=>{
                        this.setState({
                            scannedBookId: text
                        })
                    }}
                    value={this.state.scannedBookId}/>
                    <TouchableOpacity style={styles.scanButton}
                    onPress ={()=>{this.getCameraPermission('bookId')}} >
                        <Text style={styles.buttonText}>scan</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputView}>
                    <TextInput
                    style={styles.inputBox}
                    placeholder='student id'
                    onChangeText={(text)=>{
                        this.setState({
                            scannedStudentId: text
                        })
                    }}
                    value={this.state.scannedStudentId} />
                    <TouchableOpacity style={styles.scanButton}
                    onPress={()=>{
                        this.getCameraPermission('studentId')
                    }} >
                        <Text style={styles.buttonText}>scan</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style = {styles.submitButton}
                onPress={()=>{
                    this.handleTransaction();
                }}>
                    <Text style={styles.submitButtonText}>submit</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
            )}
    }
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    displayText:{
        fontSize:15,
        textDecorationLine:'underline'
    },
    scanButton:{
        backgroundColor:'blue',
        padding:10,
        margin:10
    },
    buttonText:{
        fontSize:15,
        textAlign:'center',
        marginTop: 10,
        color: 'white'
    },
    inputView:{
        flexDirection : 'row',
        margin: 20
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth: 1.5,
        borderRightWidth: 0,
        fontSize: 20
    },
    scanButton:{
        backgroundColor: 'blue',
        width: 50,
        borderWidth: 1.5,
        borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor: 'blue',
        width: 100,
        height: 50
    },
    submitButtonText:{
        padding: 10,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white'
    }
})