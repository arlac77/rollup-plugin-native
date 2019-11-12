import sample from './imports.node';

const instance = sample({
  env: {
    foobar: (x) => t.is(x, 10, 'got callback')
  }
});

instance.exports.main();