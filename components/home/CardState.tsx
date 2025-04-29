import React from "react";
import { Text, View , StyleSheet } from "react-native";
interface CardStateProps {
    ElementSensorName : string,
    Value : string,
    State : boolean
}
export default function CardState({ElementSensorName,Value,State}:CardStateProps) {
    return (
        <>
            <View className="bg-white w-[48%] px-5 py-5 shadow-1 shadow-black/100 shadow-md rounded-md">
                <Text className="font-semibold text-xl">{ElementSensorName}</Text>
                <Text className="text-gray-500 text-[35px]">{Value}</Text>
                <Text className={`${State ? "text-green-500" : "text-red-500"} font-semibold text-sm`}>{State ? "Normal" : "Warning"}</Text>
            </View>
        </>
    )
}
