import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import { authorize } from '../../hooks/authorize';

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

export default {
  before: {
    all: [],
    find:   [ authenticate('jwt'), authorize('admin') ],      // solo admin ve la lista
    get:    [ authenticate('jwt') ],                          // cualquiera ve su propio perfil
    create: [ hashPassword('password') ],                     // registro público
    update: [ hashPassword('password'), authenticate('jwt'), authorize('admin') ],
    patch:  [ hashPassword('password'), authenticate('jwt'), authorize('admin') ],
    remove: [ authenticate('jwt'), authorize('admin') ]
  },

  after: {
    all: [ protect('password') ],
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