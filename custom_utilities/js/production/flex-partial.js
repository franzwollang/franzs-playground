//partial application function that supports variadic, additive, and non-linear input partial application behaviors.


//supports variadic and additive behaviors
function autoPartial(fn) {
  const collect = (boundArgs, ...args) => {
    const collectedArgs = boundArgs.concat(args);
    return collectedArgs.length >= fn.length ? fn.apply(null, collectedArgs) : collect.bind(null, collectedArgs);
  };
  return collect.bind(null, []);
}


//supports non-linear argument input using an underscore '_' as a placeholder
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
