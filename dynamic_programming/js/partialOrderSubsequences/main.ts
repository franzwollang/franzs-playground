// @ts-nocheck

/////////////////////////////
//// Problem Explanation ////
/////////////////////////////

// given two strings, find if the first string matchs one or more times as a (partially ordered) subsequence of the second string and return the matches.

//////////////////////
//// Pre-Analysis ////
//////////////////////

// For string1 = n and string2 = m, n>=2 and n_1 =/= n_2, an example pathological scenario is entire string2 is the first character of string1 repeated m times. This will lead to looping over string2 m(m+1)/2 times or o(m^2) time complexity, even though there are obviously no possible matches.

// This can be avoided by keeping a dictionary keyed to each unique character in str1 containing arrays. Each array records the indices of str2 at which an incidence of the keyed character occurs. Then one can iterate over str1 and use the dictionary of incidence arrays to map out partial matches recursively, entering a new loop for each character in str1 over the corresponding incidence array and recursing to longer partial matches by going to the next character in str1 and looking for incidences that have index values larger than the index value of the incidence of the previous character in the pattern (i.e. str1).

// This technique would require creating a dictionary of arrays with total elements across all arrays equal to m, in time o(m). This makes the additional space complexity on top of the size of the input arrays due to the data structure equal to o(m).

// The time complexity would depend on how much overlap of the partial matches there is --and thus the average branching factor of the imagined combined tree of all the recursive call paths traversed depth first by the algorithm (upper bounded by m)--, along with the average length of partial matches corresponding to leafs of the recursion tree. In the worst case, the average branching factor is a large fraction of m and the average length of leaf (terminating) partial matches is a large fraction of n; this would create an imagined recursion call tree with o(m^n) nodes to be traversed and in expectation o(n) additional memory for the maximum size of the call stack.

//////////////////
//// Solution ////
//////////////////

// only works at the moment for number of arrays equal to 2, but can be generalized; first string is the query string, second string is the test string
function subsequenceMatch(mode, ...args) {
	if (mode == "large") {
		var matches = 0;
	} else {
		var matches = [];
	}

	function recursiveMatch(
		str1,
		incidenceDict,
		str1Ind = 0,
		prevIncidence = 0,
		candidate = []
	) {
		if (str1Ind > str1.length - 1) {
			if (mode == "large") {
				matches += 1;
			} else {
				matches.push(candidate);
			}
			return;
		}

		const charIncidences = incidenceDict[str1[str1Ind]];

		charIncidences.forEach((incidence) => {
			if (incidence > prevIncidence || (incidence == 0 && str1Ind == 0)) {
				recursiveMatch(str1, incidenceDict, str1Ind + 1, incidence, [
					...candidate,
					incidence
				]);
			}
		});
	}

	const arrayArgs = args.map((string) => {
		return string.split("");
	});

	const str1 = arrayArgs[0];
	const str2 = arrayArgs[1];

	const incidenceDict = str1.reduce((dict, char) => {
		dict[char] = [];
		return dict;
	}, {});

	str2.forEach((char, index) => {
		if (incidenceDict.hasOwnProperty(char)) {
			incidenceDict[char].push(index);
		}
	});

	recursiveMatch(str1, incidenceDict);
	return matches;
}

///////////////
//// Tests ////
///////////////

console.log(
	`\nThe answer for ('tpwx','tpwx') is ` +
		JSON.stringify(subsequenceMatch("small", "tpwx", "tpwx"))
);
// [[0,1,2,3]]

console.log(
	`\nThe answer for ('tpwx','tpwxapplebwananacwherrypeachx') is ` +
		JSON.stringify(
			subsequenceMatch("small", "tpwx", "tpwxapplebwananacwherrypeachx")
		)
);
// [[0,1,2,3],[0,1,2,28],[0,1,10,28],[0,1,17,28],[0,5,10,28],[0,5,17,28],[0,6,10,28],[0,6,17,28]]

console.log(
	`\nThe answer for ('tpwx','teflpawmvwsebx') is ` +
		JSON.stringify(subsequenceMatch("small", "tpwx", "teflpawmvwsebx"))
);
// [[0,4,6,13],[0,4,9,13]]

console.log(
	`\nThe answer for ('xtpwx','xteflpawmvwsebx') is ` +
		JSON.stringify(subsequenceMatch("small", "xtpwx", "xteflpawmvwsebx"))
);

console.log(
	`\nThe answer for ('xteflpawmvwsebx','xtpwx') is ` +
		JSON.stringify(subsequenceMatch("small", "xteflpawmvwsebx", "xtpwx"))
);
// [[0,1,5,7,14],[0,1,5,10,14]]

console.log(
	`\nThe answer for ('aaa','aaaaaaa') is ` +
		JSON.stringify(subsequenceMatch("small", "aaa", "aaaaaaa"))
);
// [[0,1,2],[0,1,3],[0,1,4],[0,1,5],[0,1,6],[0,2,3],[0,2,4],[0,2,5],[0,2,6],[0,3,4],[0,3,5],[0,3,6],[0,4,5],[0,4,6],[0,5,6],[1,2,3],[1,2,4],[1,2,5],[1,2,6],[1,3,4],[1,3,5],[1,3,6],[1,4,5],[1,4,6],[1,5,6],[2,3,4],[2,3,5],[2,3,6],[2,4,5],[2,4,6],[2,5,6],[3,4,5],[3,4,6],[3,5,6],[4,5,6]]

console.log(
	`\nThe answer for ('aaaaaaa','aaaaaaaaaaaaaaaa') contains ` +
		subsequenceMatch("large", "aaaaaaa", "aaaaaaaaaaaaaaaa") +
		" matches"
);
// 11440 matches

// console.log(`\nThe answer for ('aaaaaaaaaa','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') contains ` + subsequenceMatch('large','aaaaaaaaaa','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa') + ' matches');
//254 186 856 matches

///////////////////////
//// Post-Analysis ////
///////////////////////

// While this algorithm is worst-case exponential in n, it is memory efficient enough to allow for the computation of subsequences over large m.

// It is not possible to improve the time complexity of this algorithm using deterministic calculations (due to the lack of constraints imposed when allowing the query string to be a partially ordered substring of the match string). Could it be improved using statistical techniques? I believe statistical techniques could improve the average time complexity, but I doubt they would be able to improve the worst-case bounds.
