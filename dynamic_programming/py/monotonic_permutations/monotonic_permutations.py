###

###

### INCOMPLETE SOLUTION ###

###

###

#############################
#### Problem Explanation ####
#############################

# Given an integer 'n' that represents a certain number of blocks, compute the number of possible valid staircases that can be constructed using exactly that number of blocks given the following additional constraints: 1) a staircase must have at least two steps 2) each step must be at least one block higher than the previous step

# Alternative description: compute the size of the subset of all strictly monotonic permutations of the natural numbers such that their sum equals some value 'n' and the magnitude/cardinality of the subset is greater than 1.


######################
#### Pre-Analysis ####
######################

# The minimum value of n is 3, since that allows for 2 steps of size 1 and 2 respectively.

# The minimum value of n for some number of steps is given by the Gauss sum of the number of steps. So the maximum number of steps possible for a given n can be calculated by finding the smallest Gauss sum that is greater than or equal to n.

# We may introduce an abstraction: there is always a base (the minimum size staircase for some specific number of steps) and the free blocks (the blocks leftover from n after constructing the base).

# If we restrict ourselves to only allowing 2 steps, then the total number of possible combinations of heights for the two steps can be calculated directly as floor(free_blocks/2) + 1.

# We can then try to setup up a procedure to decompose any given problem for some n into sub-problems. The base case will be the case of two steps and some number of free blocks. We then frame the top-level problem in terms of the maximum number of steps possible for the given n (the largest base) and whatever free blocks remain, the next lower sub-problem as max_steps-1 with 0 free blocks (initially), the next lower sub-problem as max_steps-2 with 0 free blocks (initially), etc...

# We start our computation by looking at the largest base and the free blocks. We can then stack all the free blocks onto the last step s and remove them one by one, adding them to free blocks of the next lower sub-problem, then doing the same for this sub-problem, etc...

# Let us denote each sub-problem in terms of the steps and the free blocks as P(S, F) where S is steps and F is free blocks. So we begin the top-level with attempting to compute P(max_steps, f_{max}) where f_{max} = n - gauss_sum(max_steps). The next lower sub-problem is then *initially* P(max_steps-1, 0), then the next lower is then *initially* P(max_steps-2, 0), etc...

# To compute our top-level problem of P(max_steps, f_{max}), we must tabulate one combination for each block we remove (plus one) times the number of combinations in the next lower sub-problem, where the number of combinations in the next lower sub-problem is also then computed recursively in the same manner (i.e. by stacking all free blocks onto the last step s and removing them one by one and adding them to the next lower sub-problem, tabulating one combination for each block we remove (plus one) times the number of combinations in the next lower sub-problem, etc...).

# However, a major caveat here is that for sub-problems we cannot stack all the free blocks on the last step however we like. The constraint on valid staircases demands that the height of the last step s of a sub-problem must be strictly less than the height of the last step s in the one level higher sub-problem. This means that we must always calculate a maximum height for the last step s for every sub-problem. For the top-level problem, the maximum height is determined as max_steps + free_blocks. But for every other sub-problem, the maximum height of the last step s is dependent on the current height of the last step s+1 in the one level higher sub-problem and it must be calculated dynamically for every P(*, f).

# Let us then introduce another new abstraction in order to better reason about the constrained maximum heights of last steps S for sub-problems: the maximum number of blocks that can be added as free blocks to a next lower level sub-problem s-1 without violating the height constraint imposed by the current sub-problem s with some number of free blocks f is equal to gauss_sum(h-1) - gauss_sum(s-1) where h = s + f. This expression is a quadratic function of the current height of the last step s before we remove another block. Let us call this expression the 'absorption' of a sub-problem when the height of its last step s-1 is constrained to be h_{s} - 1. The absorption of a sub-problem s-1 is equivalent to the largest number of free blocks it can accept f_max without its last step violating the height constraint imposed by h_{s}.

# We can then describe the top level problem as P(max_steps, f_{max}) and every lower level sub-problem as P(s, absorption(h-1, s-1)) where s is relative to a one level higher sub-problem s+1 and h is the current height of s+1.

# The number of computational steps for each sub-problem increases multiplicatively by the difference between the minimum and maximum height for that sub-problem for each successive lower sub-problem. This means that the number of multiplicative factors for a sub-problem governing the total number of computational steps is the number of stair steps s for that sub-problem and the value of each multiplicative factor is upper bounded by the some linear function of the absorption of the subproblem for a given height constraint imposed by h_{s+1}.

# This should mean the time complexity is upper bounded as o(n^(3/2)). However, this is only the time complexity per top-level problem. We actually have to compute s top-level problems, since there are valid staircases with fewer steps than then maximum numbers of steps (all the way down to 2 steps minimum). This introduces another factor of o(n^(1/2)) for a total time complexity of o(n^2) if each top-level problem is computed independently.

# Since there is much overlap between sub-problems for a given n, adding memoization should reduce the overall time complexity. What is the polynomial (?) factor by which the time complexity is reduced??? It could at best be an o(n^(1/2)) reduction; wouldn't make sense if the overall complexity could be less than o(n^(3/2)) since this is the complexity for a single top-level problem. Would this mean the additional memory complexity of the memoization is also o(n^(1/2)) at worst?

# The regular memory complexity of the problem (before memoization) should be o(n^(1/2)) since the longest chain of sub-problems is bounded by the number of steps. With memoization as an additive factor, overall memory complexity would still be o(n^(1/2)).

# Any similarities or ways of relating this problem to bounds on sorting algorithms?


##########################
#### Franz's Solution ####
##########################

import math as m


def gauss_sum(n):
    return int(n * (n + 1) / 2)


def absorption(s, h):
    return h * s - s**2


def step_loop(memo, step, free_blocks, h_max=None):
    # base cases
    if free_blocks == 0:
        return 1

    if step == 2:
        return m.floor(free_blocks / 2) + 1

    # if root level call, initialize h_max
    if not h_max:
        h_max = step + free_blocks

    combinations = 0

    # setting h_min to 'step' height in loop below is only okay because the
    # "leftover check" prevents the loop below from going below true h_min;
    # h_min is dependent on both s-1 and f, so cannot be calculated ahead of time.
    for height in range(h_max, step - 1, -1):
        used_blocks = height - step
        remainder = free_blocks - used_blocks

        if remainder < 0:
            # no free blocks available for this height
            continue

        leftover = remainder - absorption(step - 1, height - 1)

        # if leftover >= 0, no degrees of freedom remaining
        if leftover > 0:
            # "sum to N" constraint violated
            break

        if (step - 1, remainder) in memo:
            print(f"{(step-1, remainder)} found in memo")
            combinations += memo[(step - 1, remainder)]
        else:
            result = step_loop(memo, step - 1, remainder, h_max=height - 1)
            memo[(step - 1, remainder)] = result
            combinations += result

    return combinations


def monotonic_permutations(total, step=0):
    memo = dict()
    max_steps = int(m.floor((m.sqrt(1 + 8 * total) - 1) / 2))
    combinations = 0

    for step in range(max_steps, 1, -1):
        free_blocks = total - gauss_sum(step)

        if (step, free_blocks) in memo:
            combinations += memo[(step, free_blocks)]
        else:
            result = step_loop(memo, step, free_blocks)
            memo[(step, free_blocks)] = result
            combinations += result

    return combinations


###############
#### Tests ####
###############

# Test cases
test_cases = [
    (3, 1),
    (5, 2),
    (6, 3),
    (10, 9),
    (15, 26),
    (25, 141),
    (50, 3657),
    # (200, 487067745)
]

for x, expected in test_cases:
    result = monotonic_permutations(x)
    print(f"monotonic_permutations({x}) returns {result}; it should return {expected}")


# https://math.stackexchange.com/questions/2055775/finding-all-possible-designs-for-a-staircase

#####################################
#### Unreadable Example Solution ####
#####################################

# def gauss_sum(n):
#     return n*(n+1)/2


def solution(n, base=None, memo=dict()):
    key = (n, base)
    print(f"{key}")
    if key in memo:
        print(f"Found {key} in memo")
        return memo[key]

    base = min(base, n) if base else n - 1
    if n > gauss_sum(base):
        return 0

    if n < 3:
        return 2

    count = 0
    while True:
        nextLevels = solution(n - base, base - 1, memo)
        if nextLevels == 0:
            break
        count += nextLevels
        base = base - 1

    memo[key] = count
    return count
