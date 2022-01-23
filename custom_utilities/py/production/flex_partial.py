
###############
#### Notes ####
###############

'''

'''

# https://stackoverflow.com/a/66274908


##############
#### Code ####
##############

from functools import partial

class bind(partial):
    """
    Partial application function that support non-linear input of arguments using Ellipsis (...) as a placeholder
    """
    def __call__(self, *args, **keywords):
        keywords = {**self.keywords, **keywords}
        iargs = iter(args)
        args = (next(iargs) if arg is ... else arg for arg in self.args)
        return self.func(*args, *iargs, **keywords)
