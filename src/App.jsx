import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import html2pdf from "html2pdf.js";

var COMPANY = {
  name: "Insulation Services of Tulsa",
  tagline: "Serving Northeastern Oklahoma",
  phone: "1 (918) 232-9055",
};

var SALESMAN_INFO = {
  "Johnny": { fullName: "Johnny Casper", phone: "918-550-2396", email: "Johnny@istulsa.com" },
  "Jordan": { fullName: "Jordan Beard", phone: "918-625-7820", email: "Jordan@istulsa.com" },
  "Skip": { fullName: "Skip Owen", phone: "918-219-7890", email: "Skip@istulsa.com" },
};

var LOCATIONS = [
  { id: "ext_walls_house", label: "Boxed Exterior Walls of House", type: "wall", group: "Walls" },
  { id: "ext_walls_garage", label: "Boxed Exterior Walls of Garage", type: "wall", group: "Walls" },
  { id: "garage_common", label: "Garage Common Wall", type: "wall", group: "Walls" },
  { id: "ext_kneewall", label: "Boxed Exterior Kneewall", type: "wall", group: "Walls" },
  { id: "open_attic_walls", label: "Open Attic Walls", type: "wall", group: "Walls" },
  { id: "attic_area_house", label: "Open Attic Area of House", type: "area", group: "Attic / Ceiling" },
  { id: "attic_area_garage", label: "Open Attic Area of Garage", type: "area", group: "Attic / Ceiling" },
  { id: "ext_slopes", label: "Boxed Exterior Slopes", type: "wall", group: "Attic / Ceiling" },
  { id: "attic_slopes", label: "Open Attic Slopes", type: "area", group: "Attic / Ceiling" },
  { id: "attic_kneewall", label: "Open Attic Kneewall", type: "area", group: "Attic / Ceiling" },
  { id: "flat_ceiling", label: "Flat Ceiling", type: "area", group: "Attic / Ceiling" },
  { id: "porch", label: "Porch", type: "area", group: "Porch / Blocking" },
  { id: "porch_blocking", label: "Porch Blocking", type: "area", group: "Porch / Blocking" },
  { id: "band_joist", label: "Band Joist Blocking", type: "area", group: "Porch / Blocking" },
  { id: "roofline", label: "Roofline", type: "roofline", group: "Roofline" },
  { id: "roofline_house", label: "Roofline of House", type: "roofline", group: "Roofline" },
  { id: "roofline_garage", label: "Roofline of Garage", type: "roofline", group: "Roofline" },
  { id: "gable_end", label: "Gable End", type: "area", group: "Roofline" },
  { id: "custom", label: "Custom", type: "area", group: "Other" },
];

var FIBERGLASS_MATERIALS = [
  "Blown Fiberglass", "R11 Fiberglass Batts", "R13 Fiberglass Batts", "R15 Fiberglass Batts",
  "R19 Fiberglass Batts", "R30 Fiberglass Batts", "R38 Fiberglass Batts",
  "Blown Cellulose", "Blown Rockwool", "Rockwool", '6" Rockwool', "Lambswool",
];

var OPEN_CELL_MATERIALS = [];
[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6].forEach(function(n){ OPEN_CELL_MATERIALS.push(n+'" Open Cell Foam'); });

var CLOSED_CELL_MATERIALS = [];
[0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5,6].forEach(function(n){ CLOSED_CELL_MATERIALS.push(n+'" Closed Cell Foam'); });

var ALL_MATERIALS = FIBERGLASS_MATERIALS.concat(OPEN_CELL_MATERIALS).concat(CLOSED_CELL_MATERIALS);

var PITCH_FACTORS = {"Flat (0/12)":1.0,"1/12":1.003,"2/12":1.014,"3/12":1.031,"4/12":1.054,"5/12":1.083,"6/12":1.118,"7/12":1.158,"8/12":1.202,"9/12":1.25,"10/12":1.302,"11/12":1.357,"12/12":1.414};

var WALL_HEIGHTS = [
  {label:"8' walls (10.00 sq ft each)",sqftPer:10},{label:"9' walls (11.25 sq ft each)",sqftPer:11.25},
  {label:"10' walls (12.50 sq ft each)",sqftPer:12.5},{label:"11' walls (13.75 sq ft each)",sqftPer:13.75},
  {label:"12' walls (15.00 sq ft each)",sqftPer:15},
];

var GROUP_ORDER = ["Walls","Attic / Ceiling","Porch / Blocking","Roofline","Other"];

var C = {bg:"#0A0A0A",card:"#141414",green:"#4ADE80",white:"#FFFFFF",text:"#E5E5E5",dim:"#777777",border:"#252525",borderLight:"#333333",input:"#0D0D0D",inputBorder:"#2A2A2A",danger:"#EF4444",blue:"#60A5FA"};

/* ──────── STORAGE HELPERS (Supabase) ──────── */

async function saveJob(jobName, savedBy, jobData) {
  try {
    // Check if job with same name by same user exists (for autosave updates)
    var existing = await supabase.from("jobs").select("id").eq("job_name", jobName).eq("saved_by", savedBy).limit(1);
    if (existing.data && existing.data.length > 0) {
      var res = await supabase.from("jobs").update({ job_data: jobData, updated_at: new Date().toISOString() }).eq("id", existing.data[0].id);
      return !res.error;
    } else {
      var res2 = await supabase.from("jobs").insert({ job_name: jobName, saved_by: savedBy, job_data: jobData });
      return !res2.error;
    }
  } catch (e) { console.log("Save error:", e); return false; }
}

async function loadAllJobs() {
  try {
    var res = await supabase.from("jobs").select("*").neq("job_name", "__autosave__").order("updated_at", { ascending: false });
    if (res.data) return res.data;
  } catch (e) { console.log("Load error:", e); }
  return [];
}

async function deleteJob(id) {
  try {
    var res = await supabase.from("jobs").delete().eq("id", id);
    return !res.error;
  } catch (e) { console.log("Delete error:", e); return false; }
}

async function saveAutosave(savedBy, jobData) {
  return saveJob("__autosave__", savedBy, jobData);
}

async function loadAutosave(savedBy) {
  try {
    var res = await supabase.from("jobs").select("*").eq("job_name", "__autosave__").eq("saved_by", savedBy).limit(1);
    if (res.data && res.data.length > 0) return res.data[0].job_data;
  } catch (e) { console.log("Autosave load error:", e); }
  return null;
}

/* ──────── UI COMPONENTS ──────── */

function Input(p){return(<div><label style={{fontSize:11,fontWeight:700,color:C.dim,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.label}</label><input style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:8,color:C.white,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box"}} type={p.type||"number"} value={p.value} onChange={function(e){p.onChange(e.target.value);}} placeholder={p.placeholder} step={p.step}/></div>);}

function AppSelect(p){return(<div><label style={{fontSize:11,fontWeight:700,color:C.dim,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.label}</label><select style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:8,color:C.white,fontSize:15,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none"}} value={p.value} onChange={function(e){p.onChange(e.target.value);}}>{p.options.map(function(o){var v=typeof o==="string"?o:o.value;var l=typeof o==="string"?o:o.label;return(<option key={v} value={v}>{l}</option>);})}</select></div>);}

function Row(p){return <div style={{display:"flex",gap:10,marginBottom:10}}>{p.children}</div>;}
function Col(p){return <div style={{flex:1}}>{p.children}</div>;}
function StepLabel(p){return(<label style={{fontSize:11,fontWeight:700,color:C.green,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.children}</label>);}

function ToggleButtons(p){return(<div style={{display:"flex",gap:2,background:C.bg,padding:3,borderRadius:8,marginBottom:12}}>{p.options.map(function(o){return(<button key={o.id} onClick={function(){p.setMode(o.id);}} style={{flex:1,padding:"8px 6px",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",border:"none",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:"0.04em",background:p.mode===o.id?C.green:"transparent",color:p.mode===o.id?"#000":C.dim}}>{o.label}</button>);})}</div>);}

function GreenBtn(p){return(<button onClick={p.onClick} style={{width:"100%",padding:"13px 20px",borderRadius:10,border:"none",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase",letterSpacing:"0.06em",background:C.green,color:"#000",marginTop:p.mt||0}}>{p.children}</button>);}

/* ──────── MEASUREMENTS ──────── */

function WallMeasurement(p){
  var s1=useState("count"),mode=s1[0],setMode=s1[1];
  var s2=useState(""),wc=s2[0],setWc=s2[1];
  var s3=useState("0"),wi=s3[0],setWi=s3[1];
  var s4=useState(""),ln=s4[0],setLn=s4[1];
  var s5=useState(""),ht=s5[0],setHt=s5[1];
  var sq=mode==="count"?(parseInt(wc)||0)*(WALL_HEIGHTS[parseInt(wi)]?WALL_HEIGHTS[parseInt(wi)].sqftPer:0):(parseFloat(ln)||0)*(parseFloat(ht)||0);
  return(<div>
    <ToggleButtons mode={mode} setMode={setMode} options={[{id:"count",label:"Wall Count"},{id:"lh",label:"L × H"}]}/>
    {mode==="count"?(<Row><Col><Input label="# of Cavities" value={wc} placeholder="0" onChange={function(v){setWc(v);p.onSqftChange((parseInt(v)||0)*(WALL_HEIGHTS[parseInt(wi)]?WALL_HEIGHTS[parseInt(wi)].sqftPer:0));}}/></Col><Col><AppSelect label="Wall Height" value={wi} onChange={function(v){setWi(v);p.onSqftChange((parseInt(wc)||0)*(WALL_HEIGHTS[parseInt(v)]?WALL_HEIGHTS[parseInt(v)].sqftPer:0));}} options={WALL_HEIGHTS.map(function(w,i){return{value:String(i),label:w.label};})}/></Col></Row>):(<Row><Col><Input label="Length (ft)" value={ln} placeholder="0" onChange={function(v){setLn(v);p.onSqftChange((parseFloat(v)||0)*(parseFloat(ht)||0));}}/></Col><Col><Input label="Height (ft)" value={ht} placeholder="0" onChange={function(v){setHt(v);p.onSqftChange((parseFloat(ln)||0)*(parseFloat(v)||0));}}/></Col></Row>)}
    {sq>0&&(<div style={{fontSize:13,color:C.green,fontWeight:700,marginBottom:8}}>{Math.round(sq)+" sq ft"}</div>)}
  </div>);
}

function AreaMeasurement(p){
  var s1=useState("dims"),mode=s1[0],setMode=s1[1];
  var s2=useState(""),ln=s2[0],setLn=s2[1];
  var s3=useState(""),wd=s3[0],setWd=s3[1];
  var s4=useState(""),ds=s4[0],setDs=s4[1];
  var sq=mode==="dims"?(parseFloat(ln)||0)*(parseFloat(wd)||0):(parseFloat(ds)||0);
  return(<div>
    <ToggleButtons mode={mode} setMode={setMode} options={[{id:"dims",label:"L × W"},{id:"sqft",label:"Sq Ft"}]}/>
    {mode==="dims"?(<Row><Col><Input label="Length (ft)" value={ln} placeholder="0" onChange={function(v){setLn(v);p.onSqftChange((parseFloat(v)||0)*(parseFloat(wd)||0));}}/></Col><Col><Input label="Width (ft)" value={wd} placeholder="0" onChange={function(v){setWd(v);p.onSqftChange((parseFloat(ln)||0)*(parseFloat(v)||0));}}/></Col></Row>):(<div style={{marginBottom:10}}><Input label="Total Sq Ft" value={ds} placeholder="0" onChange={function(v){setDs(v);p.onSqftChange(parseFloat(v)||0);}}/></div>)}
    {sq>0&&(<div style={{fontSize:13,color:C.green,fontWeight:700,marginBottom:8}}>{Math.round(sq)+" sq ft"}</div>)}
  </div>);
}

function MeasurementForm(p){
  var mats=p.tab==="opencell"?OPEN_CELL_MATERIALS:p.tab==="closedcell"?CLOSED_CELL_MATERIALS:FIBERGLASS_MATERIALS;
  var isFoam=p.tab==="opencell"||p.tab==="closedcell";
  var hp=p.hasPrice;
  var s1=useState(""),lid=s1[0],setLid=s1[1];
  var s2=useState(""),cl=s2[0],setCl=s2[1];
  var s3=useState(mats[0]),mat=s3[0],setMat=s3[1];
  var s4=useState(0),sqft=s4[0],setSqft=s4[1];
  var s5=useState(""),price=s5[0],setPrice=s5[1];
  var s6=useState("Flat (0/12)"),pitch=s6[0],setPitch=s6[1];
  var s7=useState(0),mk=s7[0],setMk=s7[1];
  var loc=LOCATIONS.find(function(x){return x.id===lid;});
  var locLabel=loc?(loc.id==="custom"?cl:loc.label):"";
  var locGroup=loc?(loc.id==="custom"?"Other":loc.group):"Other";
  var needsPitch=loc&&loc.type==="roofline"&&(!hp||isFoam);
  var measType=loc?(loc.type==="wall"?"wall":"area"):null;
  var pf=needsPitch?(PITCH_FACTORS[pitch]||1):1;
  var adj=sqft*pf;var fin=Math.round(adj);
  var ss={width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:8,color:C.white,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none"};
  var tabLabel=p.tab==="opencell"?"Open Cell":p.tab==="closedcell"?"Closed Cell":"Fiberglass";
  function handleAdd(){
    var pr=hp?(parseFloat(price)||0):0;if(fin<=0||!locLabel)return;if(hp&&pr<=0)return;
    var useMat=hp?mat:"(material TBD)";
    var desc=hp?("Install "+mat.toLowerCase()+" in "+locLabel.toLowerCase()):(locLabel+" — "+fin.toLocaleString()+" sq ft");
    p.onAdd({type:isFoam?"Foam":"Fiberglass",material:useMat,location:locLabel,locationId:loc?loc.id:"custom",group:locGroup,sqft:fin,pitch:needsPitch?pitch:null,pricePerUnit:pr,total:hp?Math.ceil(fin*pr):0,description:desc});
    setSqft(0);setPrice("");setPitch("Flat (0/12)");setMk(function(k){return k+1;});
  }
  var stepNum=1;
  return(<div style={{background:C.card,borderRadius:12,padding:16,border:"1px solid "+C.border}}>
    <div style={{fontSize:15,fontWeight:700,marginBottom:14,color:C.white}}>{hp?(tabLabel+" — Add Line Item"):"Add Measurement"}</div>
    <div style={{marginBottom:12}}><StepLabel>{"① Location"}</StepLabel><select style={ss} value={lid} onChange={function(e){setLid(e.target.value);setSqft(0);setMk(function(k){return k+1;});}}><option value="">{"— Select Location —"}</option>{GROUP_ORDER.filter(function(g){return LOCATIONS.some(function(loc){return loc.group===g;});}).map(function(g){return(<optgroup key={g} label={g}>{LOCATIONS.filter(function(loc){return loc.group===g;}).map(function(x){return(<option key={x.id} value={x.id}>{x.label}</option>);})}</optgroup>);})}</select></div>
    {lid==="custom"&&(<div style={{marginBottom:12}}><Input label="Custom Location Name" value={cl} onChange={setCl} type="text" placeholder="e.g. Bonus room walls"/></div>)}
    {loc&&(<div>
      {hp&&(<div style={{marginBottom:12}}><StepLabel>{"② Material"}</StepLabel><select style={ss} value={mat} onChange={function(e){setMat(e.target.value);}}>{mats.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</select></div>)}
      <div style={{marginBottom:4}}><StepLabel>{(hp?"③":"②")+" Measurements"}</StepLabel></div>
      {measType==="wall"?(<WallMeasurement key={"w-"+mk} onSqftChange={setSqft}/>):(<AreaMeasurement key={"a-"+mk} onSqftChange={setSqft}/>)}
      {needsPitch&&(<div style={{marginBottom:10}}><AppSelect label="Roof Pitch" value={pitch} onChange={setPitch} options={Object.keys(PITCH_FACTORS)}/></div>)}
      {hp&&(<div style={{marginBottom:12}}><StepLabel>{(hp?"④":"③")+" Price"}</StepLabel><Input label="Price per Sq Ft" value={price} onChange={setPrice} placeholder="$0.00" step="0.01"/></div>)}
      {fin>0&&(<div style={{background:C.bg,borderRadius:8,padding:12,marginBottom:12,fontSize:13,color:C.dim,border:"1px solid "+C.border}}>
        <div style={{fontWeight:600,color:C.text,marginBottom:4,fontSize:14}}>{hp?("Install "+mat.toLowerCase()+" in "+locLabel.toLowerCase()):(locLabel+" — "+fin.toLocaleString()+" sq ft")}</div>
        <div>{"Total: "}<span style={{color:C.white,fontWeight:600}}>{fin.toLocaleString()+" sq ft"}</span>{needsPitch&&sqft!==adj&&(<span>{" (adj. from "+Math.round(sqft)+" w/ "+pitch+")"}</span>)}</div>
        {hp&&(parseFloat(price)||0)>0&&(<div>{"Line Total: "}<span style={{color:C.green,fontWeight:700}}>{"$"+Math.ceil(fin*(parseFloat(price)||0)).toLocaleString()+".00"}</span></div>)}
      </div>)}
      <GreenBtn onClick={handleAdd}>{"+ "+(hp?"Add to Quote":"Add Measurement")}</GreenBtn>
    </div>)}
  </div>);
}

function MaterialTabs(p){return(<div style={{display:"flex",gap:0,borderRadius:10,overflow:"hidden",border:"1px solid "+C.border,marginBottom:16}}>{[{id:"fiberglass",label:"FIBERGLASS"},{id:"opencell",label:"OPEN CELL"},{id:"closedcell",label:"CLOSED CELL"}].map(function(t){return(<button key={t.id} onClick={function(){p.setActiveTab(t.id);}} style={{flex:1,padding:"12px 4px",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontSize:11,fontWeight:800,letterSpacing:"0.04em",textTransform:"uppercase",background:p.activeTab===t.id?C.green:C.card,color:p.activeTab===t.id?"#000":C.dim}}>{t.label}</button>);})}</div>);}

function CustomerInfo(p){
  var s1=useState(false),show=s1[0],setShow=s1[1];
  return(<div style={{padding:"0 16px 12px"}}>
    <button onClick={function(){setShow(!show);}} style={{width:"100%",padding:"12px 16px",borderRadius:10,border:"1px solid "+C.border,background:C.card,color:C.text,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span>{p.custName?"Customer: "+p.custName:"Customer Info"}</span><span style={{fontSize:16,color:C.dim}}>{show?"▲":"▼"}</span></button>
    {show&&(<div style={{background:C.card,borderRadius:12,padding:16,marginTop:8,border:"1px solid "+C.border}}>
      <div style={{marginBottom:10}}><Input label="Customer Name" value={p.custName} onChange={p.setCustName} type="text" placeholder="John Doe"/></div>
      <div style={{marginBottom:10}}><Input label="Address" value={p.custAddr} onChange={p.setCustAddr} type="text" placeholder="123 Main St, Tulsa OK"/></div>
      <Row><Col><Input label="Phone" value={p.custPhone} onChange={p.setCustPhone} type="tel" placeholder="(918) 555-0000"/></Col><Col><Input label="Email" value={p.custEmail} onChange={p.setCustEmail} type="email" placeholder="john@email.com"/></Col></Row>
      <Input label="Job Site (if different)" value={p.jobAddr} onChange={p.setJobAddr} type="text" placeholder="456 Oak Ave"/>
      <button onClick={function(){if(confirm("Clear customer info?")){p.setCustName("");p.setCustAddr("");p.setCustPhone("");p.setCustEmail("");p.setJobAddr("");}}} style={{width:"100%",marginTop:12,padding:"8px",borderRadius:8,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase"}}>{"Clear Customer Info"}</button>
    </div>)}
  </div>);
}

function groupMeasurements(items){var g={};items.forEach(function(m){var k=m.group||"Other";if(!g[k])g[k]=[];g[k].push(m);});return g;}

/* ──────── PRINT / DOWNLOAD FUNCTIONS ──────── */

function buildSalesmanBlock(salesman){
  var s=SALESMAN_INFO[salesman];if(!s)return "";
  return '<div style="margin-top:30px;display:inline-block;padding:10px 16px;background:#f5f5f5;border:2px solid #222;border-radius:6px"><div style="font-size:9px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Your Sales Representative</div><div style="font-size:16px;font-weight:800;color:#111;margin-bottom:4px">'+s.fullName+'</div><div style="font-size:13px;color:#111;font-weight:600;margin-bottom:2px">📞 '+s.phone+'</div><div style="font-size:13px;color:#111;font-weight:600">✉ '+s.email+'</div></div>';
}

function buildTakeOffHtml(customer,jobNotes,measurements,salesman){
  var groups=groupMeasurements(measurements);var sorted=GROUP_ORDER.filter(function(g){return groups[g];});
  var total=measurements.reduce(function(s,m){return s+m.sqft;},0);
  var today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  var notesHtml=jobNotes?'<div style="margin-bottom:20px;padding:12px 14px;background:#f9f9f9;border:1px solid #ddd;border-radius:6px"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Job Notes</div><div style="font-size:13px;color:#333;white-space:pre-wrap;line-height:1.5">'+jobNotes.replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</div></div>':"";
  var ghtml=sorted.map(function(gn){var gt=groups[gn].reduce(function(s,m){return s+m.sqft;},0);
    var rows=groups[gn].map(function(item){return '<tr style="border-bottom:1px solid #e0e0e0"><td style="padding:8px 10px;font-size:13px;color:#333">'+item.location+'</td><td style="padding:8px 10px;font-size:13px;color:#333;text-align:right;font-weight:600">'+item.sqft.toLocaleString()+' sf</td></tr>';}).join("");
    return '<div style="margin-bottom:20px"><div style="display:flex;justify-content:space-between;align-items:center;padding:8px 10px;background:#f5f5f5;border:1px solid #ddd;border-bottom:2px solid #333;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#333"><span>'+gn+'</span><span>'+gt.toLocaleString()+' sq ft</span></div><table style="width:100%;border-collapse:collapse"><tbody>'+rows+'</tbody></table></div>';}).join("");
  var si=SALESMAN_INFO[salesman];
  var salesHtml=si?'<div style="text-align:right"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Your Sales Rep</div><div style="font-size:15px;font-weight:800;color:#111;margin-bottom:2px">'+si.fullName+'</div><div style="font-size:13px;color:#111;font-weight:600;margin-bottom:1px">'+si.phone+'</div><div style="font-size:13px;color:#111;font-weight:600">'+si.email+'</div></div>':'';
  var totalRow=measurements.length>0?'<div style="margin-top:24px;padding-top:16px;border-top:2px solid #111;display:flex;justify-content:space-between;align-items:center"><div style="font-size:14px;font-weight:800;text-transform:uppercase;color:#111">Total</div><div style="font-size:18px;font-weight:800;color:#111">'+total.toLocaleString()+' sq ft</div></div>':'';
  return '<div style="font-family:Arial,sans-serif;color:#1a1a1a;padding:32px;max-width:800px;margin:0 auto">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #111"><div><h1 style="font-size:22px;font-weight:800;color:#111;margin-bottom:2px">'+COMPANY.name+'</h1><p style="font-size:12px;color:#888">'+COMPANY.tagline+'</p></div><div style="text-align:right"><div style="font-size:18px;font-weight:800;color:#111;text-transform:uppercase">Take Off</div><div style="font-size:12px;color:#888;margin-top:2px">'+today+'</div></div></div>'+
    '<div style="display:flex;justify-content:space-between;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #ddd"><div style="flex:1"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Customer</div><div style="font-size:15px;font-weight:600">'+(customer.name||"—")+'</div><div style="font-size:13px;color:#666">'+(customer.address||"")+'</div><div style="font-size:13px;color:#666">'+(customer.phone||"")+'</div><div style="font-size:13px;color:#666">'+(customer.email||"")+'</div></div><div style="flex:1"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Job Site</div><div style="font-size:15px;font-weight:600">'+(customer.jobAddress||customer.address||"—")+'</div></div>'+salesHtml+'</div>'+
    notesHtml+
    ghtml+totalRow+
    '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center">'+COMPANY.name+' &bull; '+COMPANY.phone+'<br/>Helping Oklahoma stay energy efficient—one home at a time.</div></div>';
}

function printTakeOff(customer,jobNotes,measurements,salesman){
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Take Off</title><style>*{margin:0;padding:0;box-sizing:border-box}@media print{body{padding:0}}</style></head><body>'+buildTakeOffHtml(customer,jobNotes,measurements,salesman)+'</body></html>';
  var blob=new Blob([html],{type:"text/html"});var url=URL.createObjectURL(blob);var win=window.open(url,"_blank");
  if(win){win.onload=function(){setTimeout(function(){win.print();},500);};}
}

function downloadTakeOffPdf(customer,jobNotes,measurements,salesman){
  var container=document.createElement("div");
  container.innerHTML=buildTakeOffHtml(customer,jobNotes,measurements,salesman);
  document.body.appendChild(container);
  var filename="TakeOff"+(customer.name?" - "+customer.name:"")+".pdf";
  html2pdf().set({margin:0.3,filename:filename,image:{type:"jpeg",quality:0.98},html2canvas:{scale:2},jsPDF:{unit:"in",format:"letter",orientation:"portrait"}}).from(container).save().then(function(){document.body.removeChild(container);});
}

function buildQuoteHtml(customer,opts,salesman){
  var today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});var qn="IST-"+Date.now().toString(36).toUpperCase();
  var si=SALESMAN_INFO[salesman];
  var salesHtml=si?'<div style="flex:1;text-align:right"><div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Your Sales Rep</div><div style="font-size:15px;font-weight:800;color:#111;margin-bottom:3px">'+si.fullName+'</div><div style="font-size:13px;color:#111;font-weight:600;margin-bottom:1px">'+si.phone+'</div><div style="font-size:13px;color:#111;font-weight:600">'+si.email+'</div></div>':'';
  var optsWithItems=opts.filter(function(o){return o.items.length>0;});
  var optSections=optsWithItems.map(function(opt,oi){
    var rows=opt.items.map(function(item,i){return '<tr style="border-bottom:1px solid #ddd"><td style="padding:10px 8px;font-size:13px">'+(i+1)+'</td><td style="padding:10px 8px;font-size:13px">'+item.description+'</td></tr>';}).join("");
    var energySealRow=opt.energySeal?'<tr style="border-bottom:1px solid #ddd"><td style="padding:10px 8px;font-size:13px">'+(opt.items.length+1)+'</td><td style="padding:10px 8px;font-size:13px">Energy seal and plates per city code.</td></tr>':"";
    var lineTotal=opt.items.reduce(function(s,i){return s+i.total;},0);
    var psoCredit=opt.pso?600:0;
    var el=opt.extraLabor?(parseFloat(opt.extraLaborAmt)||0):0;
    var tc=opt.tripCharge?(parseFloat(opt.tripChargeAmt)||0):0;
    var es=opt.energySeal?(parseFloat(opt.energySealAmt)||0):0;
    var sub=lineTotal+el+tc+es;
    var total=opt.overrideTotal!==""?(parseFloat(opt.overrideTotal)||0):(sub-psoCredit);
    var header=optsWithItems.length>1?'<div style="font-size:18px;font-weight:800;color:#111;margin-bottom:16px;padding-bottom:8px;border-bottom:2px solid #111">'+opt.name+'</div>':"";
    var totalLabel=optsWithItems.length>1?opt.name+" Total":"Total";
    var totalHtml="";
    if(opt.pso){
      totalHtml='<div style="display:flex;justify-content:flex-end;margin-bottom:'+(oi<optsWithItems.length-1?"30":"0")+'px"><div style="width:280px">'+
        '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:15px;font-weight:600;color:#333"><span>Price</span><span>$'+Math.ceil(sub).toLocaleString()+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:15px;font-weight:600;color:#dc2626;border-bottom:1px solid #ddd"><span>Less PSO Credit</span><span>-$600</span></div>'+
        '<div style="display:flex;justify-content:space-between;padding:12px 0;font-size:20px;font-weight:800;color:#111"><span>'+totalLabel+'</span><span>$'+Math.ceil(total).toLocaleString()+'</span></div>'+
        '</div></div>';
    }else{
      totalHtml='<div style="display:flex;justify-content:flex-end;margin-bottom:'+(oi<optsWithItems.length-1?"30":"0")+'px"><div style="width:280px"><div style="display:flex;justify-content:space-between;padding:12px 0;font-size:20px;font-weight:800;color:#111"><span>'+totalLabel+'</span><span>$'+Math.ceil(total).toLocaleString()+'</span></div></div></div>';
    }
    return header+'<table style="width:100%;border-collapse:collapse;margin-bottom:16px"><thead><tr style="background:#111"><th style="padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;text-align:left;color:#fff">#</th><th style="padding:10px 8px;font-size:11px;font-weight:700;text-transform:uppercase;text-align:left;color:#fff">Description</th></tr></thead><tbody>'+rows+energySealRow+'</tbody></table>'+totalHtml;
  }).join("");
  return '<div style="font-family:Arial,sans-serif;color:#1a1a1a;padding:40px;max-width:800px;margin:0 auto">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:20px;border-bottom:3px solid #222"><div><h1 style="font-size:26px;font-weight:800;color:#111;margin-bottom:4px">'+COMPANY.name+'</h1><p style="font-size:13px;color:#666">'+COMPANY.tagline+'</p><p style="font-size:13px;color:#666">'+COMPANY.phone+'</p></div><div style="text-align:right"><div style="font-size:22px;font-weight:700;color:#111">QUOTE</div><div style="font-size:13px;color:#666;margin-top:4px">'+qn+'</div><div style="font-size:13px;color:#666">'+today+'</div></div></div>'+
    '<div style="display:flex;gap:24px;margin-bottom:30px"><div style="flex:1"><div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Prepared For</div><div style="font-size:15px;font-weight:600">'+(customer.name||"—")+'</div><div style="font-size:13px;color:#666">'+(customer.address||"")+'</div><div style="font-size:13px;color:#666">'+(customer.phone||"")+'</div><div style="font-size:13px;color:#666">'+(customer.email||"")+'</div></div><div style="flex:1"><div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Project</div><div style="font-size:13px;color:#666">Job Site: '+(customer.jobAddress||customer.address||"—")+'</div><div style="font-size:13px;color:#666">Valid 30 days from quote date</div></div>'+salesHtml+'</div>'+
    optSections+
    '<div style="margin-top:20px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#111;text-align:center">'+COMPANY.name+' &bull; '+COMPANY.phone+'<br/>Helping Oklahoma stay energy efficient—one home at a time.</div></div>';
}

function generatePDF(customer,opts,salesman){
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Quote</title><style>*{margin:0;padding:0;box-sizing:border-box}@media print{body{padding:0}}</style></head><body>'+buildQuoteHtml(customer,opts,salesman)+'</body></html>';
  var blob=new Blob([html],{type:"text/html"});var url=URL.createObjectURL(blob);var win=window.open(url,"_blank");
  if(win){win.onload=function(){setTimeout(function(){win.print();},500);};}
}

function downloadQuotePdf(customer,opts,salesman){
  var container=document.createElement("div");
  container.innerHTML=buildQuoteHtml(customer,opts,salesman);
  document.body.appendChild(container);
  var filename="Quote"+(customer.name?" - "+customer.name:"")+".pdf";
  html2pdf().set({margin:0.3,filename:filename,image:{type:"jpeg",quality:0.98},html2canvas:{scale:2},jsPDF:{unit:"in",format:"letter",orientation:"portrait"}}).from(container).save().then(function(){document.body.removeChild(container);});
}

/* ══════════ TAKE OFF ══════════ */

function TakeOff(p){
  function addM(item){p.setMeasurements(function(prev){return prev.concat([Object.assign({},item,{id:Date.now()+Math.random()})]);});}
  function removeM(id){p.setMeasurements(function(prev){return prev.filter(function(m){return m.id!==id;});});}
  var groups=groupMeasurements(p.measurements);var sorted=GROUP_ORDER.filter(function(g){return groups[g];});
  var total=p.measurements.reduce(function(s,m){return s+m.sqft;},0);
  return(<div>
    <CustomerInfo custName={p.custName} setCustName={p.setCustName} custAddr={p.custAddr} setCustAddr={p.setCustAddr} custPhone={p.custPhone} setCustPhone={p.setCustPhone} custEmail={p.custEmail} setCustEmail={p.setCustEmail} jobAddr={p.jobAddr} setJobAddr={p.setJobAddr}/>
    <div style={{padding:"0 16px 12px"}}>
      <label style={{fontSize:11,fontWeight:700,color:C.dim,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{"Job Notes / Description"}</label>
      <textarea style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:8,color:C.white,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",minHeight:80,resize:"vertical"}} value={p.jobNotes} onChange={function(e){p.setJobNotes(e.target.value);}} placeholder="e.g. 2-story, 4/12 pitch, no garage, spray foam roofline + blown walls..."/>
    </div>
    <div style={{padding:"0 16px"}}><MeasurementForm key={"to-takeoff"} tab={"fiberglass"} onAdd={addM} hasPrice={false}/></div>
    {p.measurements.length>0&&(<div style={{padding:"20px 16px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>{"Take Off ("+p.measurements.length+" items · "+total.toLocaleString()+" sq ft)"}</div>
      {sorted.map(function(gn){var gt=groups[gn].reduce(function(s,m){return s+m.sqft;},0);
        return(<div key={gn} style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,paddingBottom:6,borderBottom:"1px solid "+C.border}}>{gn}<span style={{color:C.green,marginLeft:8}}>{gt.toLocaleString()+" sq ft"}</span></div>
          <div style={{background:C.card,borderRadius:10,border:"1px solid "+C.border,overflow:"hidden"}}>
            {groups[gn].map(function(item,idx){return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:idx<groups[gn].length-1?"1px solid "+C.border:"none"}}>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,lineHeight:1.3,color:C.text}}>{item.location}</div>{item.pitch&&(<div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.pitch}</div>)}</div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginLeft:12}}><div style={{fontSize:14,fontWeight:700,color:C.white}}>{item.sqft.toLocaleString()+" sf"}</div><button onClick={function(){removeM(item.id);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>{"✕"}</button></div>
            </div>);})}
          </div>
        </div>);
      })}
      <GreenBtn onClick={p.onSendToQuote}>{"Send to Quote Builder →"}</GreenBtn>
      <button onClick={function(){if(confirm("Clear all measurements?"))p.setMeasurements([]);}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:10,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase"}}>{"Clear All"}</button>
    </div>)}
    <div style={{padding:"12px 16px 0"}}>
      <GreenBtn onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr||p.custAddr};printTakeOff(cust,p.jobNotes,p.measurements,p.currentUser);}}>{"Print Take Off"}</GreenBtn>
      <GreenBtn onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr||p.custAddr};downloadTakeOffPdf(cust,p.jobNotes,p.measurements,p.currentUser);}} mt={8}>{"📥 Download Take Off PDF"}</GreenBtn>
    </div>
    {p.measurements.length===0&&(<div style={{textAlign:"center",padding:"40px 16px",color:C.dim}}><div style={{fontSize:36,marginBottom:8}}>{"📏"}</div><div style={{fontSize:14}}>{"Start measuring — add locations above"}</div></div>)}
  </div>);
}

/* ══════════ QUOTE BUILDER ══════════ */

function newOption(name){return{name:name,items:[],pso:false,extraLabor:false,extraLaborAmt:"",tripCharge:false,tripChargeAmt:"",overrideTotal:""};}

function QuoteBuilderSection(p){
  var s1=useState("fiberglass"),matTab=s1[0],setMatTab=s1[1];
  var s2=useState(null),pricingId=s2[0],setPricingId=s2[1];
  var s3=useState(""),pricingPrice=s3[0],setPricingPrice=s3[1];
  var s12=useState(""),pricingMat=s12[0],setPricingMat=s12[1];
  var s13=useState(0),activeIdx=s13[0],setActiveIdx=s13[1];
  var s14=useState(false),editingName=s14[0],setEditingName=s14[1];

  var opts=p.quoteOpts;var setOpts=p.setQuoteOpts;
  if(activeIdx>=opts.length)setActiveIdx(0);
  var opt=opts[activeIdx]||newOption("Option 1");

  function updateOpt(changes){setOpts(function(prev){return prev.map(function(o,i){return i===activeIdx?Object.assign({},o,changes):o;});});}
  function addItem(item){updateOpt({items:opt.items.concat([Object.assign({},item,{id:Date.now()+Math.random()})]),overrideTotal:""});}
  function removeItem(id){updateOpt({items:opt.items.filter(function(i){return i.id!==id;}),overrideTotal:""});}

  var unpriced=p.importedItems.filter(function(i){return!i.priced;});
  var lineItemsTotal=opt.items.reduce(function(s,i){return s+i.total;},0);
  var psoCredit=opt.pso?600:0;
  var extraLabor=opt.extraLabor?(parseFloat(opt.extraLaborAmt)||0):0;
  var tripCharge=opt.tripCharge?(parseFloat(opt.tripChargeAmt)||0):0;
  var energySeal=opt.energySeal?(parseFloat(opt.energySealAmt)||0):0;
  var subtotal=lineItemsTotal-psoCredit+extraLabor+tripCharge+energySeal;
  var finalTotal=opt.overrideTotal!==""?(parseFloat(opt.overrideTotal)||0):subtotal;
  var matSs={width:"100%",padding:"8px 10px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.white,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",marginBottom:8};

  function handlePriceImport(item){var pr=parseFloat(pricingPrice)||0;if(pr<=0||!pricingMat)return;
    var desc="Install "+pricingMat.toLowerCase()+" in "+item.location.toLowerCase();
    addItem(Object.assign({},item,{material:pricingMat,pricePerUnit:pr,total:Math.ceil(item.sqft*pr),description:desc}));
    p.setImportedItems(function(prev){return prev.map(function(i){return i.id===item.id?Object.assign({},i,{priced:true}):i;});});
    setPricingId(null);setPricingPrice("");setPricingMat("");}

  function addOption(){setOpts(function(prev){return prev.concat([newOption("Option "+(prev.length+1))]);});setActiveIdx(opts.length);}
  function removeOption(idx){if(opts.length<=1)return;setOpts(function(prev){return prev.filter(function(_,i){return i!==idx;});});if(activeIdx>=opts.length-1)setActiveIdx(Math.max(0,opts.length-2));}

  return(<div>
    <CustomerInfo custName={p.custName} setCustName={p.setCustName} custAddr={p.custAddr} setCustAddr={p.setCustAddr} custPhone={p.custPhone} setCustPhone={p.setCustPhone} custEmail={p.custEmail} setCustEmail={p.setCustEmail} jobAddr={p.jobAddr} setJobAddr={p.setJobAddr}/>

    {/* OPTION TABS */}
    <div style={{padding:"0 16px 12px"}}>
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        {opts.map(function(o,idx){return(
          <button key={idx} onClick={function(){setActiveIdx(idx);setPricingId(null);}}
            style={{padding:"8px 14px",borderRadius:8,border:activeIdx===idx?"2px solid "+C.green:"1px solid "+C.border,background:activeIdx===idx?C.card:"transparent",color:activeIdx===idx?C.green:C.dim,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
            {o.name}{o.items.length>0?" ("+o.items.length+")":""}
          </button>
        );})}
        <button onClick={addOption} style={{padding:"8px 12px",borderRadius:8,border:"1px dashed "+C.dim,background:"transparent",color:C.dim,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{"+"}</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
        {editingName?(<div style={{display:"flex",gap:6,flex:1}}>
          <input style={{flex:1,padding:"6px 10px",background:C.input,border:"1px solid "+C.green,borderRadius:6,color:C.white,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none"}}
            type="text" value={opt.name} onChange={function(e){updateOpt({name:e.target.value});}} autoFocus
            onKeyDown={function(e){if(e.key==="Enter")setEditingName(false);}}/>
          <button onClick={function(){setEditingName(false);}} style={{padding:"6px 10px",background:C.green,border:"none",borderRadius:6,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{"OK"}</button>
        </div>):(<div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <span style={{fontSize:14,fontWeight:700,color:C.white}}>{opt.name}</span>
          <button onClick={function(){setEditingName(true);}} style={{background:"none",border:"none",color:C.dim,fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{"✏️ rename"}</button>
          {opts.length>1&&(<button onClick={function(){if(confirm("Delete \""+opt.name+"\"?"))removeOption(activeIdx);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",marginLeft:"auto"}}>{"🗑 delete option"}</button>)}
        </div>)}
      </div>
    </div>

    {/* FROM TAKE OFF */}
    {unpriced.length>0&&(<div style={{padding:"0 16px 16px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>{"From Take Off — Price These ("+unpriced.length+")"}</div>
      <div style={{background:C.card,borderRadius:10,border:"1px solid "+C.border,overflow:"hidden"}}>
        {unpriced.map(function(item,idx){return(<div key={item.id} style={{padding:"12px 14px",borderBottom:idx<unpriced.length-1?"1px solid "+C.border:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.location}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.sqft.toLocaleString()+" sq ft"}{item.pitch?" · "+item.pitch:""}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:12}}>
              {pricingId!==item.id&&(<button onClick={function(){setPricingId(item.id);setPricingMat("");setPricingPrice("");}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+C.green,borderRadius:8,color:C.green,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase"}}>{"Price"}</button>)}
              <button onClick={function(){p.setImportedItems(function(prev){return prev.filter(function(i){return i.id!==item.id;});});}} style={{padding:"4px 6px",background:"none",border:"none",color:C.danger,fontSize:14,cursor:"pointer"}}>{"🗑"}</button>
            </div>
          </div>
          {pricingId===item.id&&(<div style={{marginTop:10,padding:12,background:C.bg,borderRadius:8,border:"1px solid "+C.border}}>
            <div style={{fontSize:11,color:C.green,fontWeight:600,marginBottom:6}}>{"Adding to: "+opt.name}</div>
            <select style={matSs} value={pricingMat} onChange={function(e){setPricingMat(e.target.value);}}>
              <option value="">{"— Select Material —"}</option>
              <optgroup label="Fiberglass">{FIBERGLASS_MATERIALS.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</optgroup>
              <optgroup label="Open Cell Foam">{OPEN_CELL_MATERIALS.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</optgroup>
              <optgroup label="Closed Cell Foam">{CLOSED_CELL_MATERIALS.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</optgroup>
            </select>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input style={{flex:1,padding:"8px 10px",background:C.input,border:"1px solid "+C.green,borderRadius:6,color:C.white,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none"}} type="number" value={pricingPrice} onChange={function(e){setPricingPrice(e.target.value);}} placeholder="$/sf" step="0.01" autoFocus/>
              <button onClick={function(){handlePriceImport(item);}} style={{padding:"8px 14px",background:C.green,border:"none",borderRadius:6,color:"#000",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{"Add"}</button>
              <button onClick={function(){setPricingId(null);setPricingPrice("");setPricingMat("");}} style={{padding:"8px 10px",background:"none",border:"1px solid "+C.dim,borderRadius:6,color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>{"✕"}</button>
            </div>
          </div>)}
        </div>);})}
      </div>
      <button onClick={function(){if(confirm("Clear all imported items?"))p.setImportedItems(function(prev){return prev.filter(function(i){return i.priced;});});}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:10,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase"}}>{"Clear All"}</button>
    </div>)}

    {/* ADD MANUALLY */}
    <div style={{padding:"0 16px",marginBottom:16}}><MaterialTabs activeTab={matTab} setActiveTab={setMatTab}/><MeasurementForm key={"qb-"+matTab+"-"+activeIdx} tab={matTab} onAdd={addItem} hasPrice={true}/></div>

    {/* ITEMS FOR ACTIVE OPTION */}
    {opt.items.length>0&&(<div style={{padding:"0 16px 20px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{opt.name+" — Items ("+opt.items.length+")"}</div>
      <div style={{background:C.card,borderRadius:12,padding:16,border:"1px solid "+C.border}}>
        {opt.items.map(function(item,idx){return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:idx<opt.items.length-1?"1px solid "+C.border:"none"}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,lineHeight:1.3,color:C.text}}>{item.description}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.sqft.toLocaleString()+" sq ft"}{item.pitch?" · "+item.pitch:""}</div></div>
          <div style={{marginLeft:12}}><button onClick={function(){removeItem(item.id);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Outfit',sans-serif",fontWeight:600}}>{"REMOVE"}</button></div>
        </div>);})}

        {/* ADJUSTMENTS */}
        <div style={{paddingTop:12,marginTop:8,borderTop:"1px solid "+C.borderLight}}>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.pso} onChange={function(e){updateOpt({pso:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.green,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"PSO Credit"}</span>
            {opt.pso&&(<span style={{fontSize:13,fontWeight:700,color:C.danger,marginLeft:"auto"}}>{"-$600"}</span>)}
          </label>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.extraLabor} onChange={function(e){updateOpt({extraLabor:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.green,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Extra Labor"}</span>
            <span style={{fontSize:10,color:C.dim,fontStyle:"italic"}}>{"(not on quote)"}</span>
            {opt.extraLabor&&(
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:13,color:C.white}}>{"$"}</span>
                <input type="number" value={opt.extraLaborAmt} onChange={function(e){updateOpt({extraLaborAmt:e.target.value,overrideTotal:""});}}
                  style={{width:80,padding:"4px 8px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.white,fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",outline:"none",textAlign:"right"}} placeholder="0" step="1"/>
              </div>
            )}
          </label>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.tripCharge} onChange={function(e){updateOpt({tripCharge:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.green,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Trip Charge"}</span>
            <span style={{fontSize:10,color:C.dim,fontStyle:"italic"}}>{"(not on quote)"}</span>
            {opt.tripCharge&&(
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:13,color:C.white}}>{"$"}</span>
                <input type="number" value={opt.tripChargeAmt} onChange={function(e){updateOpt({tripChargeAmt:e.target.value,overrideTotal:""});}}
                  style={{width:80,padding:"4px 8px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.white,fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",outline:"none",textAlign:"right"}} placeholder="0" step="1"/>
              </div>
            )}
          </label>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.energySeal||false} onChange={function(e){updateOpt({energySeal:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.green,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Energy Seal & Plates"}</span>
            {opt.energySeal&&(
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:13,color:C.white}}>{"$"}</span>
                <input type="number" value={opt.energySealAmt||""} onChange={function(e){updateOpt({energySealAmt:e.target.value,overrideTotal:""});}}
                  style={{width:80,padding:"4px 8px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.white,fontSize:13,fontWeight:600,fontFamily:"'Outfit',sans-serif",outline:"none",textAlign:"right"}} placeholder="0" step="1"/>
              </div>
            )}
          </label>
        </div>

        {/* TOTAL */}
        <div style={{paddingTop:12,marginTop:4,borderTop:"1px solid "+C.borderLight}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 0"}}>
            <span style={{fontSize:18,fontWeight:800,color:C.white}}>{"TOTAL"}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16,fontWeight:800,color:C.white}}>{"$"}</span>
              <input type="number" value={opt.overrideTotal!==""?opt.overrideTotal:subtotal.toFixed(0)} onChange={function(e){updateOpt({overrideTotal:e.target.value});}}
                style={{width:110,padding:"6px 10px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.white,fontSize:18,fontWeight:800,fontFamily:"'Outfit',sans-serif",outline:"none",textAlign:"right"}} step="1"/>
            </div>
          </div>
          {opt.overrideTotal!==""&&parseFloat(opt.overrideTotal)!==subtotal&&(<div style={{fontSize:11,color:C.dim,textAlign:"right",marginTop:4}}>{"Calculated: $"+subtotal.toFixed(0)}</div>)}
        </div>
      </div>
      <button onClick={function(){if(confirm("Clear items from "+opt.name+"?"))updateOpt({items:[]});}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:10,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",textTransform:"uppercase"}}>{"Clear "+opt.name}</button>
    </div>)}

    {/* PRINT/DOWNLOAD — show when ANY option has items */}
    {opts.some(function(o){return o.items.length>0;})&&(<div style={{padding:"0 16px 20px"}}>
      <GreenBtn onClick={function(){generatePDF({name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr},opts,p.currentUser);}}>{"Print Quote"}</GreenBtn>
      <GreenBtn mt={8} onClick={function(){downloadQuotePdf({name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr},opts,p.currentUser);}}>{"📥 Download Quote PDF"}</GreenBtn>
    </div>)}

    {opt.items.length===0&&unpriced.length===0&&(<div style={{textAlign:"center",padding:"40px 16px",color:C.dim}}><div style={{fontSize:36,marginBottom:8}}>{"💰"}</div><div style={{fontSize:14}}>{"Use Take Off to measure first, or add items manually"}</div></div>)}
  </div>);
}

/* ══════════ TEAM ══════════ */

var TEAM_MEMBERS = ["Johnny", "Skip", "Jordan"];

/* ══════════ SAVED JOBS PANEL ══════════ */

function SavedJobsPanel(p) {
  var s1 = useState([]), jobs = s1[0], setJobs = s1[1];
  var s2 = useState(false), loading = s2[0], setLoading = s2[1];
  var s3 = useState(""), saveName = s3[0], setSaveName = s3[1];
  var s4 = useState(false), showSave = s4[0], setShowSave = s4[1];
  var s5 = useState(""), status = s5[0], setStatus = s5[1];
  var s6 = useState({}), openSections = s6[0], setOpenSections = s6[1];

  function refreshJobs() {
    setLoading(true);
    loadAllJobs().then(function(data) {
      setJobs(data || []);
      setLoading(false);
    });
  }

  useEffect(function() { refreshJobs(); }, []);

  function handleSave() {
    var name = saveName.trim();
    if (!name) return;
    var jobData = {
      custName: p.custName, custAddr: p.custAddr, custPhone: p.custPhone, custEmail: p.custEmail, jobAddr: p.jobAddr, jobNotes: p.jobNotes,
      measurements: p.measurements, quoteOpts: p.quoteOpts, importedItems: p.importedItems, section: p.section,
    };
    saveJob(name, p.currentUser, jobData).then(function(ok) {
      if (ok) {
        setStatus("Saved: " + name);
        setSaveName("");
        setShowSave(false);
        refreshJobs();
        setTimeout(function() { setStatus(""); }, 2000);
      }
    });
  }

  function handleLoad(job) {
    if (!confirm("Load \"" + job.job_name + "\"? This will replace your current work.")) return;
    var d = job.job_data || {};
    p.setCustName(d.custName || "");
    p.setCustAddr(d.custAddr || "");
    p.setCustPhone(d.custPhone || "");
    p.setCustEmail(d.custEmail || "");
    p.setJobAddr(d.jobAddr || "");
    p.setJobNotes(d.jobNotes || "");
    p.setMeasurements(d.measurements || []);
    if (d.quoteOpts) p.setQuoteOpts(d.quoteOpts);
    else if (d.quoteItems && d.quoteItems.length > 0) p.setQuoteOpts([Object.assign(newOption("Option 1"),{items:d.quoteItems})]);
    else p.setQuoteOpts([newOption("Option 1")]);
    p.setImportedItems(d.importedItems || []);
    setStatus("Loaded: " + job.job_name);
    setTimeout(function() { setStatus(""); }, 2000);
  }

  function handleDelete(job) {
    if (!confirm("Delete \"" + job.job_name + "\"?")) return;
    deleteJob(job.id).then(function() { refreshJobs(); });
  }

  var hasWork = p.measurements.length > 0 || p.quoteOpts.some(function(o){return o.items.length>0;});

  return (
    <div style={{ padding: "0 16px 16px" }}>
      {hasWork && (
        <div style={{ marginBottom: 12 }}>
          {!showSave ? (
            <button onClick={function() { setShowSave(true); setSaveName(p.custName || ""); }}
              style={{ width: "100%", padding: "11px 16px", borderRadius: 10, border: "1px solid " + C.blue, background: "transparent", color: C.blue, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {"💾 Save Current Job"}
            </button>
          ) : (
            <div style={{ background: C.card, borderRadius: 10, padding: 14, border: "1px solid " + C.blue }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, textTransform: "uppercase", marginBottom: 8 }}>{"Save Job As"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ flex: 1, padding: "8px 12px", background: C.input, border: "1px solid " + C.inputBorder, borderRadius: 8, color: C.white, fontSize: 14, fontFamily: "'Outfit', sans-serif", outline: "none" }}
                  type="text" value={saveName} onChange={function(e) { setSaveName(e.target.value); }} placeholder="Job name (e.g. Smith Residence)" autoFocus
                  onKeyDown={function(e) { if (e.key === "Enter") handleSave(); }}
                />
                <button onClick={handleSave} style={{ padding: "8px 16px", background: C.blue, border: "none", borderRadius: 8, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>{"Save"}</button>
                <button onClick={function() { setShowSave(false); }} style={{ padding: "8px 12px", background: "none", border: "1px solid " + C.dim, borderRadius: 8, color: C.dim, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>{"✕"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {status && (<div style={{ padding: "8px 12px", background: "#1a2e1a", border: "1px solid " + C.green, borderRadius: 8, fontSize: 13, color: C.green, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{status}</div>)}

      {loading && (<div style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: "16px 0" }}>{"Loading..."}</div>)}

      {!loading && TEAM_MEMBERS.map(function(member) {
        var memberJobs = jobs.filter(function(j) { return j.saved_by === member; });
        var isOpen = openSections[member];
        return (
          <div key={member} style={{ marginBottom: 10 }}>
            <button onClick={function() { setOpenSections(function(prev) { var n = Object.assign({}, prev); n[member] = !n[member]; return n; }); }}
              style={{ width: "100%", padding: "12px 16px", borderRadius: isOpen ? "10px 10px 0 0" : 10, border: "1px solid " + C.border, background: C.card, color: C.white, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{member + (memberJobs.length > 0 ? " (" + memberJobs.length + ")" : "")}</span>
              <span style={{ fontSize: 14, color: C.dim }}>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div style={{ background: C.card, borderRadius: "0 0 10px 10px", border: "1px solid " + C.border, borderTop: "none", overflow: "hidden" }}>
                {memberJobs.length === 0 && (
                  <div style={{ padding: "12px 14px", fontSize: 12, color: C.dim, textAlign: "center" }}>{"No saved jobs"}</div>
                )}
                {memberJobs.map(function(job, idx) {
                  var date = new Date(job.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  var d = job.job_data || {};
                  var measCount = (d.measurements || []).length;
                  var quoteCount = d.quoteOpts ? d.quoteOpts.reduce(function(s,o){return s+(o.items?o.items.length:0);},0) : (d.quoteItems||[]).length;
                  var info = [];
                  if (measCount > 0) info.push(measCount + " measurements");
                  if (quoteCount > 0) info.push(quoteCount + " quote items");
                  return (
                    <div key={job.id} style={{ padding: "12px 14px", borderBottom: idx < memberJobs.length - 1 ? "1px solid " + C.border : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{job.job_name}</div>
                          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                            {date + (info.length > 0 ? " · " + info.join(", ") : "")}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={function() { handleLoad(job); }}
                            style={{ padding: "6px 12px", background: C.green, border: "none", borderRadius: 6, color: "#000", fontWeight: 700, fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textTransform: "uppercase" }}>{"Load"}</button>
                          <button onClick={function() { handleDelete(job); }}
                            style={{ padding: "6px 8px", background: "none", border: "1px solid " + C.danger, borderRadius: 6, color: C.danger, fontSize: 11, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>{"✕"}</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════ LOGIN SCREEN ══════════ */

function LoginScreen(p) {
  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');"}</style>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: C.white, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>{"Insulation Services of Tulsa"}</h1>
        <div style={{ fontSize: 11, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>{COMPANY.tagline}</div>
      </div>
      <div style={{ width: "100%", maxWidth: 320 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, textAlign: "center" }}>{"Who's working?"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEAM_MEMBERS.map(function(name) {
            return (
              <button key={name} onClick={function() { localStorage.setItem("ist-user", name); p.onLogin(name); }}
                style={{ width: "100%", padding: "16px 20px", borderRadius: 12, border: "1px solid " + C.border, background: C.card, color: C.white, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textAlign: "center", transition: "all 0.15s ease" }}>
                {name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════ MAIN APP ══════════ */

export default function App() {
  var s0 = useState(function() { return localStorage.getItem("ist-user") || ""; }), currentUser = s0[0], setCurrentUser = s0[1];
  var s1 = useState("takeoff"), sec = s1[0], setSec = s1[1];
  var s2 = useState([]), meas = s2[0], setMeas = s2[1];
  var s3 = useState([newOption("Option 1")]), qOpts = s3[0], setQOpts = s3[1];
  var s4 = useState([]), ii = s4[0], setIi = s4[1];
  var s5 = useState(""), cn = s5[0], setCn = s5[1];
  var s6 = useState(""), ca = s6[0], setCa = s6[1];
  var s7 = useState(""), cph = s7[0], setCph = s7[1];
  var s8 = useState(""), ce = s8[0], setCe = s8[1];
  var s9 = useState(""), ja = s9[0], setJa = s9[1];
  var s11 = useState(""), jn = s11[0], setJn = s11[1];
  var s10 = useState(true), initialLoad = s10[0], setInitialLoad = s10[1];

  // Auto-save current session to Supabase
  var autoSave = useCallback(function() {
    if (!currentUser) return;
    var data = { measurements: meas, quoteOpts: qOpts, importedItems: ii, custName: cn, custAddr: ca, custPhone: cph, custEmail: ce, jobAddr: ja, jobNotes: jn, section: sec };
    saveAutosave(currentUser, data);
  }, [meas, qOpts, ii, cn, ca, cph, ce, ja, jn, sec, currentUser]);

  useEffect(function() {
    if (initialLoad || !currentUser) return;
    var timer = setTimeout(autoSave, 2000);
    return function() { clearTimeout(timer); };
  }, [autoSave, initialLoad, currentUser]);

  // Load auto-saved session on login
  useEffect(function() {
    if (!currentUser) return;
    loadAutosave(currentUser).then(function(data) {
      if (data) {
        if (data.measurements) setMeas(data.measurements);
        if (data.quoteOpts) setQOpts(data.quoteOpts);
        else if (data.quoteItems && data.quoteItems.length > 0) setQOpts([Object.assign(newOption("Option 1"),{items:data.quoteItems})]);
        if (data.importedItems) setIi(data.importedItems);
        if (data.custName) setCn(data.custName);
        if (data.custAddr) setCa(data.custAddr);
        if (data.custPhone) setCph(data.custPhone);
        if (data.custEmail) setCe(data.custEmail);
        if (data.jobAddr) setJa(data.jobAddr);
        if (data.jobNotes) setJn(data.jobNotes);
        if (data.section) setSec(data.section);
      }
      setInitialLoad(false);
    });
  }, [currentUser]);

  if (!currentUser) {
    return <LoginScreen onLogin={function(name) { setCurrentUser(name); }} />;
  }

  function sendToQuote() {
    if (meas.length === 0) return;
    setIi(function(prev) { return prev.concat(meas.map(function(m) { return Object.assign({}, m, { priced: false }); })); });
    setSec("quote");
  }

  function handleNewJob() {
    var hasWork = meas.length > 0 || qOpts.some(function(o){return o.items.length>0;});
    if (hasWork && !confirm("Start a new job? Make sure you've saved first.")) return;
    setMeas([]); setQOpts([newOption("Option 1")]); setIi([]);
    setCn(""); setCa(""); setCph(""); setCe(""); setJa(""); setJn("");
    setSec("takeoff");
  }

  function handleLogout() {
    localStorage.removeItem("ist-user");
    setCurrentUser("");
    setMeas([]); setQOpts([newOption("Option 1")]); setIi([]);
    setCn(""); setCa(""); setCph(""); setCe(""); setJa(""); setJn("");
    setSec("takeoff");
    setInitialLoad(true);
  }

  var cp2 = { custName: cn, setCustName: setCn, custAddr: ca, setCustAddr: setCa, custPhone: cph, setCustPhone: setCph, custEmail: ce, setCustEmail: setCe, jobAddr: ja, setJobAddr: setJa, jobNotes: jn, setJobNotes: setJn };

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: C.bg, color: C.text, minHeight: "100vh", maxWidth: 520, margin: "0 auto", paddingBottom: 100 }}>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');"}</style>

      {/* HEADER */}
      <div style={{ background: C.card, padding: "22px 20px 16px", borderBottom: "2px solid " + C.green, textAlign: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: C.green, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{currentUser}</div>
          <button onClick={handleLogout} style={{ background: "none", border: "none", color: C.dim, fontSize: 10, cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600, textTransform: "uppercase" }}>{"Switch User"}</button>
        </div>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: C.white, letterSpacing: "0.04em", margin: 0, textTransform: "uppercase" }}>{"Insulation Services of Tulsa"}</h1>
        <div style={{ fontSize: 10, color: C.dim, marginTop: 3, letterSpacing: "0.12em", textTransform: "uppercase" }}>{COMPANY.tagline}</div>

        <div style={{ display: "flex", gap: 0, borderRadius: 10, overflow: "hidden", border: "1px solid " + C.border, marginTop: 14 }}>
          {[
            { id: "takeoff", label: "TAKE OFF", badge: meas.length || null },
            { id: "quote", label: "QUOTE", badge: qOpts.reduce(function(s,o){return s+o.items.length;},0) || null },
            { id: "jobs", label: "JOBS", badge: null },
          ].map(function(t) {
            return (
              <button key={t.id} onClick={function() { setSec(t.id); }}
                style={{ flex: 1, padding: "10px 6px", border: "none", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", background: sec === t.id ? C.white : C.card, color: sec === t.id ? "#000" : C.dim, transition: "all 0.15s ease" }}>
                {t.label}
                {t.badge ? (<span style={{ display: "inline-block", marginLeft: 5, background: sec === t.id ? C.green : "#333", color: sec === t.id ? "#000" : C.dim, fontSize: 10, fontWeight: 800, padding: "2px 6px", borderRadius: 10, minWidth: 18, textAlign: "center" }}>{t.badge}</span>) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ paddingTop: 16 }}>
        {sec === "takeoff" && (<TakeOff measurements={meas} setMeasurements={setMeas} onSendToQuote={sendToQuote} currentUser={currentUser} {...cp2} />)}
        {sec === "quote" && (<QuoteBuilderSection quoteOpts={qOpts} setQuoteOpts={setQOpts} importedItems={ii} setImportedItems={setIi} currentUser={currentUser} {...cp2} />)}
        {sec === "jobs" && (
          <div>
            <SavedJobsPanel
              measurements={meas} quoteOpts={qOpts} importedItems={ii}
              setMeasurements={setMeas} setQuoteOpts={setQOpts} setImportedItems={setIi}
              section={sec} setSection={setSec}
              currentUser={currentUser}
              {...cp2}
            />
            <div style={{ padding: "0 16px" }}>
              <button onClick={handleNewJob}
                style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1px solid " + C.borderLight, background: "transparent", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {"+ New Job"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
