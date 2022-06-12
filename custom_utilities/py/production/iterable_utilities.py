###############
#### Notes ####
###############

'''

'''


##############
#### Code ####
##############

# small array chunking utility

def chunk(iter, size = 2):
    return zip(*[iter]*size)
