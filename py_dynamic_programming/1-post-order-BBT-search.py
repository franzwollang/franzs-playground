# Problem explanation
# You are given the height 'h' of a balanced binary tree. The nodes of the balanced binary tree are labeled in order using post-order traversal. You are then given a list of node labels in the tree and asked to return a list corresponding to the respective parent nodes for those labels, or '-1' if the node is the root node for the tree of that height.

# analysis
# When manually drawing out a binary tree of height 3 and then 5 and labeling them using post-order traversal, it becomes clear that the labels of the left boundary of a tree are always 2**(level)-1 where level = 1 for a leaf node and level == height of tree for the root node. Similarly, the labels of the right boundary of a tree are always sequential decrements of 1 from the root node, i.e. ( root_node, root_node-1, root_node-2,...,root_node-(height-1) ).

# Crucially, these patterns hold for all subtrees as well. The tricky part is that the subtrees are not equivalent to root trees of the same height, since the method of labelling is not invariant to the original tree size.

# However, the differences between any two consecutive labels in the left boundary of the tree OR the left boundary of any subtree can be computed as a power of 2 relative to the level of the larger of the two nodes, i.e. for a tree of height 5 the root node is 31 and the next node in the left boundary is 15; the difference between 31 and 15 is 16 or 2**4; since the level of the root node (31) is 5, the difference can be computed as 2**(level-1)


def recursive_search(h, root, query_node, depth=0):
    # initializations
    left_boundary_node = root
    subtree_height = h-depth

    # left boundary logarithmic search
    for level in range(subtree_height, 0, -1):

        if level != subtree_height:
            left_boundary_node -= (2**level)

        if query_node == left_boundary_node:
            if level == subtree_height:
                return -1
            else:
                return left_boundary_node+(2**level)

        if level <= 2:
            return left_boundary_node

        left_descendant = left_boundary_node if level == 1 else left_boundary_node-(2**(level-1))

        if (query_node < left_boundary_node) & (query_node > left_descendant):

            if query_node >= left_boundary_node-(level-1): # check right boundary range
                return query_node+1
            else: # recurse on sub-tree
                return query_parent(h, left_boundary_node-1, query_node, depth+(subtree_height-level)+1)
        else:
            continue


def query_parents(h, q):
    # initializations
    root_node = (2**h)-1

    # return parents of query nodes
    return [recursive_search(h, root_node, query_node) for query_node in q]


print( solution(3, [1, 2, 4, 5, 3, 6, 7]) )
# --> [3, 3, 6, 6, 7, 7, -1]

print( solution(5, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) )
# --> [3, 3, 7, 6, 6, 7, 15, 10, 10, 14, 13, 13, 14, 15, 31]


# For any given query label, the memory complexity of this implementation is o(1). The time complexity strictly upper-bounded by logN since the maximum number of steps is a single path from the root to a leaf node which for a balanced binary tree is strictly of length logN; the average time complexity is rather lower since asymptotically half of all nodes in the tree are not leaf nodes, and thus the number of steps is smaller for them, plus there are optimizations like checking the right boundary range.
