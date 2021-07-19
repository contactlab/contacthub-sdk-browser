import {right, TaskEither} from 'fp-ts/TaskEither';
import {Http} from '../../src/http';

interface HttpProps {
  post?: TaskEither<Error, unknown>;
  patch?: TaskEither<Error, unknown>;
}

export const HTTP = ({
  post = right({}),
  patch = right({})
}: HttpProps): Http => ({
  post: jest.fn(() => post),
  patch: jest.fn(() => patch)
});
