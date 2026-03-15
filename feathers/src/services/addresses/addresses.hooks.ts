// src/services/cities/cities.hooks.ts
import * as authentication from '@feathersjs/authentication';
import { authorize } from '../../hooks/authorize';

const { authenticate } = authentication.hooks;

export default {
  before: {
    all: [],
    find: [authenticate('jwt')],                 // cualquier autenticado ve
    get: [authenticate('jwt')],                 // cualquier autenticado ve
    create: [authenticate('jwt')],                 // cualquier autenticado crea
    update: [authenticate('jwt'), authorize('admin')],
    patch: [authenticate('jwt'), authorize('admin')],
    remove: [authenticate('jwt'), authorize('admin')],
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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