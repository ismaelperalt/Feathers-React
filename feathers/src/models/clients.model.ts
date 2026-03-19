// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize';
import { Application } from '../declarations';
import { HookReturn } from 'sequelize/types/hooks';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const clients = sequelizeClient.define('clients', {
    name: {
      type: DataTypes.STRING
    },
    phone: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    address_id: {
      type: DataTypes.INTEGER
    },
    user_id: {
      type: DataTypes.INTEGER
    },

    active: {
      type: DataTypes.BOOLEAN,
      defaultValue:true
    },

    client_type:{
      type:DataTypes.STRING,
      defaultValue:"regular"

    }
  }, {
    hooks: {
      beforeCount(options: any): HookReturn {
        options.raw = false;
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (clients as any).associate = function (models: any): void {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    clients.belongsTo(models.addresses, {
      foreignKey: 'address_id'
    });

    clients.belongsTo(models.users, {
      foreignKey: 'user_id'
    });
  };

  return clients;
}
