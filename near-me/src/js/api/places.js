export async function getNearByPlaces(lat, lon){
    const API_KEY = import.meta.env.VITE_OPENTRIPMAP_KEY;
    const radius = 10000; // 10 km radius

    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lon}&lat=${lat}&apikey=${API_KEY}`;

    try{
        const response = await fetch(url);
        const data = await response.json();

        console.log("API RESPONSE:", data);

        if (!data.features) return [];

        return data.features;
    } catch (error){
        console.error("Error fetching places:", error);
        return [];
    }
}