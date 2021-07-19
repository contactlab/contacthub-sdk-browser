import {Document} from '../../src/doc';

interface DocumentProps {
  title?: string;
  referrer?: string;
}

export const DOC = ({
  title = 'Some title',
  referrer = ''
}: DocumentProps): Document => ({
  title: () => title,
  referrer: () => referrer
});
