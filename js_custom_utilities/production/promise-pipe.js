// pipe function that chains promises instead of functions

async function promisePipe( ...asyncTasks) {
  const starterPromise = Promise.resolve();
  return await asyncTasks
  .reduce(
    (promiseAccumulator, currentTask) => promiseAccumulator.then(
      (...args) => currentTask(...args) ),
    starterPromise
  )
  .catch( (err) => {
        console.log(err);
        throw err;
    })
}
