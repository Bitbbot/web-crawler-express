# Links crawler

## Installation
Install necessary dependencies with ```npm i```

## Running the Program
1. Run ```npm run start``` to start the server.
2. URL for making requests `http://localhost:3000/api/v1/sponsored-links?pages={AMOUNT OF PAGES TO CRAWL}&keywords={LIST OF KEYWORDS SEPARATED WITH COMMA}`.

## Expected Response
You'll get the results as [{"keyword":string, "sponsoredLinks":[string]}].

Notice that response time depends on the Internet connection and PC configuration