const fetch = require('isomorphic-fetch');
const promiseRetry = require('./lib/promise-retry');

const fetchDemo = async (url) => {
    const handler = {
        before: (u) => console.log(u, 'before fetch'),
        ok: (u, r) => console.log(u, `${r.status} ${r.statusText}`),
        ng: (u, r) => console.log(u, `${r.status} ${r.statusText}`),
        retry: (u, n) => console.log(u, 'retry', n, 'remaining'),
        error: (u, e) => console.log(u, 'error', e.message),
        after: (u) => console.log(u, 'after fetch'),
    };

    const rfetch = promiseRetry(fetch, {
        retries: 3,
        retryDelay: 3000,
        retryCallback: (n) => handler.retry(url, n),
    });

    try {
        handler.before(url);
        const response = await rfetch(url);
        if (response.ok) {
            handler.ok(url, response);
        } else {
            handler.ng(url, response);
        }
    } catch (e) {
        handler.error(url, e);
    } finally {
        handler.after(url);
    }
};

console.log('start');
Promise.all([
    fetchDemo('https://example.com/'),
    fetchDemo('https://example.com/404'),
]).then(() => {
    console.log('end');
});
