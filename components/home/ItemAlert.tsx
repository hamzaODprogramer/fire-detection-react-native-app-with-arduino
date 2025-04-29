import React from "react"; 
import { Text, View } from "react-native";  

interface ItemAlertProps {
    title: string,
    date: string,
    alert: string,
    type: 'warning' | 'danger' | 'normal'
} 

export default function ItemAlert({title, date, alert, type}: ItemAlertProps) {
    return (
        <View style={{padding: 10}} className="flex flex-row gap-2 bg-white px-5 w-[90%] shadow-1 shadow-black/100 shadow-md rounded-md">
            <View style={{width:30,height:30}} className={`${type === "danger" ? "bg-red-500" : (type === "warning" ? "bg-orange-400" : "bg-green-500")} flex items-center justify-center rounded-full`}>
                <Text style={{fontSize:20}} className="text-white font-extrabold text-center">!</Text>
            </View>
            <View>
                <Text className="text-black/80 text-xl font-semibold">{title}</Text>
                <Text style={{color: 'gray'}} className="text-gray-200">{date}</Text>
                <Text className={`${
                    type === "danger" ? "text-red-500" : 
                    (type === "warning" ? "text-orange-400" : "text-green-500")
                } font-medium`}>{alert}</Text>
            </View>
        </View>
    );
}