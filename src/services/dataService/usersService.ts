import { DeleteResult, InsertOneResult, UpdateResult } from 'mongodb';
import { User, UsersData  } from '../../types/types'; 
import bcrypt from 'bcrypt'; 
import jwt from 'jsonwebtoken'; 

class UsersService {

    constructor ( private dataSource : UsersData, private jwtSecret: string ){}
    public async insertUser(user: User): Promise<InsertOneResult> {
        user.password = await bcrypt.hash(user.password, 10); 
        return this.dataSource.insertUser(user); 
    }
    public deleteUser(userId: number): Promise<DeleteResult> {
        return this.dataSource.deleteUser(userId); 
    }
    public async updateUser(userId: number, roleArr?: string[], password?: string): Promise<UpdateResult> {
        if(password) {
            password = await bcrypt.hash(password, 10); 
        }
        return this.dataSource.updateUser(userId, roleArr, password); 
    }
    public getUsers(): Promise<User[]> {
        return this.dataSource.getUsers(); 
    }
    public async checkPass(username: string, password:string): Promise<{userJwt:string, rolesArr:string[]} | null> {
        let user = await this.dataSource.getUser(username); 
        if(!user) return null; 
        if(!bcrypt.compare(password, user.password)) return null;         
        let userWoPass: {username: string, rolesArr: string[], password?:string} = user; 
        delete userWoPass.password; 
        let userJwt = jwt.sign(userWoPass, this.jwtSecret);
        return {userJwt: userJwt, rolesArr: userWoPass.rolesArr}
    }
}
    
export default UsersService; 