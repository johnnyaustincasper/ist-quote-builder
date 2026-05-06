export var GROUP_ORDER = ["Walls","Attic","Garage Ceiling","Porch / Blocking","Roofline","Other"];

var TAKEOFF_LOCATIONS = [
  { id: "band_joist",       label: "Band Joist Blocking",           short: "Band Joist",        type: "area",    group: "Porch / Blocking" },
  { id: "ext_walls_house",  label: "Boxed Exterior Walls of House", short: "Ext Walls House",   type: "wall",    group: "Walls" },
  { id: "ext_walls_garage", label: "Boxed Exterior Walls of Garage",short: "Ext Walls Garage",  type: "wall",    group: "Walls" },
  { id: "garage_common",    label: "Garage Common Wall",            short: "Garage Common",     type: "wall",    group: "Walls" },
  { id: "open_attic_walls", label: "Open Attic Walls",              short: "Attic Walls",       type: "wall",    group: "Walls" },
  { id: "ext_slopes",       label: "Boxed Exterior Slopes",         short: "Ext Slopes",        type: "slope",   group: "Attic" },
  { id: "ext_kneewall",     label: "Boxed Exterior Kneewall",       short: "Ext Kneewall",      type: "wall",    group: "Attic" },
  { id: "attic_slopes",     label: "Open Attic Slopes",             short: "Attic Slopes",      type: "area",    group: "Attic" },
  { id: "attic_kneewall",   label: "Open Attic Kneewall",           short: "Attic Kneewall",    type: "wall",    group: "Attic" },
  { id: "flat_ceiling",     label: "Flat Ceiling",                  short: "Flat Ceiling",      type: "area",    group: "Attic" },
  { id: "flat_areas_no_blow", label: "Flat Areas That Can’t Be Blown", short: "No-Blow Flats",     type: "area",    group: "Attic" },
  { id: "attic_area_house", label: "Open Attic Area of House",      short: "Attic House",       type: "area",    group: "Attic" },
  { id: "attic_area_garage",label: "Open Attic Area of Garage",     short: "Attic Garage",      type: "area",    group: "Attic" },
  { id: "gable_end",        label: "Gable End",                     short: "Gable End",         type: "area",    group: "Roofline" },
  { id: "porch",            label: "Porch",                         short: "Porch",             type: "area",    group: "Porch / Blocking" },
  { id: "porch_blocking",   label: "Porch Blocking",                short: "Porch Blocking",    type: "area",    group: "Porch / Blocking" },
  { id: "roofline",         label: "Roofline",                      short: "Roofline",          type: "roofline",group: "Roofline" },
  { id: "roofline_garage",  label: "Roofline of Garage",            short: "Roofline Garage",   type: "roofline",group: "Roofline" },
  { id: "roofline_house",   label: "Roofline of House",             short: "Roofline House",    type: "roofline",group: "Roofline" },
  { id: "custom",           label: "Custom",                        short: "Custom",            type: "area",    group: "Other" },
];

export function isGarageCeilingMeasurement(m){
  var name=String((m&&m.location)||(m&&m.customLocation)||"").trim().toLowerCase();
  return name==="garage ceiling";
}

export function getMeasurementGroup(m){
  if(isGarageCeilingMeasurement(m))return "Garage Ceiling";
  var loc=TAKEOFF_LOCATIONS.find(function(l){return l.id===(m&&m.locationId);});
  if(loc&&loc.id!=="custom")return loc.group;
  var group=(m&&m.group)||"Other";
  return GROUP_ORDER.indexOf(group)>=0?group:"Other";
}

export function measurementLocationKey(m){
  var id=String((m&&m.locationId)||"").trim();
  var loc=String((m&&m.location)||"").trim();
  return (id&&id!=="custom")?id:(loc||id||"custom");
}

export function takeoffNormalize(v){
  return String(v||"").toLowerCase().replace(/[^a-z0-9]+/g," " ).trim();
}

function takeoffLocationInfo(m){
  var loc=TAKEOFF_LOCATIONS.find(function(l){return l.id===((m&&m.locationId)||"");});
  var name=(m&&m.location)||((loc&&loc.label)||"");
  var id=String((m&&m.locationId)||((loc&&loc.id)||""));
  var group=getMeasurementGroup(m);
  var hay=takeoffNormalize([id,name,(m&&m.customLocation)||"",group,(loc&&loc.short)||"",(loc&&loc.label)||""].join(" "));
  return {id:id,name:name,group:group,hay:hay};
}

export function takeoffLocationRank(m){
  var info=takeoffLocationInfo(m),h=info.hay,id=info.id;
  var isGarageCeiling=isGarageCeilingMeasurement(m)||/\bgarage ceiling\b/.test(h);
  var isRoofline=/\broofline\b/.test(h);
  var isGarage=/\bgarage\b/.test(h);
  var isGarageExterior=id==="ext_walls_garage"||/\bgarage exterior wall(s)?\b|exterior walls of garage|ext walls garage/.test(h);
  var isAtticWall=id==="attic_kneewall"||id==="ext_kneewall"||id==="open_attic_walls"||(/\battic\b/.test(h)&&(/kneewall|knee wall|\bwall(s)?\b/.test(h)));
  var isWall=/\bwall(s)?\b|kneewall|knee wall|ext walls/.test(h)||info.group==="Walls";
  var isBlocking=id==="band_joist"||id==="porch_blocking"||/blocking|block out|blockout|band joist|porch/.test(h)||info.group==="Porch / Blocking";
  var isGable=id==="gable_end"||/gable/.test(h);
  var isAtticArea=id==="attic_area_house"||id==="attic_area_garage"||id==="ext_slopes"||id==="attic_slopes"||id==="flat_ceiling"||id==="flat_areas_no_blow"||(/\battic\b/.test(h)&&(/\barea\b|slope|flat|ceiling|blown|blow/.test(h)))||info.group==="Attic";

  if(id==="ext_walls_house"||(/\bexterior wall(s)?\b/.test(h)&&!isGarage))return 0;
  if(id==="garage_common"||/\bcommon wall\b/.test(h))return 1;
  if(isAtticWall)return 2;
  if(isWall&&!isGarageExterior&&!isGarage)return 3;
  if(isGarageExterior)return 4;
  if(isGarageCeiling)return 5;
  if(isGarage&&!isRoofline&&!isAtticArea)return 6;
  if(isBlocking)return 7;
  if(isGable)return 8;
  if(isRoofline||info.group==="Roofline")return 9;
  if(isAtticArea)return 10;
  return 11;
}

export function takeoffLocationTie(m){
  var id=String((m&&m.locationId)||"");
  var order=["ext_walls_house","garage_common","open_attic_walls","ext_kneewall","attic_kneewall","ext_walls_garage","band_joist","porch_blocking","porch","gable_end","roofline_house","roofline_garage","roofline","ext_slopes","attic_slopes","flat_ceiling","flat_areas_no_blow","attic_area_house","attic_area_garage"];
  var idx=order.indexOf(id);
  return idx>=0?idx:999;
}

export function takeoffMaterialRank(v){
  var m=String(v||"");
  if(/foam|open cell|closed cell/i.test(m))return -1;
  var n=m.match(/(\d+(?:\.\d+)?)/);
  return n?parseFloat(n[1]):0;
}

export function compareTakeoffRecords(a,b){
  var ar=takeoffLocationRank(a),br=takeoffLocationRank(b);
  if(ar!==br)return ar-br;
  var at=takeoffLocationTie(a),bt=takeoffLocationTie(b);
  if(at!==bt)return at-bt;
  var an=takeoffNormalize((a&&a.location)||""),bn=takeoffNormalize((b&&b.location)||"");
  if(an!==bn)return an<bn?-1:1;
  var am=takeoffMaterialRank((a&&a.matNote)||((a&&a.material)||"")),bm=takeoffMaterialRank((b&&b.matNote)||((b&&b.material)||""));
  if(am!==bm)return am-bm;
  return 0;
}

export function sortMeasurementsForTakeoff(items){
  return (items||[]).slice().sort(compareTakeoffRecords);
}

export function compareTakeoffGroups(a,b){
  var ae=(a.entries&&a.entries[0])||a,be=(b.entries&&b.entries[0])||b;
  var ar=takeoffLocationRank(ae),br=takeoffLocationRank(be);
  if(ar!==br)return ar-br;
  var at=takeoffLocationTie(ae),bt=takeoffLocationTie(be);
  if(at!==bt)return at-bt;
  var an=takeoffNormalize(a.location||(ae&&ae.location)||""),bn=takeoffNormalize(b.location||(be&&be.location)||"");
  if(an!==bn)return an<bn?-1:1;
  var am=takeoffMaterialRank(a.material),bm=takeoffMaterialRank(b.material);
  if(am!==bm)return am-bm;
  return 0;
}
