///////////////
//// Notes ////
///////////////

/*
Pipe function that chains promises instead of functions.
*/

//////////////
//// Code ////
//////////////

async function promisePipe(...asyncTasks) {
	const starterPromise = Promise.resolve();
	return await asyncTasks
		.reduce(
			(promiseAccumulator, currentTask) =>
				promiseAccumulator.then((value) => currentTask(value)),
			starterPromise
		)
		.catch((err) => {
			console.log(err);
			console.log(asyncTasks);
			throw err;
		});
}
