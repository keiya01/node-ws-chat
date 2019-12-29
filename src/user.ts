export class User {
  constructor(public id: string, public name: string) {
  }
}

export default function createUser(id: string, name: string) {
  return new User(id, name);
}
