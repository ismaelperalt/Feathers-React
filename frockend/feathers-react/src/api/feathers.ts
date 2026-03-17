import feathers from "@feathersjs/feathers"
import socketio from "@feathersjs/socketio-client"
import authentication from "@feathersjs/authentication-client"
import io from "socket.io-client"

const socket = io("http://localhost:3030", {
  transports: ["websocket"],
  forceNew: true
})

const client = feathers()

client.configure(socketio(socket))

client.configure(authentication({
  storageKey: "feathers-jwt",
  storage: window.sessionStorage
}))

// Exporta también el socket
export { socket }
export default client