///////////////
//// Notes ////
///////////////

/*
In case you need fine-grained control over the exponential backoff implementation, or need to implement it in a situation where it is not automatically provided.
/*

// https://github.com/softonic/axios-retry/issues/87


//////////////
//// Code ////
//////////////

const axios = require('axios');
const axiosRetry = require('axios-retry')

// exponential backoff on retries w/ customizable base interval
const baseInterval = 500; // milliseconds
const retryDelay = (retryNumber = 0) => {
    const seconds = Math.pow(2, retryNumber) * baseInterval;
    const randomMs = baseInterval * Math.random();
    return seconds + randomMs;
};

axiosRetry(axios, {
    retries: 2,
    retryDelay,
    // retry on Network Error & 5xx responses
    retryCondition: axiosRetry.isRetryableError
});


// Example GET w/ nice error handling

/*
  axiosRetry.get(encodeURI(`${domain}${path}`), config)
  .catch( (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // client never received a response, or request never left
      console.log(error.request);
    } else {
      // anything else
      console.log('Error', error.message);
    }
  })
*/
