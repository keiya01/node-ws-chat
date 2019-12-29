import { User } from "./user";

export class Room {
  constructor(public id: string, public name: string, public users: User[]) {
  }

  addUser(username: string) {
    const nextID = (this.users[this.users.length - 1].id + 1).toString();
    this.users.push({
      id: nextID,
      name: username
    });
  }
}

export default function createRoom(id: string, name: string) {
  return new Room(id, name, []);
}
