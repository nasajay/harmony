const { describe, it } = require('mocha');
const { expect } = require('chai');
const Job = require('../../app/models/job');
const catalog = require('../../app/frontends/stac-catalog');

// Prop for testing
const jobProps = {
  jobID: '1234',
  request: 'example.com',
  links: [
    {
      href: 'file_1.nc',
      title: 'Item #1',
      rel: 'data',
      type: 'application/nc',
      bbox: [-80, -30, -100, 20],
      temporal: {
        start: '1996-10-15T00:05:32.000Z',
        end: '1996-11-15T00:05:32.000Z',
      },
    },
    {
      href: 'file_2.png',
      title: 'Item #2',
      rel: 'data',
      type: 'image/png',
      bbox: [-100, -30, -80, 20],
      temporal: {
        start: '1996-10-15T00:05:32.000Z',
        end: '1996-11-15T00:05:32.000Z',
      },
    },
    {
      href: 'http://data.example.org/',
      title: 'this catalog',
      rel: 'self',
      type: 'application/json',
    },
  ],
};

describe('stac-catalog', function () {
  describe('catalog creation with invalid argument', function () {
    const job = { jobID: 1 };
    it('should fail', function () {
      expect(function () { catalog.create(job); }).to.throw();
    });
  });

  describe('catalog creation with an object matching Harmony Job properties', function () {
    it('should fail', function () {
      expect(function () { catalog.create(jobProps); }).to.throw();
    });
  });

  describe('catalog creation with a Harmony Job object', function () {
    const job = new Job(jobProps);
    let jsonObj = {};
    it('created Harmony STAC Catalog', function () {
      expect(function () { jsonObj = catalog.create(job); }).to.not.throw();
    });
    it('catalog ID matches Job ID', function () {
      expect(jsonObj.id).to.equal(jobProps.jobID);
    });
    it('has links', function () {
      expect(jsonObj.links.length).to.equal(4);
    });
    it('has link with an item', function () {
      expect(jsonObj.links[3].rel).to.equal('item');
    });
    it('has link with href to item index', function () {
      expect(jsonObj.links[3].href).to.equal('./1');
    });
  });
});