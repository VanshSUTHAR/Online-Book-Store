import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://online-books-0acj.onrender.com/api",
  headers: {
    "Content-Type": "application/json"
  }
});

