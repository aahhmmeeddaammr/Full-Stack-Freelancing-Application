import { atom } from "recoil";

export const baseUrl = atom({
   key: 'baseUrl',
   default: 'http://127.0.0.1:8000/',
});
