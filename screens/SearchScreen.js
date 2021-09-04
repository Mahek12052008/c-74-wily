import React, { Component } from 'react';
import { StyleSheet, Text, View , ScrollView , FlatList, TouchableOpacity , TextInput} from 'react-native';
import db from '../config';
import firebase from 'firebase';

export default class SearchScreen extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            allTransactions: [],
            search: '',
            lastVisibleTransaction: ''
        }
    }
    /*componentDidMount= async()=>{
        const query = await db.collection('transaction').limit(10).get();
        query.docs.map((doc)=>{
            this.setState({
                allTransactions: [...this.state.allTransactions,doc.data()],
                lastVisibleTransaction: doc
            })
        })
    }*/
    fetchMoreTransactions = async()=>{
        var text1 = this.state.search;
        var enteredText =text1.split('')

        if(enteredText[0].toUpperCase() ==='B'){
            const transaction = await db.collection('transaction').where('bookId','===',text1).startAfter(this.state.lastVisibleTransaction).limit(10).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                    })
            })
        } else if(enteredText[0].toUpperCase() === 'S'){
            const transaction = await db.collection('transaction').where('studentId','===',text1).startAfter(this.state.lastVisibleTransaction).limit(10).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                    })
            }) 
        }
   }
    searchTransaction =async(text1)=>{
        var enteredText =text1.split('')

        if(enteredText[0].toUpperCase() ==='B'){
            const transaction = await db.collection('transaction').where('bookId','===',text1).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                    })
            })
        } else if(enteredText[0].toUpperCase() === 'S'){
            const transaction = await db.collection('transaction').where('studentId','===',text1).get()
            transaction.docs.map((doc)=>{
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction: doc
                    })
            }) 
        }
    }
    render(){
        return(
            <View style = {styles.container}>
            <View style={styles.searchBar}>

                <TextInput 
                    style = {styles.bar}
                    placeholder= 'Enter book id or student id'
                    onChangeText={(text)=>{this.setState({
                        search: text
                })}} />

                <TouchableOpacity
                style={styles.searchButton}
                onPress={()=>{this.searchTransaction(this.state.search)}}>
                    <Text>search</Text>
                </TouchableOpacity>

            </View>
            <FlatList
                    data = {this.state.allTransactions}
                    renderItem = {({item})=>(
                            <View style={{
                                borderBottomWidth: 2
                            }}>
                                <Text>{'book id: '+ item.bookId}</Text>
                                <Text>{'student id: ' + item.studentId}</Text>
                                <Text>{'transaction type:' + item.transactionType}</Text>
                                <Text>{'date: ' + item.date.toDate()}</Text>
                            </View>
                        )
                    }
                    
                    keyExtractor={(item,index)=>index.toString()}

                    onEndReached={this.fetchMoreTransactions}
                    onEndReachedThreshold={0.7}
                />
                </View>

        )
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        marginTop: 20
    },
    searchBar:{
        flesDirection: 'row',
        height: 40,
        width: 'auto',
        borderWidth: 0.5,
        alignItems: 'center',
        backGroundColor: 'grey'
    },
    bar:{
        borderWidth:2,
        height: 30,
        width: 300,
        paddingLeft:10
    },
    searchButton:{
        borderWidth: 1,
        height: 30,
        width: 50,
        alignItems:'center',
        justifyContent: 'center',
        backgroundColor: 'green'
    }

})