import test from 'ava'
import { query } from './db'

test('queries', t => {
    t.deepEqual(query('foobar'), {
        text: 'foobar'
    })
})

test('query modality', t => {
    t.deepEqual(query('term modality:bota'), {
        text: 'term modality:bota',
        modality: 'bota'
    }, 'it has a long name')

    t.deepEqual(query('term m:bota'), {
        text: 'term m:bota',
        modality: 'bota'
    }, 'it has shorthands')

    try {
        query('term m:bota m:vera')
        t.fail('must not allow multiple modality codes')
    } catch (_) {

    }

    t.deepEqual(query('term m:"string modality"'), {
        text: 'term m:"string modality"',
        modality: 'string modality'
    }, 'it captures double quotes')

    t.deepEqual(query("term m:'string modality'"), {
        text: "term m:'string modality'",
        modality: 'string modality'
    }, 'it captures single quotes')

    t.deepEqual(query("term m:'string modality' word"), {
        text: "term m:'string modality' word",
        modality: 'string modality'
    }, "it doesn't capture words after quotes")
})