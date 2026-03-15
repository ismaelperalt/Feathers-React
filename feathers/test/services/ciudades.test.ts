import assert from 'assert';
import app from '../../src/app';

describe('\'ciudades\' service', () => {
  it('registered the service', () => {
    const service = app.service('ciudades');

    assert.ok(service, 'Registered the service');
  });
});
