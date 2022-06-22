import { TracksData, Track, insertTrackResp } from '../../types/types'

class TracksService {

    constructor ( private dataSource : TracksData ){}

    public insertTrack(newTrack: Track): insertTrackResp {
        return this.dataSource.insertTrack(newTrack); 
    }
    public deleteTrack(trackId: number): boolean {
        return this.dataSource.deleteTrack(trackId); 
    }
    public updateTrack(updatedTrack:Track): Track {
        return this.dataSource.updateTrack(updatedTrack); 
    }
    public getTrack(trackId:number): Track | undefined {
        return this.dataSource.getTrack(trackId); 
    }
    public getTrackByName(trackName:string): Track | undefined {
        return this.dataSource.getTrackByName(trackName); 
    }
    public getTracks(): Track[] {
        return this.dataSource.getTracks(); 

    }
}
    
export default TracksService; 