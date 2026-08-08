/**
 * Execute a promise-returning function. If the promise isn't resolved or
 * rejected in `ms` milliseconds, the promise is rejected.
 *
 * @param {number} ms Timeout after this many milliseconds
 * @param {function} f Function that returns a promise
 * @returns {Promise}
 */
// options with timeout settings to timeout executing

// a particular async function
export interface Options {
  retry: number,
  timeout: number
}

export async function timeout(ms: number, f: () => Promise<string>) : Promise<string> {
  const promise = f();

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'));
    }, ms);

    promise.then(resolve, reject);
  });
}

/**
 * Execute a promise-returning function. If the promise is rejected, retry the
 * function call `count` times.
 *
 * @param {number} count Number of times to retry
 * @param {function} f Function that returns a promise
 * @returns {Promise}
 */
export async function retry(count: number, f: () => Promise<string>) {
  if (count > 0) {
    try {
      return await f();
    } catch (e) {
      return retry(count - 1, f);
    }
  }

  return Promise.reject();
}

/* Execute a promise-returning function.
 *
 * @param {ControlFlowOptions} options Invocation options
 * @param {function} f Function that returns a promise
 * @returns {Promise}
 */
export async function invoke(options: Options, f: () => Promise<string>) {
  return retry(options.retry || 1, () => timeout(options.timeout || 0, f));
}
