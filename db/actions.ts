import { ref, set , push, get } from "firebase/database";
import { db, getUserId } from "./firebase";
interface HistoricRecord {
    date: string;
    time: string;
    temperature: number;
    gaz: number;
    state: boolean;
    createdAt?: string; 
}

interface SensorDataRecord {
    temperature : string,
    valeur_gaz : string,
    humidite : string,
    gaz_detecte : string
}

export const getSensorData =  async () => {
    try{
        const sensorRef = ref(db,'capteurs')
        const snapshot = await get(sensorRef)
        if(snapshot.exists()){
            const sensorData = snapshot.val()
            return { sensorData : sensorData as SensorDataRecord }
        }else{
            return { sensorData : null }
        }
    }catch(error){
        console.error('Error adding project:', error);
        return { error };
    }
}

export const addHistoric = async (historic:HistoricRecord) => {
    try{
        const { userId } = await getUserId()
        if (!userId) return { error: 'No user ID found' };

        const historicRef = ref(db, `users/${userId}/historic`);
        const newHistoricRef = push(historicRef);
        await set(newHistoricRef, {
            ...historic,
            createdAt: new Date().toISOString()
        });
        return { success: true };
    }catch(error){
        console.error('Error adding project:', error);
        return { error };
    }
};

export const getHistorics = async () => {
    try{
        const { userId } = await getUserId()
        if (!userId) return { error: 'No user ID found' };

        const historicRef = ref(db, `users/${userId}/historic`);
        const snapshot = await get(historicRef);
        if(snapshot.exists()){
            const historicObj = snapshot.val()
            const historicList = Object.entries(historicObj).map(([id,data])=>({
                id,
                ...(data as HistoricRecord),
            }))
            return { histories : historicList  };
        }else{
            return { histories : [] };
        }
    }catch(error){
        console.error('Error adding project:', error);
        return { error };
    }
}