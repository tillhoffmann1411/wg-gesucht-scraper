import Applicant from './interfaces/applicant';
import { initFirebase } from './firebase';
import WgGesucht from './scraper';
import admin from 'firebase-admin';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get('/', (req, res) => {
  const db: admin.database.Database = app.locals.database;
  const wgGesucht: WgGesucht = app.locals.wgGesucht;

  db.ref("applicants").orderByChild('when').on("value", async (snapshot: any) => {
    const lastApplicants: Applicant[] = [];
    snapshot.forEach((applicantSnap: any) => {
      lastApplicants.push(applicantSnap.val() as Applicant);
    });

    lastApplicants.reverse();
    await wgGesucht.login(process.env.WGG_EMAIL!, process.env.WGG_PASSWORD!);
    await wgGesucht.getMessageAfter(lastApplicants, db);
    await wgGesucht.logout();
  });

  res.type('text');
  res.send('Hello');
});

app.listen(3000, () => {
  app.locals.database = initFirebase(process.env.FIREBASE_DB_URL!);
  app.locals.wgGesucht = new WgGesucht();
  console.log('listening on port 3000!');
});
