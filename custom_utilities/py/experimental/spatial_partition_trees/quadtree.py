import math

from geopy.distance import geodesic as distance
from geopy.point import Point


class GeoPoint(Point):
    __slots__ = "payload"

    def __init__(self, latitude=None, longitude=None, altitude=None):
        self.payload = None


def to_radians(degrees):
    return degrees * (math.pi / 180)


def new_point_from_dist(point: GeoPoint, true_course=0, distance=0):
    """Create a new GeoPoint from a reference point and a distance (in meters).

    Uses an Equilinear approximation that is accurate enough for short distances."""

    if true_course == 0 and distance == 0:
        return point

    lat_displ = (distance * math.cos(true_course)) / 110.574e3
    lon_displ = (
        (distance * math.sin(true_course)) / math.cos(point.latitude)
    ) / 111.320e3

    return GeoPoint(point.latitude + lat_displ, point.longitude + lon_displ)


class GeoRect:
    """
    A kite centered at GeoPoint 'center' with width in radians 'lat_arc' and height in radians 'lon_arc'.
    """

    __slots__ = (
        "center",
        "lat_arc",
        "lon_arc",
        "north_edge",
        "south_edge",
        "west_edge",
        "east_edge",
    )

    def __init__(self, center: GeoPoint, lat_arc: float, lon_arc: float):
        self.center = center
        self.lat_arc, self.lon_arc = lat_arc, lon_arc
        self.north_edge = self.center.latitude + (self.lat_arc / 2)
        self.south_edge = self.center.latitude - (self.lat_arc / 2)
        self.west_edge = self.center.longitude - (self.lon_arc / 2)
        self.east_edge = self.center.longitude + (self.lon_arc / 2)

    def __repr__(self):
        return str((self.west_edge, self.east_edge, self.north_edge, self.south_edge))

    def __str__(self):
        return f"R(west_edge:{self.west_edge}, north_edge:{self.north_edge}, east_edge:{self.east_edge}, south_edge:{self.south_edge})"

    def contains(self, point: GeoPoint):
        """Is GeoPoint 'point' inside this GeoRect?"""

        return (
            point.longitude > self.west_edge
            and point.longitude < self.east_edge
            and point.latitude < self.north_edge
            and point.latitude > self.south_edge
        )

    def intersects(self, other):
        """Does GeoRect 'other' intersect this GeoRect?"""

        return not (
            other.west_edge > self.east_edge
            or other.east_edge < self.west_edge
            or other.north_edge < self.south_edge
            or other.south_edge > self.north_edge
        )

    def draw(self, ax, c="k", lw=1, **kwargs):
        x1, y1 = self.west_edge, self.north_edge
        x2, y2 = self.east_edge, self.south_edge
        ax.plot([x1, x2, x2, x1, x1], [y1, y1, y2, y2, y1], c=c, lw=lw, **kwargs)


class GeoQuadTree:
    """An implementation of a point quadtree for geographic coordinates; each instantiation is one node that can recursively contain other GeoQuadTree instances."""

    __slots__ = ("boundary", "depth", "ne", "nw", "se", "sw", "leaf", "bucket")

    def __init__(self, boundary, bucket: GeoPoint = None, leaf: bool = False, depth=0):
        """
        Initialize this node of the point quadtree.

        boundary is a GeoRect object defining the region from which points are
        placed into this node; depth keeps track of how deep into the point quadtree a node lies.
        """
        self.boundary = boundary
        self.bucket = bucket
        self.depth = depth
        self.leaf = leaf

        if not leaf:
            self.divide()

    def __str__(self):
        """Return a string representation of this node, suitably formatted."""
        sp = " " * self.depth * 2
        s = str(self.boundary) + "\n"
        s += sp + ", ".join(str(point) for point in self.points)
        return (
            s
            + "\n"
            + "\n".join(
                [
                    sp + "nw: " + str(self.nw),
                    sp + "ne: " + str(self.ne),
                    sp + "se: " + str(self.se),
                    sp + "sw: " + str(self.sw),
                ]
            )
        )

    def divide(self):
        """Divide this node by spawning four child nodes."""
        boundary = self.boundary
        self.nw = GeoQuadTree(
            GeoRect(
                GeoPoint(
                    boundary.center.latitude - boundary.lat_arc / 4,
                    boundary.center.longitude + boundary.lon_arc / 4,
                ),
                boundary.lat_arc / 2,
                boundary.lon_arc / 2,
            ),
            leaf=True,
            depth=self.depth + 1,
        )
        self.ne = GeoQuadTree(
            GeoRect(
                GeoPoint(
                    boundary.center.latitude + boundary.lat_arc / 4,
                    boundary.center.longitude + boundary.lon_arc / 4,
                ),
                boundary.lat_arc / 2,
                boundary.lon_arc / 2,
            ),
            leaf=True,
            depth=self.depth + 1,
        )
        self.se = GeoQuadTree(
            GeoRect(
                GeoPoint(
                    boundary.center.latitude + boundary.lat_arc / 4,
                    boundary.center.longitude - boundary.lon_arc / 4,
                ),
                boundary.lat_arc / 2,
                boundary.lon_arc / 2,
            ),
            leaf=True,
            depth=self.depth + 1,
        )
        self.sw = GeoQuadTree(
            GeoRect(
                GeoPoint(
                    boundary.center.latitude - boundary.lat_arc / 4,
                    boundary.center.longitude - boundary.lon_arc / 4,
                ),
                boundary.lat_arc / 2,
                boundary.lon_arc / 2,
            ),
            leaf=True,
            depth=self.depth + 1,
        )
        self.leaf = False

    def insert(self, point: GeoPoint):
        """Try to insert GeoPoint 'point' into this GeoQuadTree."""
        if not self.boundary.contains(point):
            return False

        if self.leaf:
            if not self.bucket:
                self.bucket = point
                return True
            else:
                self.divide()
                new_point = point
                old_point = getattr(self, "bucket")
                self.insert(old_point)
                self.insert(new_point)
                setattr(self, "bucket", None)
                return True

        return (
            self.ne.insert(point)
            or self.nw.insert(point)
            or self.se.insert(point)
            or self.sw.insert(point)
        )

    def query(self, boundary, found_points):
        """Find the points in the point quadtree that lie within boundary."""

        if not self.boundary.intersects(boundary):
            return False

        if self.leaf:
            if self.bucket and boundary.contains(self.bucket):
                found_points.append(self.bucket)
        else:
            self.nw.query(boundary, found_points)
            self.ne.query(boundary, found_points)
            self.se.query(boundary, found_points)
            self.sw.query(boundary, found_points)

        return found_points

    def _query_circle(self, boundary, q_center, q_radius, found_points):
        """
        Find the points in the quadtree that lie within radius of center.
        boundary is a GeoRect kite that bounds the search circle.
        """

        if not self.boundary.intersects(boundary):
            return False

        if self.leaf:
            if (
                self.bucket
                and boundary.contains(q_center)
                and distance(self.bucket, q_center).meters <= q_radius
            ):
                found_points.append(self.bucket)
        else:
            self.nw._query_circle(boundary, q_center, q_radius, found_points)
            self.ne._query_circle(boundary, q_center, q_radius, found_points)
            self.se._query_circle(boundary, q_center, q_radius, found_points)
            self.sw._query_circle(boundary, q_center, q_radius, found_points)

        return found_points

    def query_radius(self, q_center, q_radius, found_points):
        """Find the points in the point quadtree that lie within 'radius' (in meters) of the given center.

        Use a radius less than 50km in order to avoid overly large error."""

        north_point = new_point_from_dist(q_center, to_radians(0), q_radius)
        east_point = new_point_from_dist(q_center, to_radians(90), q_radius)

        lat_arc = 2 * (north_point.latitude - q_center.latitude)
        lon_arc = 2 * (east_point.longitude - q_center.longitude)

        boundary = GeoRect(q_center, lat_arc, lon_arc)

        return self._query_circle(boundary, q_center, q_radius, found_points)

    def __len__(self):
        """Return the number of points in the quadtree."""

        npoints = 0
        if self.leaf:
            npoints = bool(self.bucket)
        else:
            npoints += len(self.nw) + len(self.ne) + len(self.se) + len(self.sw)

        return npoints

    def draw(self, ax):
        """Draw a representation of the quadtree on Matplotlib Axes ax."""

        self.boundary.draw(ax)
        if not self.leaf:
            self.nw.draw(ax)
            self.ne.draw(ax)
            self.se.draw(ax)
            self.sw.draw(ax)
