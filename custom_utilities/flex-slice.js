//flex_slice is a generalized version of vanilla Array.prototype.slice(); it preserves all behavior of vanilla slice if constant integer start and end indices are passed. However, it also allows passing in binary test functions for the start and/or end bounds that allow for dynamic selection of the returned sub-array.

const flex_slice = function(start, end, data) {

  //no magic numbers
  const starting = 0;
  const ending = 1;
  const fixed = 0;
  const dynamic = 1;

  //declarations & initializations
  let mode = [fixed, fixed];
  const length = data.length;
  let start_index, start_func, end_bound, end_func;
  let start_guard = false;

  //identify type of start parameter; default to starting at zero; preserve negative index behavior of standard Array.prototype.slice()
  if ( typeof(start) == "number" ) {
    if (start < 0) {
      start = length + 1 + start;
    }
    start_index = start;
    mode[starting] = fixed;
  }
  else if ( typeof(start) == "function" ) {
    start_func = start;
    mode[starting] = dynamic;
  }
  else {
    start_index = 0;
    mode[starting] = fixed;
  }

  //identify type of end parameter; default to end at length; preserve negative index behavior of standard Array.prototype.slice()
  if ( typeof(end) == "number" ) {
    if (end < 0) {
      end = length - 1 + end;
    }
    end_bound = end;
    mode[ending] = fixed;
  }
  else if ( typeof(end) == "function" ) {
    end_func = end;
    mode[ending] = dynamic;
  }
  else {
    end_bound = length;
    mode[ending] = fixed;
  }

  switch ( JSON.stringify(mode) ) {

    case JSON.stringify([fixed, fixed]):
    if ( end_bound > length ) {
      throw new Error('End bound cannot be greater than length of array')
    }
    if ( end_bound <= start_index ) {
      throw new Error('End bound cannot be less than or equal to start index')
    }
    if ( start_index < 0 ) {
      throw new Error('The magnitude of negative indices cannot exceed the length of the array')
    }
    if ( start_index >= length ) {
      throw new Error('Start index cannot be greater than or equal to the length of array')
    }
    break;

    case JSON.stringify([fixed, dynamic]):
    if ( start_index < 0 ) {
      throw new Error('The magnitude of negative indices cannot exceed the length of the array')
    }
    if ( start_index >= length ) {
      throw new Error('Start index cannot be greater than or equal to the length of array')
    }

    for (let i = start_index;; i++) {
      if ( i == length-1 ) {
        end_bound = length;
        break;
      }
      if ( end_func(data[i], data[i+1]) ) {
        end_bound = i+1;
        break;
      }
    }
    break;

    case JSON.stringify([dynamic, fixed]):
    start_guard = true;

    if ( end_bound > length ) {
      throw new Error('End bound cannot be greater than length of array')
    }
    if ( end_bound < 2 ) {
      throw new Error('End bound cannot be less than two when the starting index is computed dynamically')
    }

    if ( end_bound >= length ) {
      for(let i = 0;; i++) {
        if ( i == end_bound-1 ) {
          break;
        }
        if ( start_func(data[i], data[i+1]) ) {
          start_index = i;
          start_guard = false;
          break;
        }
      }
    }
    else {
      for(let i = 0;; i++) {
        if ( i == end_bound ) {
          break;
        }
        if ( start_func(data[i], data[i+1]) ) {
          start_index = i;
          start_guard = false;
          break;
        }
      }
    }
    break;

    case JSON.stringify([dynamic, dynamic]):
    start_guard = true;

    for (let i = 0;; i++) {
      if ( i == length-1 ) {
        break;
      }
      if ( start_func(data[i], data[i+1]) ) {
        start_index = i;
        start_guard = false;
        break;
      }
    }

    for (let i = start_index;; i++) {
      if ( i == length-1 ) {
        end_bound = length;
        break;
      }
      if ( end_func(data[i], data[i+1]) ) {
        end_bound = i+1;
        break;
      }
    }
    break;
  }

  if (!start_guard) {
    return {
      image: data.slice(start_index, end_bound),
      interval: [start_index, end_bound]
    };
  }
  else {
    return {
      image: [],
      interval: [null, null]
    };
  }
}

module.exports = {
  flex_slice,
};
