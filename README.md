### Notes

[Article](https://www.section.io/engineering-education/how-to-use-typescript-with-nodejs/) used for TS Config
[Article](https://dev.to/santypk4/bulletproof-node-js-project-architecture-4epf) used for project org
[Article](https://dev.to/vovaspace/dependency-injection-in-typescript-4mbf) used for TS dependecy injection
[Article](https://dev.to/somedood/the-proper-way-to-write-async-constructors-in-javascript-1o8c#:~:text=The%20static%20async%20factory%20function,the%20indirect%20invocation%20of%20constructor%20.) on async constructors
[Article](https://flaviocopes.com/node-aws-s3-upload-image/) on saving images to aws
[Article](https://blog.cloudthat.com/step-by-step-guide-to-deploy-reactjs-app-on-aws-s3/) on deploying fe to s3
[Article](https://webpack.js.org/plugins/define-plugin) env vars in FE with webpack
[Video](https://www.youtube.com/watch?v=rtshCulV2hk&list=LL&index=1) on lightsail, apache, ssl
[Article](https://docs.bitnami.com/ibm/infrastructure/nodejs/administration/enable-cors-nodejs/) Enable cors on apache bitnami
[Article](https://docs.bitnami.com/installer/apps/odoo/get-started/understand-config/) Understanding the default Apache config in Bitnami


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
* cloudfront to secure FE, I think this will fix the cors issue then - not sure, but going to keep going.  

* add logout and use deleteSession; 
* test session expiration

* make a separate endpoint with lowest auth for link adders.  
* db backups?

* re-install bootstrap and react-bootstrap for tooltips
* turn off locations until images
* tournament winners page that defaults to NYSs, but can be filtered to see others
* add link on tournament pages to see the top runs at this track (add query params to top runs page?)
* OF doesn't work in schedule search
* add state tournament winners to past season page
* check that video icons appear in proper places
* 

* 1991 state tournament, total points don't include half values
* 2011 state tournament is weird
* 2012 suffolk county drill displays the wrong winner
* 2009 town of islip not display winner tie
* 2015 big 8 is weird
* 1957 three man big 8 is blank, leads to error when clicked

* add marker to all imported runs / all new runs
* add extra zeroes to time (FE) e.g. 7.5 to 7.50
* running orders are in the 100s?
* find way to ID parades.
* times, points are getting 'NULL' strings instead of NULL
* cache the big 8 for every hour (check other places for cacheing, total points)
* considering select columns for some requests
* handle cursor for getFilteredRuns
* aws to save images

### Ideas
* index on tournamentId (convert to numeric?)?
* Most points scored in year, circuit, sanctioned

### Finished: 
* error handling in controllers
* query db for last old_id and save on class
* getSeasons - agg query on tournaments
* total points


