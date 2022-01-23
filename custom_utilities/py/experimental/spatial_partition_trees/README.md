# Geo Quad Tree

This is a modification and expansion of code originally found at https://scipython.com/blog/quadtrees-2-implementation-in-python/.

## Planning Notes

The intention is to take this working reference implementation of a quad tree and convert it into a 'spherical quad tree' (see paper "Indexing the Sphere with the Hierarchical Triangular Mesh").

After that, it would be fascinating to implement a general mechanism for handling Hilbert curve coordinates of arbitrary dimension and mapping them to a single array. I would then use it to make the spherical quad tree implementation blazing fast (for read queries), since using a space-filling curve technique will create cache locality of geographically near objects inside of a single giant, linear array. This would combine the practical performance of an array with the algorithmic performance of a tree search while still guaranteeing cache locality as the search process iterates.

The caveat, however, is that read queries will be as fast as possible but write operations will complicated to handle and potentially slow. So this Hilbert curve implementation would be for read heavy use cases only; for more write heavy or read/write balanced use cases, see

https://stackoverflow.com/questions/41946007/efficient-and-well-explained-implementation-of-a-quadtree-for-2d-collision-det

and

https://stackoverflow.com/questions/59795569/what-is-a-coarse-and-fine-grid-search.

Depending on how slow write operations become for the Hilbert curve implementation and whether this would conflict substantially with general machine learning use case needs, I may consider generalizing the code even further to handle high-dimensional data and have it serve as my go-to data structure for the unsupervised neural network algorithm that I am researching. See "Which Spatial Partition Trees are Adaptive to Intrinsic Dimension" as general reference for partition trees in the context of machine learning.
