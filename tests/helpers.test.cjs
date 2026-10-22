const {test} = require('node:test');
const assert = require('node:assert/strict');
const {
    convertObjectToFormData, convertFormDataToObject, convertObjectToURLSearchParams, convertURLSearchParamsToObject
} = require('./helpers.cjs');

test('convertObjectToFormData flattens nested objects and arrays into bracket keys', () => {
    const form = convertObjectToFormData({a: 1, b: {c: 'x', d: {e: true}}, list: ['p', 'q']});

    assert.deepEqual([...form], [['a', '1'], ['b[c]', 'x'], ['b[d][e]', 'true'], ['list[0]', 'p'], ['list[1]', 'q']]);
});

test('convertObjectToFormData keeps files and blobs as values', () => {
    const file = new File(['data'], 'a.txt');
    const form = convertObjectToFormData({upload: file, meta: {blob: new Blob(['b'])}});

    assert.ok(form.get('upload') instanceof File);
    assert.equal(form.get('upload').name, 'a.txt');
    assert.ok(form.get('meta[blob]') instanceof Blob);
});

test('convertFormDataToObject builds nested objects and [] arrays', () => {
    const form = new FormData();
    form.append('name', 'x');
    form.append('user[address][city]', 'Sofia');
    form.append('tags[]', 'a');
    form.append('tags[]', 'b');
    form.append('first-name', 'hyphen');

    assert.deepEqual(convertFormDataToObject(form), {
        name: 'x',
        user: {address: {city: 'Sofia'}},
        tags: ['a', 'b'],
        'first-name': 'hyphen'
    });
});

test('convertFormDataToObject preserves repeated names as arrays', () => {
    const form = new FormData();
    form.append('tag', 'a');
    form.append('tag', 'b');
    form.append('user[role]', 'editor');
    form.append('user[role]', 'reviewer');

    assert.deepEqual(convertFormDataToObject(form), {
        tag: ['a', 'b'],
        user: {role: ['editor', 'reviewer']}
    });
});

test('convertFormDataToObject rejects keys without a name', () => {
    const form = new FormData();
    form.append('[]', 'x');

    assert.throws(() => convertFormDataToObject(form), /Invalid Form Data Key/);
});

test('convertObjectToURLSearchParams flattens nested values and stringifies scalars', () => {
    const params = convertObjectToURLSearchParams({a: 1, flag: false, b: {c: 'x'}, list: [1, 2]});

    assert.equal(params.toString(), 'a=1&flag=false&b%5Bc%5D=x&list%5B0%5D=1&list%5B1%5D=2');
});

test('convertURLSearchParamsToObject builds nested objects and [] arrays', () => {
    const params = new URLSearchParams('name=x&user[city]=Sofia&tags[]=a&tags[]=b');

    assert.deepEqual(JSON.parse(JSON.stringify(convertURLSearchParamsToObject(params))), {
        name: 'x',
        user: {city: 'Sofia'},
        tags: ['a', 'b']
    });
});

test('convertURLSearchParamsToObject accepts mixed object and array bracket keys', () => {
    const params = new URLSearchParams('a[x]=1&a[]=2&a[]=3');
    const reversed = new URLSearchParams('a[]=2&a[x]=1');

    assert.deepEqual(convertURLSearchParamsToObject(params), {a: {x: '1', 0: '2', 1: '3'}});
    assert.deepEqual(convertURLSearchParamsToObject(reversed), {a: {0: '2', x: '1'}});
});
