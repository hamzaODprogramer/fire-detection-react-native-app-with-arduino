import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { db, ref, set, get } from '@/db/firebase'; // small fix here!

export default function TestFireBase() {
  const [name, setName] = useState('');
  const [fetchedName, setFetchedName] = useState('');

  // Function to store data
  const addName = async () => {
    try {
      await set(ref(db, 'test/name'), name);
      console.log('Name added successfully!');
    } catch (error) {
      console.error('Error adding name:', error);
    }
  };

  // Function to get data
  const getName = async () => {
    try {
      const snapshot = await get(ref(db, 'test/name'));
      if (snapshot.exists()) {
        setFetchedName(snapshot.val());
        console.log('Fetched name:', snapshot.val());
      } else {
        console.log('No data available');
      }
    } catch (error) {
      console.error('Error getting name:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 10 }}>
      <Text>TestFireBase</Text>
      <Text>Fetched name: {fetchedName}</Text>

      <TextInput 
        placeholder="Enter name" 
        value={name}
        onChangeText={text => setName(text)}
        style={{ borderWidth: 1, width: 200, padding: 5 }}
      />

      <Button title="Add Name" onPress={addName} />
      <Button title="Get Name" onPress={getName} />
    </View>
  );
}
