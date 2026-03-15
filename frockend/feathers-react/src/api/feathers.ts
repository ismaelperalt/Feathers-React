// src/api/feathersClient.ts
import { feathers } from "@feathersjs/feathers"
import socketio from "@feathersjs/socketio-client"
import authentication from "@feathersjs/authentication-client"
import { io, Socket } from "socket.io-client"

const socket: Socket = io("http://localhost:3030", {
  withCredentials: true
})

const client = feathers()

client.configure(socketio(socket))

client.configure(authentication({
  storageKey: 'feathers-jwt'
}))

export default client