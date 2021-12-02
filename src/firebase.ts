import * as admin from 'firebase-admin';
import serviceAccount from './db-key.json';
import { ServiceAccount } from 'firebase-admin';

let database: admin.database.Database;

export function initFirebase(dbUrl: string): { realtimeDatabase: admin.database.Database, firestore: admin.firestore.Firestore} {  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
    databaseURL: dbUrl
  });

  return {
    realtimeDatabase: admin.database(),
    firestore: admin.firestore()
  };
}

export function getDatabase(): admin.database.Database {
  return database;
}
