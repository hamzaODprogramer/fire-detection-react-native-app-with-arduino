import React from "react";
import { Text, View } from "react-native";

interface OnlineCardStateProps {
    text : string,
    value : string,
    state : boolean
}
export default function OnlineCardState({text,value,state}:OnlineCardStateProps){
    return <>
        <View className="relative bg-white w-[42%] px-5 py-2 shadow-1 shadow-black/100 shadow-md rounded-md">
            <Text className="text-black/70 font-semibold text-xl">{text}</Text>
            <Text className="text-gray-500 text-xl">{value}</Text>
            {
                state 
                ? <View style={{top:16,right:15}} className="absolute w-3 h-3 bg-green-500 rounded-full"></View>
                : <View style={{top:16,right:15}} className="absolute w-3 h-3 bg-red-500 rounded-full"></View>
            }
        </View>
    </>
} 