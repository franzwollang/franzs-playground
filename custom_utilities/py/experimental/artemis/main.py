###############
#### Notes ####
###############

"""
Can define a forest of role hierarchies (trees); in each tree, roles form the nodes of the tree and any parent node subsumes all permissions of its descendant nodes. A role may be found in more than one hierarchy#tree. Roles are communicated as a two-element tuple containing as its first element the role label and its second element an array of tree heirarchies#tree labels.

The authorization agents responsible for enforcing any single specific permission are bound to a specific role in a specific hierarchy#tree; the role they are bound to is the lowest role in the hierarchy that grants access to the shielded resource. Thus, the authorization agent needs only to check that any agent requesting authorization holds a role at or above the bound role marking the lower limit of the permission's "span" across roles in the hierarchy.

If the access for a role is not unconditional but parameterized, then any arbitrary object may served as a value keyed to the role in a role dictionary.

i.e.

Forest1: <role forest; dictionary of trees>
Hierarchy1: <role hierarchy; tree> = Forest1['Hierarchy1_label']

Requester1: <agent>
arbitrary_object = <array of org_ids>
Requester1Role: <role tuple> = ["role_label", arbitrary_object]

Sentinel1: <agent>
Sentinel1.get_access() => (Requester1Role,) eval_func, match_val)  => Hierarchy1.search(Requester1Role) = Access_Denied | Access_Granted | (eval_func, match_val) => Access_Denied | Access_Granted
"""


#############################################
#### Example unfinished proof of concept ####
#############################################

from collections import defaultdict
from typing import Dict, Literal, Union

"""
WARNING: This is a pretty hacky, incomplete implementation.

There are some issues:
- If two or more roles have the same permission set, they are collapsed into the one and the other role labels are added as aliases. HOWEVER, currently the .convert() method on a 'PermissionTree' doesn't support transferring over aliases.
- 'RoleTree' is only partially implemented.
- The code for the 'set containment' function to create PermissionTree's may not work properly in all cases. Specifically, subsets of the top level sets identified may contain each other (i.e. there might be overlap lower in the tree of containment relations) but currenetly these will not be be found; the algorithm as implemented assumes a tree-like structure when it actually needs to work with more general digraphs.
"""


def set_containment(set_collection, guarantee_sort=False):
    if isinstance(set_collection, dict):
        items = list(set_collection.items())
        items.sort(key=lambda e: len(e[1]), reverse=True)
        sorted = items
    elif isinstance(set_collection, list):
        sorted = set_collection
        if guarantee_sort:
            sorted.sort(key=lambda e: len(e[1]))
    else:
        raise ValueError("Argument must be either a dictionary of sets or a list of pairs of strings and sets.")

    largest_key, largest_set = sorted[0]
    remaining_list = []
    subset_list = []
    aliases = []

    for index in range(1, len(sorted)):
        key, leq_set = sorted[index]

        if largest_set.issuperset(leq_set):
            if not largest_set.difference(leq_set):
                aliases.append(key)
            else:
                subset_list.append((key, leq_set))
        else:
            remaining_list.append((key, leq_set))

    return (largest_key, largest_set), subset_list, aliases, remaining_list


def invert_dict(dict: Dict[str, str]):
    inverted_dict = defaultdict(set)
    for key, string in dict.items():
        inverted_dict[string].add(key)
    return inverted_dict


def cascade_permissions(inv_dict: Dict[str, set], tree, role_sets=defaultdict(set), root=True):
    upper_cascade = set()

    for role, list in tree.items():
        lower_cascade = set()
        for element in list:
            if isinstance(element, dict):
                lower_cascade = lower_cascade.union(cascade_permissions(inv_dict, element, role_sets, root=False))
            elif isinstance(element, str):
                role_sets[element] = inv_dict[element] if inv_dict[element] else set()
                lower_cascade = lower_cascade.union(inv_dict[element])

        role_set = inv_dict[role] if inv_dict[role] else set()
        role_sets[role] = role_set.union(lower_cascade)
        upper_cascade = upper_cascade.union(role_sets[role])

    return dict(role_sets) if root else upper_cascade


class RoleTree:
    def __init__(self, label, children=list(), isroot=False, parent=None, node_dict=None):
        # reduce sets down to lowest_role_can_access using domination_paths on the hierarchy
        if isroot:
            self.isroot = True
            self.node_dict = node_dict

        if parent:
            self.parent = parent

        self.label = label
        self.children = children

    def convert(self: Dict[str, dict], access_grove=None):
        inverted_dict = defaultdict(dict)
        for tree_key, role_dict in dict.items():
            for role, permission_set in role_dict.items():
                for permission in permission_set:
                    inverted_dict[permission][tree_key] = role

            permission_tree = PermissionTree(inverted_dict)

            if access_grove:
                access_grove._upsert_permission_tree(self.label, permission_tree)

            return permission_tree

    def domination_path(self, bound_role=None, path=[]):
        if bound_role:
            start_node = self.node_dict[bound_role]
            if start_node:
                if getattr(start_node, "isroot", None):
                    return [start_node.label]
                else:
                    return start_node.domination_path(path=path)
            else:
                raise Error("Bound role not found")

        parent = getattr(self, "parent", None)
        if parent:
            parent.domination_path(path=path).append(self.label)
            return path

        path.append(self.label)
        return path


class PermissionTree:
    def __init__(self, label, self_set, subset_list=list(), aliases=[], isroot=False):
        self.label = label
        self.set = self_set
        self.aliases = []
        self.isroot = isroot
        self.children = None

        if subset_list:
            self.children = []
            stop = False
            while not stop:
                primary, subset_list, aliases, remaining_list = set_containment(subset_list)
                pkey, pset = primary
                self.children.append(PermissionTree(pkey, pset, subset_list, aliases=aliases))
                data = remaining_list
                if len(data) <= 1:
                    stop = True
                    if len(data) == 1:
                        pkey, pset = data[0]
                        self.children.append(PermissionTree(pkey, pset))

    def convert(self, access_grove=None):
        def hierarchy(ptree, node_dict, parent=None, isroot=False):
            if not ptree.children:
                role_tree = RoleTree(label=ptree.label, parent=parent)
                node_dict[ptree.label] = role_tree
                return role_tree
            else:
                if isroot:
                    role_tree = RoleTree(label=ptree.label, isroot=True, node_dict=node_dict)
                else:
                    role_tree = RoleTree(label=ptree.label, parent=parent)

                node_dict[ptree.label] = role_tree
                role_tree.children = [hierarchy(child, node_dict, parent=role_tree) for child in ptree.children]
                return role_tree

        node_dict = {}
        role_tree = hierarchy(self, node_dict, isroot=True)

        if access_grove:
            access_grove._upsert_role_tree(self.label, role_tree)

        return role_tree


class AccessGrove:
    def __init__(self, data_mode: Literal["role", "permission"] = None, data=None):
        self._role_trees = {}
        self._permission_trees = {}

        if not data:
            return

        if data_mode == "role":
            role_bounds, role_tree = data
            data = cascade_permissions(invert_dict(role_bounds), role_tree)

        roots = {}
        stop = False
        while not stop:
            primary, subset_list, aliases, remaining_list = set_containment(data)
            pkey, pset = primary
            roots[pkey] = PermissionTree(pkey, pset, subset_list, aliases=aliases, isroot=True)
            data = remaining_list
            if len(data) <= 1:
                stop = True
                if len(data) == 1:
                    pkey, pset = data[0]
                    roots[pkey] = PermissionTree(pkey, pset, isroot=True)

        if data_mode == "role":
            self._permission_trees = roots

        elif data_mode == "permission":
            self._permission_trees = roots

    def __getitem__(self, key: Literal["role", "permission"]):
        if not (key == "role" or key == "permission"):
            raise AttributeError("Improper value")
        return getattr(self, f"_{key}_trees")

    def _upsert_role_tree(self, label, tree: RoleTree):
        self._role_trees[label] = tree

    def _upsert_permission_tree(self, label, tree: PermissionTree):
        self._permission_trees[label] = tree

    def _conversert_role_tree(self, label):
        role_tree = self["role"][label]
        role_tree.convert(access_grove=self)

    def _conversert_permission_tree(self, label):
        permission_tree = self["permission"][label]
        permission_tree.convert(access_grove=self)
