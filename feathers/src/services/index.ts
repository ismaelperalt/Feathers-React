import { Application } from '../declarations';
import users from './users/users.service';
import cities from './cities/cities.service';
import addresses from './addresses/addresses.service';
import clients from './clients/clients.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  app.configure(users);
  app.configure(cities);
  app.configure(addresses);
  app.configure(clients);
}
