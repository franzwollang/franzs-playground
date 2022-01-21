from collections import defaultdict, deque
from functools import partial


class DataDirectory:
    '''
    Recursive defaultdict-like class for organizing simple composite data types; allows for arbitrarily chained key set inserts and lookups, and returns an instance with associated containers.

    **Not fully implemented**
    '''
    __slots__ = '_table_', 'list', 'dict', 'set', 'deque'

    def __init__(self, has_list = True, has_dict = False, has_set = False, has_deque = False):
        kwargs = locals().copy()
        del kwargs['self']

        self._table_ = defaultdict(partial(DataDirectory, **kwargs))
        if has_list:
            self.list = list()
        if has_dict:
            self.dict = dict()
        if has_set:
            self.set = set()
        if has_deque:
            self.deque = deque()

    def __getitem__(self, key):
        return self._table_[key]

    def get_nested(self, *keys):
        if keys:
            key = keys[0]
            node = self._table_[key]
            return node if len(keys) == 1 else node.get_nested(*keys[1:])
