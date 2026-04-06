import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "https://online-books-0acj.onrender.com";

export const api = axios.create({
  baseURL: API_URL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});
