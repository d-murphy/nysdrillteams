### Notes

[Article](https://www.section.io/engineering-education/how-to-use-typescript-with-nodejs/) used for TS Config
[Article](https://dev.to/santypk4/bulletproof-node-js-project-architecture-4epf) used for project org
[Article](https://dev.to/vovaspace/dependency-injection-in-typescript-4mbf) used for TS dependecy injection
[Article](https://dev.to/somedood/the-proper-way-to-write-async-constructors-in-javascript-1o8c#:~:text=The%20static%20async%20factory%20function,the%20indirect%20invocation%20of%20constructor%20.) on async constructors
[Article](https://flaviocopes.com/node-aws-s3-upload-image/) on saving images to aws
[Article](https://blog.cloudthat.com/step-by-step-guide-to-deploy-reactjs-app-on-aws-s3/) on deploying fe to s3
[Article](https://webpack.js.org/plugins/define-plugin) env vars in FE with webpack
[Article](https://docs.bitnami.com/aws/infrastructure/nodejs/) on working with Bitnami (be deployment)


### Data Issues to investigate
* update classes
* use classes when figuring out points? 
* 2011 Joe Hunter is sanctioned and cfp
* 2011 states has no running order
* why do nassau teams have true booleans for suffolk points (2008 three man ladder @ central islip)
    * maybe class can fix this? 
* state record flags are run in runDb
* update name of old id field
* there is a tournament with id: 'hose tester checked on 8/13/93 found it to be illegal by rules committee.'

### To Do Before live
* tracks page, pictures, track records

### To Do

* re-install bootstrap and react-bootstrap for tooltips
* add some try catch in controllers and move error handling up?
* turn off locations for now
* tournament winners page that defaults to NYSs, but can be filtered to see others
* add link on tournament pages to see the top runs at this track (add query params to top runs page?)
* total points
* 1991 state tournament, total points don't include half values
* 2011 state tournament is weird
* 2012 suffolk county drill displays the wrong winner
* 2009 town of islip not display winner tie
* OF doesn't work in schedule search
* 2015 big 8 is weird
* 1957 three man big 8 is blank, leads to error when clicked
* add state tournament winners to past season page
* check that video icons appear in proper places
* add marker to all imported runs
* add extra zeroes to time (FE) e.g. 7.5 to 7.50
* running orders are in the 100s?
* find way to ID parades.
* times, points are getting 'NULL' strings instead of NULL
* cache the big 8 for every hour
* query db for last old_id and save on class
* collation to sort strings as numbers?
* need a new column in runs - can do this from a query? 
* considering select columns for some requests
* handle cursor for getFilteredRuns
* add cors
* aws to save images
* getSeasons - agg query on tournaments

### Ideas
* index on tournamentId (convert to numeric?)?
* Most points scored in year, circuit, sanctioned


