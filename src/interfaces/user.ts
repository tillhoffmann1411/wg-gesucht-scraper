import admin from 'firebase-admin';
import IApartment from './apartment';


export default interface IUser {
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    createdAt: admin.firestore.Timestamp,
    apartment: IApartment
}