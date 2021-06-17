import {IO} from 'fp-ts/IO';

export interface DocumentSvc {
  document: Document;
}

export interface Document {
  title: IO<string>;
  referrer: IO<string>;
}

export const document = (): Document => ({
  title: () => window.document.title,

  referrer: () => window.document.referrer
});
