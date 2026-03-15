import { ServiceAddons } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { expressOauth } from '@feathersjs/authentication-oauth';
import { HookContext } from '@feathersjs/feathers';
import { Application } from './declarations';

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>;
  }
}

export default function(app: Application): void {
  const authentication = new AuthenticationService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());

  app.service('authentication').hooks({
    after: {
      create: [
        async (context: HookContext) => {
          const { user } = context.result;
          if (user) {
            context.result.user = user;
          }

          // ← Guarda el token en una cookie httpOnly
          if (context.params?.res) {
            context.params.res.cookie('feathers-jwt', context.result.accessToken, {
              httpOnly: true,    // JS no puede leerla, más seguro
              secure: false,     // true en producción con HTTPS
              sameSite: 'lax',
              maxAge: 24 * 60 * 60 * 1000 // 1 día
            });
          }

          return context;
        }
      ]
    }
  });
}