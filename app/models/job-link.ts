import _ from 'lodash';
import { Transaction } from 'util/db';
import { removeEmptyProperties } from 'util/object';
import Record from './record';

interface BaseJobLink {
  id?: number;
  jobID?: string;
  href: string;
  type?: string;
  title?: string;
  rel?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface JobLinkRecord extends BaseJobLink {
  bbox?: string;
  temporalStart?: Date;
  temporalEnd?: Date;
}

/**
 * For the constructor we can take either a JobLink or a JobLinkRecord.
 * When created from the database it will be a JobLinkRecord, but when
 * constructed outside of the database it will likely be a JobLink
 * which has a different representation for the bbox and temporal.
 * Specifying JobLink | JobLinkRecord as the type causes many Typescript
 * errors so we use this interface to avoid that.
 */

export interface JobLinkOrRecord extends BaseJobLink {
  bbox?: string | number[];
  temporalStart?: Date;
  temporalEnd?: Date;
  temporal?: {
    start?: Date;
    end?: Date;
  };
}

export interface SerializedJobLink {
  href: string;
  type?: string;
  title?: string;
  rel?: string;
  temporal?: {
    start?: string;
    end?: string;
  };
  bbox?: number[];
}

const serializedLinkFields = ['href', 'type', 'title', 'rel', 'bbox'];

const jobLinkCommonFields = ['id', 'jobID', 'createdAt', 'updatedAt', 'href', 'type', 'title', 'rel'];

/**
 *
 * Wrapper object for persisted job links
 *
 */
export default class JobLink extends Record {
  static table = 'job_links';

  jobID: string;

  href: string;

  type?: string;

  title?: string;

  rel?: string;

  temporal?: {
    start?: Date;
    end?: Date;
  };

  bbox?: number[];

  /**
   * Creates a Job link from the links in a job.
   *
   * @param fields - Object containing fields to set on the record
   */
  constructor(fields: JobLinkOrRecord) {
    super(fields);
    if (fields.bbox && typeof fields.bbox === 'string') {
      this.bbox = fields.bbox.split(',').map(Number);
    }
    if (fields.temporalStart || fields.temporalEnd) {
      this.temporal = {};
      if (fields.temporalStart) {
        this.temporal.start = new Date(fields.temporalStart);
      }
      if (fields.temporalEnd) {
        this.temporal.end = new Date(fields.temporalEnd);
      }
    }
  }

  /**
   * Returns a serialized job link
   */
  serialize(): SerializedJobLink {
    const serializedLink = _.pick(this, serializedLinkFields) as unknown as SerializedJobLink;
    if (this.temporal) {
      serializedLink.temporal = {};
      if (this.temporal.start) {
        serializedLink.temporal.start = this.temporal.start.toISOString();
      }
      if (this.temporal.end) {
        serializedLink.temporal.end = this.temporal.end.toISOString();
      }
    }
    return removeEmptyProperties(serializedLink) as SerializedJobLink;
  }

  /**
   * Saves the job link using the given transaction.
   *
   * @param transaction - The transaction to use for saving the job link
   */
  async save(transaction: Transaction): Promise<void> {
    const record = _.pick(this, jobLinkCommonFields) as JobLinkOrRecord;
    const { bbox, temporal } = this;
    if (bbox) {
      record.bbox = bbox.join(',');
    }
    if (temporal) {
      record.temporalStart = temporal.start;
      record.temporalEnd = temporal.end;
    }
    await super.save(transaction, record);
  }

  /**
   * Validates the job link. Returns null if the link is valid. Returns a list of errors
   * if it is invalid.
   *
   * @returns a list of validation errors or null if the link is valid
   */
  validate(): string[] {
    const errors = [];
    if (!this.href) {
      errors.push('Job link must include an href');
    }
    return errors.length === 0 ? null : errors;
  }
}

/**
 * Returns the links for a given job
 * @param transaction - the transaction to use for querying
 * @param jobID - the UUID associated with the job
 */
export async function getLinksForJob(transaction, jobID): Promise<JobLink[]> {
  const links = await transaction('job_links').select().where({ jobID }).forUpdate();
  return links.map((j) => new JobLink(j));
}