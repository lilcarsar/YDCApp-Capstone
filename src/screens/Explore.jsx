import { collection, addDoc, getDocs, query, orderBy, onSnapshot,where,updateDoc,doc,arrayUnion,collectionGroup} from 'firebase/firestore';
import React, { useEffect, useState,useLayoutEffect,Fragment} from 'react';
import { auth, db } from '../../Firebase/firebaseConfig';

import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  View,
  Dimensions
  
} from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';



const ExploreScreen = ({navigation,route})=>{
    const [users, setUsers] = useState([])
    const [realFriend, setRealFriend] = useState([])
    const dimensions = Dimensions.get('window');
    const imageWidth = dimensions.width;

    useEffect(() => {
        const fetchNonFriendUsers = async () => {
            // Fetch all friendships for the current user
            const friendshipsSnap = await getDocs(query(collection(db, "friendships"), where("friend1", "==", auth.currentUser.uid)));
    
            // Extract the IDs of the friends
            const friendIds = friendshipsSnap.docs.map(doc => doc.data().friend2);
    
            // Fetch all users
            const usersSnap = await getDocs(collection(db, "users"));
    
            // Filter out the friends
            const nonFriendUsers = usersSnap.docs
                .filter(doc => !friendIds.includes(doc.id))
                .map(doc => ({ ...doc.data(), key: doc.id }));
    
            setUsers(nonFriendUsers);
        };
    
        fetchNonFriendUsers();
    }, [navigation]);


    const closeRow = (rowMap, rowKey) => {
        console.log(rowKey);
        //send Friend Request
        updateDoc(doc(db, "users",rowKey), {
            "req": arrayUnion(auth.currentUser.uid),
            // "favorites.color": "Red"
        });

        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
            const newUsers = [...users];
            const prevIndex = users.findIndex(item => item.key === rowKey);
            newUsers.splice(prevIndex, 1);
            setUsers(newUsers);
        }
    };

    const deleteRow = (rowMap, rowKey) => {
        closeRow(rowMap, rowKey);
        const newUsers = [...users];
        const prevIndex = users.findIndex(item => item.key === rowKey);
        newUsers.splice(prevIndex, 1);
        setUsers(newUsers);
    };

    return(
       <Fragment>
         <SafeAreaView style={{ flex: 0, backgroundColor: '#FFFFFF' }} />
        {/* <SafeAreaView style={{flex: 1 }}> */}
        <View style={{backgroundColor: '#E5EAFD',flex:1, alignItems: 'center'}}>
        
        <Text style={{marginVertical: 20, fontWeight: '800'}} >SWIPE to find who is your FRIEND</Text>
        
          <View style={styles.container}>
                <SwipeListView
                    useFlatList={true}
                    data={users.slice(0, 4)}
                    maxToRenderPerBatch={5}
                    renderItem={ (data, rowMap) => (
                        <View style={styles.rowFront}>
                            <Text>I am {data.item.firstname} </Text>
                            
                            
                        </View>
                    )}
                    renderHiddenItem={ (data, rowMap) => (
                        <View style={styles.rowBack}>
                            <TouchableOpacity
                                style={[styles.backRightBtn, styles.backLeftBtn]}
                                onPress={() => deleteRow(rowMap, data.item.key)}
                            >
                                <Text style={styles.backTextWhite}>No...</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.backRightBtn, styles.backRightBtnLeft]}
                                onPress={() => closeRow(rowMap, data.item.key)}
                            >
                                <Text style={styles.backTextWhite}>Be My Friend</Text>
                            </TouchableOpacity>
                        
                        </View>
                    )}
                    leftOpenValue={75}
                    rightOpenValue={-75}
                />


          </View>
       </View>
          </Fragment>
    
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E5EAFD',
        flex: 1,
        width: '90%'
    
    },
    backTextWhite: {
        color: '#FFF',
    },
    rowFront: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: 'black',
        borderBottomWidth: 0,
        justifyContent: 'center',
        height: 50,
        marginBottom: 10,
        borderRadius: 10,
        flexDirection: 'row',
    },
    rowBack: {
        alignItems: 'center',
        backgroundColor: 'white',
        flex: 1,
        flexDirection: 'row',
        height: 10,
        justifyContent: 'space-between',
        paddingLeft: 15, 
        borderRadius: 10 ,
        marginBottom: 10,
      
    },
    backRightBtn: {
        alignItems: 'center',
        bottom: 0,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        width: 75,
        
    },
    backRightBtnLeft: {
        backgroundColor: '#AE64F3',
        right: 0,
        borderBottomRightRadius: 10,
        borderTopRightRadius: 10
    },
    backLeftBtn: {
        backgroundColor: '#F4B1BA',
        left: 0,
        borderBottomLeftRadius: 10,
        borderTopLeftRadius: 10
    },
});

export default ExploreScreen;