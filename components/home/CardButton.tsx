import React from "react";
import { Text, TouchableOpacity } from "react-native";

interface CardButtonProps{
    text : string,
    color : string,
    className?: string,
    style?: any,
    onPress?: () => void
}
export default function CardButton({text,color,className,style,onPress}:CardButtonProps){
    return <>
        <TouchableOpacity onPress={onPress} style={[{backgroundColor:color},style]} className={`${className} flex justify-center items-center gap-2 p-4 rounded-md`}>
            <Text style={{fontSize:18}} className="font-bold text-white">{text}</Text>
        </TouchableOpacity>
    </>
}