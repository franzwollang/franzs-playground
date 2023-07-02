//@ts-nocheck

/////////////////////////////
//// Problem Explanation ////
/////////////////////////////

// When given a number 'n', return all pairs (a,b) such that a*b = sumFromOnetoN - a - b

//////////////////
//// Solution ////
//////////////////

const m = Math;

function gaussSum(n) {
	return (n * (n + 1)) / 2;
}

function dynamicEquality(n) {
	const upperBound = gaussSum(n);
	const sqrtUPB = m.floor(m.sqrt(upperBound));
	const results = [];

	for (smaller = sqrtUPB; smaller >= 1; smaller--) {
		larger = (upperBound - smaller) / (smaller + 1);
		if (larger < n) {
			if (larger % 1 == 0) {
				results.push([smaller, larger]);
			}
		} else {
			break;
		}
	}
	results.sort((pair1, pair2) => pair1[0] - pair2[0]);
	return results;
}

///////////////
//// Tests ////
///////////////

function searchByMinNumPairs(minNumOfPairs, limit) {
	for (let i = 1; i <= limit; i++) {
		const pairs = dynamicEquality(i);

		if (pairs.reduce((accum) => accum + 1, 0) >= minNumOfPairs) {
			console.log(
				`For n equal to ${i}, pairs (a,b) are: ` +
					JSON.stringify(dynamicEquality(i))
			);
		}
	}
}

searchByMinNumPairs(3, 1000);

///////////////////////
//// Post-Analysis ////
///////////////////////

// Complexity of o(n) for general problem of finding any such (a,b)

// Complexity reduced by a small constant when given constraint that a,b < n; small constant factor is sqrt( ( 3*sqrt(2) - 4 ) / ( 2*sqrt(2) ) )
