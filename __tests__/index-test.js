'use strict';

const arvishTest = require('arvish-test');

function formatOutput(input, output, flowStrippedOutput, flowCommentedOutput) {
  return [
    {
      arg: output,
      subtitle: `Prettified "${input}"`,
      text: {
        copy: output,
        largetype: output,
      },
      title: output,
    },
    {
      arg: flowStrippedOutput,
      icon: {
        path: 'flow-logo.png',
      },
      subtitle: `Flow stripped & prettified "${input}"`,
      text: {
        copy: flowStrippedOutput,
        largetype: flowStrippedOutput,
      },
      title: flowStrippedOutput,
    },
    {
      arg: flowCommentedOutput,
      icon: {
        path: 'flow-logo.png',
      },
      subtitle: `Flow commented & prettified "${input}"`,
      text: {
        copy: flowCommentedOutput,
        largetype: flowCommentedOutput,
      },
      title: flowCommentedOutput,
    },
  ];
}

test('it works', async () => {
  const input = `node index.js '{query}'`;
  const query = 'const foo: {[key: string]:number} = {james:12,lucy: 24,ming:235};';

  const arvish = arvishTest({
    vars: { query }
  });

  const result = await arvish(input);

  expect(result).toEqual(
    formatOutput(
      query,
      'const foo: {[key: string]: number} = {james: 12, lucy: 24, ming: 235};\n',
      'const foo = {james: 12, lucy: 24, ming: 235};\n',
      'const foo /*: {[key: string]: number}*/ = {james: 12, lucy: 24, ming: 235};\n',
    ),
  );
});

test('it supports experimental language features', async () => {
  const input = `node index.js '{query}'`;
  const query = `@deco class Foo<T>{type: ?number;property:string=('initializer': any);bar:?number=thatCall(12)}`;

  const arvish = arvishTest({
    vars: { query }
  });

  const result = await arvish(input);

  expect(result).toEqual(
    formatOutput(
      query,
      [
        '@deco',
        'class Foo<T> {',
        '  type: ?number;',
        "  property: string = ('initializer': any);",
        '  bar: ?number = thatCall(12);',
        '}',
        '',
      ].join('\n'),
      [
        '@deco',
        'class Foo {',
        "  property = 'initializer';",
        '  bar = thatCall(12);',
        '}',
        '',
      ].join('\n'),
      [
        '@deco',
        'class Foo /*:: <T>*/ {',
        '  /*:: type: ?number;*/',
        '',
        "  property /*: string*/ = ('initializer' /*: any*/);",
        '  bar /*: ?number*/ = thatCall(12);',
        '}',
        '',
      ].join('\n'),
    ),
  );
});

test('it reports errors', async () => {
  const input = `node index.js '{query}'`;
  const query = 'const foo';

  const arvish = arvishTest({
    vars: { query }
  });

  const result = await arvish(input);

  const errorString = [
    'SyntaxError: Unexpected token (1:10)',
    '> 1 | const foo',
    '    |          ^',
  ].join('\n');

  expect(result).toHaveLength(1);
  expect(result[0].title).toBe(errorString);
});
