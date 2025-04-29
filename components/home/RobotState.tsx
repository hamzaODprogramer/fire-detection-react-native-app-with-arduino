import React from "react";
import {  Text, View } from "react-native";
type RobotStateProps = {   
    State : boolean,
    Battery : number,
    Connection : boolean
}
export default function RobotState({State,Battery,Connection}:RobotStateProps) {
    return <>
        <View className="bg-white px-5 py-4 shadow-1 shadow-black/100 shadow-md rounded-md">
            <View className="flex flex-row gap-12 items-center">
                <View className="flex flex-col gap-y-1">
                    <Text className="font-semibold text-xl">System status</Text>
                    <View className="flex flex-row gap-2 items-center">
                        <View className={`${State ? "bg-green-500" : "bg-red-500"} rounded-full w-3 h-3`}></View>
                        <Text className="opacity-65">{State ? "Operational" : "Not Operational"}</Text> 
                    </View>
                </View>
                <View className="flex flex-col gap-y-1 mt-1">
                    <Text className="opacity-70">{Connection ? "Robot connected" : "Robot inconnected"}</Text>
                    <View className="flex flex-row gap-2 items-center mt-1">
                        <View className="w-[30%] bg-gray-200 rounded-full h-3">
                            <View className={`bg-green-500 h-3 rounded-full`} style={{ width: `${Battery}%` }}></View>
                        </View>
                        <Text>Battery : {Battery}%</Text> 
                    </View>
                    
                </View> 
            </View>
        </View>
    </>
}
