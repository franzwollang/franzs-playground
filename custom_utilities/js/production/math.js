///////////////
//// Notes ////
///////////////

/*
Collection of useful math functions not found in Lodash or Just.
 */

//////////////
//// Code ////
//////////////

/**
 * True modulus operator that works in both positive and negative directions.
 */
function modulus(n, m) {
	return ((n % m) + m) % m;
}
