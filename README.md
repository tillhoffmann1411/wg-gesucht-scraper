# wg-gesucht-scraper
A simple WG gesucht scraper to save messages of a profile in Firebase. This scraper was developed to create the database for the [flatrate tool](https://github.com/tillhoffmann1411/flatrate).

## 🚀 Setup
1. run `npm i`
2. Create a .env in root folder with:
```
WGG_EMAIL=
WGG_PASSWORD=

FIREBASE_DB_URL=
```
3. Add the db-key.json file from Firebase in the src folder
4. run `npm run` to sync messages
