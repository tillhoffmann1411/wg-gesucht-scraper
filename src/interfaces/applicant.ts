export default interface IApplicant {
    name: string,
    text: string,
    gender?: string,
    when: number,
    imageUrl: string,
    wggId: string | undefined,
    id: string,
    note: string,
    ratings: {
        "till": number,
        "maike": number,
        "max": number,
        "emily": number
    }
    status?: 'rejected' | 'open' | 'invited' | 'accepted',
}