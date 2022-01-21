import sys

def export(fn):
    '''
    Decorator alternative to explicitly listing all public module members in __all__
    '''
    mod = sys.modules[fn.__module__]
    if hasattr(mod, '__all__'):
        mod.__all__.append(fn.__name__)
    else:
        mod.__all__ = [fn.__name__]
    return fn
