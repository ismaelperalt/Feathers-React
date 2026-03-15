// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const addresses = sequelizeClient.define('addresses', {
    street: {
      type: DataTypes.STRING
    },
    number: {
      type: DataTypes.STRING
    },
    reference: {
      type: DataTypes.STRING
    },
    city_id: {
      type: DataTypes.INTEGER
    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = false;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (addresses as any).associate = function (models: any): void {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html

    addresses.belongsTo(models.cities, {
      foreignKey: 'city_id'
    });

    addresses.hasMany(models.clients, {
      foreignKey: 'address_id'
    });
  };

  return addresses;
}
