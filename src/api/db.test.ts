import test from 'ava'
import request from 'supertest'
import db, { query, SearchResult } from './db'
import bodyparser from 'body-parser'
import express from 'express'

const getApp = () => {
    const app = express()
    app.use(bodyparser.json())
    app.use('/', db)
    return app
}

test('db:app:/', async t => {
    t.plan(2)

    const res = await request(getApp()).get('/')

    t.is(res.status, 200)
    t.not(res.body, undefined)
})

test('db:app:/:query', async t => {
    t.plan(2)

    const res = await request(getApp()).get('/?q=string')

    t.is(res.status, 200)
    t.not(res.body, undefined)
})

test('db:app:/diseases', async t => {
    t.plan(2)

    const res = await request(getApp()).get('/diseases')

    t.is(res.status, 200)
    t.is((res.body as SearchResult).directory, "diseases")
})

test('db:app:/treatments', async t => {
    t.plan(2)

    const res = await request(getApp()).get('/treatments')

    t.is(res.status, 200)
    t.is((res.body as SearchResult).directory, "treatments")
})

test('db:query:modality', t => {
    t.deepEqual(query('foobar'), {
        text: 'foobar'
    })

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

    t.deepEqual(query('term m:"string modality" word'), {
        text: 'term m:"string modality" word',
        modality: 'string modality'
    }, "it doesn't capture words after quotes")
})