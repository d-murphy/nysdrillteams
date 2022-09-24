import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { TracksData, Track } from '../../types/types'

class TracksService {

    constructor ( private dataSource : TracksData ){}

    public insertTrack(newTrack: Track): Promise<InsertOneResult> {
        return this.dataSource.insertTrack(newTrack); 
    }
    public deleteTrack(trackId: string): Promise<DeleteResult> {
        return this.dataSource.deleteTrack(trackId); 
    }
    public updateTrack(trackId:string, fieldsToUpdate:{}): Promise<UpdateResult> {
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