const request = require('supertest');
const { before, after } = require('mocha');
const sinon = require('sinon');
const fs = require('fs');
const aws = require('aws-sdk');
const { hookRequest } = require('./hooks');

/**
 * Makes a cloud-access JSON request
 * @param {Express.Application} app The express application (typically this.frontend)
 * @returns {Promise<Response>} The response
 */
function cloudAccessJson(app) {
  return request(app).get('/cloud-access');
}

/**
 * Makes a cloud-access.sh request
 * @param {Express.Application} app The express application (typically this.frontend)
 * @returns {Promise<Response>} The response
 */
function cloudAccessSh(app) {
  return request(app).get('/cloud-access.sh');
}

const hookCloudAccessSh = hookRequest.bind(this, cloudAccessSh);
const hookCloudAccessJson = hookRequest.bind(this, cloudAccessJson);

const sampleCloudAccessJsonResponse = {
  Credentials: {
    AccessKeyId: 'XXXXXXXXXXXXXXXXXXXX',
    SecretAccessKey: 'XXXXXXXXXXXXXXXXXXXX1111111111+++++/////',
    SessionToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa++++++++++++++++++++++++++++++++++++++++++++++++++00000000000000000000000000000000000000000000000000//////////////////////////////////////////////////XXXXXX==================================================',
    Expiration: '2020-04-10T18:03:46.337Z',
  },
};

/**
 * Adds before and after hooks to stub out calls to AWS STS.
 * @returns {void}
 */
function hookAwsSts() {
  let stub;
  before(function () {
    stub = sinon.stub(aws, 'STS')
      .returns({
        assumeRole: () => (
          { promise: async () => sampleCloudAccessJsonResponse }),
      });
  });
  after(function () {
    stub.restore();
  });
}

const sampleCloudAccessShResponse = fs.readFileSync('./test/resources/cloud-access-example-response.sh', 'utf-8');

module.exports = {
  cloudAccessJson,
  hookCloudAccessJson,
  cloudAccessSh,
  hookCloudAccessSh,
  sampleCloudAccessJsonResponse,
  sampleCloudAccessShResponse,
  hookAwsSts,
};
