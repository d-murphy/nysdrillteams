import { Team, TeamData, insertTeamResp } from '../../types/types'; 

const teams: Team[] = loadMockTeams(); 

const teamsData: TeamData = {
    insertTeam(newTeam:Team): insertTeamResp {
        if(!newTeam.id) newTeam.id = Math.floor(Math.random()*10000)
        teams.push(newTeam); 
        return {result: true, team: newTeam}; 
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
            imageUrl: '', 
            active: true        
        },
        {
            id: 2,
            fullName: 'Hagerman Gamblers',  
            name: 'Gamblers',
            town: 'Hagerman',
            circuit: 'Suffolk',
            imageUrl: '', 
            active: true        
        },
        {
            id: 3,
            fullName: 'Bay Shore Redskins',  
            name: 'Redskins',
            town: 'Bay Shore',
            circuit: 'Suffolk',
            imageUrl: '', 
            active: true        
        }
    
    ]; 
}