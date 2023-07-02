// @ts-nocheck

///////////////
//// Notes ////
///////////////

/*
context-free parser vs. context-aware parser; can build framework for context-aware parser as collection of context-free parsers joined by some sort of universal relations/representations?

To handle situations with nested contexts, create method of spawning new threads for new contexts and binding these sub-contexts to continuations that can be later resolved when containing contexts are decidable. Resolving a context continuation folds spawned threads back into parent.

Create lexer/formatter as separate process that runs constantly and handles real-time mediation betweeen human-friendly display format and parser friendly lexed and structured format.
*/

// https://v8.dev/blog/scanner
// https://v8.dev/blog/preparser
// https://medium.com/@jnkrtech/building-a-functional-parsing-library-in-javascript-and-flow-7d738088237f

//////////////
//// Code ////
//////////////

function success(result, input) {
	return [[result, input]];
}

function fail(result, input) {
	return [];
}

function satisfy(test) {
	return (input) => {
		return input.length === 0
			? fail(input)
			: test(input[0])
			? success(input[0], input.slice(1))
			: fail(input);
	};
}

const parseABCD = satisfy((x) => ["a", "b", "c", "d"].includes(x));

parseABCD("asdf".split("")); // returns [['a', ['s', 'd', 'f']]]
parseABCD([]); // returns []
parseABCD(["Z"]); // returns []

function character(c) {
	return satisfy((x) => x === c);
}

function flatMap(arr, fn) {
	return arr.reduce((arr, x) => arr.concat(fn(x)), []);
}

function then(first, second) {
	return (input) => {
		return flatMap(first(input), ([r, remainder]) =>
			second(remainder).map(([s, secondRemainder]) => [
				[r, s],
				secondRemainder
			])
		);
	};
}

function alt(left, right) {
	return (input) => left(input).concat(right(input));
}

function map(fn, p) {
	return (input) => {
		return p(input).map(([result, remaining]) => [fn(result), remaining]);
	};
}

function lazyThen(first, second) {
	return (input) => then(first, second)(input);
}

function bracket(left, middle, right) {
	return (input) =>
		alt(
			map((m) => [[], m], middle),
			map(
				([l, [[lrs, m], r]]) => [[[l, r]].concat(lrs), m],
				then(left, then(bracket(left, middle, right), right))
			)
		)(input);
}

const parenOneBracketed = map(
	(parens, one) => parens.reduce((acc, _) => new ParenPair(acc), new One()),
	bracket(character("("), character("1"), character(")"))
);

function many(p) {
	return alt(
		map(
			([r, rs]) => [r].concat(rs),
			then(p, (input) => many(p)(input))
		),
		(input) => success([], input)
	);
}

function some(p) {
	return map(
		([r, rs]) => [r].concat(rs),
		then(p, (input) => many(p)(input))
	);
}

// example parser combinators

// Eat any amount of whitespace, returning nothing
whitespace: Parser<null>;

// Parse a sequence of items separated by some junk,
// like a "," - separated list
// separatedBy: (Parser<R>, Parser<S>) => Parser<Array<R>>;

// Parse a sequence of items separated by some important thing
// separatedByImportant: (Parser<R>, Parser<S>) => Parser<[R, Array<[S, R]>]>
