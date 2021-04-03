/*
When given a number 'n', return all pairs (a,b) such that a*b = sumFromOnetoN - a - b
*/

const m = Math

function dynamicEquality(n){
  const upperBound = n*(n+1)/2;
  const sqrtUPB = m.floor(m.sqrt(upperBound));
  const results = [];

  for(smaller = sqrtUPB; smaller >= 1; smaller-- ){
    larger = (upperBound - smaller)/(smaller + 1);
    if (larger < n){
      if (m.abs(larger - m.round(larger)) == 0){
        results.push([smaller, larger]);
      }
    }
    else {
      break
    }
  }
  results.sort((pair1, pair2) => pair1[0] - pair2[0])
  return results;
}

/*
Complexity of o(n) for general problem of finding such (a,b)

Complexity reduced by a small constant when given constraint that a,b < n
small constant factor is sqrt( ( 3*sqrt(2) - 4 ) / ( 2*sqrt(2) ) )
*/
