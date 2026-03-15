// src/services/clients/clients.hooks.ts
import * as authentication from '@feathersjs/authentication';
import { authorize } from '../../hooks/authorize';

const { authenticate } = authentication.hooks;

const assignUserId = async (context: any) => {
  const user = context.params.user;
  if (user.role === 'user') {
    context.data.user_id = user.id; // user normal → su propio id forzado
  }
  // admin → puede mandar el user_id que quiera en el body
  return context;
};

export default {
  before: {
    all: [],
    find:   [ authenticate('jwt') ],
    get:    [ authenticate('jwt') ],
    create: [ authenticate('jwt'), assignUserId ], // ← aquí va
    update: [ authenticate('jwt'), authorize('admin') ],
    patch:  [ authenticate('jwt'), authorize('admin') ],
    remove: [ authenticate('jwt'), authorize('admin') ]
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