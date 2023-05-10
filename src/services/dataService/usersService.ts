import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { User, UsersData  } from '../../types/types'; 
import bcrypt from 'bcrypt'; 

class UsersService {

    constructor ( private dataSource : UsersData ){}
    public async insertUser(user: User): Promise<InsertOneResult> {
        user.password = await bcrypt.hash(user.password, 10); 
        return this.dataSource.insertUser(user); 
    }
    public deleteUser(userId: number): Promise<DeleteResult> {
        return this.dataSource.deleteUser(userId); 
    }
    public async updateUser(userId: number, role?: string, password?: string): Promise<UpdateResult> {
        if(password) {
            password = await bcrypt.hash(password, 10); 
        }
        return this.dataSource.updateUser(userId, role, password); 
    }
    public getUsers(): Promise<User[]> {
        return this.dataSource.getUsers(); 
    }
    public async checkPass(username: string, password:string): Promise<{username:string, role:string} | null> {
        let user = await this.dataSource.getUser(username); 
        if(!user) return null; 
        const compareResult = await bcrypt.compare(password, user.password); 
        if(!compareResult) return null;         
        let userWoPass: {username: string, role: string, password?:string} = user; 
        delete userWoPass.password; 
        return userWoPass; 
    }
}
    
export default UsersService; 