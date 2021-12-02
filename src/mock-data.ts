import admin from 'firebase-admin';
import faker from 'faker';

import IApartment from './interfaces/apartment';
import { INewApplicant } from './interfaces/applicant';
import IUser from './interfaces/user';


export const generateMockApplicant = (apartment: IApartment): INewApplicant => {
    faker.locale = "de";
    return {
        name: faker.name.findName(),
        text: faker.lorem.paragraph(),
        gender: mockGender(),
        when: Date.now(),
        imageUrl: faker.image.avatar(),
        id: '',
        note: '',
        apartment: apartment,
        status: 'open',
        ratings: apartment.flatmates.map(f => {
            return { [f.firstName]: getRandomInt(6) };
        })
    }
}

const mockGender = (): 'male' | 'female' => {
    const num = getRandomInt(2);
    if (num === 0) {
        return 'male';
    } else {
        return 'female';
    }
}

const getRandomInt = (max: number): number => {
    return Math.floor(Math.random() * max);
  }

export const createApplicant = async (appl: INewApplicant, apartment: IApartment, firestore: admin.firestore.Firestore): Promise<INewApplicant> => {
    const col = firestore.collection('applicants-' + apartment.id);
    const docRef = col.doc();
    const id = docRef.id;

    const apartmentDoc = firestore.collection('apartments').doc(apartment.id);

    const newApplicantRef = {
        ...appl,
        id,
        apartment: apartmentDoc
    };
    const newApplicant = {
        ...appl,
        id,
        apartment
    };
    await docRef.set(newApplicantRef);
    return newApplicant;
}

export const getApartment = async (apartId: string, firestore: admin.firestore.Firestore): Promise<IApartment> => {
    const apartmentRef = firestore.collection('apartments').doc(apartId);
    const apartmentDoc = await apartmentRef.get();
    const apartmentData = apartmentDoc.data();
    const flatmates: IUser[] = [];
    if (apartmentData && apartmentData['flatmates']) {
        for (const ref of apartmentData['flatmates']) {
            const flatmateDoc = await ref.get();
            const flatmateData = flatmateDoc.data();
            if (flatmateData) {
                flatmates.push(flatmateData as IUser);
            }
        }
    }
    return { ...apartmentData, id: apartmentDoc.id, flatmates } as IApartment;
}

export const generateMultipleMockApplicants = async (nr = 10, apartmentId: string, firestore: admin.firestore.Firestore): Promise<void> => {
    console.log('Generating mock data...');
    for (let i=0; i<nr; i++) {
        const apartment = await getApartment(apartmentId, firestore);
        const applicant = generateMockApplicant(apartment);
        await createApplicant(applicant, apartment, firestore);
    }
    console.log('Done with generating mock data!');
}