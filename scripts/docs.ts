import * as fs from 'fs';
import {sequenceT} from 'fp-ts/Apply';
import {info, log, error} from 'fp-ts/Console';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import {pipe} from 'fp-ts/function';

const sequenceTE = sequenceT(TE.ApplicativePar);

const readFileTE = TE.taskify<
  fs.PathLike,
  BufferEncoding,
  NodeJS.ErrnoException,
  string
>(fs.readFile);

const writeFileTE = TE.taskify<
  fs.PathLike,
  string,
  NodeJS.ErrnoException,
  void
>(fs.writeFile);

const makeHeadline = (title: string, order: number): string => `---
title: ${title}
nav_order: ${order}
---
`;

const copyInDocs = (
  source: string,
  dest: string,
  headline: string
): TE.TaskEither<Error, void> =>
  pipe(
    TE.fromIO<void, Error>(info(`Copy content of ${source} into ${dest}...`)),
    TE.chain(() => readFileTE(source, 'utf8')),
    TE.map(content => `${headline}${content}`),
    TE.chain(content => writeFileTE(dest, content)),
    TE.chainFirstIOK(() => log(`${dest} updated`))
  );

const main = sequenceTE(
  copyInDocs('README.md', 'docs/index.md', makeHeadline('Home', 1)),
  copyInDocs('CHANGELOG.md', 'docs/changelog.md', makeHeadline('CHANGELOG', 2))
);

// --- Run the program
main()
  .then(
    E.match(
      e => {
        throw e;
      },
      _ => {
        process.exitCode = 0;
      }
    )
  )
  .catch(e => {
    error(e)();

    process.exitCode = 1;
  });
