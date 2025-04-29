import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Feather from '@expo/vector-icons/Feather'
interface ButtonFuncsProps{
    text : string,
    icon? : string,
    onPress? : () => void
}
export default function ButtonFuncs({text,icon,onPress}:ButtonFuncsProps){
    return <>
        <TouchableOpacity onPress={onPress} className="bg-[#1E6091] w-[28%] py-2 rounded-3xl flex flex-row justify-center items-center gap-2">
            {icon && <Feather name={icon} size={18} color={'white'} />}
            <Text className="text-white text-center text-lg font-semibold">{text}</Text>
        </TouchableOpacity>
    </>
}