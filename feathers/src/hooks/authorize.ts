// src/hooks/authorize.ts
import { HookContext } from '@feathersjs/feathers';

export const authorize = (...roles: string[]) => {


  return async (context: HookContext): Promise<HookContext> => {

    if (!context.params.provider) return context;

    const user = context.params.user;
    if (!user) throw new Error('No autenticado');

    if (!roles.includes((user as any).role)) {
      throw new Error(`Acceso denegado. Rol requerido: ${roles.join(' o ')}`);
    }

    return context;
  }
  
}