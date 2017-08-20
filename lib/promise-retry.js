const defaultOption = {
    retries: 0,
    retryDelay: 0,
    retryCallback: () => {}
};

module.exports = (callbackAsync, option = defaultOption) => (...args) => {
    const retriedFetch = new Promise((resolve, reject) => {
        const wrappedFetch = async (n) => {
            try {
                resolve(await callbackAsync(...args));
            } catch (err) {
                if (n > 0) {
                    setTimeout(() => {
                        const residue = n - 1;
                        option.retryCallback(residue);
                        wrappedFetch(residue);
                    }, option.retryDelay);
                } else {
                    reject(err);
                }
            }
        };
        wrappedFetch(option.retries);
    });
    return retriedFetch;
};
