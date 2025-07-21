import { adjectives, animals, uniqueNamesGenerator } from "unique-names-generator";

export const uniqueUsernameGen = uniqueNamesGenerator({
    dictionaries: [adjectives,animals],
    separator:'',
    length:2,
    style:'capital'
});