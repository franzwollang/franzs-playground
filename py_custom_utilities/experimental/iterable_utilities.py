
def chunk(iter, size = 2):
    return zip(*[iter]*size)
