import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

export class Addresses extends Service {
  app: Application;

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find(params: any) {
    params.sequelize = {
      include: [
        {
          model: this.app.get('sequelizeClient').models.cities
        }
      ],
      raw: false,
      nest: true
    };

    return super.find(params);
  }
}