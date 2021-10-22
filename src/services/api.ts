import axios from 'axios'
import io from 'socket.io-client'

export const api = axios.create({
   baseURL: "http://localhost:4000"
})

export const socket = io("http://localhost:4000")
