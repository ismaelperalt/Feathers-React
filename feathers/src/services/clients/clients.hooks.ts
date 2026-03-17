// src/services/clients/clients.hooks.ts
import * as authentication from '@feathersjs/authentication';
import { authorize } from '../../hooks/authorize';

const { authenticate } = authentication.hooks;

const assignUserId = async (context: any) => {
  const user = context.params.user;
  if (user.role === 'user') {
    context.data.user_id = user.id;
  }
  return context;
};

const populateAddress = async (context: any) => {
  const sequelizeClient = context.app.get('sequelizeClient');
  const addresses = sequelizeClient.models.addresses;
  const cities = sequelizeClient.models.cities;

  const addAddress = async (result: any) => {
    if (result.address_id) {
      // ✅ Busca dirección simple sin include
      const address: any = await addresses.findByPk(result.address_id, { raw: true })

      if (address) {
        // ✅ Busca ciudad por separado
        if (address.city_id) {
          const city = await cities.findByPk(address.city_id, { raw: true })
          address.city = city
        }
        result.address = address
      }
    }
    return result
  }

  if (Array.isArray(context.result.data)) {
    context.result.data = await Promise.all(context.result.data.map(addAddress))
  } else if (Array.isArray(context.result)) {
    context.result = await Promise.all(context.result.map(addAddress))
  } else {
    context.result = await addAddress(context.result)
  }

  return context
}

export default {
  before: {
    all: [],
    find:   [authenticate('jwt')],
    get:    [authenticate('jwt')],
    create: [authenticate('jwt'), assignUserId],
    update: [authenticate('jwt'), authorize('admin')],
    patch:  [authenticate('jwt'), authorize('admin')],
    remove: [authenticate('jwt'), authorize('admin')]
  },
  after: {
    all: [],
    find:   [populateAddress],  // ✅
    get:    [populateAddress],  // ✅
    create: [populateAddress],  // ✅ fix del socket
    update: [populateAddress],
    patch:  [populateAddress],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};