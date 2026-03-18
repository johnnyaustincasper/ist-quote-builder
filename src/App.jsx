import { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
const getHtml2pdf = () => import("html2pdf.js").then(m => m.default);

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
  { id: "band_joist",       label: "Band Joist Blocking",           short: "Band Joist",        type: "area",    group: "Porch / Blocking" },
  { id: "ext_kneewall",     label: "Boxed Exterior Kneewall",       short: "Ext Kneewall",      type: "wall",    group: "Walls" },
  { id: "ext_slopes",       label: "Boxed Exterior Slopes",         short: "Ext Slopes",        type: "slope",   group: "Attic / Ceiling" },
  { id: "ext_walls_garage", label: "Boxed Exterior Walls of Garage",short: "Ext Walls Garage",  type: "wall",    group: "Walls" },
  { id: "ext_walls_house",  label: "Boxed Exterior Walls of House", short: "Ext Walls House",   type: "wall",    group: "Walls" },
  { id: "flat_ceiling",     label: "Flat Ceiling",                  short: "Flat Ceiling",      type: "area",    group: "Attic / Ceiling" },
  { id: "gable_end",        label: "Gable End",                     short: "Gable End",         type: "area",    group: "Roofline" },
  { id: "garage_common",    label: "Garage Common Wall",            short: "Garage Common",     type: "wall",    group: "Walls" },
  { id: "attic_area_garage",label: "Open Attic Area of Garage",     short: "Attic Garage",      type: "area",    group: "Attic / Ceiling" },
  { id: "attic_area_house", label: "Open Attic Area of House",      short: "Attic House",       type: "area",    group: "Attic / Ceiling" },
  { id: "attic_kneewall",   label: "Open Attic Kneewall",           short: "Attic Kneewall",    type: "area",    group: "Attic / Ceiling" },
  { id: "attic_slopes",     label: "Open Attic Slopes",             short: "Attic Slopes",      type: "area",    group: "Attic / Ceiling" },
  { id: "open_attic_walls", label: "Open Attic Walls",              short: "Attic Walls",       type: "wall",    group: "Walls" },
  { id: "porch",            label: "Porch",                         short: "Porch",             type: "area",    group: "Porch / Blocking" },
  { id: "porch_blocking",   label: "Porch Blocking",                short: "Porch Blocking",    type: "area",    group: "Porch / Blocking" },
  { id: "roofline",         label: "Roofline",                      short: "Roofline",          type: "roofline",group: "Roofline" },
  { id: "roofline_garage",  label: "Roofline of Garage",            short: "Roofline Garage",   type: "roofline",group: "Roofline" },
  { id: "roofline_house",   label: "Roofline of House",             short: "Roofline House",    type: "roofline",group: "Roofline" },
  { id: "custom",           label: "Custom",                        short: "Custom",            type: "area",    group: "Other" },
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

var C = {bg:"#f8f9fb",card:"#ffffff",accent:"#1a56db",accentHover:"#1648b8",accentBg:"#eef2ff",white:"#111827",text:"#111827",textSec:"#4b5563",dim:"#9ca3af",border:"#e2e5ea",borderLight:"#eef0f3",input:"#ffffff",inputBorder:"#e2e5ea",danger:"#dc2626",dangerBg:"#fef2f2",green:"#1a56db",blue:"#1a56db",shadow:"0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",shadowMd:"0 4px 12px rgba(0,0,0,0.08)"};

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
    var res = await supabase.from("jobs").select("*").neq("job_name", "__autosave__").neq("job_name", "__passcode__").order("updated_at", { ascending: false });
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

async function savePasscode(user, code) {
  return saveJob("__passcode__", user, { passcode: code });
}

async function loadPasscode(user) {
  try {
    var res = await supabase.from("jobs").select("*").eq("job_name", "__passcode__").eq("saved_by", user).limit(1);
    if (res.data && res.data.length > 0 && res.data[0].job_data) return res.data[0].job_data.passcode || null;
  } catch (e) { console.log("Passcode load error:", e); }
  return null;
}

/* ──────── UI COMPONENTS ──────── */

function Input(p){return(<div><label style={{fontSize:11,fontWeight:600,color:C.textSec,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.label}</label><input style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:15,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",transition:"border-color 0.15s"}} onFocus={function(e){e.target.style.borderColor=C.accent;}} onBlur={function(e){e.target.style.borderColor=C.inputBorder;}} type={p.type||"number"} value={p.value} onChange={function(e){p.onChange(e.target.value);}} placeholder={p.placeholder} step={p.step}/></div>);}

function AppSelect(p){return(<div><label style={{fontSize:11,fontWeight:600,color:C.textSec,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.label}</label><select style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:15,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",transition:"border-color 0.15s"}} onFocus={function(e){e.target.style.borderColor=C.accent;}} onBlur={function(e){e.target.style.borderColor=C.inputBorder;}} value={p.value} onChange={function(e){p.onChange(e.target.value);}}>{p.options.map(function(o){var v=typeof o==="string"?o:o.value;var l=typeof o==="string"?o:o.label;return(<option key={v} value={v}>{l}</option>);})}</select></div>);}

function Row(p){return <div style={{display:"flex",gap:10,marginBottom:10}}>{p.children}</div>;}
function Col(p){return <div style={{flex:1}}>{p.children}</div>;}
function StepLabel(p){return(<label style={{fontSize:11,fontWeight:700,color:C.accent,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.children}</label>);}

function ToggleButtons(p){return(<div style={{display:"flex",gap:2,background:C.borderLight,padding:3,borderRadius:6,marginBottom:12}}>{p.options.map(function(o){return(<button key={o.id} onClick={function(){p.setMode(o.id);}} style={{flex:1,padding:"8px 6px",borderRadius:4,fontSize:12,fontWeight:600,cursor:"pointer",border:"none",fontFamily:"'Inter',sans-serif",textTransform:"uppercase",letterSpacing:"0.04em",background:p.mode===o.id?C.accent:"transparent",color:p.mode===o.id?"#fff":C.dim}}>{o.label}</button>);})}</div>);}

function GreenBtn(p){return(<button onClick={p.onClick} style={{width:"100%",padding:"13px 20px",borderRadius:6,border:"none",fontWeight:600,fontSize:14,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase",letterSpacing:"0.06em",background:C.accent,color:"#fff",marginTop:p.mt||0,boxShadow:C.shadow,transition:"background 0.15s"}} onMouseOver={function(e){e.target.style.background=C.accentHover;}} onMouseOut={function(e){e.target.style.background=C.accent;}}>{p.children}</button>);}

/* ──────── MEASUREMENTS ──────── */

function WallMeasurement(p){
  var s1=useState(p.lhOnly?"lh":"count"),mode=s1[0],setMode=s1[1];
  var s2=useState(""),wc=s2[0],setWc=s2[1];
  var s3=useState("0"),wi=s3[0],setWi=s3[1];
  var s4=useState(""),ln=s4[0],setLn=s4[1];
  var s5=useState(""),ht=s5[0],setHt=s5[1];
  var sq=mode==="count"?(parseInt(wc)||0)*(WALL_HEIGHTS[parseInt(wi)]?WALL_HEIGHTS[parseInt(wi)].sqftPer:0):(parseFloat(ln)||0)*(parseFloat(ht)||0);
  function notify(sqftVal, wiVal, wcVal, lnVal, htVal, modeVal){
    var heightLabel=null;
    if((modeVal||mode)==="count"){var h=WALL_HEIGHTS[parseInt(wiVal!==undefined?wiVal:wi)];if(h)heightLabel=h.label;var cavities=parseInt(wcVal!==undefined?wcVal:wc)||0;if(cavities>0&&heightLabel)heightLabel=cavities+" cavities @ "+heightLabel;}
    p.onSqftChange(sqftVal,heightLabel);
  }
  return(<div>
    {!p.lhOnly&&<ToggleButtons mode={mode} setMode={setMode} options={[{id:"count",label:"Wall Count"},{id:"lh",label:"L × H"}]}/>}
    {mode==="count"?(<Row><Col><Input label="# of Cavities" value={wc} placeholder="0" onChange={function(v){setWc(v);var s=(parseInt(v)||0)*(WALL_HEIGHTS[parseInt(wi)]?WALL_HEIGHTS[parseInt(wi)].sqftPer:0);notify(s,wi,v,ln,ht,"count");}}/></Col><Col><AppSelect label="Wall Height" value={wi} onChange={function(v){setWi(v);var s=(parseInt(wc)||0)*(WALL_HEIGHTS[parseInt(v)]?WALL_HEIGHTS[parseInt(v)].sqftPer:0);notify(s,v,wc,ln,ht,"count");}} options={WALL_HEIGHTS.map(function(w,i){return{value:String(i),label:w.label};})}/></Col></Row>):(<Row><Col><Input label="Length (ft)" value={ln} placeholder="0" onChange={function(v){setLn(v);notify((parseFloat(v)||0)*(parseFloat(ht)||0),wi,wc,v,ht,"lh");}}/></Col><Col><Input label="Height (ft)" value={ht} placeholder="0" onChange={function(v){setHt(v);notify((parseFloat(ln)||0)*(parseFloat(v)||0),wi,wc,ln,v,"lh");}}/></Col></Row>)}
    {sq>0&&(<div style={{fontSize:13,color:C.accent,fontWeight:600,marginBottom:8}}>{Math.round(sq)+" sq ft"}</div>)}
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
    {sq>0&&(<div style={{fontSize:13,color:C.accent,fontWeight:600,marginBottom:8}}>{Math.round(sq)+" sq ft"}</div>)}
  </div>);
}

function LocationGrid(p){
  var groups=GROUP_ORDER.filter(function(g){return LOCATIONS.some(function(l){return l.group===g&&l.id!=="custom";});});
  return(<div style={{marginBottom:4}}>
    {groups.map(function(g){
      var locs=LOCATIONS.filter(function(l){return l.group===g&&l.id!=="custom";});
      return(<div key={g} style={{marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{g}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {locs.map(function(loc){
            var active=p.value===loc.id;
            return(<button key={loc.id} onClick={function(){p.onChange(loc.id);}}
              style={{padding:"8px 13px",borderRadius:8,border:active?"2px solid "+C.accent:"1px solid "+C.border,background:active?C.accentBg:C.card,color:active?C.accent:C.text,fontSize:13,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.12s",lineHeight:1.2}}>
              {loc.short}
            </button>);
          })}
        </div>
      </div>);
    })}
    <button onClick={function(){p.onChange("custom");}}
      style={{padding:"8px 13px",borderRadius:8,border:p.value==="custom"?"2px solid "+C.accent:"1px dashed "+C.dim,background:p.value==="custom"?C.accentBg:"transparent",color:p.value==="custom"?C.accent:C.dim,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
      + Custom
    </button>
  </div>);
}

function StepBar(p){
  var steps=p.steps;
  return(<div style={{display:"flex",alignItems:"center",gap:0,marginBottom:18}}>
    {steps.map(function(s,i){
      var done=i<p.current;var active=i===p.current;
      var bg=done?C.accent:active?C.accent:"transparent";
      var col=done||active?"#fff":C.dim;
      var borderCol=done||active?C.accent:C.border;
      return(<div key={i} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 12px",borderRadius:20,background:bg,border:"1.5px solid "+borderCol,transition:"all 0.15s"}}>
          <span style={{fontSize:12,fontWeight:800,color:col}}>{done?"✓":(i+1)}</span>
          <span style={{fontSize:12,fontWeight:600,color:col,whiteSpace:"nowrap"}}>{s}</span>
        </div>
        {i<steps.length-1&&(<div style={{flex:1,height:2,background:done?C.accent:C.borderLight,margin:"0 4px"}}/>)}
      </div>);
    })}
  </div>);
}

function MeasurementForm(p){
  var mats=p.tab==="opencell"?OPEN_CELL_MATERIALS:p.tab==="closedcell"?CLOSED_CELL_MATERIALS:FIBERGLASS_MATERIALS;
  var isFoam=p.tab==="opencell"||p.tab==="closedcell";
  var hp=p.hasPrice;
  var s1=useState(""),lid=s1[0],setLid=s1[1];
  var s2=useState(""),cl=s2[0],setCl=s2[1];
  var s3=useState(mats[0]||""),mat=s3[0],setMat=s3[1];
  var s4=useState(0),sqft=s4[0],setSqft=s4[1];
  var s4b=useState(null),wallHeightLabel=s4b[0],setWallHeightLabel=s4b[1];
  var s5=useState(""),price=s5[0],setPrice=s5[1];
  var s6=useState("Flat (0/12)"),pitch=s6[0],setPitch=s6[1];
  var s7=useState(0),mk=s7[0],setMk=s7[1];
  var s8=useState(false),isRemoval=s8[0],setIsRemoval=s8[1];
  var s9=useState(""),matNote=s9[0],setMatNote=s9[1];
  var loc=LOCATIONS.find(function(x){return x.id===lid;});
  var locLabel=loc?(loc.id==="custom"?cl:loc.label):"";
  var locGroup=loc?(loc.id==="custom"?"Other":loc.group):"Other";
  var needsPitch=loc&&loc.type==="roofline"&&(!hp||isFoam);
  var measType=loc?(loc.type==="wall"?"wall":loc.type==="slope"?"slope":"area"):null;
  var pf=needsPitch?(PITCH_FACTORS[pitch]||1):1;
  var adj=sqft*pf;var fin=Math.round(adj);
  var ss={width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",transition:"border-color 0.15s"};
  var tabLabel=p.tab==="opencell"?"Open Cell":p.tab==="closedcell"?"Closed Cell":"Fiberglass";
  // Step tracking
  var stepsDone = lid ? ((!hp||mat) ? (fin>0 ? ((!hp||(parseFloat(price)||0)>0) ? 4 : 3) : 2) : 1) : 0;
  var stepLabels = hp ? ["Location","Material","Measure","Price"] : ["Location","Measure","Add"];
  var stepCurrent = lid ? ((!hp||mat) ? (fin>0 ? (hp ? 3 : 2) : (hp?2:1)) : 1) : 0;
  function handleAdd(){
    var pr=hp?(parseFloat(price)||0):0;if(fin<=0||!locLabel)return;if(hp&&pr<=0)return;
    var useMat=hp?mat:"(material TBD)";
    var desc=hp?("Install "+mat.toLowerCase()+" in "+locLabel.toLowerCase()):(locLabel+" — "+fin.toLocaleString()+" sq ft");
    p.onAdd({type:isFoam?"Foam":"Fiberglass",material:useMat,location:locLabel,locationId:loc?loc.id:"custom",group:locGroup,sqft:fin,pitch:needsPitch?pitch:null,pricePerUnit:pr,total:hp?Math.ceil(fin*pr):0,description:desc,isRemoval:!hp&&isRemoval,wallHeightLabel:(!hp&&wallHeightLabel)||null,matNote:(!hp&&matNote.trim())||null});
    setSqft(0);setWallHeightLabel(null);setPrice("");setPitch("Flat (0/12)");setMk(function(k){return k+1;});setIsRemoval(false);setMatNote("");
  }
  return(<div style={{background:C.card,borderRadius:8,padding:18,border:"1px solid "+C.border,boxShadow:C.shadow}}>
    <StepBar steps={stepLabels} current={stepCurrent}/>
    {/* STEP 1: Location grid */}
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{"① Location"}</div>
      <LocationGrid value={lid} onChange={function(v){setLid(v);setSqft(0);setMk(function(k){return k+1;});}}/>
      {lid==="custom"&&(<div style={{marginTop:8}}><Input label="Custom Location Name" value={cl} onChange={setCl} type="text" placeholder="e.g. Bonus room walls"/></div>)}
    </div>
    {loc&&(<div>
      {hp&&(<div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{"② Material"}</div>
        <select style={ss} value={mat} onChange={function(e){setMat(e.target.value);}}>{mats.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</select>
      </div>)}
      <div style={{marginBottom:4}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{(hp?"③":"②")+" Measurements"}</div>
      </div>
      {measType==="wall"?(<WallMeasurement key={"w-"+mk} onSqftChange={function(s,h){setSqft(s);setWallHeightLabel(h||null);}}/>):measType==="slope"?(<WallMeasurement key={"w-"+mk} onSqftChange={function(s){setSqft(s);}} lhOnly/>):(<AreaMeasurement key={"a-"+mk} onSqftChange={setSqft}/>)}
      {needsPitch&&(<div style={{marginBottom:10}}><AppSelect label="Roof Pitch" value={pitch} onChange={setPitch} options={Object.keys(PITCH_FACTORS)}/></div>)}
      {!hp&&(<div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{"Material (optional)"}</div>
        <input type="text" value={matNote} onChange={function(e){setMatNote(e.target.value);}} placeholder="e.g. R13 Batts, Blown Fiberglass…" style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box"}}/>
      </div>)}
      {hp&&(<div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{(hp?"④":"③")+" Price"}</div>
        <Input label="Price per Sq Ft" value={price} onChange={setPrice} placeholder="$0.00" step="0.01"/>
      </div>)}
      {fin>0&&(<div style={{background:C.accentBg,borderRadius:6,padding:12,marginBottom:12,fontSize:13,color:C.textSec,border:"1px solid "+C.borderLight}}>
        <div style={{fontWeight:600,color:C.text,marginBottom:4,fontSize:14}}>{hp?("Install "+mat.toLowerCase()+" in "+locLabel.toLowerCase()):(locLabel+" — "+fin.toLocaleString()+" sq ft")}</div>
        <div>{"Total: "}<span style={{color:C.text,fontWeight:600}}>{fin.toLocaleString()+" sq ft"}</span>{needsPitch&&sqft!==adj&&(<span>{" (adj. from "+Math.round(sqft)+" w/ "+pitch+")"}</span>)}</div>
        {hp&&(parseFloat(price)||0)>0&&(<div>{"Line Total: "}<span style={{color:C.accent,fontWeight:700}}>{"$"+Math.ceil(fin*(parseFloat(price)||0)).toLocaleString()+".00"}</span></div>)}
      </div>)}
      {!hp&&fin>0&&(<label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",marginBottom:8,cursor:"pointer"}}>
        <input type="checkbox" checked={isRemoval} onChange={function(e){setIsRemoval(e.target.checked);}} style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Removal"}</span>
      </label>)}
      <GreenBtn onClick={handleAdd}>{"+ "+(hp?"Add to Quote":"Add Measurement")}</GreenBtn>
    </div>)}
  </div>);
}

function MaterialTabs(p){return(<div style={{display:"flex",gap:0,borderRadius:6,overflow:"hidden",border:"1px solid "+C.border,marginBottom:16}}>{[{id:"fiberglass",label:"FIBERGLASS"},{id:"opencell",label:"OPEN CELL"},{id:"closedcell",label:"CLOSED CELL"}].map(function(t){return(<button key={t.id} onClick={function(){p.setActiveTab(t.id);}} style={{flex:1,padding:"12px 4px",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",background:p.activeTab===t.id?C.accent:C.card,color:p.activeTab===t.id?"#fff":C.dim}}>{t.label}</button>);})}</div>);}

function getSavedCustomers(salesman){try{return JSON.parse(localStorage.getItem("ist-customers-"+salesman)||"[]");}catch(e){return[];}}
function setSavedCustomers(salesman,list){localStorage.setItem("ist-customers-"+salesman,JSON.stringify(list));}

function CustomerInfo(p){
  var s1=useState(false),show=s1[0],setShow=s1[1];
  var s2=useState(false),showPicker=s2[0],setShowPicker=s2[1];
  var saved=getSavedCustomers(p.currentUser||"default");

  function saveCustomer(){
    if(!p.custName.trim()){alert("Enter a customer name first.");return;}
    var entry={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr};
    var list=getSavedCustomers(p.currentUser||"default");
    var idx=list.findIndex(function(c){return c.name.toLowerCase()===entry.name.toLowerCase();});
    if(idx>=0){if(!confirm("Update saved info for "+entry.name+"?"))return;list[idx]=entry;}else{list.unshift(entry);}
    setSavedCustomers(p.currentUser||"default",list);
    alert(entry.name+" saved!");
  }

  function loadCustomer(c){
    p.setCustName(c.name||"");p.setCustAddr(c.address||"");p.setCustPhone(c.phone||"");p.setCustEmail(c.email||"");p.setJobAddr(c.jobAddress||"");
    setShowPicker(false);
  }

  function deleteCustomer(name,e){
    e.stopPropagation();
    if(!confirm("Remove "+name+" from saved?"))return;
    var list=getSavedCustomers(p.currentUser||"default").filter(function(c){return c.name!==name;});
    setSavedCustomers(p.currentUser||"default",list);
    setShowPicker(false);setTimeout(function(){setShowPicker(true);},10);
  }

  return(<div style={{padding:"0 16px 12px"}}>
    <div style={{display:"flex",gap:8,marginBottom:6}}>
      <button onClick={function(){setShow(!show);}} style={{flex:1,padding:"12px 16px",borderRadius:6,border:"1px solid "+C.border,background:C.card,color:C.text,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:C.shadow}}><span>{p.custName?"Customer: "+p.custName:"Customer Info"}</span><span style={{fontSize:16,color:C.dim}}>{show?"▲":"▼"}</span></button>
      {saved.length>0&&<button onClick={function(){setShowPicker(!showPicker);setShow(true);}} style={{padding:"10px 14px",borderRadius:6,border:"1px solid #2563eb",background:showPicker?"#2563eb":"#eff6ff",color:showPicker?"#fff":"#2563eb",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap"}}>{"📋 Saved"}</button>}
    </div>

    {showPicker&&(<div style={{background:C.card,borderRadius:6,border:"1px solid #2563eb",boxShadow:C.shadow,marginBottom:8,maxHeight:220,overflowY:"auto"}}>
      <div style={{padding:"8px 12px",fontSize:11,fontWeight:700,color:"#2563eb",textTransform:"uppercase",letterSpacing:0.5,borderBottom:"1px solid "+C.border}}>Select Saved Customer</div>
      {saved.map(function(c){return(
        <div key={c.name} onClick={function(){loadCustomer(c);}} style={{padding:"10px 12px",borderBottom:"1px solid "+C.border,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:C.text}}>{c.name}</div>
            {c.address&&<div style={{fontSize:12,color:C.dim}}>{c.address}</div>}
            {c.phone&&<div style={{fontSize:12,color:C.dim}}>{c.phone}</div>}
          </div>
          <button onClick={function(e){deleteCustomer(c.name,e);}} style={{padding:"4px 8px",borderRadius:5,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",flexShrink:0,marginLeft:8}}>✕</button>
        </div>
      );})}
    </div>)}

    {show&&(<div style={{background:C.card,borderRadius:6,padding:16,marginTop:4,border:"1px solid "+C.border,boxShadow:C.shadow}}>
      <div style={{marginBottom:10}}><Input label="Customer Name" value={p.custName} onChange={p.setCustName} type="text" placeholder="John Doe"/></div>
      <div style={{marginBottom:10}}>
        <Input label="Address" value={p.custAddr} onChange={p.setCustAddr} type="text" placeholder="123 Main St, Tulsa OK"/>
        <button onClick={function(){ var addr=(p.custAddr||"").trim(); if(!addr){alert("Enter an address first.");return;} window.open("https://assessor.tulsacounty.org/Property/Search?terms="+encodeURIComponent(addr),"_blank"); }} style={{marginTop:6,padding:"6px 12px",borderRadius:6,border:"1px solid #2563eb",background:"#eff6ff",color:"#2563eb",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Look Up on Tulsa County Assessor</button>
      </div>
      <Row><Col><Input label="Phone" value={p.custPhone} onChange={p.setCustPhone} type="tel" placeholder="(918) 555-0000"/></Col><Col><Input label="Email" value={p.custEmail} onChange={p.setCustEmail} type="email" placeholder="john@email.com"/></Col></Row>
      <Input label="Job Site (if different)" value={p.jobAddr} onChange={p.setJobAddr} type="text" placeholder="456 Oak Ave"/>
      <div style={{display:"flex",gap:8,marginTop:12}}>
        <button onClick={saveCustomer} style={{flex:1,padding:"8px",borderRadius:6,border:"1px solid #16a34a",background:"#f0fdf4",color:"#16a34a",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>💾 Save Customer</button>
        <button onClick={function(){if(confirm("Clear customer info?")){p.setCustName("");p.setCustAddr("");p.setCustPhone("");p.setCustEmail("");p.setJobAddr("");}}} style={{flex:1,padding:"8px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Clear"}</button>
      </div>
    </div>)}
  </div>);
}

function groupMeasurements(items){var g={};items.forEach(function(m){var k=m.group||"Other";if(!g[k])g[k]=[];g[k].push(m);});return g;}

/* ──────── PRINT / DOWNLOAD FUNCTIONS ──────── */

function buildSalesmanBlock(salesman){
  var s=SALESMAN_INFO[salesman];if(!s)return "";
  return '<div style="margin-top:30px;display:inline-block;padding:10px 16px;background:#f5f5f5;border:2px solid #222;border-radius:6px"><div style="font-size:9px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Your Sales Representative</div><div style="font-size:16px;font-weight:800;color:#111;margin-bottom:4px">'+s.fullName+'</div><div style="font-size:13px;color:#111;font-weight:600;margin-bottom:2px">📞 '+s.phone+'</div><div style="font-size:13px;color:#111;font-weight:600">✉ '+s.email+'</div></div>';
}

function buildTakeOffHtml(customer,jobNotes,measurements,salesman,quoteOpts){
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
    (function(){
      if(!quoteOpts||quoteOpts.length===0)return"";
      var rows=quoteOpts.map(function(opt,idx){
        var lines=[];
        // Line items with price per sq ft
        if(opt.items&&opt.items.length>0){
          opt.items.forEach(function(item){
            if(!item.sqft||!item.pricePerUnit)return;
            lines.push('<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;border-bottom:1px solid #eee"><span style="font-size:13px;color:#333">'+item.location+(item.description?' <span style="color:#666;font-size:11px">('+item.description+')</span>':'')+'</span><span style="font-size:13px;font-weight:700;color:#333;text-align:right;white-space:nowrap;margin-left:12px">'+item.sqft.toLocaleString()+' sf @ $'+parseFloat(item.pricePerUnit).toFixed(2)+'/sf = $'+Math.ceil(item.sqft*item.pricePerUnit).toLocaleString()+'</span></div>');
          });
          if(lines.length>0)lines.push('<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:2px solid #d1d5db;margin-bottom:4px"><span style="font-size:12px;font-weight:700;color:#666">Total before adders</span><span style="font-size:13px;font-weight:800;color:#111">$'+(opt.overrideTotal?parseFloat(opt.overrideTotal).toLocaleString():opt.items.reduce(function(s,i){return s+i.total;},0).toLocaleString())+'</span></div>');
        }
        if(opt.pso)lines.push('<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee"><span style="font-size:13px;color:#333">PSO Credit Attic</span><span style="font-size:13px;font-weight:700;color:#dc2626">-$600</span></div>');
        if(opt.psoKw)lines.push('<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee"><span style="font-size:13px;color:#333">PSO Credit KW</span><span style="font-size:13px;font-weight:700;color:#dc2626">-$525</span></div>');
        if(opt.extraLabor&&opt.extraLaborAmt)lines.push('<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee"><span style="font-size:13px;color:#333">Extra Labor</span><span style="font-size:13px;font-weight:700;color:#333">$'+parseFloat(opt.extraLaborAmt).toFixed(0)+'</span></div>');
        if(opt.tripCharge&&opt.tripChargeAmt)lines.push('<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee"><span style="font-size:13px;color:#333">Trip Charge</span><span style="font-size:13px;font-weight:700;color:#333">$'+parseFloat(opt.tripChargeAmt).toFixed(0)+'</span></div>');
        if(opt.energySeal&&opt.energySealAmt)lines.push('<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee"><span style="font-size:13px;color:#333">Energy Seal & Plates</span><span style="font-size:13px;font-weight:700;color:#333">$'+parseFloat(opt.energySealAmt).toFixed(0)+'</span></div>');
        if(opt.dumpster&&opt.dumpsterAmt)lines.push('<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee"><span style="font-size:13px;color:#333">Dumpster</span><span style="font-size:13px;font-weight:700;color:#333">$'+parseFloat(opt.dumpsterAmt).toFixed(0)+'</span></div>');
        if(lines.length===0)return"";
        var header=quoteOpts.length>1?'<div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">'+opt.name+'</div>':"";
        return header+lines.join("");
      }).join("");
      if(!rows)return"";
      return '<div style="margin-top:24px;padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px"><div style="font-size:11px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px">⚠ Internal Adders — Do Not Share With Customer</div>'+rows+'</div>';
    })()+
    '<div style="margin-top:20px;padding-top:16px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center">'+COMPANY.name+' &bull; '+COMPANY.phone+'<br/>Helping Oklahoma stay energy efficient—one home at a time.</div></div>';
}

function printTakeOff(customer,jobNotes,measurements,salesman,quoteOpts){
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title> </title><style>*{margin:0;padding:0;box-sizing:border-box}@page{margin:0;size:letter}@media print{html,body{height:auto;overflow:hidden;margin:0;padding:0}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+buildTakeOffHtml(customer,jobNotes,measurements,salesman,quoteOpts)+'</body></html>';
  var blob=new Blob([html],{type:"text/html"});var url=URL.createObjectURL(blob);var win=window.open(url,"_blank");
  if(win){win.onload=function(){setTimeout(function(){win.print();},500);};}
}

function sharePdf(container,filename){
  container.style.position="absolute";
  container.style.left="-9999px";
  container.style.top="0";
  return getHtml2pdf().then(function(html2pdf){
    return html2pdf().set({
      margin:0.3,filename:filename,
      image:{type:"jpeg",quality:0.98},
      html2canvas:{scale:2,useCORS:true},
      jsPDF:{unit:"in",format:"letter",orientation:"portrait"}
    }).from(container).toPdf().output("blob").then(function(blob){
      document.body.removeChild(container);
      var url=URL.createObjectURL(blob);
      // Try Web Share API (mobile)
      if(navigator.share && navigator.canShare){
        var file=new File([blob],filename,{type:"application/pdf"});
        if(navigator.canShare({files:[file]})){
          return navigator.share({files:[file],title:filename}).catch(function(){
            // Share dismissed or failed — fall back to download
            var a=document.createElement("a");a.href=url;a.download=filename;a.click();
            setTimeout(function(){URL.revokeObjectURL(url);},5000);
          });
        }
      }
      // Direct download
      var a=document.createElement("a");a.href=url;a.download=filename;a.click();
      setTimeout(function(){URL.revokeObjectURL(url);},5000);
    });
  }).catch(function(err){
    document.body.contains(container)&&document.body.removeChild(container);
    alert("PDF generation failed: "+err.message);
  });
}

function downloadTakeOffPdf(customer,jobNotes,measurements,salesman,quoteOpts){
  var container=document.createElement("div");
  container.innerHTML=buildTakeOffHtml(customer,jobNotes,measurements,salesman,quoteOpts);
  document.body.appendChild(container);
  var filename="TakeOff"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
  sharePdf(container,filename);
}

function buildQuoteHtml(customer,opts,salesman){try{return _buildQuoteHtml(customer,opts,salesman);}catch(e){alert("Quote error: "+e.message);return "";}}
function _buildQuoteHtml(customer,opts,salesman){
  var today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});var qn="IST-"+Date.now().toString(36).toUpperCase();
  var si=SALESMAN_INFO[salesman];
  var salesHtml=si?'<div style="flex:1;text-align:right"><div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Your Sales Rep</div><div style="font-size:15px;font-weight:800;color:#111;margin-bottom:3px">'+si.fullName+'</div><div style="font-size:13px;color:#111;font-weight:600;margin-bottom:1px">'+si.phone+'</div><div style="font-size:13px;color:#111;font-weight:600">'+si.email+'</div></div>':'';
  var optsWithItems=opts.filter(function(o){return o.items.length>0;});
  var optSections=optsWithItems.map(function(opt,oi){
    var sortedItems=opt.items.slice().sort(function(a,b){
      var aFoam=a.type==="Foam"||/foam/i.test(a.material||"");
      var bFoam=b.type==="Foam"||/foam/i.test(b.material||"");
      if(aFoam&&!bFoam)return -1;
      if(!aFoam&&bFoam)return 1;
      if(aFoam&&bFoam){
        var aIn=parseFloat((a.material||"").match(/^([\d.]+)/)||[0,0])||0;
        var bIn=parseFloat((b.material||"").match(/^([\d.]+)/)||[0,0])||0;
        return aIn-bIn;
      }
      var aR=parseInt((a.material||"").match(/R(\d+)/i)||[0,0])||0;
      var bR=parseInt((b.material||"").match(/R(\d+)/i)||[0,0])||0;
      return aR-bR;
    });
    var rows=sortedItems.map(function(item,i){return '<tr style="border-bottom:1px solid #ddd"><td style="padding:6px 8px;font-size:13px">'+(i+1)+'</td><td style="padding:6px 8px;font-size:13px">'+item.description+'</td></tr>';}).join("");
    var energySealRow=opt.energySeal?'<tr style="border-bottom:1px solid #ddd"><td style="padding:6px 8px;font-size:13px">'+(opt.items.length+1)+'</td><td style="padding:6px 8px;font-size:13px">Energy seal and plates per city code.</td></tr>':"";
    var lineTotal=opt.items.reduce(function(s,i){return s+i.total;},0);
    var psoCredit=((opt.pso||false)?600:0)+((opt.psoKw||false)?525:0);
    var el=opt.extraLabor?(parseFloat(opt.extraLaborAmt)||0):0;
    var tc=opt.tripCharge?(parseFloat(opt.tripChargeAmt)||0):0;
    var es=opt.energySeal?(parseFloat(opt.energySealAmt)||0):0;
    var du=opt.dumpster?(parseFloat(opt.dumpsterAmt)||0):0;
    var sub=lineTotal+el+tc+es+du;
    var total=opt.overrideTotal!==""?(parseFloat(opt.overrideTotal)||0):(sub-psoCredit);
    var header=optsWithItems.length>1?'<div style="font-size:16px;font-weight:800;color:#111;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #111">'+opt.name+'</div>':"";
    var totalLabel=optsWithItems.length>1?opt.name+" Total":"Total";
    var totalHtml="";
    var creditRows="";
    if(opt.psoKw)creditRows+='<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:14px;font-weight:600;color:#dc2626;border-bottom:1px solid #ddd"><span>Less PSO Credit KW</span><span>-$525</span></div>';
    if(opt.pso)creditRows+='<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:14px;font-weight:600;color:#dc2626;border-bottom:1px solid #ddd"><span>Less PSO Credit Attic</span><span>-$600</span></div>';
    if(opt.pso||opt.psoKw){
      totalHtml='<div style="display:flex;justify-content:flex-end;margin-bottom:'+(oi<optsWithItems.length-1?"20":"0")+'px"><div style="width:260px">'+
        '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:14px;font-weight:600;color:#333"><span>Price</span><span>$'+Math.ceil(sub).toLocaleString()+'</span></div>'+
        creditRows+
        '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:800;color:#111"><span>'+totalLabel+'</span><span>$'+Math.ceil(total).toLocaleString()+'</span></div>'+
        '</div></div>';
    }else{
      totalHtml='<div style="display:flex;justify-content:flex-end;margin-bottom:'+(oi<optsWithItems.length-1?"20":"0")+'px"><div style="width:260px"><div style="display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:800;color:#111"><span>'+totalLabel+'</span><span>$'+Math.ceil(total).toLocaleString()+'</span></div></div></div>';
    }
    return header+'<table style="width:100%;border-collapse:collapse;margin-bottom:10px"><thead><tr style="background:#111"><th style="padding:7px 8px;font-size:11px;font-weight:700;text-transform:uppercase;text-align:left;color:#fff">#</th><th style="padding:7px 8px;font-size:11px;font-weight:700;text-transform:uppercase;text-align:left;color:#fff">Description</th></tr></thead><tbody>'+rows+energySealRow+'</tbody></table>'+totalHtml;
  }).join("");
  return '<div style="font-family:Arial,sans-serif;color:#1a1a1a;padding:28px 32px;max-width:800px;margin:0 auto">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:14px;border-bottom:3px solid #222"><div><h1 style="font-size:22px;font-weight:800;color:#111;margin-bottom:3px">'+COMPANY.name+'</h1><p style="font-size:12px;color:#666">'+COMPANY.tagline+'</p><p style="font-size:12px;color:#666">'+COMPANY.phone+'</p></div><div style="text-align:right"><div style="font-size:19px;font-weight:700;color:#111">QUOTE</div><div style="font-size:12px;color:#666;margin-top:3px">'+qn+'</div><div style="font-size:12px;color:#666">'+today+'</div></div></div>'+
    '<div style="display:flex;gap:20px;margin-bottom:18px"><div style="flex:1"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Prepared For</div><div style="font-size:14px;font-weight:600">'+(customer.name||"—")+'</div><div style="font-size:12px;color:#666">'+(customer.address||"")+'</div><div style="font-size:12px;color:#666">'+(customer.phone||"")+'</div><div style="font-size:12px;color:#666">'+(customer.email||"")+'</div></div><div style="flex:1"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Project</div><div style="font-size:12px;color:#666">Job Site: '+(customer.jobAddress||customer.address||"—")+'</div><div style="font-size:12px;color:#666">Valid 30 days from quote date</div></div>'+salesHtml+'</div>'+
    optSections+
    '<div style="margin-top:14px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center">'+COMPANY.name+' &bull; '+COMPANY.phone+'<br/>Helping Oklahoma stay energy efficient—one home at a time.</div></div>';
}

function generatePDF(customer,opts,salesman){
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title> </title><style>*{margin:0;padding:0;box-sizing:border-box}@page{margin:0;size:letter}@media print{html,body{height:auto;overflow:hidden;margin:0;padding:0}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>'+buildQuoteHtml(customer,opts,salesman)+'</body></html>';
  var blob=new Blob([html],{type:"text/html"});var url=URL.createObjectURL(blob);var win=window.open(url,"_blank");
  if(win){win.onload=function(){setTimeout(function(){win.print();},500);};}
}

function downloadQuotePdf(customer,opts,salesman){
  var container=document.createElement("div");
  container.innerHTML=buildQuoteHtml(customer,opts,salesman);
  document.body.appendChild(container);
  var filename="Quote"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
  sharePdf(container,filename);
}

function printQuoteAndTakeOff(customer,opts,salesman,jobNotes,measurements,quoteOpts){
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title> </title><style>*{margin:0;padding:0;box-sizing:border-box}@page{margin:0;size:letter}@media print{html,body{height:auto;overflow:hidden;margin:0;padding:0}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.page-break{page-break-before:always}}</style></head><body>'+
    buildQuoteHtml(customer,opts,salesman)+
    '<div class="page-break"></div>'+
    buildTakeOffHtml(customer,jobNotes,measurements,salesman,quoteOpts)+
    '</body></html>';
  var blob=new Blob([html],{type:"text/html"});var url=URL.createObjectURL(blob);var win=window.open(url,"_blank");
  if(win){win.onload=function(){setTimeout(function(){win.print();},500);};}
}

/* ══════════ TAKE OFF ══════════ */

function TakeOff(p){
  function addM(item){
    p.setMeasurements(function(prev){
      // Only merge if same location, same isRemoval, same wall height label, and same matNote
      var existing=prev.find(function(m){
        return m.location===item.location && m.locationId===item.locationId &&
          !!m.isRemoval===!!item.isRemoval &&
          (m.wallHeightLabel||null)===(item.wallHeightLabel||null) &&
          (m.matNote||null)===(item.matNote||null);
      });
      if(existing){
        return prev.map(function(m){return m.id===existing.id?Object.assign({},m,{sqft:m.sqft+item.sqft}):m;});
      }
      return prev.concat([Object.assign({},item,{id:Date.now()+Math.random()})]);
    });
  }
  function removeM(id){p.setMeasurements(function(prev){return prev.filter(function(m){return m.id!==id;});});}
  var regularItems=p.measurements.filter(function(m){return !m.isRemoval;});
  var removalItems=p.measurements.filter(function(m){return m.isRemoval;});
  var groups=groupMeasurements(regularItems);var sorted=GROUP_ORDER.filter(function(g){return groups[g];});
  var total=p.measurements.reduce(function(s,m){return s+m.sqft;},0);
  var removalTotal=removalItems.reduce(function(s,m){return s+m.sqft;},0);
  return(<div>
    <CustomerInfo custName={p.custName} setCustName={p.setCustName} custAddr={p.custAddr} setCustAddr={p.setCustAddr} custPhone={p.custPhone} setCustPhone={p.setCustPhone} custEmail={p.custEmail} setCustEmail={p.setCustEmail} jobAddr={p.jobAddr} setJobAddr={p.setJobAddr} currentUser={p.currentUser}/>
    <div className="ist-2col">
    <div className="ist-col-form">
      <div style={{padding:"0 16px 12px"}}>
        <label style={{fontSize:11,fontWeight:600,color:C.textSec,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{"Job Notes / Description"}</label>
        <textarea style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",minHeight:80,resize:"vertical",transition:"border-color 0.15s"}} onFocus={function(e){e.target.style.borderColor=C.accent;}} onBlur={function(e){e.target.style.borderColor=C.inputBorder;}} value={p.jobNotes} onChange={function(e){p.setJobNotes(e.target.value);}} placeholder="e.g. 2-story, 4/12 pitch, no garage, spray foam roofline + blown walls..."/>
      </div>
      <div style={{padding:"0 16px"}}><MeasurementForm key={"to-takeoff"} tab={"fiberglass"} onAdd={addM} hasPrice={false}/></div>
      <div style={{padding:"12px 16px 0"}}>
        <GreenBtn onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr||p.custAddr};printTakeOff(cust,p.jobNotes,p.measurements,p.currentUser,p.quoteOpts);}}>{"Print Take Off"}</GreenBtn>
        <GreenBtn onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr||p.custAddr};downloadTakeOffPdf(cust,p.jobNotes,p.measurements,p.currentUser,p.quoteOpts);}} mt={8}>{"Download Take Off PDF"}</GreenBtn>
      </div>
    </div>
    <div className="ist-col-results">
    {p.measurements.length>0&&(<div style={{padding:"20px 16px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>{"Take Off ("+p.measurements.length+" items · "+total.toLocaleString()+" sq ft)"}</div>
      {sorted.map(function(gn){var gt=groups[gn].reduce(function(s,m){return s+m.sqft;},0);
        return(<div key={gn} style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,paddingBottom:6,borderBottom:"1px solid "+C.border}}>{gn}<span style={{color:C.accent,marginLeft:8}}>{gt.toLocaleString()+" sq ft"}</span></div>
          <div style={{background:C.card,borderRadius:6,border:"1px solid "+C.border,overflow:"hidden",boxShadow:C.shadow}}>
            {groups[gn].map(function(item,idx){return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:idx<groups[gn].length-1?"1px solid "+C.borderLight:"none"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,lineHeight:1.3,color:C.text}}>{item.location}</div>
                {item.wallHeightLabel&&(<div style={{fontSize:12,color:C.accent,marginTop:2,fontWeight:500}}>{"↳ "+item.wallHeightLabel}</div>)}
                {item.matNote&&(<div style={{fontSize:12,color:C.dim,marginTop:2}}>{"📋 "+item.matNote}</div>)}
                {item.pitch&&(<div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.pitch}</div>)}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginLeft:12}}><div style={{fontSize:14,fontWeight:700,color:C.text}}>{item.sqft.toLocaleString()+" sf"}</div><button onClick={function(){removeM(item.id);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600}}>{"Remove"}</button></div>
            </div>);})}
          </div>
        </div>);
      })}
      {removalItems.length>0&&(<div style={{marginBottom:16}}>
        <div style={{fontSize:11,fontWeight:700,color:C.danger,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,paddingBottom:6,borderBottom:"1px solid "+C.danger}}>{"Removal"}<span style={{color:C.danger,marginLeft:8}}>{removalTotal.toLocaleString()+" sq ft"}</span></div>
        <div style={{background:C.card,borderRadius:6,border:"1px solid "+C.danger,overflow:"hidden",boxShadow:C.shadow}}>
          {removalItems.map(function(item,idx){return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:idx<removalItems.length-1?"1px solid "+C.borderLight:"none"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,lineHeight:1.3,color:C.text}}>{item.location}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginLeft:12}}><div style={{fontSize:14,fontWeight:700,color:C.text}}>{item.sqft.toLocaleString()+" sf"}</div><button onClick={function(){removeM(item.id);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600}}>{"Remove"}</button></div>
          </div>);})}
        </div>
      </div>)}
      <GreenBtn onClick={p.onSendToQuote}>{"Send to Quote Builder"}</GreenBtn>
      <button onClick={function(){if(confirm("Clear all measurements?"))p.setMeasurements([]);}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Clear All"}</button>
    </div>)}
    {p.measurements.length===0&&(<div style={{textAlign:"center",padding:"40px 16px",color:C.dim}}><div style={{fontSize:14}}>{"Start measuring — add locations above"}</div></div>)}
    </div>{/* end col-results */}
    </div>{/* end ist-2col */}
  </div>);
}

/* ══════════ QUOTE BUILDER ══════════ */

function newOption(name){return{name:name,items:[],pso:false,psoKw:false,extraLabor:false,extraLaborAmt:"",tripCharge:false,tripChargeAmt:"",energySeal:false,energySealAmt:"",dumpster:false,dumpsterAmt:"",overrideTotal:""};}

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
  function addItem(item){
    var existing=opt.items.find(function(i){return i.description===item.description;});
    if(existing){
      var newSqft=existing.sqft+item.sqft;
      var newTotal=Math.ceil(newSqft*existing.pricePerUnit);
      updateOpt({items:opt.items.map(function(i){return i.id===existing.id?Object.assign({},i,{sqft:newSqft,total:newTotal}):i;}),overrideTotal:""});
    }else{
      updateOpt({items:opt.items.concat([Object.assign({},item,{id:Date.now()+Math.random()})]),overrideTotal:""});
    }
  }
  function removeItem(id){updateOpt({items:opt.items.filter(function(i){return i.id!==id;}),overrideTotal:""});}

  var unpriced=p.importedItems.filter(function(i){return!i.priced;});
  var lineItemsTotal=opt.items.reduce(function(s,i){return s+i.total;},0);
  var psoCredit=((opt.pso||false)?600:0)+((opt.psoKw||false)?525:0);
  var extraLabor=opt.extraLabor?(parseFloat(opt.extraLaborAmt)||0):0;
  var tripCharge=opt.tripCharge?(parseFloat(opt.tripChargeAmt)||0):0;
  var energySeal=opt.energySeal?(parseFloat(opt.energySealAmt)||0):0;
  var dumpster=opt.dumpster?(parseFloat(opt.dumpsterAmt)||0):0;
  var subtotal=lineItemsTotal-psoCredit+extraLabor+tripCharge+energySeal+dumpster;
  var finalTotal=opt.overrideTotal!==""?(parseFloat(opt.overrideTotal)||0):subtotal;
  var matSs={width:"100%",padding:"8px 10px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",marginBottom:8};

  function handlePriceImport(item){var pr=parseFloat(pricingPrice)||0;if(pr<=0||!pricingMat)return;
    var isRem=pricingMat==="Removal";
    var desc=isRem?("Remove existing insulation from "+item.location.toLowerCase()+"."):("Install "+pricingMat.toLowerCase()+" in "+item.location.toLowerCase());
    addItem(Object.assign({},item,{material:pricingMat,pricePerUnit:pr,total:Math.ceil(item.sqft*pr),description:desc}));
    p.setImportedItems(function(prev){return prev.map(function(i){return i.id===item.id?Object.assign({},i,{priced:true}):i;});});
    setPricingId(null);setPricingPrice("");setPricingMat("");}

  function addOption(){setOpts(function(prev){return prev.concat([newOption("Option "+(prev.length+1))]);});setActiveIdx(opts.length);}
  function removeOption(idx){if(opts.length<=1)return;setOpts(function(prev){return prev.filter(function(_,i){return i!==idx;});});if(activeIdx>=opts.length-1)setActiveIdx(Math.max(0,opts.length-2));}

  return(<div>
    <CustomerInfo custName={p.custName} setCustName={p.setCustName} custAddr={p.custAddr} setCustAddr={p.setCustAddr} custPhone={p.custPhone} setCustPhone={p.setCustPhone} custEmail={p.custEmail} setCustEmail={p.setCustEmail} jobAddr={p.jobAddr} setJobAddr={p.setJobAddr} currentUser={p.currentUser}/>
    <div className="ist-2col">
    <div className="ist-col-form">
    {/* OPTION TABS */}
    <div style={{padding:"0 16px 12px"}}>
      <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        {opts.map(function(o,idx){return(
          <button key={idx} onClick={function(){setActiveIdx(idx);setPricingId(null);}}
            style={{padding:"8px 14px",borderRadius:6,border:activeIdx===idx?"2px solid "+C.accent:"1px solid "+C.border,background:activeIdx===idx?C.accentBg:C.card,color:activeIdx===idx?C.accent:C.dim,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
            {o.name}{o.items.length>0?" ("+o.items.length+")":""}
          </button>
        );})}
        <button onClick={addOption} style={{padding:"8px 12px",borderRadius:6,border:"1px dashed "+C.dim,background:"transparent",color:C.dim,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"+"}</button>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8}}>
        {editingName?(<div style={{display:"flex",gap:6,flex:1}}>
          <input style={{flex:1,padding:"6px 10px",background:C.input,border:"1px solid "+C.accent,borderRadius:6,color:C.text,fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none"}}
            type="text" value={opt.name} onChange={function(e){updateOpt({name:e.target.value});}} autoFocus
            onKeyDown={function(e){if(e.key==="Enter")setEditingName(false);}}/>
          <button onClick={function(){setEditingName(false);}} style={{padding:"6px 10px",background:C.accent,border:"none",borderRadius:6,color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"OK"}</button>
        </div>):(<div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
          <span style={{fontSize:14,fontWeight:600,color:C.text}}>{opt.name}</span>
          <button onClick={function(){setEditingName(true);}} style={{background:"none",border:"none",color:C.dim,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Rename"}</button>
          {opts.length>1&&(<button onClick={function(){if(confirm("Delete \""+opt.name+"\"?"))removeOption(activeIdx);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",marginLeft:"auto"}}>{"Delete option"}</button>)}
        </div>)}
      </div>
    </div>

    {/* FROM TAKE OFF */}
    {unpriced.length>0&&(<div style={{padding:"0 16px 16px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>{"From Take Off — Price These ("+unpriced.length+")"}</div>
      <div style={{background:C.card,borderRadius:6,border:"1px solid "+C.border,overflow:"hidden"}}>
        {unpriced.map(function(item,idx){return(<div key={item.id} style={{padding:"12px 14px",borderBottom:idx<unpriced.length-1?"1px solid "+C.border:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.isRemoval?(<span><span style={{fontSize:10,fontWeight:700,color:C.danger,background:C.dangerBg,padding:"2px 6px",borderRadius:4,marginRight:6}}>{"REMOVAL"}</span>{item.location}</span>):item.location}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.sqft.toLocaleString()+" sq ft"}{item.pitch?" · "+item.pitch:""}</div></div>
            <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:12}}>
              {pricingId!==item.id&&(<button onClick={function(){setPricingId(item.id);setPricingMat("");setPricingPrice("");}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+C.accent,borderRadius:6,color:C.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Price"}</button>)}
              <button onClick={function(){p.setImportedItems(function(prev){return prev.filter(function(i){return i.id!==item.id;});});}} style={{padding:"4px 6px",background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600}}>{"Remove"}</button>
            </div>
          </div>
          {pricingId===item.id&&(<div style={{marginTop:10,padding:12,background:C.bg,borderRadius:8,border:"1px solid "+C.border}}>
            <div style={{fontSize:11,color:C.accent,fontWeight:600,marginBottom:6}}>{"Adding to: "+opt.name}</div>
            <select style={matSs} value={pricingMat} onChange={function(e){setPricingMat(e.target.value);}}>
              <option value="">{"— Select Material —"}</option>
              <optgroup label="Fiberglass">{FIBERGLASS_MATERIALS.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</optgroup>
              <optgroup label="Open Cell Foam">{OPEN_CELL_MATERIALS.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</optgroup>
              <optgroup label="Closed Cell Foam">{CLOSED_CELL_MATERIALS.map(function(m){return(<option key={m} value={m}>{m}</option>);})}</optgroup>
              <optgroup label="Other"><option value="Removal">{"Removal"}</option></optgroup>
            </select>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <input style={{flex:1,padding:"8px 10px",background:C.input,border:"1px solid "+C.accent,borderRadius:6,color:C.text,fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none"}} type="number" value={pricingPrice} onChange={function(e){setPricingPrice(e.target.value);}} placeholder="$/sf" step="0.01" autoFocus/>
              <button onClick={function(){handlePriceImport(item);}} style={{padding:"8px 14px",background:C.accent,border:"none",borderRadius:6,color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Add"}</button>
              <button onClick={function(){setPricingId(null);setPricingPrice("");setPricingMat("");}} style={{padding:"8px 10px",background:"none",border:"1px solid "+C.dim,borderRadius:6,color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Remove"}</button>
            </div>
          </div>)}
        </div>);})}
      </div>
      <button onClick={function(){if(confirm("Clear all imported items?"))p.setImportedItems(function(prev){return prev.filter(function(i){return i.priced;});});}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Clear All"}</button>
    </div>)}

    {/* ADD MANUALLY */}
    <div style={{padding:"0 16px",marginBottom:16}}><MaterialTabs activeTab={matTab} setActiveTab={setMatTab}/><MeasurementForm key={"qb-"+matTab+"-"+activeIdx} tab={matTab} onAdd={addItem} hasPrice={true}/></div>
    </div>{/* end col-form */}
    <div className="ist-col-results">
    {/* QUOTE TOTAL — pinned card */}
    {opt.items.length>0&&(<div style={{padding:"0 16px 16px"}}>
      <div style={{background:C.accent,borderRadius:10,padding:"18px 22px",display:"flex",justifyContent:"space-between",alignItems:"center",boxShadow:"0 4px 16px rgba(37,99,235,0.18)"}}>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.75)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:4}}>{opt.name+" · "+opt.items.length+" item"+(opt.items.length!==1?"s":"")}</div>
          <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.85)"}}>{"Estimated Total"}</div>
        </div>
        <div style={{fontSize:38,fontWeight:900,color:"#fff",letterSpacing:"-0.02em"}}>
          {"$"+(opt.overrideTotal!==""?(parseFloat(opt.overrideTotal)||0).toLocaleString():((opt.items.reduce(function(s,i){return s+i.total;},0)-((opt.pso||false)?600:0)-((opt.psoKw||false)?525:0)+(opt.extraLabor?(parseFloat(opt.extraLaborAmt)||0):0)+(opt.tripCharge?(parseFloat(opt.tripChargeAmt)||0):0)+(opt.energySeal?(parseFloat(opt.energySealAmt)||0):0)+(opt.dumpster?(parseFloat(opt.dumpsterAmt)||0):0))).toLocaleString())}
        </div>
      </div>
    </div>)}
    {/* ITEMS FOR ACTIVE OPTION */}
    {opt.items.length>0&&(<div style={{padding:"0 16px 20px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{opt.name+" — Items ("+opt.items.length+")"}</div>
      <div style={{background:C.card,borderRadius:6,padding:16,border:"1px solid "+C.border,boxShadow:C.shadow}}>
        {opt.items.map(function(item,idx){return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:idx<opt.items.length-1?"1px solid "+C.border:"none"}}>
          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,lineHeight:1.3,color:C.text}}>{item.description}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.sqft.toLocaleString()+" sq ft"}{item.pitch?" · "+item.pitch:""}</div></div>
          <div style={{marginLeft:12}}><button onClick={function(){removeItem(item.id);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600}}>{"REMOVE"}</button></div>
        </div>);})}

        {/* ADJUSTMENTS */}
        <div style={{paddingTop:12,marginTop:8,borderTop:"1px solid "+C.borderLight}}>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.pso} onChange={function(e){updateOpt({pso:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"PSO Credit Attic"}</span>
            {opt.pso&&(<span style={{fontSize:13,fontWeight:700,color:C.danger,marginLeft:"auto"}}>{"-$600"}</span>)}
          </label>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.psoKw||false} onChange={function(e){updateOpt({psoKw:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"PSO Credit KW"}</span>
            {opt.psoKw&&(<span style={{fontSize:13,fontWeight:700,color:C.danger,marginLeft:"auto"}}>{"-$525"}</span>)}
          </label>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.extraLabor} onChange={function(e){updateOpt({extraLabor:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Extra Labor"}</span>
            <span style={{fontSize:10,color:C.dim,fontStyle:"italic"}}>{"(not on quote)"}</span>
            {opt.extraLabor&&(
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:13,color:C.text}}>{"$"}</span>
                <input type="number" value={opt.extraLaborAmt} onChange={function(e){updateOpt({extraLaborAmt:e.target.value,overrideTotal:""});}}
                  style={{width:80,padding:"4px 8px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.text,fontSize:13,fontWeight:600,fontFamily:"'Inter',sans-serif",outline:"none",textAlign:"right"}} placeholder="0" step="1"/>
              </div>
            )}
          </label>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.tripCharge} onChange={function(e){updateOpt({tripCharge:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Trip Charge"}</span>
            <span style={{fontSize:10,color:C.dim,fontStyle:"italic"}}>{"(not on quote)"}</span>
            {opt.tripCharge&&(
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:13,color:C.text}}>{"$"}</span>
                <input type="number" value={opt.tripChargeAmt} onChange={function(e){updateOpt({tripChargeAmt:e.target.value,overrideTotal:""});}}
                  style={{width:80,padding:"4px 8px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.text,fontSize:13,fontWeight:600,fontFamily:"'Inter',sans-serif",outline:"none",textAlign:"right"}} placeholder="0" step="1"/>
              </div>
            )}
          </label>
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.energySeal||false} onChange={function(e){updateOpt({energySeal:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Energy Seal & Plates"}</span>
            {opt.energySeal&&(
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:13,color:C.text}}>{"$"}</span>
                <input type="number" value={opt.energySealAmt||""} onChange={function(e){updateOpt({energySealAmt:e.target.value,overrideTotal:""});}}
                  style={{width:80,padding:"4px 8px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.text,fontSize:13,fontWeight:600,fontFamily:"'Inter',sans-serif",outline:"none",textAlign:"right"}} placeholder="0" step="1"/>
              </div>
            )}
          </label>
          {/* Dumpster — internal only, never on quote */}
          <label style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:"1px solid "+C.borderLight,cursor:"pointer"}}>
            <input type="checkbox" checked={opt.dumpster||false} onChange={function(e){updateOpt({dumpster:e.target.checked});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Dumpster"}</span>
            <span style={{fontSize:11,color:C.dim,marginLeft:2}}>{"(internal only)"}</span>
            {opt.dumpster&&(
              <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:13,color:C.text}}>{"$"}</span>
                <input type="number" value={opt.dumpsterAmt||""} onChange={function(e){updateOpt({dumpsterAmt:e.target.value});}}
                  style={{width:80,padding:"4px 8px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.text,fontSize:13,fontWeight:600,fontFamily:"'Inter',sans-serif",outline:"none",textAlign:"right"}} placeholder="0" step="1"/>
              </div>
            )}
          </label>
        </div>

        {/* TOTAL */}
        <div style={{paddingTop:12,marginTop:4,borderTop:"1px solid "+C.borderLight}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 0"}}>
            <span style={{fontSize:18,fontWeight:800,color:C.text}}>{"TOTAL"}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16,fontWeight:800,color:C.text}}>{"$"}</span>
              <input type="number" value={opt.overrideTotal!==""?opt.overrideTotal:subtotal.toFixed(0)} onChange={function(e){updateOpt({overrideTotal:e.target.value});}}
                style={{width:110,padding:"6px 10px",background:C.bg,border:"1px solid "+C.borderLight,borderRadius:6,color:C.text,fontSize:18,fontWeight:800,fontFamily:"'Inter',sans-serif",outline:"none",textAlign:"right"}} step="1"/>
            </div>
          </div>
          {opt.overrideTotal!==""&&parseFloat(opt.overrideTotal)!==subtotal&&(<div style={{fontSize:11,color:C.dim,textAlign:"right",marginTop:4}}>{"Calculated: $"+subtotal.toFixed(0)}</div>)}
        </div>
      </div>
      <button onClick={function(){if(confirm("Clear items from "+opt.name+"?"))updateOpt({items:[]});}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Clear "+opt.name}</button>
    </div>)}

    {/* PRINT/DOWNLOAD — show when ANY option has items */}
    {opts.some(function(o){return o.items.length>0;})&&(<div style={{padding:"0 16px 20px"}}>
      <GreenBtn onClick={function(){generatePDF({name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr},opts,p.currentUser);}}>{"Print Quote"}</GreenBtn>
      <GreenBtn mt={8} onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr};printQuoteAndTakeOff(cust,opts,p.currentUser,p.jobNotes,p.measurements,opts);}}>{"Print Quote and Take Off"}</GreenBtn>
      <GreenBtn mt={8} onClick={function(){downloadQuotePdf({name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr},opts,p.currentUser);}}>{"Download Quote PDF"}</GreenBtn>
    </div>)}

    {opt.items.length===0&&unpriced.length===0&&(<div style={{textAlign:"center",padding:"40px 16px",color:C.dim}}><div style={{fontSize:14}}>{"Use Take Off to measure first, or add items manually"}</div></div>)}
    </div>{/* end col-results */}
    </div>{/* end ist-2col */}
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
              style={{ width: "100%", padding: "11px 16px", borderRadius: 6, border: "1px solid " + C.accent, background: "transparent", color: C.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {"Save Current Job"}
            </button>
          ) : (
            <div style={{ background: C.card, borderRadius: 6, padding: 14, border: "1px solid " + C.accent, boxShadow: C.shadowMd }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", marginBottom: 8 }}>{"Save Job As"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={{ flex: 1, padding: "8px 12px", background: C.input, border: "1px solid " + C.inputBorder, borderRadius: 6, color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif", outline: "none", transition: "border-color 0.15s" }}
                  type="text" value={saveName} onChange={function(e) { setSaveName(e.target.value); }} placeholder="Job name (e.g. Smith Residence)" autoFocus
                  onKeyDown={function(e) { if (e.key === "Enter") handleSave(); }}
                  onFocus={function(e){e.target.style.borderColor=C.accent;}} onBlur={function(e){e.target.style.borderColor=C.inputBorder;}}
                />
                <button onClick={handleSave} style={{ padding: "8px 16px", background: C.accent, border: "none", borderRadius: 6, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{"Save"}</button>
                <button onClick={function() { setShowSave(false); }} style={{ padding: "8px 12px", background: "none", border: "1px solid " + C.dim, borderRadius: 6, color: C.dim, fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{"Cancel"}</button>
              </div>
            </div>
          )}
        </div>
      )}

      {status && (<div style={{ padding: "8px 12px", background: C.accentBg, border: "1px solid " + C.accent, borderRadius: 6, fontSize: 13, color: C.accent, fontWeight: 600, marginBottom: 12, textAlign: "center" }}>{status}</div>)}

      {loading && (<div style={{ fontSize: 12, color: C.dim, textAlign: "center", padding: "16px 0" }}>{"Loading..."}</div>)}

      {!loading && TEAM_MEMBERS.map(function(member) {
        var memberJobs = jobs.filter(function(j) { return j.saved_by === member; });
        var isOpen = openSections[member];
        return (
          <div key={member} style={{ marginBottom: 10 }}>
            <button onClick={function() { setOpenSections(function(prev) { var n = Object.assign({}, prev); n[member] = !n[member]; return n; }); }}
              style={{ width: "100%", padding: "12px 16px", borderRadius: isOpen ? "6px 6px 0 0" : 6, border: "1px solid " + C.border, background: C.card, color: C.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: C.shadow }}>
              <span>{member + (memberJobs.length > 0 ? " (" + memberJobs.length + ")" : "")}</span>
              <span style={{ fontSize: 14, color: C.dim }}>{isOpen ? "▲" : "▼"}</span>
            </button>
            {isOpen && (
              <div style={{ background: C.card, borderRadius: "0 0 6px 6px", border: "1px solid " + C.border, borderTop: "none", overflow: "hidden" }}>
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
                    <div key={job.id} style={{ padding: "12px 14px", borderBottom: idx < memberJobs.length - 1 ? "1px solid " + C.borderLight : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{job.job_name}</div>
                          <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>
                            {date + (info.length > 0 ? " · " + info.join(", ") : "")}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={function() { handleLoad(job); }}
                            style={{ padding: "6px 12px", background: C.accent, border: "none", borderRadius: 6, color: "#fff", fontWeight: 600, fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "uppercase" }}>{"Load"}</button>
                          <button onClick={function() { handleDelete(job); }}
                            style={{ padding: "6px 8px", background: "none", border: "1px solid " + C.danger, borderRadius: 6, color: C.danger, fontSize: 11, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>{"Delete"}</button>
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

function PasscodeInput(p) {
  var s1 = useState(["","","",""]), digits = s1[0], setDigits = s1[1];
  function handleChange(idx, val) {
    if (val && !/^\d$/.test(val)) return;
    var next = digits.slice();
    next[idx] = val;
    setDigits(next);
    if (val && idx < 3) {
      var el = document.getElementById("pin-" + p.id + "-" + (idx + 1));
      if (el) el.focus();
    }
    if (val && idx === 3) {
      var code = next.join("");
      if (code.length === 4) setTimeout(function() { p.onSubmit(code); }, 100);
    }
  }
  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      var el = document.getElementById("pin-" + p.id + "-" + (idx - 1));
      if (el) el.focus();
    }
  }
  var boxStyle = { width: 48, height: 56, textAlign: "center", fontSize: 22, fontWeight: 700, fontFamily: "'Inter',sans-serif", border: "1px solid " + C.border, borderRadius: 6, outline: "none", background: C.card, color: C.text, transition: "border-color 0.15s", boxShadow: C.shadow };
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
      {[0,1,2,3].map(function(idx) {
        return (<input key={idx} id={"pin-" + p.id + "-" + idx} type="tel" inputMode="numeric" maxLength={1} value={digits[idx]}
          onChange={function(e) { handleChange(idx, e.target.value); }}
          onKeyDown={function(e) { handleKeyDown(idx, e); }}
          onFocus={function(e) { e.target.style.borderColor = C.accent; }}
          onBlur={function(e) { e.target.style.borderColor = C.border; }}
          style={boxStyle} autoFocus={idx === 0}/>);
      })}
    </div>
  );
}

function LoginScreen(p) {
  var s1 = useState(""), selectedUser = s1[0], setSelectedUser = s1[1];
  var s2 = useState("pick"), step = s2[0], setStep = s2[1];
  var s3 = useState(false), loading = s3[0], setLoading = s3[1];
  var s4 = useState(""), error = s4[0], setError = s4[1];
  var s5 = useState(""), firstCode = s5[0], setFirstCode = s5[1];
  var s6 = useState(0), pinKey = s6[0], setPinKey = s6[1];

  function handlePickUser(name) {
    setSelectedUser(name);
    setLoading(true);
    setError("");
    loadPasscode(name).then(function(code) {
      setLoading(false);
      if (code) {
        setStep("enter");
      } else {
        setStep("create");
      }
    });
  }

  function handleEnter(code) {
    setLoading(true);
    setError("");
    loadPasscode(selectedUser).then(function(stored) {
      setLoading(false);
      if (code === stored) {
        localStorage.setItem("ist-user", selectedUser);
        p.onLogin(selectedUser);
      } else {
        setError("Incorrect passcode");
        setPinKey(function(k) { return k + 1; });
      }
    });
  }

  function handleCreate(code) {
    if (!firstCode) {
      setFirstCode(code);
      setStep("confirm");
      setPinKey(function(k) { return k + 1; });
      return;
    }
    if (code !== firstCode) {
      setError("Passcodes don't match. Try again.");
      setFirstCode("");
      setStep("create");
      setPinKey(function(k) { return k + 1; });
      return;
    }
    setLoading(true);
    setError("");
    savePasscode(selectedUser, code).then(function() {
      setLoading(false);
      localStorage.setItem("ist-user", selectedUser);
      p.onLogin(selectedUser);
    });
  }

  function handleBack() {
    setSelectedUser("");
    setStep("pick");
    setError("");
    setFirstCode("");
    setPinKey(function(k) { return k + 1; });
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", position: "fixed", inset: 0, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes kenburns { 0%{transform:scale(1.0) translate(0%,0%)} 50%{transform:scale(1.12) translate(-2%,-1%)} 100%{transform:scale(1.0) translate(0%,0%)} }
        @keyframes authFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .kb-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;animation:kenburns 20s ease-in-out infinite;transform-origin:center center}
        .kb-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.55) 0%,rgba(0,0,0,0.35) 50%,rgba(0,0,0,0.65) 100%)}
        .kb-content{animation:authFadeIn 0.45s cubic-bezier(0.16,1,0.3,1) both;position:relative;z-index:1;width:100%;max-width:340px;padding:20px}
        .kb-btn{background:rgba(255,255,255,0.1)!important;backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.2)!important;color:#fff!important;box-shadow:0 4px 24px rgba(0,0,0,0.3)!important;transition:background 0.2s,transform 0.2s!important}
        .kb-btn:hover{background:rgba(255,255,255,0.18)!important;transform:translateY(-2px)}
      `}</style>
      <img className="kb-img" src="/tulsa.jpg" alt="" />
      <div className="kb-overlay" />
      <div className="kb-content">
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>{"Insulation Services of Tulsa"}</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase", margin: 0 }}>{"IST Takeoff"}</h1>
        <div style={{ width: 36, height: 2, background: C.accent, margin: "10px auto 0", borderRadius: 1 }} />
      </div>
      <div style={{ width: "100%" }}>

        {step === "pick" && (<div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, textAlign: "center" }}>{"Who's working?"}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TEAM_MEMBERS.map(function(name) {
              return (
                <button key={name} onClick={function() { handlePickUser(name); }} className="kb-btn"
                  style={{ width: "100%", padding: "16px 20px", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textAlign: "center", border: "none" }}>
                  {name}
                </button>
              );
            })}
          </div>
        </div>)}

        {step === "enter" && (<div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{selectedUser}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>{"Enter your passcode"}</div>
          {loading ? (<div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{"Verifying..."}</div>) : (<PasscodeInput key={pinKey} id="enter" onSubmit={handleEnter}/>)}
          {error && (<div style={{ marginTop: 12, fontSize: 13, color: C.danger, fontWeight: 600 }}>{error}</div>)}
          <button onClick={handleBack} style={{ marginTop: 20, background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{"Back"}</button>
        </div>)}

        {step === "create" && (<div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{selectedUser}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>{"Create a 4-digit passcode"}</div>
          {loading ? (<div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{"Loading..."}</div>) : (<PasscodeInput key={pinKey} id="create" onSubmit={handleCreate}/>)}
          {error && (<div style={{ marginTop: 12, fontSize: 13, color: C.danger, fontWeight: 600 }}>{error}</div>)}
          <button onClick={handleBack} style={{ marginTop: 20, background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{"Back"}</button>
        </div>)}

        {step === "confirm" && (<div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{selectedUser}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 20 }}>{"Confirm your passcode"}</div>
          {loading ? (<div style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{"Saving..."}</div>) : (<PasscodeInput key={pinKey} id="confirm" onSubmit={handleCreate}/>)}
          {error && (<div style={{ marginTop: 12, fontSize: 13, color: C.danger, fontWeight: 600 }}>{error}</div>)}
          <button onClick={handleBack} style={{ marginTop: 20, background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>{"Back"}</button>
        </div>)}

      </div>
      </div>
    </div>
  );
}

/* ══════════ MAIN APP ══════════ */

export default function App() {
  var s0 = useState(""), currentUser = s0[0], setCurrentUser = s0[1];
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
    <div className="ist-app" style={{ fontFamily: "'Inter', sans-serif", background: C.bg, color: C.text, maxWidth: 1140, margin: "0 auto", paddingBottom: 32 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        .ist-2col { display: flex; flex-direction: column; }
        .ist-col-form { min-width: 0; }
        .ist-col-results { min-width: 0; }
        @media (min-width: 768px) {
          .ist-2col { flex-direction: row; align-items: flex-start; gap: 28px; padding: 16px 24px 0; }
          .ist-col-form { flex: 0 0 400px; }
          .ist-col-results { flex: 1 1 0; padding-top: 4px; }
        }
        @media (min-width: 1024px) { .ist-col-form { flex: 0 0 440px; } }
        .ist-clear-btn-inner { max-width: 1140px; margin: 0 auto; }
      `}</style>

      {/* HEADER */}
      <div style={{ background: C.card, padding: "22px 20px 16px", borderBottom: "1px solid " + C.border, textAlign: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: C.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{currentUser}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={function(){if(window.confirm("Clear everything? This will erase customer info, all measurements, and the entire quote.")){setMeas([]);setQOpts([newOption("Option 1")]);setIi([]);setCn("");setCa("");setCph("");setCe("");setJa("");setJn("");setSec("takeoff");}}} style={{ background: "none", border: "1px solid "+C.danger, borderRadius: 5, color: C.danger, fontSize: 10, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 700, textTransform: "uppercase", padding: "4px 8px", letterSpacing: "0.04em" }}>{"🗑 Clear"}</button>
            <button onClick={handleLogout} style={{ background: "none", border: "none", color: C.dim, fontSize: 10, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, textTransform: "uppercase" }}>{"Switch User"}</button>
          </div>
        </div>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "0.04em", margin: 0, textTransform: "uppercase" }}>{"Insulation Services of Tulsa"}</h1>
        <div style={{ fontSize: 10, color: C.dim, marginTop: 3, letterSpacing: "0.12em", textTransform: "uppercase" }}>{COMPANY.tagline}</div>

        <div className="ist-nav-tabs" style={{ display: "flex", gap: 0, borderRadius: 6, overflow: "hidden", border: "1px solid " + C.border, marginTop: 14 }}>
          {[
            { id: "takeoff", label: "TAKE OFF", badge: meas.length || null },
            { id: "quote", label: "QUOTE", badge: qOpts.reduce(function(s,o){return s+o.items.length;},0) || null },
            { id: "jobs", label: "JOBS", badge: null },
          ].map(function(t) {
            return (
              <button key={t.id} onClick={function() { setSec(t.id); }}
                style={{ flex: 1, padding: "10px 6px", border: "none", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: sec === t.id ? C.accent : C.card, color: sec === t.id ? "#fff" : C.dim, transition: "all 0.15s ease" }}>
                {t.label}
                {t.badge ? (<span style={{ display: "inline-block", marginLeft: 5, background: sec === t.id ? "rgba(255,255,255,0.25)" : C.borderLight, color: sec === t.id ? "#fff" : C.textSec, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, minWidth: 18, textAlign: "center" }}>{t.badge}</span>) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {sec === "takeoff" && (<TakeOff measurements={meas} setMeasurements={setMeas} onSendToQuote={sendToQuote} currentUser={currentUser} quoteOpts={qOpts} {...cp2} />)}
        {sec === "quote" && (<QuoteBuilderSection quoteOpts={qOpts} setQuoteOpts={setQOpts} importedItems={ii} setImportedItems={setIi} currentUser={currentUser} measurements={meas} {...cp2} />)}
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
                style={{ width: "100%", padding: "12px 16px", borderRadius: 6, border: "1px solid " + C.borderLight, background: "transparent", color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {"+ New Job"}
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}
