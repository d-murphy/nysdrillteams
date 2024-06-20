function updateRunningOrder() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); 
  
    var tournIdRange = spreadsheet.getRangeByName("TournamentId"); 
    var tournId = tournIdRange.getValue(); 
  
    var resultsSheet = spreadsheet.getSheetByName("Tournament Running Order"); 
  
    var query = 'tournamentId=' + parseInt(tournId).toString(); 
    var url = 'https://www.nysdrillteamsapi.com/tournaments/getTournament'
    + '?' + query;
  
    var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
    var responseParsed = JSON.parse(response); 
    var runningOrder = responseParsed.runningOrder; 
  
    resultsSheet.clearContents(); 
    resultsSheet.appendRow(["Running Position", "Team Name"])
  
    var resultsArr = []; 
  
    Object.keys(runningOrder).sort((a,b) => parseInt(a) < parseInt(b) ? -1 : 1).forEach((el, ind) => {
      resultsArr.push([el, runningOrder[el]])
    })
    var range = resultsSheet.getRange(2,1, resultsArr.length, 2); 
    range.setValues(resultsArr)
  }
  
  function updateTournamentResults(){
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); 
    var tournIdRange = spreadsheet.getRangeByName("TournamentId"); 
    var tournId = tournIdRange.getValue(); 
  
    var resultsSheet = spreadsheet.getSheetByName("Tournament Results"); 
  
    var query = 'tournamentId=' + parseInt(tournId).toString(); 
    var url = 'https://www.nysdrillteamsapi.com/runs/getRunsFromTournament'
    + '?' + query;
  
    var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
    var responseParsed = JSON.parse(response); 
  
    resultsSheet.clearContents(); 
    resultsSheet.appendRow(["Lookup Key", "Team Name", "Contest", "Time", "Points"])
    var resultsArr = []; 
  
    responseParsed.forEach((el, ind) => {
      resultsArr.push([el.team + "-" + el.contest,  el.team, el.contest, el.time, el.points])
    }); 
    var range = resultsSheet.getRange(2,1, resultsArr.length, 5); 
    range.setValues(resultsArr)
  }
  
  function updateTopTimes(){
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet(); 
  
    var contestRange = spreadsheet.getRangeByName("Contest"); 
    var contest = contestRange.getValue(); 
    var yearRange = spreadsheet.getRangeByName("Year"); 
    var year = yearRange.getValue(); 
    var trackRange = spreadsheet.getRangeByName("Track"); 
    var track = trackRange.getValue(); 
  
    var resultsSheet = spreadsheet.getSheetByName("Top Times"); 
    resultsSheet.clearContents(); 
    resultsSheet.appendRow(["Lookup Key", "Date", "Year", "Tournament", "Track", "Team Name", "Contest",  "Time", "Points"])
    var resultsArr = []; 
  
    var urlStem = 'https://www.nysdrillteamsapi.com/runs/getFilteredRuns'
  
    var queries = [
      {
        query: 'years=' + year.toString() + '&contests=' + contest + "&limit=1", 
        lookupKey: "Season Top Run"
      }, 
      {
        query: 'contests=' + contest + '&currentStateRecord=true' + '&limit=1', 
        lookupKey: "State Record"
      }, 
      {
        query: "contests=" + contest + "&tracks=" + track + '&limit=1', 
        lookupKey: "Track Record"
      }, 
    ];
    var tournamentRunningOrderRange = spreadsheet.getRangeByName("TournamentRunningOrder"); 
    var tournamentRunningOrder = tournamentRunningOrderRange.getValues();  
    tournamentRunningOrder.forEach(row => {
      var team = row[0]; 
      if(team && team.length){
        queries.push({
          query: "contests=" + contest + "&years=" + year.toString() + "&teams=" + team + '&limit=1', 
          lookupKey: "Team Season Best" + " - " + team
        }); 
        queries.push({
          query: "contests=" + contest + "&tracks=" + track + "&teams=" + team + '&limit=1', 
          lookupKey: "Team Track Best" + " - " + team
        }); 
        queries.push({
          query: "contests=" + contest + "&teams=" + team + '&limit=1', 
          lookupKey: "Team All Time Best" + " - " + team
        }); 
      }
    })
  
    queries.forEach((obj, ind) => {
      var url = urlStem + "?" + obj.query; 
      // Teddy`s Boys and Ol` Henries used to back tick, this prevented error, but didn't fix.  Needs db update. 
      url = url.replace("`", "'")
      var response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
      var responseParsed = JSON.parse(response); 
      var run = responseParsed && responseParsed.length && responseParsed[0].data && responseParsed[0].data.length ? 
        responseParsed[0].data[0] : null; 
      if(run && run.time.toUpperCase() != "NA" && run.time.toUpperCase() != "NULL") {
        resultsArr.push([
          obj.lookupKey, new Date(run.date).toLocaleDateString(), run.year, run.tournament, run.track, run.team, run.contest, run.time.toString(), run.points 
        ])
      }
    })
  
    var range = resultsSheet.getRange(2,1, resultsArr.length, 9); 
    range.setValues(resultsArr)
  }