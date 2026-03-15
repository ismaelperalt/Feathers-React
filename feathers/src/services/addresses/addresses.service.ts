// Initializes the `addresses` service on path `/addresses`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Addresses } from './addresses.class';
import createModel from '../../models/addresses.model';
import hooks from './addresses.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'addresses': Addresses & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/addresses', new Addresses(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('addresses');

  service.hooks(hooks);
}
