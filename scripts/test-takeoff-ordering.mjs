import assert from "node:assert/strict";
import { compareTakeoffGroups, sortMeasurementsForTakeoff, takeoffLocationRank } from "../src/takeoffOrdering.js";

function m(location, locationId, group="Other"){
  return { id: locationId || location, location, locationId, group, sqft: 100, material: "R13 Fiberglass Batts" };
}

const matrix = [
  { label: "exterior walls", item: m("Boxed Exterior Walls of House", "ext_walls_house", "Walls"), rank: 0 },
  { label: "common walls", item: m("Garage Common Wall", "garage_common", "Walls"), rank: 1 },
  { label: "attic kneewalls/walls", item: m("Open Attic Kneewall", "attic_kneewall", "Attic"), rank: 2 },
  { label: "other walls", item: m("Interior Partition Walls", "custom", "Walls"), rank: 3 },
  { label: "garage exterior walls", item: m("Boxed Exterior Walls of Garage", "ext_walls_garage", "Walls"), rank: 4 },
  { label: "garage ceiling", item: m("Garage Ceiling", "custom", "Garage Ceiling"), rank: 5 },
  { label: "garage walls/items", item: m("Garage Interior Walls", "custom", "Other"), rank: 6 },
  { label: "blocking/porch blocking/band joist", item: m("Band Joist Blocking", "band_joist", "Porch / Blocking"), rank: 7 },
  { label: "gable ends", item: m("Gable End", "gable_end", "Roofline"), rank: 8 },
  { label: "roofline", item: m("Roofline of Garage", "roofline_garage", "Roofline"), rank: 9 },
  { label: "attic areas", item: m("Open Attic Area of Garage", "attic_area_garage", "Attic"), rank: 10 },
];

for (const row of matrix) {
  assert.equal(takeoffLocationRank(row.item), row.rank, row.label);
}

const shuffled = [
  matrix[10].item, matrix[4].item, matrix[7].item, matrix[0].item, matrix[9].item,
  matrix[5].item, matrix[8].item, matrix[1].item, matrix[6].item, matrix[2].item, matrix[3].item,
];
assert.deepEqual(sortMeasurementsForTakeoff(shuffled).map((item) => item.location), matrix.map((row) => row.item.location));

const edgeCases = [
  { label: "garage attic area is attic area, not generic garage", item: m("Open Attic Area of Garage", "attic_area_garage", "Attic"), rank: 10 },
  { label: "garage roofline is roofline, not generic garage", item: m("Roofline of Garage", "roofline_garage", "Roofline"), rank: 9 },
  { label: "custom garage ceiling exact name", item: m("garage ceiling", "custom", "Other"), rank: 5 },
  { label: "custom garage exterior wall text", item: m("Garage Exterior Walls", "custom", "Walls"), rank: 4 },
  { label: "porch blocks before roofline despite area wording", item: m("Porch Blocking Area", "custom", "Other"), rank: 7 },
];
for (const edge of edgeCases) {
  assert.equal(takeoffLocationRank(edge.item), edge.rank, edge.label);
}

const grouped = [
  { location: "Open Attic Area of Garage", material: "R38", entries: [m("Open Attic Area of Garage", "attic_area_garage", "Attic")] },
  { location: "Roofline", material: "3.5 Open Cell Foam", entries: [m("Roofline", "roofline", "Roofline")] },
  { location: "Garage Ceiling", material: "R38", entries: [m("Garage Ceiling", "custom", "Garage Ceiling")] },
].sort(compareTakeoffGroups);
assert.deepEqual(grouped.map((g) => g.location), ["Garage Ceiling", "Roofline", "Open Attic Area of Garage"]);

console.log("takeoff ordering matrix ok");
