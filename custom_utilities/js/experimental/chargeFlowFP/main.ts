// @ts-nocheck

///////////////
//// Notes ////
///////////////

/*
Construct a transducer framework

sketch: pipeline = (producer, processor, consumer) => { return undefined }
Its return value is undefined because the value from the producer is piped into the consumer. The pipeline only exists to allow applying a composition of transducers to *either* the producer or consumer first, and then pulling (if applied to a consumer) data from the producer or then pushing (if applied to a producer) data to the consumer.

The pipeline can be understood as an analogy with charge flow: the first argument represents a point of high potential, the third argument represents a point of low potential. Thus, the "flow" of data (charge) is a positive current if the producer is passed as the first argument and a negative current if the consumer is passed as the first argument.
signature: (<source/sink>, <reducer>, <source/sink>)

Need:
- Function that "steps" the producer (calls next() on an iterator or awaits the next async value)
- Method of modifying a reducer and returning something that acts like a new reducer
- Transducer passes a new reducer callback that is a function made using the input reducer and the modification operations and takes a single value as an input
- Each new reducer returned from each transducer in the pipeline is wrapped in another layer of function
- The final output of the transducer pipeline is a function that (when resolved through all layers of function calls) acts like a reducer, taking an accumulator and value in and outputing a new accumulator
*/

//////////////
//// Code ////
//////////////

// define a currying function
// should use an implementation that depends on object self-reference rather than stack recursion, to improve performance
// also allows for flexibilty in passing multiple arguments at once rather than necessarily always sticking to "true" currying

// variadic, auto, and additive (semi-ring) partial function
function autoPartial(fn) {
	const collect = (boundArgs, ...args) => {
		const collectedArgs = boundArgs.concat(args);
		return collectedArgs.length >= fn.length
			? fn.apply(null, collectedArgs)
			: collect.bind(null, collectedArgs);
	};
	return collect.bind(null, []);
}

// new binding
const curry = autoPartial;

// https://medium.com/javascript-scene/transducers-efficient-data-processing-pipelines-in-javascript-7985330fe73d

// basic form of transducer
const transduce = curry((step, initial, transducer, foldable) =>
	foldable.reduce(transducer(step), initial)
);

// example map transducer
const map = (f) => (next) =>
	transducer({
		init: () => next.init(),
		result: (a) => next.result(a),
		step: (a, c) => next.step(a, f(c))
	});

// create map using generator syntax
function* map(func, input) {
	for (const val of input) {
		yield func(val);
	}
}

function* filter(pred, input) {
	for (const val of input) {
		if (pred(val)) {
			yield val;
		}
	}
}

async function discard(input) {
	for await (const i of input) {
	}
}
