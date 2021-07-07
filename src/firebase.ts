import * as admin from 'firebase-admin';
import serviceAccount from './db-key.json';
import { ServiceAccount } from 'firebase-admin';

let database: admin.database.Database;

export function initFirebase(dbUrl: string): admin.database.Database {  
  const firebase = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    databaseURL: dbUrl
  });

  database = firebase.database();
  
  return database;
}

export function getDatabase(): admin.database.Database {
  return database;
}