// @ts-nocheck

// https://medium.com/@jnkrtech/an-introduction-to-function-fixed-points-with-the-y-combinator-e7bd4d00fb62

// define y combinator
var y = function (f) {
	var g = function (h) {
		return function (x) {
			return f(h(h))(x);
		};
	};
	return g(g);
};

// more generally
var y = function (f) {
	return (function (g) {
		return g(g);
	})(function (h) {
		return function (...args) {
			return f(h(h)).apply(null, args);
		};
	});
};

// https://medium.com/@jnkrtech/variations-on-the-y-combinator-and-recursion-cd8d2a7f1a2c

// memoized y-combinator
function yMemoized<A, B>(fn: ((A) => B) => (A) => B): (A) => B {
	function recursive(memory: Map<string, B>, arg: A): B {
		const cacheKey = JSON.stringify(arg);

		// Casts are because Flow doesn't treat memory.has as a type
		// refinement, and thinks `memory.get` might return undefined
		if (memory.has(cacheKey)) {
			return ((memory.get(cacheKey): any): B);
		}

		const completeFunction: (A) => B = fn(recursive.bind(null, memory));

		const result = completeFunction(arg);
		memory.set(cacheKey, result);

		return result;
	}

	return recursive.bind(null, new Map());
}

// limited recursion depth y-combinator
function finiteY<A, B>(fn: ((A) => B) => (A) => B, max: number): (A) => B {
	function recursive(invocationCount: number, arg: A): B {
		if (invocationCount > max) {
			throw new Error("Recursion went too many levels deep!");
		}

		const completeFunction: (A) => B = fn(
			recursive.bind(null, invocationCount + 1)
		);

		return completeFunction(arg);
	}

	return recursive.bind(null, 0);
}

// logging y-combinator
function noisyY<A, B>(fn: ((A) => B) => (A) => B): (A) => B {
	function recursive(arg: A): B {
		console.log("called function with ", arg);

		const completeFunction: (A) => B = fn(recursive);

		const result = completeFunction(arg);

		console.log("Results of arg ", arg, " was ", result);

		return result;
	}

	return recursive;
}

//asynchronous recursion y-combinator
//Note to self: implement it, bitch
