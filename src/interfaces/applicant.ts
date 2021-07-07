export default interface Applicant {
    name: string,
    text: string,
    gender: string,
    when: number,
    imageUrl: string,
    id: string,
    note: string,
    wggId: string;
    ratings: {
        "till": number,
        "maike": number,
        "max": number
    }
}