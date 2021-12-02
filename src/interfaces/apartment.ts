import IUser from './user';

export default interface IApartment {
    id: string,
    name: string,
    flatmates: IUser[]
}