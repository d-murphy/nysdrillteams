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
        }

    
    ]; 
}