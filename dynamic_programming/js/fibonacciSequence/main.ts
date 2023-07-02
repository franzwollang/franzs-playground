//@ts-nocheck

/////////////////////////////
//// Problem Explanation ////
/////////////////////////////

// generate the nth term of the fibonacci sequence

//////////////////
//// Solution ////
//////////////////

// sane solution for languages that don't have compilers which implement tail recursion (i.e. converting linear recursive chains into loops); complexity is o(n) time and o(1) space. Imperative style.

function loopFib(nth_element) {
	if (nth_element < 3) {
		return 1;
	}

	// initialize
	let previous_terms = [1, 1];
	let result = 0;

	for (n = 3; n <= nth_element; n++) {
		result = previous_terms[0] + previous_terms[1];
		previous_terms = [previous_terms[1], result];
	}

	return result;
}

// single recursive call that accesses both previous terms, or recurses until it can access both previous terms, then pops back up the stack; complexity is o(n) time and o(n) space since it uses 'n' stack frames, unless you have tail recursion reducing space complexity to o(1).

function recursiveFib(nth_element, previous_terms = [1, 1, 3]) {
	if (nth_element < 3) {
		return 1;
	}
	if (previous_terms[2] == nth_element) {
		const new_term = previous_terms[0] + previous_terms[1];
		return [previous_terms[1], new_term, nth_element + 1];
	} else {
		previous_terms = recursiveFib(nth_element - 1, previous_terms);
		const new_term = previous_terms[0] + previous_terms[1];
		return [previous_terms[1], new_term, nth_element + 1];
	}
}

///////////////
//// Tests ////
///////////////

// Tests using loop fib
console.log(loopFib(5));
console.log(loopFib(10));
console.log(loopFib(20));

// Tests using recursive fib
console.log(recursiveFib(5)[1]);
console.log(recursiveFib(10)[1]);
console.log(recursiveFib(20)[1]);
