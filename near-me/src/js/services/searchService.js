import { getUserLocation } from "./locationService";    
import { getNearByPlaces } from "../api/places";

export async function searchNearbyPlaces(){
    try{
        const {lat, lon} = await getUserLocation();
        const places = await getNearByPlaces(lat, lon);

        return places;
    } catch (error){
        console.error("Search error:", error);
        return [];
    }
}
