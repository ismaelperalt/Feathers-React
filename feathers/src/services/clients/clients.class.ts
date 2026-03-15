import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

export class Clients extends Service {
  app: any;

  constructor(options: Partial<SequelizeServiceOptions>, app: any) {
    super(options);
    this.app = app;
  }

  async find(params: any) {
    params.sequelize = {
      include: [
        {
          model: this.app.get('sequelizeClient').models.addresses,
          include: [
            {
              model: this.app.get('sequelizeClient').models.cities
            }
          ]
        },
        {
          model: this.app.get('sequelizeClient').models.users,
          attributes: { exclude: ['password'] }
        }
      ],
      raw: false,        // ← esto convierte los datos planos en objetos anidados
      nest: true         // ← esto también ayuda a anidar correctamente
    };

    return super.find(params);
  }
}