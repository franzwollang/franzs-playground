///////////////
//// Notes ////
///////////////

/*
Partial application functions that support variadic, additive, auto, and/or non-sequential input partial application behaviors.
*/


//////////////
//// Code ////
//////////////

// standard partial with variadic and additive behaviors
function partialApply(fn, ...args) {
  return fn.bind(null, ...args);
 }


// https://medium.com/@jnkrtech/partial-function-application-in-javascript-and-flow-7f3ca87074fe

// supports variadic, additive, and auto behaviors
function autoPartial(fn) {
  const collect = (boundArgs, ...args) => {
    const collectedArgs = boundArgs.concat(args);
    return collectedArgs.length >= fn.length ? fn.apply(null, collectedArgs) : collect.bind(null, collectedArgs);
  };
  return collect.bind(null, []);
}


// supports variadic and auto behaviors
// supports non-sequential argument input using an underscore '_' as a placeholder
function partialFactory() {
  const hole = {};

  function mergeArgs(unmerged, merged, args) {
    return (
      !unmerged.length && !args.length ? merged
    : !args.length                     ? mergeArgs(unmerged.slice(1), merged.concat([unmerged[0]]), args)
    : !unmerged.length                 ? mergeArgs(unmerged, merged.concat([args[0]]), args.slice(1))
    : unmerged[0] === hole             ? mergeArgs(unmerged.slice(1), merged.concat([args[0]]), args.slice(1))
    : /* unmerged is not a hole       */ mergeArgs(unmerged.slice(1), merged.concat([unmerged[0]]), args));
  }

  return {
    _: hole,
    holePartial: (fn, ...args) => {
      const initialArgs = args;

      return (...args) => {
        const mergedArgs = mergeArgs(initialArgs, [], args);
        return fn.apply(null, mergedArgs);
      };
    }
  };
}


// Note to self: write a new version that supports variadic, additive, and non-sequential behaviors, but not auto; control over the timing of function application can be an important tool to have in some FP scenarios.