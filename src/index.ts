import Applicant from './interfaces/applicant';
import { initFirebase } from './firebase';
import WgGesucht from './scraper';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import express, { Router } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();
const ENV = {
  email: process.env.WGG_EMAIL,
  password: process.env.WGG_PASSWORD,
  dbUrl: process.env.FIREBASE_DB_URL
}

const app = express();


const startSynchronizing = (req, res) =>{
  console.log('req', req.body);
  if (!req.body) {
    res.send(req);
  }
  const reqEmail = req.body.email;
  const reqPassword = req.body.password;

  const email = reqEmail ? reqEmail : ENV.email;
  const password = reqPassword ? reqPassword : ENV.password;

  if (email && password && ENV.dbUrl) {
    const firebase = initFirebase(ENV.dbUrl);
    const wgGesucht = new WgGesucht();
    sync(firebase, wgGesucht, email, password, (error) => {
      if (!error) {
        res.send({ message: 'Successfully synchronised' });
      } else {
        res.status(501).send({ message: 'Error by synchronising' });
      }
    });
  }
};

function sync(db: admin.database.Database, wgGesucht: WgGesucht, email: string, password: string, resCb: (error: boolean) => void): void {
  db.ref("applicants").orderByChild('when').on("value", async (snapshot: admin.database.DataSnapshot) => {
    const lastApplicants: Applicant[] = [];
    snapshot.forEach((applicantSnap: admin.database.DataSnapshot) => {
      lastApplicants.push(applicantSnap.val() as Applicant);
    });
    
    try {
      lastApplicants.reverse();
      console.log('Try to login...');
      await wgGesucht.login(email, password);
      console.log('Succsefully loged in! Now try to read messages...');
      await wgGesucht.getMessageAfter(lastApplicants, db);
      console.log('Synchronized all messages. Going to log out...');
      await wgGesucht.logout();
      console.log('Loged out!');
      resCb(false);

    } catch (error) {
      console.error(error);
      resCb(true);
    }

  });
}

app.listen(8080, () => {
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  Router().post('/', startSynchronizing);
  console.log('listening on port 8080!');
});

