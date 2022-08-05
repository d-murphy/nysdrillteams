import { TracksData, Track, trackDbResp } from '../../types/types'

class TracksService {

    constructor ( private dataSource : TracksData ){}

    public insertTrack(newTrack: Track): Promise<trackDbResp> {
        return this.dataSource.insertTrack(newTrack); 
    }
    public deleteTrack(trackId: string): Promise<boolean> {
        return this.dataSource.deleteTrack(trackId); 
    }
    public updateTrack(trackId:string, fieldsToUpdate:{}): Promise<boolean> {
        return this.dataSource.updateTrack(trackId, fieldsToUpdate); 
    }
    public getTrack(trackId:string): Promise<Track | undefined> {
        return this.dataSource.getTrack(trackId); 
    }
    public getTrackByName(trackName:string): Promise<Track | undefined> {
        return this.dataSource.getTrackByName(trackName); 
    }
    public getTracks(): Promise<Track[]> {
        return this.dataSource.getTracks(); 

    }
}
    
export default TracksService; 