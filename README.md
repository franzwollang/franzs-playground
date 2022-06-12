# Franz's Playground

This is a repository of various programming challenges, custom tools, and experiments.

## Organization

The repository is organized according to functional topics:
- Custom Utility Classes & Functions / Experimental Modules / Algorithmic & Data Structure Experiments
- Dynamic Programming Challenges
- Invocations / a.k.a "stuff you rarely need and always have to look up"

Every topic is further subdivided by the language used:
- JavaScript
- Python
- BASH

The custom utilities topic in particular has a further subdivision indicating whether something is just a sketch/experiment or it is suitable for use in production code:
- experimental
- production

## Custom Utilities

In `custom_utilities > js > production`, you can find `flex-slice.js` and `promise-pipe.js`. I've found both of these tools to be invaluable. promisePipe is extremely useful for setting up asynchronous pipelines. flexSlice is a bit more niche, but really shines when you have to do compute complicated multi-level array operations.

In `custom_utilities > py > experimental`, you can find a working implementation of a quad tree for geographic coordinate points if that interests you. There is also `permission-hunter.py`, an incomplete implementation of an RBAC utility library for APIs with a new twist --adding role hierarchies with the intention of making managing permissions on API endpoints more manageable and providing a foundation for an interactive tool to better help people visualize and modify the permissions assigned to roles.

## Dynamic Programming

In `dynamic_programming > js`, you can find `2-grid-path-combinatorics.js`. This was a challenging problem to write a memory optimal solution for (rather than just blindly applying memoization) and required utilizing dynamically-sized stacks for sub-problems, so I am proud of this one.

## Invocations

There's nothing too interesting in here yet.