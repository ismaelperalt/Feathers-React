import * as authentication from '@feathersjs/authentication';
import { authorize } from '../../hooks/authorize';

const { authenticate } = authentication.hooks;

// ✅ Hook que popula la ciudad en cada resultado
const populateCity = async (context: any) => {
  const sequelizeClient = context.app.get('sequelizeClient');
  const cities = sequelizeClient.models.cities;

  const addCity = async (result: any) => {
    if (result.city_id) {
      const city = await cities.findByPk(result.city_id, { raw: true })
      result.city = city
    }
    return result
  }

  if (Array.isArray(context.result.data)) {
    // find — array paginado
    context.result.data = await Promise.all(context.result.data.map(addCity))
  } else if (Array.isArray(context.result)) {
    // find sin paginación
    context.result = await Promise.all(context.result.map(addCity))
  } else {
    // get — objeto individual
    context.result = await addCity(context.result)
  }

  return context
}

export default {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get:  [authenticate('jwt')],
    create: [authenticate('jwt')],
    update: [authenticate('jwt'), authorize('admin')],
    patch:  [authenticate('jwt'), authorize('admin')],
    remove: [authenticate('jwt'), authorize('admin')],
  },
  after: {
    all: [],
    find: [populateCity],   // ✅ popula en lista
    get:  [populateCity],   // ✅ popula en individual
    create: [populateCity], // ✅ popula al crear — fix del socket
    update: [populateCity],
    patch:  [populateCity],
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