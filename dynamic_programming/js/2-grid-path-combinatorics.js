/////////////////////////////
//// Problem Explanation ////
/////////////////////////////

// Given a two-dimensional array (grid), find how many unique possible paths there are between one corner and the other of the grid. Movement across the grid consists of incrementing (variously decrementing) one of the two indices.

//////////////////////
//// Pre-Analysis ////
//////////////////////

// base case analysis

// For grid of size (1,1), there is only one path (to maintain consistency when reducing to subproblems). A grid for which either dimension is zero will have zero paths. A grid for which either dimension is one will have only one path.
// The number of paths for a grid of size (n,m) is equal to the sum of the paths of the two subproblems (n-1,m) and (n,m-1).

// asymmetric case analysis

// 5,9
// 5,8   5,7   5,6   5,5

// 5,9 --> 4,9 + 5,8
// 5,8 --> 4,8 + 5,7
// 5,7 --> 4,7 + 5,6
// 5,6 --> 4,6 + 5,5 (symmetric)

// 4,9 --> 3,9 + 4,8
// 4,8 --> 3,8 + 4,7
// 4,7 --> 3,7 + 4,6
// 4,6 --> 3,6 + 4,5
// 4,5 --> 3,5 + 4,4 (symmetric)

// 3,9 --> 2,9 + 3,8
// 3,8 --> 2,8 + 3,7
// ...
// 3,4 --> 2,4 + 3,3 (symmetric)

// 2,9 --> 1,9 == 1 + 2,8
// ...
// 2,4 --> 1,4 == 1  + 2,3
// 2,3 --> 1,3 == 1 + 2,2 (symmetric)

// pattern: for 5,9, all branches are other 5,X plus descending 4,X
// for 4,9, all branches are other 4,X plus descending 3,X
// for 3,9, all branches are other 3,X plus descending 2,X
// etc...
// This means call 5,9 calls 4,9 calls 3,9 calls 2,9
// 2,9 calls 2,8 + 1 calls 2,7 + 1 etc... until 2,2 + 1
// 2,9 returns itself and a list of 2,X from 2,4 to 2,9
// 3,9 calls 3,8 + 2,9 calls 3,7 + 2,8 etc... until 3,3 + 2,4
// 3,9 returns itself and a list of 3,X from 3,5 to 3,9
// 4,9 calls 4,8 + 3,9 calls 4,7 + 3,8 etc... until 3,5 + 4,4
// 4,9 returns itself and a list of 4,X from 4,6 to 4,9
// 5,9 calls 5,8 + 4,9 calls 5,7 + 4,8 etc... until 4,6 + 5,5

// (virtual case) 1,9 returns 1,3 to 1,9
// So 2,9 returns from 2,4 to 2,9
// 3,9 returns from 3,5 to 3,9
// 4,9 returns from 4,6 to 4,9
// 5,9 is original problem

// 5,9 - 1,3 == 4,6
// 9 - 5 == 4
// 9 - (4-1) = 6    i.e. 6 to 9 is 4 elements of 4,X required by 5,9
// 4,9 - 1,4 == 3,5
// 9 - 4 == 5
// 9 - (5-1) == 5     i.e. 5 to 9 is 5 elements of 3,X required by 4,9
// 3,9 - 1,5 == 2,4
// 9 - 3 == 6
// 9 - (6-1) == 4     i.e. 4 to 9 is the 6 elements of 2,X required by 3,9

// So (big dim)-(small dim) == diff == number of elements of (smallDim - 1),(bigDim) that are required by (smallDim),(bigDim) before reaching symmetric case
// (bigDim)-(diff-1) == (start) for sequence (smallDim-1),(start) to (smallDim-1),(start+1) ... to (smallDim-1),(bigDim) required by (smallDim),(bigDim) in order to reach a symmetric case

// Symmetric cases can be calculated as two times the value of one of the sub-problems because of the symmetry of the subproblems.
// Choose the subproblem that decrements the smallDim
// For 5,5, this would be 4,5
// 4,5 is 3,5 + 4,4
// Thus symmetric cases can be reduced to evaluating 2*( (dim1-2, dim2) + (dim1-1,dim2-1) ) where (dim1-1,dim2-1) is the next lower symmetric case.

//////////////////
//// Solution ////
//////////////////

function branchingRecursion(a, b) {
  if (a == 0 || b == 0 ) {
    return 0;
  }
  if (a == 1 || b == 1 ) {
    return 1;
  }
  return branchingRecursion(a-1,b) + branchingRecursion(a,b-1);
}

function optimalMemoize(dim1, dim2) {

  if ( dim1 <= 2 || dim2 <= 2) {
    return branchingRecursion(dim1, dim2);
  }

  const symmetric = (dim1 == dim2);
  const oneOff = ( Math.abs(dim1-dim2) == 1 )

  if ( oneOff ) {
    return optimalMemoize(dim1-1,dim2) + optimalMemoize(dim1,dim2-1);
  }

  if ( !symmetric ) {
    //sort dimensions ascending
    const compare = (a,b) => {
      return a - b;
    }
    const topDimsSorted = [dim1,dim2].sort(compare)
    var topSmallDim = topDimsSorted[0];
    var topBigDim = topDimsSorted[1];
  }
  else {
    var topSmallDim = dim1;
    var topBigDim = dim2;
  }

  //initializations
  if ( symmetric ) {
    var loops = topSmallDim - 2;
    var diff = topBigDim - topSmallDim;
    var maxTerms = loops + 1;
    var prevStack = new Array(maxTerms).fill(1); //all (1,X) evaluate to 1
  }
  else {
    var loops = topSmallDim - 1;
    var diff = topBigDim - topSmallDim;
    var maxTerms = loops + diff;
    var prevStack = new Array(maxTerms).fill(1); //all (1,X) evaluate to 1
  };

  let prevSymCase = 1; //value of (1,1)
  let currentSymCase = 2; //value of 2*( prevSymCase + (0,2) );
  let result, liftingTerm;

  for (smallDim = 0; smallDim < loops; smallDim++) {
    for ( bigDim = 0; bigDim < prevStack.length; bigDim++ ) {
      if ( bigDim == 0 ) {
        liftingTerm = prevStack[bigDim];
        prevStack[bigDim] = prevStack[bigDim] + currentSymCase;
      }
      else {
        prevStack[bigDim] = prevStack[bigDim] + prevStack[bigDim-1];
      }
    };

    prevStack.shift()
    prevSymCase = currentSymCase;
    currentSymCase = 2*( prevSymCase + liftingTerm )
  };

  if ( symmetric ) {
    return currentSymCase;
  }
  else {
    return prevStack[diff-2];
  };
}

///////////////
//// Tests ////
///////////////

console.log("Tests using inefficient branching recursion")
console.log('(0, 4) = ' + branchingRecursion(0, 4) ); //0
console.log('(1, 2) = ' + branchingRecursion(1, 2) ); //1
console.log('(2, 2) = ' + branchingRecursion(2, 2) ); //2
console.log('(2, 3) = ' + branchingRecursion(2, 3) ); //3
console.log('(3, 3) = ' + branchingRecursion(3, 3) ); //6
console.log('(4, 3) = ' + branchingRecursion(4, 3) ); //6
console.log('(3, 5) = ' + branchingRecursion(3, 5) ); //15
console.log('(6, 6) = ' + branchingRecursion(6, 6) ); //252
console.log('(5, 6) = ' + branchingRecursion(5, 6) ); //126
console.log('(5, 9) = ' + branchingRecursion(5, 9) ); //495
console.log('(4, 11) = ' + branchingRecursion(4, 11) ); //286
console.log('(10, 15) = ' + branchingRecursion(10, 15) ); //817190

console.log("Tests using optimal memoization")
console.log('(0, 4) = ' + optimalMemoize(0, 4) ); //0
console.log('(1, 2) = ' + optimalMemoize(1, 2) ); //1
console.log('(2, 2) = ' + optimalMemoize(2, 2) ); //2
console.log('(2, 3) = ' + optimalMemoize(2, 3) ); //3
console.log('(3, 3) = ' + optimalMemoize(3, 3) ); //6
console.log('(4, 3) = ' + optimalMemoize(4, 3) ); //6
console.log('(3, 5) = ' + optimalMemoize(3, 5) ); //15
console.log('(6, 6) = ' + optimalMemoize(6, 6) ); //252
console.log('(5, 6) = ' + optimalMemoize(5, 6) ); //126
console.log('(5, 9) = ' + optimalMemoize(5, 9) ); //495
console.log('(4, 11) = ' + optimalMemoize(4, 11) ); //286
console.log('(10, 15) = ' + optimalMemoize(10, 15) ); //817190

console.log("Very large tests using optimal memoization")
console.log('(18, 18) = ' + optimalMemoize(18, 18) ) //2333606220
console.log('(14, 27) = ' + optimalMemoize(14, 27) ) //8122425444
console.log('(42, 41) = ' + optimalMemoize(42, 41) ) //2.1239229042439588e+23

///////////////////////
//// Post-Analysis ////
///////////////////////

// For grid (n,m) where n <= m, time complexity is o(n) and upper bound space complexity is o(m)
// This is better than the o(n) time complexity and o(n*m) space complexity of the straightforward approach of memoizing all intermediate values --potentially a quadratic reduction in space usage for !(n << m). It's also obviously much better than the o(2^m) time and space complexity of the naive branching recursive approach.

// Creating a fully recursive version of this space optimal algorithm (instead of the above imperative, bottom-up implementation) would be impossible with existing languages, given the loopy structure of the term dependencies. The language used would have to support a generalized directed graph function call structure with frame merging and splitting (rather than a standard stack function call tree structure with only splitting).

// Along similar lines, a purely functional version would be difficult without reverting back to o(n*m) space complexity by iterating over an array of "loops" number of arrays of max size "maxTerms". Would have to be able to parameterize the number of loops as a single number rather than as an outer array of arrays. Could use iterators that return new iterators? Same problem, would end up with a chain of n iterators that would have to be iterated upon n times to resolve; would need a loop in one form or another to iterate through them, or could use recursion in a language with tail recursion (but that again just converts it into a loop).
