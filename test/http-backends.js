const { describe, it } = require('mocha');
const { expect } = require('chai');
const { hookServersStartStop } = require('./helpers/servers');
const { validGetMapQuery, wmsRequest } = require('./helpers/wms');
const { eossGetGranule } = require('./helpers/eoss');
const { hookFunction } = require('./helpers/hooks');

/**
 * Define common test cases for HTTP backends that don't vary by access protocol.
 *
 * @param {function} performRequestFn A function that takes a string CRS and performs a frontend
 *   request with it, returning a promise for the superagent response
 * @returns {void}
 */
function describeHttpBackendBehavior(performRequestFn) {
  describe('a service success response', function () {
    hookFunction(performRequestFn, 'res', 'SUCCESS');

    it('propagates the service response verbatim to the user', function () {
      expect(this.res.body.format.crs).to.equal('SUCCESS');
    });

    it('returns a 200 OK status code to the user', function () {
      expect(this.res.statusCode).to.equal(200);
    });

    it('propagates the service response Content-Type to the user', function () {
      expect(this.res.headers['content-type']).to.equal('application/json; charset=utf-8');
    });

    it('propagates the service response Content-Length to the user', function () {
      expect(this.res.headers['content-length']).to.equal(`${this.res.text.length}`);
    });
  });

  describe('a service redirect response', function () {
    hookFunction(performRequestFn, 'res', 'REDIRECT');

    it('redirects to the location provided in the Location header', function () {
      expect(this.res.statusCode).to.equal(303);
      expect(this.res.headers.location).to.equal('/example/redirected');
    });
  });

  describe('a service client error response', function () {
    hookFunction(performRequestFn, 'res', 'ERROR:422');

    it('propagates the message to the user', function () {
      expect(this.res.text).to.contain('An intentional error occurred');
    });

    it('propagates the status code to the user', function () {
      expect(this.res.statusCode).to.equal(422);
    });
  });

  describe('a service server error response', function () {
    hookFunction(performRequestFn, 'res', 'ERROR:501');

    it('propagates the message to the user', function () {
      expect(this.res.text).to.contain('An intentional error occurred');
    });

    it('propagates the status code to the user', function () {
      expect(this.res.statusCode).to.equal(501);
    });
  });
}

describe('HTTP Backends', function () {
  const collection = 'C1104-PVC_TS2';
  const granule = 'G1216319051-PVC_TS2';

  hookServersStartStop();

  describe('when accessed via WMS', function () {
    describeHttpBackendBehavior(function (crs) {
      return wmsRequest(this.frontend, collection, { ...validGetMapQuery, crs, layers: collection })
        .ok(() => true); // Treat all responses as non-errors to allow checking status code
    });
  });

  describe('when accessed via EOSS', function () {
    describeHttpBackendBehavior(function (crs) {
      return eossGetGranule(this.frontend, '0.1.0', collection, granule, { crs })
        .ok(() => true);
    });
  });
});