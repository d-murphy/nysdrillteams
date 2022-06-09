import { Track, TracksData, insertTrackResp } from '../../types/types'; 

const tracks: Track[] = loadMockTracks(); 

const tracksData: TracksData = {
    insertTrack(newTrack:Track): insertTrackResp {
        if(!newTrack.id) newTrack.id = Math.floor(Math.random()*10000);
        tracks.push(newTrack); 
        return {result: true, track: newTrack}; 
    },
    deleteTrack(runId:number): boolean {
        const index = tracks.findIndex(el => {
            return el.id == runId
        })
        if(index != -1) {
            tracks.splice(index,1); 
            return true;   
        } else {
            return false; 
        }
    }, 
    updateTrack(updatedTrack:Track):Track {
        const index = tracks.findIndex(el => {
            return el.id == updatedTrack.id
        })
        tracks[index] = updatedTrack; 
        return updatedTrack; 
    }, 
    getTrack(trackId:number):Track | undefined {
        console.log('mock version')
        return tracks.find(el => {
            return el.id == trackId; 
        })
    }, 
    getTracks():Track[] {
        return tracks; 
    }
}

export default tracksData; 


function loadMockTracks(): Track[]{
    return [
        {
            id: 1, 
            name: "Central Islip", 
            address: "110 Wheeler Road", 
            city: "Central Islip", 
            notes: "",
            imageUrls: [], 
            archHeight: "19'7''",
            distanceToHydrant: 225
        },
        {
            id: 2, 
            name: "Hagerman", 
            address: "", 
            city: "Hagerman", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: 200
        },
        {
            id: 3, 
            name: "Lindenhurst", 
            address: "", 
            city: "Lindenhurst", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: 200
        },
        {
            id: 4, 
            name: "Merrick", 
            address: "", 
            city: "Merrick", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 5, 
            name: "Ridge", 
            address: "", 
            city: "Ridge", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 6, 
            name: "Hempstead", 
            address: "", 
            city: "Hempstead", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 7, 
            name: "Copiague", 
            address: "", 
            city: "Copiague", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 9, 
            name: "Point Pleasant", 
            address: "", 
            city: "Point Pleasant", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 10, 
            name: "Deerfield", 
            address: "", 
            city: "Deerfield", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 11, 
            name: "Main-Transit", 
            address: "", 
            city: "Main-Transit", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 12, 
            name: "Spencerport", 
            address: "", 
            city: "Spencerport", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 13, 
            name: "Bayville", 
            address: "", 
            city: "Bayville", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 14, 
            name: "Baldwin", 
            address: "", 
            city: "Baldwin", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        },
        {
            id: 15, 
            name: "West Sayville", 
            address: "", 
            city: "West Sayville", 
            notes: "",
            imageUrls: [], 
            archHeight: null,
            distanceToHydrant: null
        }

    
    ]; 
}