import React from "react";
import { Alert, Text, TouchableOpacity } from "react-native";

interface FilterButtonProps {
    text : string,
    state : boolean,
    setFilter : any
}

export default function FilterButton({text,state,setFilter}:FilterButtonProps){
    const handleChangeFilter = () => {
        if(text == "all"){
            setFilter(1)
            return
        }else if(text == "smoke"){
            setFilter(3)
            return
        }else setFilter(2)
    }
    return <>
        {
            state
            ? <>
                <TouchableOpacity onPress={handleChangeFilter} className="bg-[#1E6091] py-2 rounded-3xl">
                    <Text className="text-white px-5 text-center text-md font-semibold">{text}</Text>
                </TouchableOpacity>
              </>
            : <>
                <TouchableOpacity onPress={handleChangeFilter} style={{borderColor:'#1E6091',borderWidth:1}} className="px-3  py-2 rounded-3xl">
                    <Text className="text-[#1E6091] text-center text-md font-semibold">{text}</Text>
                </TouchableOpacity>
            </>
        }
        
    </>
}