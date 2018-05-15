#!/usr/bin/env node
const Release = require('../index');
const JSONStream = require('JSONStream');
const es = require('event-stream');
const arg = process.argv[2];

process.stdin.setEncoding('utf8');

let output = 'release';

if (/package/.test(arg)) {
  output = 'package';
}

process.stdin
  .pipe(JSONStream.parse())
  .pipe(es.mapSync(function (cnetDocument) {
    const r = new Release({
      cnetDocument: cnetDocument.body,
      metadata: cnetDocument,
    });
    if (output === 'package') {
      return r.package;
    }
    return r.release;
  }))
  .pipe(JSONStream.stringify(false))
  .pipe(process.stdout);

process.stdin.on('end', () => {
  process.stdout.write('\n');
});
