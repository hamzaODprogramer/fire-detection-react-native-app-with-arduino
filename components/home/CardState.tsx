import React, { useEffect, useRef } from "react";
import { Text, View, Animated, Easing } from "react-native";

interface CardStateProps {
    ElementSensorName : string,
    Value : string,
    State : boolean,
    loading : boolean
}

const CustomSkeleton = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(animatedValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        animation.start();

        return () => animation.stop();
    }, []);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 100],
    });

    return (
        <View style={{ overflow: 'hidden', width: '100%', height: '100%' }}>
            <Animated.View
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#E1E9EE',
                    transform: [{ translateX }],
                }}
            />
        </View>
    );
};

export default function CardState({ElementSensorName,Value,State,loading}:CardStateProps) {
    if (loading) {
        return (
            <View className="bg-white w-[48%] px-5 py-5 shadow-1 shadow-black/100 shadow-md rounded-md">
                <Text className="font-semibold text-xl">{ElementSensorName}</Text>
                <View style={{ marginTop: 10, height: 40, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden', width: '80%' }}>
                    <CustomSkeleton />
                </View>
                <View style={{ marginTop: 8, height: 20, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden', width: '60%' }}>
                    <CustomSkeleton />
                </View>
            </View>
        );
    }

    return (
        <View className="bg-white w-[48%] px-5 py-5 shadow-1 shadow-black/100 shadow-md rounded-md">
            <Text className="font-semibold text-xl">{ElementSensorName}</Text>
            {Value && (
                <>
                    <Text className="text-gray-500 text-[35px]">{Value}</Text>
                    <Text className={`${State ? "text-green-500" : "text-red-500"} font-semibold text-sm`}>{State ? "Normal" : "Warning"}</Text>
                </>
            )}
        </View>
    );
}
