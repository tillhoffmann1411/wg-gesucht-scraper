import IApartment from './apartment';

export interface IApplicant {
    name: string,
    text: string,
    gender?: string,
    when: number,
    imageUrl: string,
    wggId: string | undefined,
    id: string,
    note: string,
    status: 'rejected' | 'open' | 'invited' | 'accepted',
    ratings: {
        "till": number,
        "maike": number,
        "max": number,
        "emily": number
    }
}

export interface INewApplicant {
    name: string,
    text: string,
    gender?: string,
    when: number,
    imageUrl: string,
    apartment: IApartment,
    id: string,
    note: string,
    ratings: { [key: string]: number }[]
    status?: 'rejected' | 'open' | 'invited' | 'accepted',
}