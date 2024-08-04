import { atom } from "recoil";

export const navPhoto = atom({
    key: 'navPhoto',
    default: localStorage.getItem('navPhoto'),
});

export const navName = atom({
    key: 'navName',
    default: localStorage.getItem('navName'),
});