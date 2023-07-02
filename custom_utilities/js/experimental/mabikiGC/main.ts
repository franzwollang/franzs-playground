// @ts-nocheck

///////////////
//// Notes ////
///////////////

/*
Sketch out garbage collection system that is inherently multi-threaded (minimum 3 threads) based on 3 thread concurrent GC algorithm from paper "Very Concurrent Mark-&-Sweep Garbage Collection without Fine-Grain Synchronization".

Further, expand notion of built in bounding and tracking of allocations to reduce average need for GC (similar to Rust); in my concept though, would require a more advanced programming model that makes managing the possible call graph and actual call graph far more explicit, and therefore that makes this relatively easier to do for interpreter in a very flexible way.
*/

//////////////
//// Code ////
//////////////
