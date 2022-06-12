import json
from functools import reduce

import matplotlib.pyplot as plt
from matplotlib import gridspec
from quadtree import GeoPoint, GeoQuadTree, GeoRect, new_point_from_dist, to_radians


with open("./GeoPostalData/geonamesDE.json") as json_file:
    geonamesDE = json.load(json_file)


with open("./GeoPostalData/geonamesAT.json") as json_file:
    geonamesAT = json.load(json_file)


with open("./GeoPostalData/geonamesCH.json") as json_file:
    geonamesCH = json.load(json_file)


def postal_reducer(accum, postalObj):
    point = GeoPoint(
        float(postalObj.get("latitude")),
        float(postalObj.get("longitude")),
    )
    setattr(point, "payload", postalObj)
    accum.append(point)
    return accum


postalDE = reduce(postal_reducer, geonamesDE, [])
postalCH = reduce(postal_reducer, geonamesCH, [])
postalAT = reduce(postal_reducer, geonamesAT, [])

postal_points = postalDE + postalCH + postalAT

print(postal_points[0:20])
print(postal_points[-21:-1])

# Bounding box
center = GeoPoint(49.18191542, 11.30329418)
lat_arc = 14
lon_arc = 14
domain = GeoRect(center, lat_arc, lon_arc)

qtree = GeoQuadTree(domain)

for point in postal_points:
    qtree.insert(point)

print("Number of points in postal_points list =", len(postal_points))
print("Number of points in the domain =", len(qtree))

# Berlin - 52.520008, 13.404954

# lat and lon for point near Frankfurt
q_center = GeoPoint(50.0745628746, 8.6936461926)
# 20km in meters
q_radius = 20e3

north_point = new_point_from_dist(q_center, to_radians(0), q_radius)
east_point = new_point_from_dist(q_center, to_radians(90), q_radius)

q_lat_arc = north_point.latitude - q_center.latitude
q_lon_arc = east_point.longitude - q_center.longitude

DPI = 72
fig = plt.figure(figsize=(700 / 30, 500 / 30), dpi=DPI)
ax = plt.subplot()
ax.set_xlim(domain.west_edge, domain.east_edge)
ax.set_ylim(domain.south_edge, domain.north_edge)
# ax.set_xlim(q_center.longitude-2, q_center.longitude+2)
# ax.set_ylim(q_center.latitude-2, q_center.latitude+2)

# qtree.draw(ax)
# print('qtree draw finished')

ax.scatter(
    [p.longitude for p in postal_points], [p.latitude for p in postal_points], s=4
)
ax.set_xticks([])
ax.set_yticks([])
print("postal_points scatter finished")

found_points = []
qtree.query_radius(q_center, q_radius, found_points)
print("Number of found points =", len(found_points))

ax.scatter(
    [p.longitude for p in found_points],
    [p.latitude for p in found_points],
    facecolors="none",
    edgecolors="r",
    s=32,
)

circle = plt.Circle((q_center.latitude, q_center.longitude), q_lon_arc, ec="r")
GeoRect(q_center, 2.5 * q_lat_arc, 2.5 * q_lon_arc).draw(ax, c="r", lw=4)

# ax.invert_yaxis()
# plt.tight_layout()
print("starting image save")
plt.savefig("search-quadtree-circle.png", DPI=DPI)

f = open("query-points.json", "w")
f.write(json.dumps([(point.latitude, point.longitude) for point in found_points]))
f.close()
