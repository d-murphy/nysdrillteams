import { Team, TeamData } from '../../types/types'; 

const teams: Team[] = loadMockTeams(); 

const teamsData: TeamData = {
    insertTeam(newTeam:Team): boolean {
        teams.push(newTeam); 
        return true; 
    },
    deleteTeam(teamId:number): boolean {
        const index = teams.findIndex(el => {
            return el.id == teamId
        })
        if(index != -1) {
            teams.splice(index,1); 
            return true;   
        } else {
            return false; 
        }
    }, 
    updateTeam(updatedTeam:Team):Team {
        const index = teams.findIndex(el => {
            return el.id == updatedTeam.id
        })
        teams[index] = updatedTeam; 
        return updatedTeam; 
    }, 
    getTeam(teamId:number):Team | undefined {
        console.log('mock version')
        return teams.find(el => {
            return el.id == teamId; 
        })
    }, 
    getTeams():Team[] {
        return teams; 
    }
}

export default teamsData; 


function loadMockTeams(): Team[]{
    return [
        {
            id: 1,
            fullName: 'Central Islip Hoboes',  
            name: 'Hoboes',
            town: 'Central Islip',
            circuit: 'Suffolk',
            imageUrl: ''        
        },
        {
            id: 2,
            fullName: 'Hagerman Gamblers',  
            name: 'Gamblers',
            town: 'Hagerman',
            circuit: 'Suffolk',
            imageUrl: ''        
        },
        {
            id: 3,
            fullName: 'Bay Shore Redskins',  
            name: 'Redskins',
            town: 'Bay Shore',
            circuit: 'Suffolk',
            imageUrl: ''        
        }
    
    ]; 
}