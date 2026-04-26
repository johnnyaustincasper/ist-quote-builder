import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { supabase } from "./supabase";


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
  { id: "ext_walls_house",  label: "Boxed Exterior Walls of House", short: "Ext Walls House",   type: "wall",    group: "Walls" },
  { id: "ext_walls_garage", label: "Boxed Exterior Walls of Garage",short: "Ext Walls Garage",  type: "wall",    group: "Walls" },
  { id: "garage_common",    label: "Garage Common Wall",            short: "Garage Common",     type: "wall",    group: "Walls" },
  { id: "open_attic_walls", label: "Open Attic Walls",              short: "Attic Walls",       type: "wall",    group: "Walls" },
  { id: "ext_slopes",       label: "Boxed Exterior Slopes",         short: "Ext Slopes",        type: "slope",   group: "Attic" },
  { id: "ext_kneewall",     label: "Boxed Exterior Kneewall",       short: "Ext Kneewall",      type: "wall",    group: "Attic" },
  { id: "attic_slopes",     label: "Open Attic Slopes",             short: "Attic Slopes",      type: "area",    group: "Attic" },
  { id: "attic_kneewall",   label: "Open Attic Kneewall",           short: "Attic Kneewall",    type: "wall",    group: "Attic" },
  { id: "flat_ceiling",     label: "Flat Ceiling",                  short: "Flat Ceiling",      type: "area",    group: "Attic" },
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

var FIBERGLASS_MATERIALS = [
  "Blown Fiberglass", "R11 Fiberglass Batts", "R13 Fiberglass Batts", "R15 Fiberglass Batts",
  "R19 Fiberglass Batts", "R22 Blown Fiberglass", "R26 Blown Fiberglass", "R30 Fiberglass Batts", "R38 Fiberglass Batts",
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

var GROUP_ORDER = ["Walls","Attic","Porch / Blocking","Roofline","Other"];

var C = {
  bg:"linear-gradient(135deg, #e8eef8 0%, #dde6f5 40%, #cdd9f0 100%)",
  bgSolid:"#e8eef8",
  card:"rgba(255,255,255,0.65)",
  cardHover:"rgba(255,255,255,0.8)",
  glass:"rgba(255,255,255,0.6)",
  glassBorder:"rgba(255,255,255,0.8)",
  glassStrong:"rgba(255,255,255,0.75)",
  accent:"#2563eb",
  accentHover:"#1d4ed8",
  accentBg:"rgba(37,99,235,0.08)",
  accentGlow:"0 0 20px rgba(37,99,235,0.2)",
  text:"#0f172a",
  textSec:"#475569",
  dim:"#94a3b8",
  border:"rgba(0,0,0,0.08)",
  borderLight:"rgba(0,0,0,0.04)",
  input:"rgba(255,255,255,0.7)",
  inputBorder:"rgba(0,0,0,0.12)",
  danger:"#dc2626",
  dangerBg:"rgba(220,38,38,0.06)",
  green:"#16a34a",
  blue:"#2563eb",
  shadow:"0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
  shadowMd:"0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
};

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

var glassInput={width:"100%",padding:"10px 12px",background:"rgba(255,255,255,0.7)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,color:"#0f172a",fontSize:15,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",transition:"border-color 0.15s, box-shadow 0.15s"};
var _numpadBlurTimer=null;
var _numpadActiveSet=null;
function _numpadOpen(setShow){
  clearTimeout(_numpadBlurTimer);
  if(_numpadActiveSet&&_numpadActiveSet!==setShow){_numpadActiveSet(false);}
  _numpadActiveSet=setShow;
  setShow(true);
}
function _numpadClose(setShow){
  _numpadBlurTimer=setTimeout(function(){
    if(_numpadActiveSet===setShow){_numpadActiveSet=null;}
    setShow(false);
  },120);
}
function Input(p){
  var isNum=!p.type||p.type==="number";
  var sp=React.useState(false),showPad=sp[0],setShowPad=sp[1];
  function padPress(v){
    var cur=String(p.value||"");
    if(v==="⌫"){p.onChange(cur.slice(0,-1));}
    else if(v==="."&&cur.includes(".")){return;}
    else{p.onChange(cur+v);}
  }
  var padNums=["7","8","9","4","5","6","1","2","3",".","0","⌫"];
  return(<div style={{position:"relative"}}>
    <label style={{fontSize:11,fontWeight:600,color:C.textSec,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.label}</label>
    <input className={p.pulse?"ist-pulse":""} style={Object.assign({},glassInput,{caretColor:isNum?"transparent":"auto"})}
      onFocus={function(e){e.target.style.borderColor=C.accent;e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.15)";if(isNum)_numpadOpen(setShowPad);}}
      onBlur={function(e){e.target.style.borderColor="rgba(0,0,0,0.1)";e.target.style.boxShadow="none";if(isNum)_numpadClose(setShowPad);}}
      readOnly={isNum} inputMode={isNum?"none":undefined}
      type={isNum?"text":p.type} value={p.value}
      onChange={isNum?function(){}:function(e){p.onChange(e.target.value);}}
      placeholder={p.placeholder} step={p.step}/>
    {isNum&&showPad&&ReactDOM.createPortal(
      (<div onMouseDown={function(e){e.preventDefault();}} style={{position:"fixed",zIndex:9999,bottom:0,left:0,right:0,background:"#f1f5f9",boxShadow:"0 -2px 16px rgba(0,0,0,0.18)",borderTop:"2px solid #2563eb",padding:"10px 16px",paddingBottom:"max(24px, env(safe-area-inset-bottom))"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:8,maxWidth:400,margin:"0 auto 8px"}}>
          {padNums.map(function(v){return(<button key={v} onMouseDown={function(e){e.preventDefault();padPress(v);}} style={{padding:"14px 0",borderRadius:10,border:"1px solid #cbd5e1",background:v==="⌫"?"#fee2e2":"#fff",color:v==="⌫"?"#dc2626":"#0f172a",fontSize:18,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>{v}</button>);})}
        </div>
        <button onMouseDown={function(e){e.preventDefault();clearTimeout(_numpadBlurTimer);_numpadActiveSet=null;setShowPad(false);}} style={{display:"block",maxWidth:400,width:"100%",margin:"0 auto",padding:"13px",borderRadius:10,border:"none",background:"#2563eb",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",letterSpacing:"0.06em",textTransform:"uppercase"}}>Done</button>
      </div>),
      document.body
    )}
  </div>);}


function AppSelect(p){return(<div><label style={{fontSize:11,fontWeight:600,color:C.textSec,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.label}</label><select className={p.pulse?"ist-pulse":""} style={Object.assign({},glassInput,{WebkitAppearance:"none"})} onFocus={function(e){e.target.style.borderColor=C.accent;e.target.style.boxShadow="0 0 0 3px rgba(37,99,235,0.15)";}} onBlur={function(e){e.target.style.borderColor="rgba(0,0,0,0.1)";e.target.style.boxShadow="none";}} value={p.value} onChange={function(e){p.onChange(e.target.value);}}>{p.options.map(function(o){var v=typeof o==="string"?o:o.value;var l=typeof o==="string"?o:o.label;return(<option key={v} value={v} style={{background:"#fff",color:"#0f172a"}}>{l}</option>);})}</select></div>);}

function Row(p){return <div style={{display:"flex",gap:10,marginBottom:10}}>{p.children}</div>;}
function Col(p){return <div style={{flex:1}}>{p.children}</div>;}
function StepLabel(p){return(<label style={{fontSize:11,fontWeight:700,color:C.accent,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:"0.08em"}}>{p.children}</label>);}

function ToggleButtons(p){return(<div style={{display:"flex",gap:2,background:"rgba(0,0,0,0.05)",padding:3,borderRadius:8,marginBottom:12,border:"1px solid rgba(0,0,0,0.07)"}}>{p.options.map(function(o){return(<button key={o.id} onClick={function(){p.setMode(o.id);}} style={{flex:1,padding:"8px 6px",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer",border:p.mode===o.id?"1px solid rgba(37,99,235,0.3)":"1px solid transparent",fontFamily:"'Inter',sans-serif",textTransform:"uppercase",letterSpacing:"0.04em",background:p.mode===o.id?"rgba(255,255,255,0.9)":"transparent",color:p.mode===o.id?C.accent:C.textSec,boxShadow:p.mode===o.id?"0 1px 4px rgba(0,0,0,0.1)":"none",transition:"all 0.15s"}}>{o.label}</button>);})}</div>);}

function GreenBtn(p){return(<button onClick={p.onClick} className={p.pulse?"ist-pulse":""} style={{width:"100%",padding:"13px 20px",borderRadius:8,border:"1px solid rgba(37,99,235,0.3)",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase",letterSpacing:"0.06em",background:"rgba(37,99,235,0.12)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",color:"#1d4ed8",marginTop:p.mt||0,boxShadow:"0 2px 12px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.8)",transition:"all 0.15s"}} onMouseOver={function(e){e.currentTarget.style.background="rgba(37,99,235,0.2)";e.currentTarget.style.boxShadow="0 4px 20px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.9)";}} onMouseOut={function(e){e.currentTarget.style.background="rgba(37,99,235,0.12)";e.currentTarget.style.boxShadow="0 2px 12px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.8)";}}>{p.children}</button>);}

/* ──────── MEASUREMENTS ──────── */

var CAVITY_WIDTHS=[{value:"",label:"— Cavity Width —"},{value:"2x4",label:"2x4"},{value:"2x6",label:"2x6"},{value:"2x8",label:"2x8"}];

function WallMeasurement(p){
  var s1=useState(p.lhOnly?"lh":"count"),mode=s1[0],setMode=s1[1];
  // sqft direct mode
  var sd=useState(""),ds=sd[0],setDs=sd[1];
  var s2=useState(""),wc=s2[0],setWc=s2[1];
  var s3=useState("0"),wi=s3[0],setWi=s3[1];
  var s4=useState(""),ln=s4[0],setLn=s4[1];
  var s5=useState(""),ht=s5[0],setHt=s5[1];
  var s6=useState(""),cw=s6[0],setCw=s6[1];
  var sq=mode==="count"?(parseInt(wc)||0)*(WALL_HEIGHTS[parseInt(wi)]?WALL_HEIGHTS[parseInt(wi)].sqftPer:0):(parseFloat(ln)||0)*(parseFloat(ht)||0);
  function notify(sqftVal,wiVal,wcVal,lnVal,htVal,modeVal,cwVal){
    var heightLabel=null;var dimStr="";
    var m=modeVal||mode;
    if(m==="count"){var h=WALL_HEIGHTS[parseInt(wiVal!==undefined?wiVal:wi)];if(h)heightLabel=h.label;var cavities=parseInt(wcVal!==undefined?wcVal:wc)||0;if(cavities>0&&heightLabel){heightLabel=cavities+" cavities @ "+heightLabel;dimStr=heightLabel;}}
    else{var l=lnVal!==undefined?lnVal:ln;var ht2=htVal!==undefined?htVal:ht;if(l&&ht2)dimStr=l+"×"+ht2;}
    var cavity=cwVal!==undefined?cwVal:cw;
    p.onSqftChange(sqftVal,heightLabel,cavity||null,dimStr||null);
  }
  return(<div>
    <ToggleButtons mode={mode} setMode={function(v){setMode(v);}} options={p.lhOnly?[{id:"lh",label:"L × H"},{id:"sqft",label:"Sq Ft"}]:[{id:"count",label:"Wall Count"},{id:"lh",label:"L × H"},{id:"sqft",label:"Sq Ft"}]}/>
    {mode==="count"&&(<Row><Col><Input pulse={p.pulse} label="# of Cavities" value={wc} placeholder="0" onChange={function(v){setWc(v);var s=(parseInt(v)||0)*(WALL_HEIGHTS[parseInt(wi)]?WALL_HEIGHTS[parseInt(wi)].sqftPer:0);notify(s,wi,v,ln,ht,"count",cw);}}/></Col><Col><AppSelect pulse={p.pulse} label="Wall Height" value={wi} onChange={function(v){setWi(v);var s=(parseInt(wc)||0)*(WALL_HEIGHTS[parseInt(v)]?WALL_HEIGHTS[parseInt(v)].sqftPer:0);notify(s,v,wc,ln,ht,"count",cw);}} options={WALL_HEIGHTS.map(function(w,i){return{value:String(i),label:w.label};})}/></Col></Row>)}
    {mode==="lh"&&(<Row><Col><Input pulse={p.pulse} label="Length (ft)" value={ln} placeholder="0" onChange={function(v){setLn(v);notify((parseFloat(v)||0)*(parseFloat(ht)||0),wi,wc,v,ht,"lh",cw);}}/></Col><Col><Input pulse={p.pulse} label="Height (ft)" value={ht} placeholder="0" onChange={function(v){setHt(v);notify((parseFloat(ln)||0)*(parseFloat(v)||0),wi,wc,ln,v,"lh",cw);}}/></Col></Row>)}
    {mode==="sqft"&&(<div style={{marginBottom:10}}><Input pulse={p.pulse} label="Total Sq Ft" value={ds} placeholder="0" onChange={function(v){setDs(v);p.onSqftChange(parseFloat(v)||0,null,null,v?v+" sf":null);}}/></div>)}
    {mode!=="sqft"&&<div style={{marginBottom:8}}><AppSelect pulse={p.pulse} label="Cavity Width" value={cw} onChange={function(v){setCw(v);notify(sq,wi,wc,ln,ht,mode,v);}} options={CAVITY_WIDTHS}/></div>}
    {(sq>0||parseFloat(ds)>0)&&(<div style={{fontSize:13,color:C.accent,fontWeight:600,marginBottom:8}}>{Math.round(mode==="sqft"?parseFloat(ds)||0:sq)+" sq ft"+(cw&&mode!=="sqft"?" · "+cw:"")}</div>)}
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
    {mode==="dims"?(<Row><Col><Input pulse={p.pulse} label="Length (ft)" value={ln} placeholder="0" onChange={function(v){setLn(v);var sq2=(parseFloat(v)||0)*(parseFloat(wd)||0);p.onSqftChange(sq2,null,null,(v&&wd)?v+"×"+wd:null);}}/></Col><Col><Input pulse={p.pulse} label="Width (ft)" value={wd} placeholder="0" onChange={function(v){setWd(v);var sq2=(parseFloat(ln)||0)*(parseFloat(v)||0);p.onSqftChange(sq2,null,null,(ln&&v)?ln+"×"+v:null);}}/></Col></Row>):(<div style={{marginBottom:10}}><Input pulse={p.pulse} label="Total Sq Ft" value={ds} placeholder="0" onChange={function(v){setDs(v);p.onSqftChange(parseFloat(v)||0,null,null,v?v+" sf":null);}}/></div>)}
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
            return(<button key={loc.id} onClick={function(){p.onChange(loc.id);}} className={(p.pulse&&!p.value)?"ist-pulse":active?"ist-pulse-selected":""}
              style={{padding:"8px 13px",borderRadius:8,border:active?"2px solid "+C.accent:"1px solid rgba(0,0,0,0.08)",background:active?"rgba(37,99,235,0.1)":"rgba(255,255,255,0.6)",color:active?C.accent:C.text,fontSize:13,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.12s",lineHeight:1.2,backdropFilter:"blur(8px)",boxShadow:active?"0 0 0 3px rgba(37,99,235,0.1)":"0 1px 3px rgba(0,0,0,0.06)"}}>
              {loc.short}
            </button>);
          })}
        </div>
      </div>);
    })}
    <button onClick={function(){p.onChange("custom");}}
      style={{padding:"8px 13px",borderRadius:8,border:p.value==="custom"?"2px solid "+C.accent:"1px dashed rgba(0,0,0,0.2)",background:p.value==="custom"?"rgba(37,99,235,0.08)":"rgba(255,255,255,0.4)",color:p.value==="custom"?C.accent:C.dim,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
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
  // Allow external lid/cl state (for split layout)
  var s1=useState(""),_lid=s1[0],_setLid=s1[1];
  var s2=useState(""),_cl=s2[0],_setCl=s2[1];
  var lid=p.lid!==undefined?p.lid:_lid;
  var setLid=p.setLid||_setLid;
  var cl=p.cl!==undefined?p.cl:_cl;
  var setCl=p.setCl||_setCl;
  var s3=useState(mats[0]||""),mat=s3[0],setMat=s3[1];
  var s4=useState(0),sqft=s4[0],setSqft=s4[1];
  var s4b=useState(null),wallHeightLabel=s4b[0],setWallHeightLabel=s4b[1];
  var s4c=useState(null),cavityWidth=s4c[0],setCavityWidth=s4c[1];
  var s4d=useState(null),dimStr=s4d[0],setDimStr=s4d[1];
  var s5=useState(""),price=s5[0],setPrice=s5[1];
  var s6=useState("Flat (0/12)"),pitch=s6[0],setPitch=s6[1];
  var s7=useState(0),mk=s7[0],setMk=s7[1];
  var s8=useState(false),isRemoval=s8[0],setIsRemoval=s8[1];
  var s9=useState(""),matNote=s9[0],setMatNote=s9[1];
  var s10=useState(""),tmpMat=s10[0],setTmpMat=s10[1];
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
  var stepLabels = hp ? ["Location","Material","Measure","Price"] : ["Location","Measure","Material","Add"];
  var stepCurrent = !lid ? 0 : (fin<=0) ? 1 : (!hp&&!matNote.trim()) ? 2 : 3;
  React.useEffect(function(){
    setSqft(0);setWallHeightLabel(null);setCavityWidth(null);setDimStr(null);setMk(function(k){return k+1;});setMatNote("");setTmpMat("");
  },[lid]);
  React.useEffect(function(){
    if(document.getElementById("ist-pulse-style"))return;
    var s=document.createElement("style");s.id="ist-pulse-style";
    s.textContent="@keyframes ist-pulse{0%{box-shadow:0 0 0 0 rgba(37,99,235,0.9),0 0 0 0 rgba(37,99,235,0.5)}60%{box-shadow:0 0 0 6px rgba(37,99,235,0.3),0 0 0 12px rgba(37,99,235,0)}100%{box-shadow:0 0 0 0 rgba(37,99,235,0),0 0 0 0 rgba(37,99,235,0)}}.ist-pulse{animation:ist-pulse 1.3s ease-in-out infinite !important;border-radius:8px;outline:2px solid rgba(37,99,235,0.6);outline-offset:1px;}.ist-pulse-selected{animation:ist-pulse 1.3s ease-in-out infinite !important;}";
    document.head.appendChild(s);
  },[]);
  function handleAdd(){
    var pr=hp?(parseFloat(price)||0):0;if(fin<=0||!locLabel)return;if(hp&&pr<=0)return;if(!hp&&!matNote.trim()){alert("Please select a material first.");return;}
    var useMat=hp?mat:"(material TBD)";
    var desc=hp?("Install "+mat.toLowerCase()+" in "+locLabel.toLowerCase()):(locLabel+" — "+fin.toLocaleString()+" sq ft");
    p.onAdd({type:isFoam?"Foam":"Fiberglass",material:useMat,location:locLabel,locationId:loc?loc.id:"custom",group:locGroup,sqft:fin,pitch:needsPitch?pitch:null,pricePerUnit:pr,total:hp?Math.ceil(fin*pr):0,description:desc,isRemoval:!hp&&isRemoval,wallHeightLabel:(!hp&&wallHeightLabel)||null,cavityWidth:(!hp&&cavityWidth)||null,matNote:(!hp&&matNote.trim())||null,dimStr:dimStr||null});
    setSqft(0);setWallHeightLabel(null);setCavityWidth(null);setDimStr(null);setPrice("");setPitch("Flat (0/12)");setMk(function(k){return k+1;});setIsRemoval(false);setMatNote("");setTmpMat("");
  }
  return(<div style={{background:"rgba(255,255,255,0.65)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:12,padding:18,border:"1px solid rgba(255,255,255,0.8)",boxShadow:"0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)"}}>
    <StepBar steps={stepLabels} current={stepCurrent}/>
    {/* STEP 1: Location grid */}
    {!p.hideLocation&&(<div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{"① Location"}</div>
      <LocationGrid pulse={!hp&&stepCurrent===0} value={lid} onChange={function(v){setLid(v);setSqft(0);setMk(function(k){return k+1;});}}/>
      {lid==="custom"&&(<div style={{marginTop:8}}><Input label="Custom Location Name" value={cl} onChange={setCl} type="text" placeholder="e.g. Bonus room walls"/></div>)}
    </div>)}
    {loc&&(<div>
      {hp&&(<div style={{marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{"② Material"}{!mat&&(<span style={{color:C.danger,marginLeft:4}}>{"*"}</span>)}</div>
        {(function(){
          var HPBTNS=[
            {id:"R11",label:"R11",value:"R11 Fiberglass Batts",sub:null},
            {id:"R13",label:"R13",value:null,sub:[{id:"x15",label:"x15",value:"R13 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R13 x24 Fiberglass Batts"}]},
            {id:"R19",label:"R19",value:null,sub:[{id:"x15",label:"x15",value:"R19 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R19 x24 Fiberglass Batts"}]},
            {id:"R30",label:"R30",value:null,sub:[{id:"x15",label:"x15",value:"R30 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R30 x24 Fiberglass Batts"}]},
            {id:"opencell",label:"Open Cell",value:null,sub:["2\"","3\"","4\"","5\"","6\""].map(function(v){return{id:v,label:v,value:v+' Open Cell Foam'};})},
            {id:"closedcell",label:"Closed Cell",value:null,sub:["1\"","2\"","3\""].map(function(v){return{id:v,label:v,value:v+' Closed Cell Foam'};})},
            {id:"blownfg",label:"Blown Fiberglass",value:null,sub:["R13","R15","R19","R22","R26","R30","R38","R44","R49","R60"].map(function(r){return{id:r,label:r,value:"Blown Fiberglass "+r};})},
            {id:"blowncel",label:"Blown Cellulose",value:null,sub:["R13","R15","R19","R22","R26","R30","R38","R44","R49","R60"].map(function(r){return{id:r,label:r,value:"Blown Cellulose "+r};})},
          ];
          var hpBtnStyle=function(active){return{padding:"8px 13px",borderRadius:8,border:active?"2px solid "+C.accent:"1px solid rgba(0,0,0,0.08)",background:active?"rgba(37,99,235,0.1)":"rgba(255,255,255,0.6)",color:active?C.accent:C.text,fontSize:13,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.12s",backdropFilter:"blur(8px)",boxShadow:active?"0 0 0 3px rgba(37,99,235,0.1)":"0 1px 3px rgba(0,0,0,0.06)"};};
          var activePrimary=HPBTNS.find(function(b){return mat&&(b.value===mat||b.sub&&b.sub.some(function(s){return s.value===mat;}));});
          var activePrimaryId=activePrimary?activePrimary.id:"";
          return React.createElement("div",null,
            React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}},
              HPBTNS.map(function(b){
                var active=activePrimaryId===b.id;
                return React.createElement("button",{key:b.id,onClick:function(){if(b.value){setMat(b.value);}else{setMat("");}setTmpMat(b.id);},style:hpBtnStyle(active)},b.label);
              })
            ),
            activePrimary&&activePrimary.sub&&React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginTop:4,paddingLeft:8,borderLeft:"3px solid "+C.accent}},
              activePrimary.sub.map(function(s){
                var subActive=mat===s.value;
                return React.createElement("button",{key:s.id,onClick:function(){setMat(s.value);},style:hpBtnStyle(subActive)},s.label);
              })
            )
          );
        })()}
        {mat&&(<div style={{marginTop:6,fontSize:12,color:C.accent,fontWeight:600}}>{"✓ "+mat}</div>)}
      </div>)}
      <div style={{marginBottom:4}}>
        <div style={{fontSize:11,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{(hp?"③":"②")+" Measurements"}</div>
      </div>
      {measType==="wall"?(<WallMeasurement key={"w-"+mk} pulse={!hp&&stepCurrent===1} lhOnly={lid==="ext_kneewall"||lid==="attic_kneewall"} onSqftChange={function(s,h,cw,ds){setSqft(s);setWallHeightLabel(h||null);setCavityWidth(cw||null);setDimStr(ds||null);}}/>):measType==="slope"?(<WallMeasurement key={"w-"+mk} pulse={!hp&&stepCurrent===1} onSqftChange={function(s,h,cw,ds){setSqft(s);setDimStr(ds||null);}} lhOnly/>):(<AreaMeasurement key={"a-"+mk} pulse={!hp&&stepCurrent===1} onSqftChange={function(s,h,cw,ds){setSqft(s);setDimStr(ds||null);}}/>)}
      {needsPitch&&(<div style={{marginBottom:10}}><AppSelect label="Roof Pitch" value={pitch} onChange={setPitch} options={Object.keys(PITCH_FACTORS)}/></div>)}
      {!hp&&(<div style={{marginBottom:12}}>
        <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{"③ Material"}{!matNote.trim()&&(<span style={{color:C.danger,marginLeft:4}}>{"*"}</span>)}</div>
        {(function(){
          var BTNS=[
            {id:"R11",label:"R11",value:"R11 Fiberglass Batts",sub:null},
            {id:"R13",label:"R13",value:null,sub:[{id:"x15",label:"x15",value:"R13 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R13 x24 Fiberglass Batts"}]},
            {id:"R19",label:"R19",value:null,sub:[{id:"x15",label:"x15",value:"R19 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R19 x24 Fiberglass Batts"}]},
            {id:"R30",label:"R30",value:null,sub:[{id:"x15",label:"x15",value:"R30 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R30 x24 Fiberglass Batts"}]},
            {id:"opencell",label:"Open Cell",value:null,sub:["1\"","2\"","3\"","4\"","5\"","6\"","7\"","8\"","9\"","10\""].map(function(v){return{id:v,label:v,value:v+' Open Cell Foam'};})},
            {id:"closedcell",label:"Closed Cell",value:null,sub:["1\"","1.5\"","2\"","2.5\"","3\"","3.5\"","4\"","4.5\"","5\"","5.5\"","6\""].map(function(v){return{id:v,label:v,value:v+' Closed Cell Foam'};})},
            {id:"blownfg",label:"Blown Fiberglass",value:null,sub:["R13","R15","R19","R22","R26","R30","R38","R44","R49","R60"].map(function(r){return{id:r,label:r,value:"Blown Fiberglass "+r};})},
            {id:"blowncel",label:"Blown Cellulose",value:null,sub:["R13","R15","R19","R22","R26","R30","R38","R44","R49","R60"].map(function(r){return{id:r,label:r,value:"Blown Cellulose "+r};})},
            {id:"removal",label:"Removal",value:"Removal",sub:null,isRemoval:true},
          ];
          var btnStyle=function(active,rem){return{padding:"8px 13px",borderRadius:8,border:active?(rem?"2px solid "+C.danger:"2px solid "+C.accent):"1px solid rgba(0,0,0,0.08)",background:active?(rem?"rgba(220,38,38,0.1)":"rgba(37,99,235,0.1)"):"rgba(255,255,255,0.6)",color:active?(rem?C.danger:C.accent):C.text,fontSize:13,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.12s",backdropFilter:"blur(8px)",boxShadow:active?(rem?"0 0 0 3px rgba(220,38,38,0.1)":"0 0 0 3px rgba(37,99,235,0.1)"):"0 1px 3px rgba(0,0,0,0.06)"};};
          var matPulse=stepCurrent===2;
          var activeBtn=BTNS.find(function(b){return b.id===tmpMat;});
          var subPulse=matPulse&&activeBtn&&activeBtn.sub&&!matNote.trim();
          return React.createElement("div",null,
            React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}},
              BTNS.map(function(b){
                var active=tmpMat===b.id;
                var shouldPulse=matPulse&&!tmpMat;
                return React.createElement("button",{key:b.id,className:shouldPulse||active?"ist-pulse":"",onClick:function(){
                  setTmpMat(b.id);
                  if(b.value){setMatNote(b.value);}else{setMatNote("");}
                  setIsRemoval(!!b.isRemoval);
                },style:btnStyle(active,b.isRemoval)},b.label);
              })
            ),
            activeBtn&&activeBtn.sub&&React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:6,marginTop:4,paddingLeft:8,borderLeft:"3px solid "+C.accent}},
              activeBtn.sub.map(function(s){
                var subActive=matNote===s.value;
                return React.createElement("button",{key:s.id,className:subPulse||subActive?"ist-pulse":"",onClick:function(){setMatNote(s.value);},style:btnStyle(subActive)},s.label);
              })
            )
          );
        })()}
        {matNote.trim()&&(<div style={{marginTop:8,fontSize:12,color:C.accent,fontWeight:600}}>{"✓ "+matNote}</div>)}
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
      {!hp&&fin>0&&false&&(<label style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",marginBottom:8,cursor:"pointer"}}>
        <input type="checkbox" checked={isRemoval} onChange={function(e){setIsRemoval(e.target.checked);}} style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Removal"}</span>
      </label>)}
      <GreenBtn pulse={!hp&&stepCurrent===3} onClick={handleAdd}>{"+ "+(hp?"Add to Quote":"Add Measurement")}</GreenBtn>
    </div>)}
  </div>);
}

function MaterialTabs(p){return(<div style={{display:"flex",gap:0,borderRadius:6,overflow:"hidden",border:"1px solid "+C.border,marginBottom:16}}>{[{id:"fiberglass",label:"FIBERGLASS"},{id:"opencell",label:"OPEN CELL"},{id:"closedcell",label:"CLOSED CELL"}].map(function(t){return(<button key={t.id} onClick={function(){p.setActiveTab(t.id);}} style={{flex:1,padding:"12px 4px",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif",fontSize:11,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",background:p.activeTab===t.id?C.accent:C.card,color:p.activeTab===t.id?"#fff":C.dim}}>{t.label}</button>);})}</div>);}

function getSavedCustomers(salesman){try{return JSON.parse(localStorage.getItem("ist-customers-"+salesman)||"[]");}catch(e){return[];}}
function setSavedCustomers(salesman,list){localStorage.setItem("ist-customers-"+salesman,JSON.stringify(list));}

function SavedDropdown({label, icon, color, bg, items, onSelect, onDelete}){
  var s1=useState(false),open=s1[0],setOpen=s1[1];
  var s2=useState(""),q=s2[0],setQ=s2[1];
  var sorted=items.filter(function(c){return!q||c.name.toLowerCase().indexOf(q.toLowerCase())>=0;}).sort(function(a,b){return a.name.localeCompare(b.name);});
  return(
    <div style={{flex:1,position:"relative"}}>
      {open&&<div onClick={function(){setOpen(false);setQ("");}} style={{position:"fixed",inset:0,zIndex:998}}/>}
      <button onClick={function(){setOpen(!open);}} style={{width:"100%",padding:"9px 12px",borderRadius:6,border:"1px solid "+color,background:open?color:bg,color:open?"#fff":color,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",display:"flex",justifyContent:"space-between",alignItems:"center",gap:4}}>
        <span>{icon} {label} ({items.length})</span><span style={{fontSize:11}}>{open?"▲":"▼"}</span>
      </button>
      {open&&(
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,boxShadow:"0 8px 32px rgba(0,0,0,0.15)",zIndex:9999,minWidth:200}}>
          <input autoFocus value={q} onChange={function(e){setQ(e.target.value);}} placeholder={"Search "+label+"..."} style={{width:"100%",padding:"8px 12px",border:"none",borderBottom:"1px solid #e5e7eb",borderRadius:"8px 8px 0 0",fontSize:13,fontFamily:"'Inter',sans-serif",boxSizing:"border-box",outline:"none"}}/>
          <div style={{maxHeight:220,overflowY:"auto"}}>
            {sorted.length===0
              ?<div style={{padding:"12px",fontSize:13,color:"#9ca3af"}}>No {label.toLowerCase()} saved</div>
              :sorted.map(function(c){return(
                <div key={c.name} onClick={function(){onSelect(c);setOpen(false);setQ("");}} style={{padding:"10px 12px",borderBottom:"1px solid #f3f4f6",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:"#111"}}>{c.name}</div>
                    {c.address&&<div style={{fontSize:11,color:"#6b7280"}}>{c.address}</div>}
                    {c.phone&&<div style={{fontSize:11,color:"#6b7280"}}>{c.phone}</div>}
                  </div>
                  <button onClick={function(e){e.stopPropagation();onDelete(c.name);}} style={{padding:"3px 7px",borderRadius:4,border:"1px solid #fca5a5",background:"#fef2f2",color:"#dc2626",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",flexShrink:0,marginLeft:8}}>✕</button>
                </div>
              );})}
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerInfo(p){
  var user=p.currentUser||"default";
  var s1=useState(false),showForm=s1[0],setShowForm=s1[1];
  var s2=useState(""),search=s2[0],setSearch=s2[1];
  var s3=useState(false),showDrop=s3[0],setShowDrop=s3[1];
  var s4=useState(getSavedCustomers(user)),saved=s4[0],setSaved=s4[1];
  var s5=useState("Individual"),custType=s5[0],setCustType=s5[1];

  var s4=useState(getSavedCustomers(user)),saved=s4[0],setSaved=s4[1];
  var s5=useState("Individual"),custType=s5[0],setCustType=s5[1];

  var builders=saved.filter(function(c){return(c.type||"Individual")==="Builder";});
  var individuals=saved.filter(function(c){return(c.type||"Individual")==="Individual";});

  function load(c){p.setCustName(c.name||"");p.setCustAddr(c.address||"");p.setCustPhone(c.phone||"");p.setCustEmail(c.email||"");p.setJobAddr(c.jobAddress||"");setCustType(c.type||"Individual");}

  function del(name){
    if(!confirm("Remove "+name+"?"))return;
    var list=getSavedCustomers(user).filter(function(c){return c.name!==name;});
    setSavedCustomers(user,list);setSaved(list);
  }

  function save(){
    if(!p.custName.trim()){alert("Enter a customer name first.");return;}
    var entry={name:p.custName.trim(),address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr,type:custType};
    var list=getSavedCustomers(user);
    var idx=list.findIndex(function(c){return c.name.toLowerCase()===entry.name.toLowerCase();});
    if(idx>=0){if(!confirm("Update saved info for "+entry.name+"?"))return;list[idx]=entry;}else{list.push(entry);}
    setSavedCustomers(user,list);setSaved(list);
    alert(entry.name+" saved!");
  }

  var s6=useState(false),open=s6[0],setOpen=s6[1];
  return(<div style={{padding:"0 16px 12px"}}>
    <div style={{background:"rgba(255,255,255,0.65)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:12,border:"1px solid rgba(255,255,255,0.8)",boxShadow:"0 4px 24px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",marginBottom:10,overflow:"visible"}}>
      <button onClick={function(){setOpen(!open);}} style={{width:"100%",padding:"10px 14px",background:"#1e293b",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:open?"8px 8px 0 0":"8px",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
        <span style={{fontSize:12,fontWeight:800,color:"#fff",textTransform:"uppercase",letterSpacing:0.8}}>👤 Customer Info</span>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {p.custName&&<span style={{fontSize:13,fontWeight:600,color:"#93c5fd"}}>{p.custName}</span>}
          <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>{open?"▲":"▼"}</span>
        </div>
      </button>

      {open&&<>{/* Two dropdowns side by side */}
      <div style={{padding:"10px 12px",display:"flex",gap:8,borderBottom:"1px solid "+C.border}}>
        <SavedDropdown label="Builders" icon="🏗️" color="#2563eb" bg="#eff6ff" items={builders} onSelect={load} onDelete={del}/>
        <SavedDropdown label="Individuals" icon="👤" color="#7c3aed" bg="#f5f3ff" items={individuals} onSelect={load} onDelete={del}/>
      </div>

      {/* Always-visible form */}
      <div style={{padding:14}}>
        <div style={{marginBottom:10}}><Input label="Customer Name" value={p.custName} onChange={p.setCustName} type="text" placeholder="John Doe"/></div>
        <div style={{marginBottom:10}}>
          <Input label="Address" value={p.custAddr} onChange={p.setCustAddr} type="text" placeholder="123 Main St, Tulsa OK"/>
          <button onClick={function(){var addr=(p.custAddr||"").trim();if(!addr){alert("Enter an address first.");return;}window.open("https://assessor.tulsacounty.org/Property/Search?terms="+encodeURIComponent(addr),"_blank");}} style={{marginTop:6,padding:"6px 12px",borderRadius:6,border:"1px solid #2563eb",background:"#eff6ff",color:"#2563eb",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>Look Up on Tulsa County Assessor</button>
        </div>
        <Row><Col><Input label="Phone" value={p.custPhone} onChange={p.setCustPhone} type="tel" placeholder="(918) 555-0000"/></Col><Col><Input label="Email" value={p.custEmail} onChange={p.setCustEmail} type="email" placeholder="john@email.com"/></Col></Row>
        <div style={{marginTop:10}}><Input label="Job Site (if different)" value={p.jobAddr} onChange={p.setJobAddr} type="text" placeholder="456 Oak Ave"/></div>

        {/* Save controls — optional */}
        <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid "+C.border}}>
          <label style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",display:"block",marginBottom:6}}>Save to List (Optional)</label>
          <div style={{display:"flex",gap:8}}>
            {["Builder","Individual"].map(function(type){return(
              <button key={type} onClick={function(){setCustType(type);}} style={{flex:1,padding:"7px",borderRadius:6,border:"1px solid "+(custType===type?(type==="Builder"?"#2563eb":"#7c3aed"):C.border),background:custType===type?(type==="Builder"?"#eff6ff":"#f5f3ff"):"transparent",color:custType===type?(type==="Builder"?"#2563eb":"#7c3aed"):C.dim,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
                {type==="Builder"?"🏗️ Builder":"👤 Individual"}
              </button>
            );})}
            <button onClick={save} style={{flex:1,padding:"7px",borderRadius:6,border:"1px solid #16a34a",background:"#f0fdf4",color:"#16a34a",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>💾 Save</button>
            <button onClick={function(){if(confirm("Clear?")){p.setCustName("");p.setCustAddr("");p.setCustPhone("");p.setCustEmail("");p.setJobAddr("");}}} style={{padding:"7px 12px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>✕</button>
          </div>
        </div>
      </div>
      </>}
    </div>
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
  return '<div style="font-family:Arial,sans-serif;color:#1a1a1a;padding:24px;max-width:100%;margin:0;width:100%;box-sizing:border-box">'+
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

function sharePdfBlob(blob,filename){
  if(navigator.share&&navigator.canShare&&navigator.canShare({files:[new File([blob],filename,{type:"application/pdf"})]})){
    navigator.share({files:[new File([blob],filename,{type:"application/pdf"})],title:filename}).catch(function(err){
      if(err.name!=="AbortError")alert("Share failed: "+err.message);
    });
  }else{
    var url=URL.createObjectURL(blob);
    var a=document.createElement("a");a.href=url;a.download=filename;a.click();
    setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
}

function buildQuotePdf(customer,opts,salesman,outputMode,showProductInfo){
  // outputMode: "blob" -> returns Promise<Blob>, "save" -> downloads directly
  return import("jspdf").then(function(mod){
    var jsPDF=mod.jsPDF||mod.default;
    var doc=new jsPDF({unit:"pt",format:"letter"});
    var W=612,M=36,x=M,RW=W-M*2;
    var si=SALESMAN_INFO[salesman];
    var today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    var qn="IST-"+Date.now().toString(36).toUpperCase();
    var optsWithItems=opts.filter(function(o){return o.items&&o.items.length>0;});
    // Brand colors
    var NAVY=[15,30,70],BLUE=[37,99,235],LIGHTBLUE=[219,234,254],GRAY=[100,116,139],LIGHTGRAY=[248,250,252],WHITE=[255,255,255],BLACK=[15,23,42];

    // ── HEADER BAND ──
    doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);
    doc.rect(0,0,W,96,"F");
    // Accent stripe
    doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);
    doc.rect(0,92,W,4,"F");
    // Company name
    doc.setTextColor(WHITE[0],WHITE[1],WHITE[2]);
    doc.setFontSize(20);doc.setFont("helvetica","bold");
    doc.text("INSULATION SERVICES OF TULSA",M,50);
    // Tagline
    doc.setFontSize(9);doc.setFont("helvetica","normal");
    doc.setTextColor(180,200,240);
    doc.text("Serving Northeastern Oklahoma  •  1 (918) 232-9055",M,66);
    // QUOTE label top right
    doc.setTextColor(LIGHTBLUE[0],LIGHTBLUE[1],LIGHTBLUE[2]);
    doc.setFontSize(11);doc.setFont("helvetica","bold");
    doc.text("QUOTE",W-M,44,{align:"right"});
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(180,200,240);
    doc.text(qn,W-M,56,{align:"right"});
    doc.text(today,W-M,68,{align:"right"});

    var y=118;

    // ── INFO CARDS ──
    var cardH=80;var col=RW/3+4;
    // Card 1: Prepared For
    doc.setFillColor(LIGHTGRAY[0],LIGHTGRAY[1],LIGHTGRAY[2]);
    doc.roundedRect(x,y,col-8,cardH,4,4,"F");
    doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(x,y,4,cardH,"F");
    doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);doc.setFontSize(7);doc.setFont("helvetica","bold");
    doc.text("PREPARED FOR",x+12,y+13);
    doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.setFontSize(11);doc.setFont("helvetica","bold");
    doc.text(customer.name||"—",x+12,y+27,{maxWidth:col-24});
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
    var cy=y+40;
    if(customer.address){var al=doc.splitTextToSize(customer.address,col-24);doc.text(al,x+12,cy);cy+=al.length*11;}
    if(customer.phone){doc.text(customer.phone,x+12,cy);cy+=11;}
    if(customer.email){doc.text(customer.email,x+12,cy);}

    // Card 2: Job Site
    var c2x=x+col;
    doc.setFillColor(LIGHTGRAY[0],LIGHTGRAY[1],LIGHTGRAY[2]);
    doc.roundedRect(c2x,y,col-8,cardH,4,4,"F");
    doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(c2x,y,4,cardH,"F");
    doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);doc.setFontSize(7);doc.setFont("helvetica","bold");
    doc.text("JOB SITE",c2x+12,y+13);
    doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.setFontSize(10);doc.setFont("helvetica","bold");
    var jsAddr=customer.jobAddress||customer.address||"—";
    var jsal=doc.splitTextToSize(jsAddr,col-24);
    doc.text(jsal,c2x+12,y+27);
    doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
    doc.text("Valid for 30 days from quote date",c2x+12,y+66);

    // Card 3: Sales Rep
    var c3x=x+col*2;
    if(si){
      doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);
      doc.roundedRect(c3x,y,col-8,cardH,4,4,"F");
      doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(c3x,y,4,cardH,"F");
      doc.setTextColor(LIGHTBLUE[0],LIGHTBLUE[1],LIGHTBLUE[2]);doc.setFontSize(7);doc.setFont("helvetica","bold");
      doc.text("YOUR SALES REP",c3x+12,y+13);
      doc.setTextColor(WHITE[0],WHITE[1],WHITE[2]);doc.setFontSize(11);doc.setFont("helvetica","bold");
      doc.text(si.fullName,c3x+12,y+27);
      doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(180,200,240);
      doc.text(si.phone,c3x+12,y+40);
      doc.text(si.email,c3x+12,y+53);
    }

    y+=cardH+20;

    // ── OPTIONS ──
    optsWithItems.forEach(function(opt,oi){
      function itemSortKey(item){
        var mat=item.material||item.description||"";
        // 0 = spray foam (open/closed cell), 1 = batts/other fiberglass, 2 = blown, 3 = energy seal
        if(/blown/i.test(mat))return 2;
        if(/open cell|closed cell/i.test(mat))return 0;
        return 1;
      }
      var sortedItems=opt.items.slice().sort(function(a,b){
        var ak=itemSortKey(a),bk=itemSortKey(b);
        if(ak!==bk)return ak-bk;
        // Within spray foam: sort by thickness
        if(ak===0){
          var aIn=parseFloat((a.material||"").match(/^([\d.]+)/)||[0,0])||0;
          var bIn=parseFloat((b.material||"").match(/^([\d.]+)/)||[0,0])||0;
          return aIn-bIn;
        }
        // Within batts: sort by R-value
        var aR=parseInt((a.material||"").match(/R(\d+)/i)||[0,0])||0;
        var bR=parseInt((b.material||"").match(/R(\d+)/i)||[0,0])||0;
        return aR-bR;
      });

      if(optsWithItems.length>1){
        if(y>680){doc.addPage();y=40;}
        doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(x,y,RW,22,"F");
        doc.setTextColor(WHITE[0],WHITE[1],WHITE[2]);doc.setFontSize(11);doc.setFont("helvetica","bold");
        doc.text(opt.name.toUpperCase(),x+10,y+15);
        y+=30;
      }

      // Table header
      doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);doc.rect(x,y,RW,18,"F");
      doc.setTextColor(LIGHTBLUE[0],LIGHTBLUE[1],LIGHTBLUE[2]);doc.setFontSize(8);doc.setFont("helvetica","bold");
      doc.text("SCOPE OF WORK",x+10,y+12);
      y+=18;

      // Rows
      var allItems=sortedItems.slice();
      if(opt.energySeal)allItems.push({description:"Energy seal and plates per city code."});
      (opt.customItems||[]).forEach(function(ci){allItems.push({description:ci.description,customPrice:parseFloat(ci.price)||0});});
      allItems.forEach(function(item,i){
        if(y>710){doc.addPage();y=40;}
        doc.setFont("helvetica","normal");doc.setFontSize(9.5);
        var desc=doc.splitTextToSize(item.description||"",RW-26);
        var rowH=Math.max(20,desc.length*13+10);
        // Alternating bg
        doc.setFillColor(i%2===0?248:255,i%2===0?250:255,i%2===0?252:255);
        doc.rect(x,y,RW,rowH,"F");
        // Left accent dot centered vertically
        doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);
        doc.circle(x+7,y+rowH/2,2.5,"F");
        doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);
        doc.text(desc,x+16,y+13,{lineHeightFactor:1.4});
        // Bottom border
        doc.setDrawColor(226,232,240);doc.setLineWidth(0.4);doc.line(x,y+rowH,x+RW,y+rowH);
        y+=rowH;
      });

      // Total section
      var lineTotal=opt.items.reduce(function(s,i){return s+(i.total||0);},0);
      var psoCredit=((opt.pso||false)?600:0)+((opt.psoKw||false)?525:0);
      var el=opt.extraLabor?(parseFloat(opt.extraLaborAmt)||0):0;
      var tc=opt.tripCharge?(parseFloat(opt.tripChargeAmt)||0):0;
      var es=opt.energySeal?(parseFloat(opt.energySealAmt)||0):0;
      var du=opt.dumpster?(parseFloat(opt.dumpsterAmt)||0):0;
      var ciTotal=(opt.customItems||[]).reduce(function(s,x){return s+(parseFloat(x.price)||0);},0);
      var sub=lineTotal+el+tc+es+du+ciTotal;
      var total=opt.overrideTotal!==""?(parseFloat(opt.overrideTotal)||0):(sub-psoCredit);

      y+=8;
      // PSO credits
      if(opt.pso||opt.psoKw){
        doc.setFontSize(9);doc.setFont("helvetica","normal");
        doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
        doc.text("Subtotal",x,y);doc.text("$"+Math.ceil(sub).toLocaleString(),W-M,y,{align:"right"});y+=14;
        if(opt.pso){doc.setTextColor(180,30,30);doc.text("Less PSO Credit — Attic",x,y);doc.text("-$600",W-M,y,{align:"right"});y+=14;}
        if(opt.psoKw){doc.setTextColor(180,30,30);doc.text("Less PSO Credit — Kneewall",x,y);doc.text("-$525",W-M,y,{align:"right"});y+=14;}
        doc.setDrawColor(220,220,230);doc.setLineWidth(0.5);doc.line(x,y,W-M,y);
        y+=8;
      }

      // Total box
      if(y>700){doc.addPage();y=40;}
      doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);
      doc.roundedRect(W-M-160,y,160,34,4,4,"F");
      doc.setTextColor(WHITE[0],WHITE[1],WHITE[2]);doc.setFontSize(18);doc.setFont("helvetica","bold");
      doc.text("$"+Math.ceil(total).toLocaleString(),W-M-80,y+22,{align:"center"});
      y+=50;
    });

    y+=8;

    // ── PRODUCT INFO (bottom of last page) ──
    if(showProductInfo){
      var colW=(RW-16)/2;
      var leftX=M,rightX=M+colW+16;
      var py=y;

      // ── FIBERGLASS BOX ──
      var FG_TITLE="Johns Manville & CertainTeed";
      var FG_SUB="";
      var FG_INTRO="IST uses a mix of both brands based on availability. They are virtually identical in performance and quality:";
      var FG_BULLETS=["Formaldehyde-free with built-in kraft paper vapor retarder","Available in R-11 through R-49 for walls, floors, and attics","Class A fire rated — won't rot, mildew, or deteriorate","GREENGUARD Gold Certified for indoor air quality","Reduces sound transmission between rooms","Pre-cut batts for standard 16\" and 24\" framing"];
      var FG_FOOTER="Both meet the same ASTM C665 industry standards — no difference in protection regardless of which brand is installed.";

      // ── FOAM BOX ──
      var FM_TITLE="Enverge® Spray Foam Systems";
      var FM_SUB="";
      var FM_BULLETS=["OPEN CELL — EasySeal .5:  R-3.8/in · 0.5 lb/ft³ · air barrier at 3.5\" · UL Certified · ENERGY STAR® qualified","CLOSED CELL — NexSeal:  R-7.2/in (R-28 @ 4\") · 2.1 lb/ft³ · adds structural rigidity · built-in Class II vapor retarder at 1.6\"","Both: Class 1 (Class A) fire rated — Flame Spread <25, Smoke Developed <450","Both: Low VOC — CA Section 01350 compliant · Fungi resistant (ASTM C-1338)","Both: Service temp range: -40°F to 180°F (220°F intermittent)","Closed cell water absorption <0.3% by volume — moisture resistant"];

      function drawProductBox(bx,by,bw,title,sub,intro,bullets,footer){
        var lh=10;var fs=7;
        doc.setFont("helvetica","normal");doc.setFontSize(fs);
        var introLines=intro?doc.splitTextToSize(intro,bw-16).length:0;
        var bulletLines=bullets.reduce(function(n,b){return n+doc.splitTextToSize(b,bw-24).length;},0);
        var footerLines=footer?doc.splitTextToSize(footer,bw-16).length:0;
        var bh=8+10+7+4+(introLines?introLines*lh+5:0)+(bulletLines*lh+bullets.length*2)+(footerLines?footerLines*lh+8:0)+8;
        doc.setFillColor(248,250,255);doc.roundedRect(bx,by,bw,bh,4,4,"F");

        doc.setDrawColor(210,220,240);doc.setLineWidth(0.4);doc.roundedRect(bx,by,bw,bh,4,4,"S");
        var ty=by+9;
        doc.setFont("helvetica","bold");doc.setFontSize(8.5);doc.setTextColor(NAVY[0],NAVY[1],NAVY[2]);
        doc.text(title,bx+9,ty);ty+=10;
        if(sub){doc.setFont("helvetica","bold");doc.setFontSize(fs);doc.setTextColor(BLUE[0],BLUE[1],BLUE[2]);doc.text(sub,bx+9,ty);ty+=7;}
        if(intro){
          doc.setFont("helvetica","italic");doc.setFontSize(fs);doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
          var il=doc.splitTextToSize(intro,bw-16);doc.text(il,bx+9,ty);ty+=il.length*lh+5;
        }
        doc.setFont("helvetica","normal");doc.setFontSize(fs);doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);
        bullets.forEach(function(b){
          var bl=doc.splitTextToSize(b,bw-24);
          doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.circle(bx+14,ty-2,1.5,"F");
          doc.text(bl,bx+20,ty);ty+=bl.length*lh+2;
        });
        if(footer){
          ty+=3;doc.setDrawColor(210,220,240);doc.setLineWidth(0.3);doc.line(bx+9,ty,bx+bw-9,ty);ty+=6;
          doc.setFont("helvetica","italic");doc.setFontSize(6.5);doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
          var fl=doc.splitTextToSize(footer,bw-16);doc.text(fl,bx+9,ty);
        }
        return by+bh;
      }

      // Section label
      doc.setFont("helvetica","bold");doc.setFontSize(8);doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
      doc.text("PRODUCT INFORMATION",leftX,py+10);
      doc.setDrawColor(BLUE[0],BLUE[1],BLUE[2]);doc.setLineWidth(0.5);doc.line(leftX,py+13,x+RW,py+13);
      py+=20;
      drawProductBox(leftX,py,colW,FG_TITLE,FG_SUB,FG_INTRO,FG_BULLETS,FG_FOOTER);
      drawProductBox(rightX,py,colW,FM_TITLE,FM_SUB,"",FM_BULLETS,"");
    }

    // ── FOOTER ──
    doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);
    doc.rect(0,756,W,36,"F");
    doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(0,756,W,3,"F");
    doc.setTextColor(180,200,240);doc.setFontSize(8);doc.setFont("helvetica","normal");
    doc.text("Insulation Services of Tulsa  •  1 (918) 232-9055  •  Helping Oklahoma stay energy efficient — one home at a time.",W/2,771,{align:"center"});
    doc.setTextColor(100,130,180);doc.setFontSize(7);
    doc.text("Licensed & Insured  •  Proudly serving Tulsa and Northeastern Oklahoma",W/2,782,{align:"center"});

    var filename="Quote"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
    if(outputMode==="save"){doc.save(filename);return null;}
    return doc.output("blob");
  });
}

function shareQuote(customer,opts,salesman,showProductInfo){
  buildQuotePdf(customer,opts,salesman,"blob",showProductInfo).then(function(blob){
    if(blob){
      var filename="Quote"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
      sharePdfBlob(blob,filename);
    }
  }).catch(function(err){alert("PDF error: "+err.message);});
}

function buildTakeOffPdf(customer,jobNotes,measurements,salesman,quoteOpts,outputMode){
  return import("jspdf").then(function(mod){
    var jsPDF=mod.jsPDF||mod.default;
    var doc=new jsPDF({unit:"pt",format:"letter"});
    var W=612,M=36,x=M,RW=W-M*2;
    var today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
    var NAVY=[15,30,70],BLUE=[37,99,235],LIGHTBLUE=[219,234,254],GRAY=[100,116,139],WHITE=[255,255,255],BLACK=[15,23,42];

    // ── HEADER ──
    doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);doc.rect(0,0,W,64,"F");
    doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(0,60,W,4,"F");
    doc.setTextColor(WHITE[0],WHITE[1],WHITE[2]);doc.setFontSize(16);doc.setFont("helvetica","bold");
    doc.text("INSULATION SERVICES OF TULSA",M,38);
    doc.setFontSize(9);doc.setFont("helvetica","normal");doc.setTextColor(180,200,240);
    doc.text((customer.name||"")+(customer.jobAddress||customer.address?" — "+(customer.jobAddress||customer.address):""),M,54);
    doc.setTextColor(LIGHTBLUE[0],LIGHTBLUE[1],LIGHTBLUE[2]);doc.setFontSize(9);doc.setFont("helvetica","bold");
    doc.text("TAKE OFF  •  "+today,W-M,46,{align:"right"});

    var y=82;

    // ── MEASUREMENTS TABLE ──
    var hasMeasurements=measurements&&measurements.some(function(r){return parseFloat(r.sqft)>0;});
    if(hasMeasurements){
      // Columns: LOCATION | MATERIAL | SQ FT | $/SQ FT
      var c1=x+10,c2=x+180,c3=x+340,c4=x+420;
      doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);doc.rect(x,y,RW,18,"F");
      doc.setTextColor(LIGHTBLUE[0],LIGHTBLUE[1],LIGHTBLUE[2]);doc.setFontSize(8);doc.setFont("helvetica","bold");
      doc.text("LOCATION",c1,y+12);doc.text("MATERIAL",c2,y+12);doc.text("SQ FT",c3,y+12);doc.text("$/SQ FT",c4,y+12);
      y+=18;
      // Group by location+material+cavityWidth
      var groups2=[];
      measurements.forEach(function(r){
        var sqft=parseFloat(r.sqft)||0;if(!sqft)return;
        var matLabel=(r.matNote&&r.matNote.trim())||r.material||"";
        var key=(r.locationId||r.location)+"|"+matLabel+"|"+(r.cavityWidth||"");
        var g=groups2.find(function(gg){return gg.key===key;});
        if(g){g.entries.push(r);g.totalSqft+=sqft;}
        else groups2.push({key:key,location:(r.location||"")+(r.cavityWidth?" ("+r.cavityWidth+")":""),material:matLabel,pricePerUnit:r.pricePerUnit,entries:[r],totalSqft:sqft});
      });
      // Sort: foam first (no R-number), then by R-value, attics last
      var atticLocIds=["attic_area_garage","attic_area_house"];
      function takeoffR(g){var m=String(g.material||"");var n=m.match(/(\d+)/);return n?parseInt(n[1],10):0;}
      function isFoamG(g){return /foam|open cell|closed cell/i.test(g.material||"");}
      function isAtticG(g){return atticLocIds.some(function(id){return (g.entries[0]&&g.entries[0].locationId===id);});}
      groups2.sort(function(a,b){
        var aAttic=isAtticG(a),bAttic=isAtticG(b);
        if(aAttic!==bAttic) return aAttic?1:-1;
        var aFoam=isFoamG(a),bFoam=isFoamG(b);
        if(aFoam!==bFoam) return aFoam?-1:1;
        return takeoffR(a)-takeoffR(b);
      });

      groups2.forEach(function(g,gi){
        var DIM_H=14;
        // Measure how many lines the location text needs
        doc.setFont("helvetica","bold");doc.setFontSize(9.5);
        var locLines=doc.splitTextToSize(g.location,164).length;
        var ROW_H=Math.max(20,locLines*12+8);
        var groupH=ROW_H+g.entries.length*DIM_H+4;
        if(y+groupH>720){doc.addPage();y=40;}
        doc.setFillColor(gi%2===0?242:250,gi%2===0?246:252,gi%2===0?255:255);
        doc.rect(x,y,RW,groupH,"F");
        doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(x,y,3,groupH,"F");
        // Header row
        doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.setFont("helvetica","bold");doc.setFontSize(9.5);
        doc.text(g.location,c1+4,y+13,{maxWidth:164,lineHeightFactor:1.4});
        doc.text(g.material,c2,y+13,{maxWidth:154});
        doc.text(g.totalSqft.toLocaleString(),c3,y+13);
        var ppu=parseFloat(g.pricePerUnit)||0;
        if(ppu)doc.text("$"+ppu.toFixed(2),c4,y+13);
        y+=ROW_H;
        // Individual dim entries
        g.entries.forEach(function(r){
          doc.setFont("helvetica","normal");doc.setFontSize(8.5);doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);
          var dimLabel=r.dimStr||(r.wallHeightLabel)||"";
          var sqftLabel=(parseFloat(r.sqft)||0).toLocaleString()+" sf";
          doc.text(dimLabel?dimLabel+" = "+sqftLabel:sqftLabel,c1+12,y+10);
          y+=DIM_H;
        });
        doc.setDrawColor(210,220,240);doc.setLineWidth(0.5);doc.line(x,y+2,x+RW,y+2);
        y+=6;
      });
    }

    // ── JOB NOTES ──
    if(jobNotes&&jobNotes.trim()){
      y+=8;
      var noteLines=doc.splitTextToSize(jobNotes.trim(),RW-24);
      var noteBlockH=noteLines.length*13+20;
      if(y+noteBlockH>720){doc.addPage();y=40;}
      doc.setFillColor(249,249,249);doc.rect(x,y,RW,noteBlockH,"F");
      doc.setDrawColor(200,210,230);doc.setLineWidth(0.5);doc.rect(x,y,RW,noteBlockH,"S");
      doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);doc.rect(x,y,3,noteBlockH,"F");
      doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);doc.setFontSize(8);doc.setFont("helvetica","bold");
      doc.text("JOB NOTES",x+10,y+12);
      doc.setFont("helvetica","normal");doc.setFontSize(9);doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);
      doc.text(noteLines,x+10,y+24);
      y+=noteBlockH+6;
    }

    // ── PRICING BREAKDOWN (manager section) ──
    if(quoteOpts&&quoteOpts.length>0&&quoteOpts.some(function(o){return o.items&&o.items.length>0;})){
      var optsWithItems=quoteOpts.filter(function(o){return o.items&&o.items.length>0;});
      // New page for this section
      doc.addPage();y=70;
      // Section title bar
      doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);doc.rect(0,0,W,58,"F");
      doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(0,54,W,4,"F");
      doc.setTextColor(WHITE[0],WHITE[1],WHITE[2]);doc.setFontSize(13);doc.setFont("helvetica","bold");
      doc.text("PRICING BREAKDOWN",M,38);
      doc.setFontSize(8.5);doc.setFont("helvetica","normal");doc.setTextColor(180,200,240);
      doc.text("MANAGER COPY — NOT FOR CUSTOMER",W-M,38,{align:"right"});

      optsWithItems.forEach(function(opt,oi){
        if(oi>0){y+=10;}
        // Option header
        if(optsWithItems.length>1){
          if(y+20>720){doc.addPage();y=40;}
          doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(x,y,RW,18,"F");
          doc.setTextColor(WHITE[0],WHITE[1],WHITE[2]);doc.setFontSize(9);doc.setFont("helvetica","bold");
          doc.text(opt.name.toUpperCase(),x+8,y+12);
          y+=18;
        }

        // Column headers
        if(y+16>720){doc.addPage();y=40;}
        var bC1=x+8,bC2=x+180,bC3=x+310,bC4=x+375,bC5=x+445;
        doc.setFillColor(230,236,248);doc.rect(x,y,RW,16,"F");
        doc.setTextColor(NAVY[0],NAVY[1],NAVY[2]);doc.setFontSize(7.5);doc.setFont("helvetica","bold");
        doc.text("LOCATION / ITEM",bC1,y+11);
        doc.text("MATERIAL",bC2,y+11);
        doc.text("SQ FT",bC3,y+11);
        doc.text("$/SF",bC4,y+11);
        doc.text("SUBTOTAL",bC5,y+11);
        y+=16;

        // Line items
        var lineTotal=0;
        var installItems=opt.items.filter(function(i){return !i.isRemoval;});
        var removalItems=opt.items.filter(function(i){return i.isRemoval;});
        var allRows=installItems.concat(removalItems);
        allRows.forEach(function(item,ri){
          if(y+20>720){doc.addPage();y=40;}
          var isRem=item.isRemoval;
          doc.setFillColor(ri%2===0?248:255,ri%2===0?250:255,ri%2===0?255:255);
          doc.rect(x,y,RW,20,"F");
          if(isRem){doc.setFillColor(220,38,38);doc.rect(x,y,3,20,"F");}
          else{doc.setFillColor(BLUE[0],BLUE[1],BLUE[2]);doc.rect(x,y,3,20,"F");}
          doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.setFont("helvetica",isRem?"italic":"normal");doc.setFontSize(9);
          doc.text(item.location||"",bC1,y+13,{maxWidth:166});
          doc.setFont("helvetica","normal");
          doc.text(isRem?"Removal":(item.material||""),bC2,y+13,{maxWidth:124});
          if(item.sqft){doc.text((item.sqft||0).toLocaleString(),bC3,y+13);}
          var ppu3=parseFloat(item.pricePerUnit)||0;
          if(ppu3){doc.text("$"+ppu3.toFixed(2),bC4,y+13);}
          var rowTotal=Math.ceil((item.sqft||0)*ppu3);
          lineTotal+=rowTotal;
          doc.setFont("helvetica","bold");
          doc.text("$"+rowTotal.toLocaleString(),bC5,y+13);
          doc.setDrawColor(220,228,245);doc.setLineWidth(0.3);doc.line(x,y+20,x+RW,y+20);
          y+=20;
        });

        // Custom items
        (opt.customItems||[]).forEach(function(ci,cii){
          if(y+20>720){doc.addPage();y=40;}
          doc.setFillColor(cii%2===0?248:255,cii%2===0?250:255,cii%2===0?255:255);
          doc.rect(x,y,RW,20,"F");
          doc.setFillColor(GRAY[0],GRAY[1],GRAY[2]);doc.rect(x,y,3,20,"F");
          doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);doc.setFont("helvetica","normal");doc.setFontSize(9);
          doc.text(ci.description||"",bC1,y+13,{maxWidth:296});
          doc.setFont("helvetica","bold");
          var ciAmt=parseFloat(ci.price)||0;lineTotal+=ciAmt;
          doc.text("$"+Math.ceil(ciAmt).toLocaleString(),bC5,y+13);
          doc.setDrawColor(220,228,245);doc.setLineWidth(0.3);doc.line(x,y+20,x+RW,y+20);
          y+=20;
        });

        // Misc charges block
        var charges=[];
        if(opt.dumpster&&parseFloat(opt.dumpsterAmt)>0)charges.push({label:"Dumpster",amount:parseFloat(opt.dumpsterAmt)});
        if(opt.tripCharge&&parseFloat(opt.tripChargeAmt)>0)charges.push({label:"Trip Charge",amount:parseFloat(opt.tripChargeAmt)});
        if(opt.extraLabor&&parseFloat(opt.extraLaborAmt)>0)charges.push({label:"Extra Labor",amount:parseFloat(opt.extraLaborAmt)});
        if(opt.energySeal&&parseFloat(opt.energySealAmt)>0)charges.push({label:"Energy Seal",amount:parseFloat(opt.energySealAmt)});
        (opt.customItems||[]).forEach(function(ci){ var amt=parseFloat(ci.price)||0; if(amt>0) charges.push({label:ci.description||"Custom Item",amount:amt}); });
        charges.forEach(function(ch,chi){
          if(y+18>720){doc.addPage();y=40;}
          doc.setFillColor(245,245,250);doc.rect(x,y,RW,18,"F");
          doc.setFillColor(GRAY[0],GRAY[1],GRAY[2]);doc.rect(x,y,3,18,"F");
          doc.setTextColor(GRAY[0],GRAY[1],GRAY[2]);doc.setFont("helvetica","normal");doc.setFontSize(9);
          doc.text(ch.label,bC1,y+12);
          doc.setFont("helvetica","bold");doc.setTextColor(BLACK[0],BLACK[1],BLACK[2]);
          doc.text("$"+Math.ceil(ch.amount).toLocaleString(),bC5,y+12);
          lineTotal+=ch.amount;
          doc.setDrawColor(220,228,245);doc.setLineWidth(0.3);doc.line(x,y+18,x+RW,y+18);
          y+=18;
        });

        // PSO credits
        var credits=[];
        if(opt.pso)credits.push({label:"PSO Credit — Attic",amount:600});
        if(opt.psoKw)credits.push({label:"PSO Credit — Kneewall",amount:525});
        credits.forEach(function(cr){
          if(y+18>720){doc.addPage();y=40;}
          doc.setFillColor(240,253,244);doc.rect(x,y,RW,18,"F");
          doc.setFillColor(22,163,74);doc.rect(x,y,3,18,"F");
          doc.setTextColor(22,163,74);doc.setFont("helvetica","bold");doc.setFontSize(9);
          doc.text(cr.label,bC1,y+12);
          doc.text("-$"+cr.amount.toLocaleString(),bC5,y+12);
          lineTotal-=cr.amount;
          doc.setDrawColor(220,228,245);doc.setLineWidth(0.3);doc.line(x,y+18,x+RW,y+18);
          y+=18;
        });

        // Receipt-style pricing summary card
        var basePrice=opt.items.reduce(function(s,i){return s+i.total;},0);
        var totalCharges=charges.reduce(function(s,ch){return s+ch.amount;},0);
        var priceAfterCharges=basePrice+totalCharges;
        var totalCredits=credits.reduce(function(s,cr){return s+cr.amount;},0);
        var baseTotal=priceAfterCharges-totalCredits;
        var hasOverride=opt.overrideTotal!=="";
        var displayTotal=hasOverride?(parseFloat(opt.overrideTotal)||0):baseTotal;
        var overrideDelta=displayTotal-baseTotal;
        var overridePct=baseTotal!==0?(overrideDelta/baseTotal)*100:0;
        var receiptRows=[{label:"Base price",value:"$"+Math.ceil(basePrice).toLocaleString(),kind:"base"}];
        if(charges.length>0){
          receiptRows.push({label:"Adders",value:"",kind:"section"});
          charges.forEach(function(ch){receiptRows.push({label:ch.label,value:"+$"+Math.ceil(ch.amount).toLocaleString(),kind:"charge"});});
          receiptRows.push({label:"After adders",value:"$"+Math.ceil(priceAfterCharges).toLocaleString(),kind:"subtotal"});
        }
        if(credits.length>0){
          receiptRows.push({label:"Credits",value:"",kind:"section"});
          credits.forEach(function(cr){receiptRows.push({label:cr.label,value:"-$"+Math.ceil(cr.amount).toLocaleString(),kind:"credit"});});
        }
        receiptRows.push({label:"Calculated total",value:"$"+Math.ceil(baseTotal).toLocaleString(),kind:"subtotal"});
        if(hasOverride){
          receiptRows.push({label:"Salesman price",value:"$"+Math.ceil(displayTotal).toLocaleString(),kind:"override"});
          receiptRows.push({label:overrideDelta<0?"Decrease":overrideDelta>0?"Increase":"Price change",value:(overrideDelta>0?"+":"")+overridePct.toFixed(1)+"%",kind:"meta"});
        }
        var totalBoxHeight=66+receiptRows.length*14;
        if(y+totalBoxHeight+12>720){doc.addPage();y=40;}
        y+=4;
        var bx=x,bw=RW;
        doc.setFillColor(255,255,255);doc.roundedRect(bx,y,bw,totalBoxHeight,10,10,"F");
        doc.setDrawColor(214,223,235);doc.setLineWidth(0.8);doc.roundedRect(bx,y,bw,totalBoxHeight,10,10,"S");
        doc.setFillColor(248,250,252);doc.roundedRect(bx+8,y+8,bw-16,totalBoxHeight-16,8,8,"F");
        doc.setTextColor(NAVY[0],NAVY[1],NAVY[2]);doc.setFont("helvetica","bold");doc.setFontSize(9.5);
        doc.text(optsWithItems.length>1?opt.name+" Pricing":"Pricing Breakdown",bx+18,y+21);
        doc.setFontSize(20);
        doc.text("$"+Math.ceil(displayTotal).toLocaleString(),bx+bw-18,y+24,{align:"right"});
        doc.setDrawColor(226,232,240);doc.setLineWidth(0.5);doc.line(bx+18,y+32,bx+bw-18,y+32);

        var labelX=bx+18;
        var valueX=bx+bw-18;
        var cy=y+47;
        receiptRows.forEach(function(row){
          if(row.kind==="section"){
            doc.setTextColor(100,116,139);doc.setFont("helvetica","bold");doc.setFontSize(7.5);
            doc.text(row.label.toUpperCase(),labelX,cy);
            cy+=11;
            return;
          }
          var color=row.kind==="credit"?[22,163,74]:row.kind==="charge"?[15,23,42]:row.kind==="override"?NAVY:row.kind==="meta"?(overrideDelta<0?[220,38,38]:overrideDelta>0?[180,83,9]:GRAY):BLACK;
          doc.setTextColor(color[0],color[1],color[2]);doc.setFont("helvetica",row.kind==="base"||row.kind==="subtotal"||row.kind==="override"?"bold":"normal");doc.setFontSize(row.kind==="base"||row.kind==="subtotal"||row.kind==="override"?9.5:9);
          doc.text(row.label,labelX,cy);
          doc.setFont("helvetica","bold");
          doc.text(row.value,valueX,cy,{align:"right"});
          cy+=14;
        });
        y+=totalBoxHeight+8;
      });
    }

    var filename="TakeOff"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
    if(outputMode==="save"){doc.save(filename);return null;}
    return doc.output("blob");
  });
}

function shareTakeOff(customer,jobNotes,measurements,salesman,quoteOpts){
  buildTakeOffPdf(customer,jobNotes,measurements,salesman,quoteOpts,"blob").then(function(blob){
    if(blob){
      var filename="TakeOff"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
      sharePdfBlob(blob,filename);
    }
  }).catch(function(err){alert("PDF error: "+err.message);});
}

function printTakeOff(customer,jobNotes,measurements,salesman,quoteOpts){
  buildTakeOffPdf(customer,jobNotes,measurements,salesman,quoteOpts,"save").catch(function(err){alert("PDF error: "+err.message);});
}

function buildQuoteHtml(customer,opts,salesman){try{return _buildQuoteHtml(customer,opts,salesman);}catch(e){alert("Quote error: "+e.message);return "";}}
function _buildQuoteHtml(customer,opts,salesman){
  var today=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});var qn="IST-"+Date.now().toString(36).toUpperCase();
  var si=SALESMAN_INFO[salesman];
  var salesHtml=si?'<div style="flex:1;text-align:right"><div style="font-size:11px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px">Your Sales Rep</div><div style="font-size:15px;font-weight:800;color:#111;margin-bottom:3px">'+si.fullName+'</div><div style="font-size:13px;color:#111;font-weight:600;margin-bottom:1px">'+si.phone+'</div><div style="font-size:13px;color:#111;font-weight:600">'+si.email+'</div></div>':'';
  var optsWithItems=opts.filter(function(o){return o.items.length>0;});
  var optSections=optsWithItems.map(function(opt,oi){
    var sortedItems=opt.items.slice().sort(function(a,b){
      function htmlSortKey(item){
        var mat=item.material||item.description||"";
        if(/blown/i.test(mat))return 2;
        if(/open cell|closed cell/i.test(mat))return 0;
        return 1;
      }
      var ak=htmlSortKey(a),bk=htmlSortKey(b);
      if(ak!==bk)return ak-bk;
      if(ak===0){
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
    var customRows=(opt.customItems||[]).map(function(ci,ci_i){return '<tr style="border-bottom:1px solid #ddd"><td style="padding:6px 8px;font-size:13px">'+(opt.items.length+(opt.energySeal?1:0)+ci_i+1)+'</td><td style="padding:6px 8px;font-size:13px">'+ci.description+'</td></tr>';}).join("");
    var lineTotal=opt.items.reduce(function(s,i){return s+i.total;},0);
    var psoCredit=((opt.pso||false)?600:0)+((opt.psoKw||false)?525:0);
    var el=opt.extraLabor?(parseFloat(opt.extraLaborAmt)||0):0;
    var tc=opt.tripCharge?(parseFloat(opt.tripChargeAmt)||0):0;
    var es=opt.energySeal?(parseFloat(opt.energySealAmt)||0):0;
    var du=opt.dumpster?(parseFloat(opt.dumpsterAmt)||0):0;
    var ciTotal=(opt.customItems||[]).reduce(function(s,x){return s+(parseFloat(x.price)||0);},0);
    var sub=lineTotal+el+tc+es+du+ciTotal;
    var total=opt.overrideTotal!==""?(parseFloat(opt.overrideTotal)||0):(sub-psoCredit);
    var hasOverride=opt.overrideTotal!=="";
    var overrideDelta=total-(sub-psoCredit);
    var overridePct=(sub-psoCredit)!==0?(overrideDelta/(sub-psoCredit))*100:0;
    var header=optsWithItems.length>1?'<div style="font-size:16px;font-weight:800;color:#111;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #111">'+opt.name+'</div>':"";
    var totalLabel=optsWithItems.length>1?opt.name+" Total":"Total";
    var totalHtml="";
    var creditRows="";
    if(opt.psoKw)creditRows+='<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:14px;font-weight:600;color:#dc2626;border-bottom:1px solid #ddd"><span>Less PSO Credit KW</span><span>-$525</span></div>';
    if(opt.pso)creditRows+='<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:14px;font-weight:600;color:#dc2626;border-bottom:1px solid #ddd"><span>Less PSO Credit Attic</span><span>-$600</span></div>';
    if(opt.pso||opt.psoKw||hasOverride){
      totalHtml='<div style="display:flex;justify-content:flex-end;margin-bottom:'+(oi<optsWithItems.length-1?"20":"0")+'px"><div style="width:260px">'+
        '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:14px;font-weight:600;color:#333"><span>Price</span><span>$'+Math.ceil(sub).toLocaleString()+'</span></div>'+
        creditRows+
        (hasOverride?'<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;font-weight:600;color:#6b7280;border-bottom:1px solid #ddd"><span>Before Override</span><span>$'+Math.ceil(sub-psoCredit).toLocaleString()+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;font-weight:600;color:'+(overrideDelta>0?'#b45309':overrideDelta<0?'#dc2626':'#6b7280')+';border-bottom:1px solid #ddd"><span>$ Change</span><span>'+(overrideDelta>0?'+':'-')+'$'+Math.ceil(Math.abs(overrideDelta)).toLocaleString()+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px;font-weight:600;color:'+(overrideDelta>0?'#b45309':overrideDelta<0?'#dc2626':'#6b7280')+';border-bottom:1px solid #ddd"><span>% Change</span><span>'+(overrideDelta>0?'+':'')+overridePct.toFixed(1)+'%</span></div>':'' )+
        '<div style="display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:800;color:#111"><span>'+totalLabel+'</span><span>$'+Math.ceil(total).toLocaleString()+'</span></div>'+
        '</div></div>';
    }else{
      totalHtml='<div style="display:flex;justify-content:flex-end;margin-bottom:'+(oi<optsWithItems.length-1?"20":"0")+'px"><div style="width:260px"><div style="display:flex;justify-content:space-between;padding:8px 0;font-size:18px;font-weight:800;color:#111"><span>'+totalLabel+'</span><span>$'+Math.ceil(total).toLocaleString()+'</span></div></div></div>';
    }
    return header+'<table style="width:100%;border-collapse:collapse;margin-bottom:10px"><thead><tr style="background:#111"><th style="padding:7px 8px;font-size:11px;font-weight:700;text-transform:uppercase;text-align:left;color:#fff">#</th><th style="padding:7px 8px;font-size:11px;font-weight:700;text-transform:uppercase;text-align:left;color:#fff">Description</th></tr></thead><tbody>'+rows+energySealRow+customRows+'</tbody></table>'+totalHtml;
  }).join("");
  return '<div style="font-family:Arial,sans-serif;color:#1a1a1a;padding:24px;max-width:100%;margin:0;width:100%;box-sizing:border-box">'+
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px;padding-bottom:14px;border-bottom:3px solid #222"><div><h1 style="font-size:22px;font-weight:800;color:#111;margin-bottom:3px">'+COMPANY.name+'</h1><p style="font-size:12px;color:#666">'+COMPANY.tagline+'</p><p style="font-size:12px;color:#666">'+COMPANY.phone+'</p></div><div style="text-align:right"><div style="font-size:19px;font-weight:700;color:#111">QUOTE</div><div style="font-size:12px;color:#666;margin-top:3px">'+qn+'</div><div style="font-size:12px;color:#666">'+today+'</div></div></div>'+
    '<div style="display:flex;gap:20px;margin-bottom:18px"><div style="flex:1"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Prepared For</div><div style="font-size:14px;font-weight:600">'+(customer.name||"—")+'</div><div style="font-size:12px;color:#666">'+(customer.address||"")+'</div><div style="font-size:12px;color:#666">'+(customer.phone||"")+'</div><div style="font-size:12px;color:#666">'+(customer.email||"")+'</div></div><div style="flex:1"><div style="font-size:10px;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px">Project</div><div style="font-size:12px;color:#666">Job Site: '+(customer.jobAddress||customer.address||"—")+'</div><div style="font-size:12px;color:#666">Valid 30 days from quote date</div></div>'+salesHtml+'</div>'+
    optSections+
    '<div style="margin-top:14px;padding-top:12px;border-top:1px solid #ddd;font-size:11px;color:#999;text-align:center">'+COMPANY.name+' &bull; '+COMPANY.phone+'<br/>Helping Oklahoma stay energy efficient—one home at a time.</div></div>';
}

function generatePDF(customer,opts,salesman,showProductInfo){
  buildQuotePdf(customer,opts,salesman,"save",showProductInfo).catch(function(err){alert("PDF error: "+err.message);});
}

function printQuoteAndTakeOff(customer,opts,salesman,jobNotes,measurements,quoteOpts,showProductInfo){
  // Build both PDFs then merge pages into one jsPDF doc
  Promise.all([
    buildQuotePdf(customer,opts,salesman,"blob",showProductInfo),
    buildTakeOffPdf(customer,jobNotes,measurements,salesman,quoteOpts,"blob")
  ]).then(function(blobs){
    var quoteName="Quote"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
    var takeoffName="TakeOff"+(customer.jobAddress||customer.address?" - "+(customer.jobAddress||customer.address):"")+".pdf";
    var files=[];
    if(blobs[0])files.push(new File([blobs[0]],quoteName,{type:"application/pdf"}));
    if(blobs[1])files.push(new File([blobs[1]],takeoffName,{type:"application/pdf"}));
    if(navigator.canShare&&navigator.canShare({files:files})){
      navigator.share({files:files,title:"Quote & Take Off"}).catch(function(){});
    } else {
      // fallback: download both
      files.forEach(function(f){
        var url=URL.createObjectURL(f);var a=document.createElement("a");a.href=url;a.download=f.name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);document.body.removeChild(a);},1000);
      });
    }
  }).catch(function(err){alert("PDF error: "+err.message);});
}

/* ══════════ TAKE OFF ══════════ */

function newMeasureModeRow(){return{id:Date.now()+Math.random(),area:"flat_ceiling",customArea:"",material:"Blown Fiberglass",height:"",centers:"",measure:"",notes:"",sqft:"",rate:""};}
function measureModeNumber(v){var n=parseFloat(String(v||"").replace(/[^0-9.\-]/g,""));return isNaN(n)?0:n;}
function measureModeSqft(row){
  var direct=measureModeNumber(row.sqft);if(direct>0)return Math.round(direct);
  var text=String(row.measure||"").toLowerCase().replace(/×/g,"x").replace(/by/g,"x");
  if(!text.trim())return 0;
  var total=0;
  text.split(/[\n,;+]+/).forEach(function(part){
    part=String(part||"").trim();if(!part)return;
    var nums=part.match(/\d+(?:\.\d+)?/g);
    if(!nums||nums.length===0)return;
    var cavityMatch=part.match(/@\s*(16|24)\b|\b(16|24)\s*(?:\"|in|oc|c|cav|cavity)\b/);
    if(cavityMatch && part.indexOf("x")<0){
      var cavity=parseFloat(cavityMatch[1]||cavityMatch[2]);
      var linear=0;
      nums.some(function(n){var v=parseFloat(n)||0;if(v!==cavity){linear=v;return true;}return false;});
      if(!linear&&nums.length===1)linear=parseFloat(nums[0])||0;
      total+=linear*(cavity===24?2:1.25);
    }
    else if(nums.length>=2)total+=(parseFloat(nums[0])||0)*(parseFloat(nums[1])||0);
    else {
      var linearOnly=parseFloat(nums[0])||0;
      var rowCenters=parseFloat(row.centers)||0;
      var rowHeight=measureModeNumber(row.height);
      if(rowCenters===16)total+=linearOnly*(rowHeight>0?rowHeight*1.25:1.25);
      else if(rowCenters===24)total+=linearOnly*(rowHeight>0?rowHeight*2:2);
      else total+=linearOnly;
    }
  });
  return Math.round(total);
}
function MeasureMode(p){
  var isFullScreen=!!p.fullScreen;
  var s1=useState([newMeasureModeRow(),newMeasureModeRow(),newMeasureModeRow(),newMeasureModeRow()]),rows=s1[0],setRows=s1[1];
  var locationOptions=LOCATIONS.map(function(l){return{value:l.id,label:l.short||l.label};});
  var materialOptions=ALL_MATERIALS.concat(["Removal"]);
  function updateRow(id,changes){setRows(function(prev){return prev.map(function(r){return r.id===id?Object.assign({},r,changes):r;});});}
  function addRow(){setRows(function(prev){return prev.concat([newMeasureModeRow()]);});}
  function removeRow(id){setRows(function(prev){return prev.length<=1?prev:prev.filter(function(r){return r.id!==id;});});}
  function clearSavedRows(savedIds){setRows(function(prev){var left=prev.filter(function(r){return savedIds.indexOf(r.id)<0;});return left.length?left:[newMeasureModeRow()];});}
  function saveRows(){
    var savedIds=[];var items=[];
    rows.forEach(function(r){
      var sqft=measureModeSqft(r);if(sqft<=0)return;
      var loc=LOCATIONS.find(function(x){return x.id===r.area;})||LOCATIONS[0];
      var locLabel=loc.id==="custom"?(r.customArea.trim()||"Custom"):loc.label;
      var rate=measureModeNumber(r.rate);var isRemoval=r.material==="Removal";
      var matNote=isRemoval?"Removal":(r.material||"Material TBD");
      var measureLabel=(r.measure||r.sqft||"").trim();var noteLabel=(r.notes||"").trim();var dimLabel=(measureLabel+(measureLabel&&noteLabel?" — ":"")+noteLabel)||null;
      items.push({type:(matNote.indexOf("Foam")>=0?"Foam":"Fiberglass"),material:"(material TBD)",location:locLabel,locationId:loc.id,group:loc.id==="custom"?"Other":loc.group,sqft:sqft,pitch:null,pricePerUnit:rate,total:rate>0?Math.ceil(sqft*rate):0,description:locLabel+" — "+sqft.toLocaleString()+" sq ft",isRemoval:isRemoval,wallHeightLabel:null,cavityWidth:null,matNote:matNote,dimStr:dimLabel,measureNotes:noteLabel||null});
      savedIds.push(r.id);
    });
    if(!items.length){alert("Add at least one row with square footage first.");return;}
    p.setMeasurements(function(prev){return prev.concat(items.map(function(item){return Object.assign({},item,{id:Date.now()+Math.random()});}));});
    clearSavedRows(savedIds);
  }
  var totalSqft=rows.reduce(function(s,r){return s+measureModeSqft(r);},0);
  var totalPrice=rows.reduce(function(s,r){return s+(measureModeSqft(r)*measureModeNumber(r.rate));},0);
  var cell={border:"1px solid rgba(0,0,0,0.08)",background:"rgba(255,255,255,0.66)",padding:6,minWidth:0,boxSizing:"border-box"};
  var inputBase={width:"100%",border:"none",background:"transparent",outline:"none",fontFamily:"'Inter',sans-serif",fontSize:13,color:C.text,minWidth:0,boxSizing:"border-box"};
  var phoneCard=typeof window!=="undefined"&&window.innerWidth<700;
  return(<div className={isFullScreen?"ist-measure-fullscreen":""} style={isFullScreen?{position:"fixed",inset:0,zIndex:9999,background:"linear-gradient(135deg,#e8eef8 0%,#dde6f5 45%,#cdd9f0 100%)",padding:"max(12px, env(safe-area-inset-top)) 10px max(12px, env(safe-area-inset-bottom))",overflow:"auto"}:{margin:"0 16px 18px",padding:12,borderRadius:14,border:"1px solid rgba(255,255,255,0.85)",background:"rgba(255,255,255,0.62)",boxShadow:C.shadow,backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:10,flexWrap:"wrap",position:isFullScreen?"sticky":"static",top:0,zIndex:3,background:isFullScreen?"rgba(232,238,248,0.92)":"transparent",backdropFilter:isFullScreen?"blur(14px)":"none",padding:isFullScreen?"8px 2px 10px":0}}>
      <div><div style={{fontSize:12,fontWeight:800,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em"}}>Measure Mode</div><div style={{fontSize:12,color:C.textSec,marginTop:3}}>Fast phone-entry sheet. Height + centers multiply linear feet. Example: height 8, centers 16, measurement 40 = 400 sqft.</div></div>
      <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
        <div style={{fontSize:12,fontWeight:800,color:C.text,textAlign:"right"}}>{totalSqft.toLocaleString()+" sf"}{totalPrice>0&&(<div style={{color:C.accent}}>{"$"+Math.ceil(totalPrice).toLocaleString()+" est."}</div>)}</div>
        {p.onClose&&(<button onClick={p.onClose} style={{width:34,height:34,borderRadius:999,border:"1px solid rgba(15,23,42,0.12)",background:"rgba(255,255,255,0.78)",color:C.text,fontSize:18,fontWeight:900,cursor:"pointer"}}>×</button>)}
      </div>
    </div>
    {phoneCard?(<div style={{display:"grid",gap:10}}>
      {rows.map(function(r){var sqft=measureModeSqft(r);var price=sqft*measureModeNumber(r.rate);return(<div key={r.id} style={{background:"rgba(255,255,255,0.78)",border:"1px solid rgba(148,163,184,0.28)",borderRadius:14,padding:12,boxShadow:"0 8px 24px rgba(15,23,42,0.05)"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <label style={{fontSize:10,fontWeight:900,color:C.accent,textTransform:"uppercase",letterSpacing:"0.08em"}}>Area<select value={r.area} onChange={function(e){updateRow(r.id,{area:e.target.value});}} style={{...inputBase,marginTop:4,padding:"9px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8,fontWeight:800}}>{locationOptions.map(function(o){return <option key={o.value} value={o.value}>{o.label}</option>;})}</select></label>
          <label style={{fontSize:10,fontWeight:900,color:C.accent,textTransform:"uppercase",letterSpacing:"0.08em"}}>Material<select value={r.material} onChange={function(e){updateRow(r.id,{material:e.target.value});}} style={{...inputBase,marginTop:4,padding:"9px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8}}>{materialOptions.map(function(m){return <option key={m} value={m}>{m}</option>;})}</select></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"78px 88px 1fr",gap:8,alignItems:"end"}}>
          <label style={{fontSize:10,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>Height<input value={r.height} onChange={function(e){updateRow(r.id,{height:e.target.value});}} placeholder="Ht" inputMode="decimal" style={{...inputBase,marginTop:4,padding:"10px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8,fontWeight:800}}/></label>
          <label style={{fontSize:10,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>Centers<select value={r.centers} onChange={function(e){updateRow(r.id,{centers:e.target.value});}} style={{...inputBase,marginTop:4,padding:"10px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8}}><option value="">—</option><option value="16">16&quot;</option><option value="24">24&quot;</option></select></label>
          <label style={{fontSize:10,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>Measurement<input value={r.measure} onChange={function(e){updateRow(r.id,{measure:e.target.value});}} placeholder="40 or 12x10" inputMode="decimal" style={{...inputBase,marginTop:4,padding:"10px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8,fontWeight:900}}/></label>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 34px",gap:8,alignItems:"end",marginTop:8}}>
          <label style={{fontSize:10,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>Sq Ft<input value={r.sqft} onChange={function(e){updateRow(r.id,{sqft:e.target.value});}} placeholder={sqft?String(sqft):"0"} inputMode="decimal" style={{...inputBase,marginTop:4,padding:"9px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8,textAlign:"right",fontWeight:900,color:C.accent}}/></label>
          <label style={{fontSize:10,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>Rate<input value={r.rate} onChange={function(e){updateRow(r.id,{rate:e.target.value});}} placeholder="0" inputMode="decimal" style={{...inputBase,marginTop:4,padding:"9px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8,textAlign:"right"}}/></label>
          <div style={{fontSize:10,fontWeight:900,color:C.dim,textTransform:"uppercase",letterSpacing:"0.08em"}}>Price<div style={{marginTop:4,padding:"10px 8px",background:"rgba(37,99,235,0.08)",border:"1px solid rgba(37,99,235,0.16)",borderRadius:8,textAlign:"right",fontWeight:950,color:C.text}}>{price>0?"$"+Math.ceil(price).toLocaleString():"—"}</div></div>
          <button onClick={function(){removeRow(r.id);}} style={{width:34,height:34,border:"none",borderRadius:999,background:"rgba(220,38,38,0.08)",color:C.danger,fontWeight:900,fontSize:16}}>×</button>
        </div>
        {r.area==="custom"&&(<input value={r.customArea} onChange={function(e){updateRow(r.id,{customArea:e.target.value});}} placeholder="Custom area name" style={{...inputBase,marginTop:8,padding:"10px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8}}/>)}
        <input value={r.notes} onChange={function(e){updateRow(r.id,{notes:e.target.value});}} placeholder="Notes" style={{...inputBase,marginTop:8,padding:"10px 8px",background:"#fff",border:"1px solid rgba(15,23,42,0.10)",borderRadius:8,color:C.textSec}}/>
      </div>);})}
    </div>):(<div style={{overflowX:"auto",borderRadius:10,border:"1px solid rgba(0,0,0,0.08)",background:"rgba(255,255,255,0.35)"}}><div className="ist-measure-sheet" style={{display:"grid",gridTemplateColumns:"110px 136px 104px 220px 74px 70px 82px 40px",minWidth:836,borderRadius:10,overflow:"hidden"}}>
      {["Area","Material","Height / Centers","Measurement / Notes","Sq Ft","Rate","Price",""] .map(function(h){return(<div key={h} style={Object.assign({},cell,{background:"rgba(37,99,235,0.09)",fontSize:10,fontWeight:800,color:C.accent,textTransform:"uppercase",letterSpacing:"0.06em"})}>{h}</div>);})}
      {rows.map(function(r){var sqft=measureModeSqft(r);var price=sqft*measureModeNumber(r.rate);return(<React.Fragment key={r.id}>
        <div style={cell}><select value={r.area} onChange={function(e){updateRow(r.id,{area:e.target.value});}} style={Object.assign({},inputBase,{fontSize:12,fontWeight:700})}>{locationOptions.map(function(o){return <option key={o.value} value={o.value}>{o.label}</option>;})}</select>{r.area==="custom"&&(<input value={r.customArea} onChange={function(e){updateRow(r.id,{customArea:e.target.value});}} placeholder="Name" style={Object.assign({},inputBase,{marginTop:5,fontSize:12,borderTop:"1px solid rgba(0,0,0,0.08)",paddingTop:5})}/>)}</div>
        <div style={cell}><select value={r.material} onChange={function(e){updateRow(r.id,{material:e.target.value});}} style={Object.assign({},inputBase,{fontSize:12})}>{materialOptions.map(function(m){return <option key={m} value={m}>{m}</option>;})}</select></div>
        <div style={cell}>
          <input value={r.height} onChange={function(e){updateRow(r.id,{height:e.target.value});}} placeholder="Ht" inputMode="decimal" style={Object.assign({},inputBase,{fontSize:12,fontWeight:800})}/>
          <select value={r.centers} onChange={function(e){updateRow(r.id,{centers:e.target.value});}} style={Object.assign({},inputBase,{marginTop:5,fontSize:12,borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:5})}>
            <option value="">Centers</option><option value="16">16&quot;</option><option value="24">24&quot;</option>
          </select>
        </div>
        <div style={cell}><input value={r.measure} onChange={function(e){updateRow(r.id,{measure:e.target.value});}} placeholder="40 or 12x10 + 8x9" inputMode="decimal" style={Object.assign({},inputBase,{fontWeight:700})}/><input value={r.notes} onChange={function(e){updateRow(r.id,{notes:e.target.value});}} placeholder="Notes" style={Object.assign({},inputBase,{marginTop:5,fontSize:12,color:C.textSec,borderTop:"1px solid rgba(0,0,0,0.06)",paddingTop:5})}/></div>
        <div style={cell}><input value={r.sqft} onChange={function(e){updateRow(r.id,{sqft:e.target.value});}} placeholder={sqft?String(sqft):"0"} inputMode="decimal" style={Object.assign({},inputBase,{textAlign:"right",fontWeight:800,color:C.accent})}/></div>
        <div style={cell}><input value={r.rate} onChange={function(e){updateRow(r.id,{rate:e.target.value});}} placeholder="0" inputMode="decimal" style={Object.assign({},inputBase,{textAlign:"right"})}/></div>
        <div style={Object.assign({},cell,{textAlign:"right",fontWeight:800,fontSize:13,color:C.text})}>{price>0?"$"+Math.ceil(price).toLocaleString():"—"}</div>
        <div style={Object.assign({},cell,{display:"flex",alignItems:"center",justifyContent:"center"})}><button onClick={function(){removeRow(r.id);}} style={{border:"none",background:"rgba(220,38,38,0.08)",color:C.danger,borderRadius:999,width:24,height:24,cursor:"pointer",fontWeight:900}}>×</button></div>
      </React.Fragment>);})}
    </div></div>)}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:10,position:isFullScreen?"sticky":"static",bottom:0,zIndex:3,background:isFullScreen?"rgba(232,238,248,0.94)":"transparent",padding:isFullScreen?"10px 0 0":0}}><button onClick={addRow} style={{padding:"11px",borderRadius:8,border:"1px solid "+C.border,background:"rgba(255,255,255,0.55)",color:C.textSec,fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>+ Row</button><button onClick={saveRows} style={{padding:"11px",borderRadius:8,border:"1px solid rgba(37,99,235,0.3)",background:"rgba(37,99,235,0.12)",color:C.accent,fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>Save Rows to Take Off</button></div>
  </div>);
}

function TakeOff(p){
  var ls=useState(""),lid=ls[0],setLid=ls[1];
  var cs=useState(""),cl=cs[0],setCl=cs[1];
  var ms=useState(false),measureMode=ms[0],setMeasureMode=ms[1];
  function addM(item){
    p.setMeasurements(function(prev){
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
    <div style={{padding:"0 16px 12px"}}>
      <button onClick={function(){setMeasureMode(!measureMode);}} style={{width:"100%",padding:"13px 16px",borderRadius:10,border:"1px solid rgba(37,99,235,0.3)",background:measureMode?C.accent:"rgba(37,99,235,0.12)",color:measureMode?"#fff":C.accent,fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase",letterSpacing:"0.08em",boxShadow:"0 3px 16px rgba(37,99,235,0.14)"}}>{measureMode?"Close Measure Mode":"Measure Mode"}</button>
    </div>
    {measureMode&&(<MeasureMode fullScreen onClose={function(){setMeasureMode(false);}} setMeasurements={p.setMeasurements}/>)}
    {/* Row 1: Location (left) | Measurement inputs (right) */}
    <div className="ist-2col" style={{marginBottom:0}}>
      <div className="ist-col-form">
        <div style={{padding:"0 16px 12px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{"① Location"}</div>
          <LocationGrid pulse={!lid} value={lid} onChange={function(v){setLid(v);}}/>
          {lid==="custom"&&(<div style={{marginTop:8}}><Input label="Custom Location Name" value={cl} onChange={setCl} type="text" placeholder="e.g. Bonus room walls"/></div>)}
        </div>
      </div>
      <div className="ist-col-results">
        <div style={{padding:"0 16px 12px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{"② Measure & Add"}</div>
          <MeasurementForm key={"to-takeoff"} lid={lid} setLid={setLid} cl={cl} setCl={setCl} tab={"fiberglass"} onAdd={addM} hasPrice={false} hideLocation/>
        </div>
      </div>
    </div>

    {/* Row 2: Job Notes (left) | Takeoff list (right) */}
    <div className="ist-2col" style={{alignItems:"flex-start"}}>

      {/* Left: Job Notes + Print/Share */}
      <div className="ist-col-form">
        <div style={{padding:"0 16px 12px"}}>
          <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{"Job Notes"}</div>
          <textarea style={{width:"100%",padding:"10px 12px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:14,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",minHeight:80,resize:"vertical",transition:"border-color 0.15s"}} onFocus={function(e){e.target.style.borderColor=C.accent;}} onBlur={function(e){e.target.style.borderColor=C.inputBorder;}} value={p.jobNotes} onChange={function(e){p.setJobNotes(e.target.value);}} placeholder="e.g. 2-story, 4/12 pitch, no garage..."/>
        </div>
        <div style={{padding:"0 16px"}}>
          <GreenBtn onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr||p.custAddr};printTakeOff(cust,p.jobNotes,p.measurements,p.currentUser,p.quoteOpts);}}>{"Print Take Off"}</GreenBtn>
          <GreenBtn mt={8} onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr||p.custAddr};shareTakeOff(cust,p.jobNotes,p.measurements,p.currentUser,p.quoteOpts);}}>{"Share Take Off"}</GreenBtn>
          {p.measurements.length>0&&(<>
            <GreenBtn mt={8} onClick={p.onSendToQuote}>{"Send to Quote Builder"}</GreenBtn>
            <GreenBtn mt={8} onClick={p.onSendToWorkOrder}>{"Send to Work Order"}</GreenBtn>
            <button onClick={function(){if(confirm("Clear all measurements?"))p.setMeasurements([]);}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Clear All"}</button>
          </>)}
        </div>
      </div>

      {/* Right: Takeoff list */}
      <div className="ist-col-results">
        <div style={{padding:"0 16px"}}>
        {p.measurements.length>0&&(<div>
          <div style={{fontSize:12,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>{"Take Off ("+p.measurements.length+" items · "+total.toLocaleString()+" sq ft)"}</div>
          {sorted.map(function(gn){var gt=groups[gn].reduce(function(s,m){return s+m.sqft;},0);
            return(<div key={gn} style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,paddingBottom:6,borderBottom:"1px solid "+C.border}}>{gn}<span style={{color:C.accent,marginLeft:8}}>{gt.toLocaleString()+" sq ft"}</span></div>
              <div style={{background:"rgba(255,255,255,0.06)",backdropFilter:"blur(12px)",WebkitBackdropFilter:"blur(12px)",borderRadius:10,border:"1px solid rgba(255,255,255,0.1)",overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
                {groups[gn].map(function(item,idx){return(<div key={item.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",borderBottom:idx<groups[gn].length-1?"1px solid "+C.borderLight:"none"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:600,lineHeight:1.3,color:C.text}}>{item.location}</div>
                    {item.wallHeightLabel&&(<div style={{fontSize:12,color:C.accent,marginTop:2,fontWeight:500}}>{"↳ "+item.wallHeightLabel}</div>)}
                    {item.cavityWidth&&(<div style={{fontSize:12,color:C.textSec,marginTop:2,fontWeight:500}}>{"↳ "+item.cavityWidth+" cavity"}</div>)}
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
        </div>)}
        {p.measurements.length===0&&(<div style={{textAlign:"center",padding:"40px 16px",color:C.dim}}><div style={{fontSize:14}}>{"Start measuring — add locations above"}</div></div>)}
        </div>
      </div>
    </div>{/* end row 2 */}
  </div>);
}

/* ══════════ QUOTE BUILDER ══════════ */

function newOption(name){return{name:name,items:[],pso:false,psoKw:false,extraLabor:false,extraLaborAmt:"",tripCharge:false,tripChargeAmt:"",energySeal:false,energySealAmt:"",dumpster:false,dumpsterAmt:"",customItems:[],overrideTotal:""};}

function QuoteBuilderSection(p){
  var s1=useState("fiberglass"),matTab=s1[0],setMatTab=s1[1];
  var s2=useState(null),pricingId=s2[0],setPricingId=s2[1];
  var s3=useState(""),pricingPrice=s3[0],setPricingPrice=s3[1];
  var s12=useState(""),pricingMat=s12[0],setPricingMat=s12[1];
  var s13=useState(0),activeIdx=s13[0],setActiveIdx=s13[1];
  var s14=useState(false),editingName=s14[0],setEditingName=s14[1];
  var ls=useState(""),lid=ls[0],setLid=ls[1];
  var cs=useState(""),cl=cs[0],setCl=cs[1];

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
  var customItemsTotal=(opt.customItems||[]).reduce(function(s,ci){return s+(parseFloat(ci.price)||0);},0);
  var totalCharges=extraLabor+tripCharge+energySeal+dumpster+customItemsTotal;
  var priceAfterCharges=lineItemsTotal+totalCharges;
  var priceAfterRebates=priceAfterCharges-psoCredit;
  var subtotal=priceAfterRebates;
  var hasManualOverride=opt.overrideTotal!=="";
  var overrideValue=hasManualOverride?(parseFloat(opt.overrideTotal)||0):subtotal;
  var finalTotal=overrideValue;
  var overrideDelta=overrideValue-subtotal;
  var overridePct=subtotal!==0?(overrideDelta/subtotal)*100:0;
  var matSs={width:"100%",padding:"8px 10px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",marginBottom:8};

  function handlePriceImport(item){var pr=parseFloat(pricingPrice)||0;if(pr<=0||!pricingMat)return;
    var isRem=pricingMat==="Removal";
    var desc=isRem?("Remove existing insulation from "+item.location.toLowerCase()+"."):("Install "+pricingMat.toLowerCase()+" in "+item.location.toLowerCase());
    addItem(Object.assign({},item,{material:pricingMat,pricePerUnit:pr,total:Math.ceil(item.sqft*pr),description:desc}));
    p.setImportedItems(function(prev){return prev.map(function(i){return i.id===item.id?Object.assign({},i,{priced:true}):i;});});
    setPricingId(null);setPricingPrice("");setPricingMat("");}

  function addOption(){setOpts(function(prev){return prev.concat([newOption("Option "+(prev.length+1))]);});setActiveIdx(opts.length);}
  function removeOption(idx){if(opts.length<=1)return;setOpts(function(prev){return prev.filter(function(_,i){return i!==idx;});});if(activeIdx>=opts.length-1)setActiveIdx(Math.max(0,opts.length-2));}

  var qs1=useState(false),locOpen=qs1[0],setLocOpen=qs1[1];
  var cid1=useState(""),customDesc=cid1[0],setCustomDesc=cid1[1];
  var cid2=useState(""),customPrice=cid2[0],setCustomPrice=cid2[1];
  var accordionBtn=function(label,open,setOpen,badge){return(<button onClick={function(){setOpen(!open);}} style={{width:"100%",padding:"10px 14px",background:"#1e293b",display:"flex",justifyContent:"space-between",alignItems:"center",borderRadius:open?"8px 8px 0 0":"8px",border:"none",cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
    <span style={{fontSize:12,fontWeight:800,color:"#fff",textTransform:"uppercase",letterSpacing:0.8}}>{label}</span>
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      {badge&&<span style={{fontSize:13,fontWeight:600,color:"#93c5fd"}}>{badge}</span>}
      <span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>{open?"▲":"▼"}</span>
    </div>
  </button>);};

  return(<div>
    <CustomerInfo custName={p.custName} setCustName={p.setCustName} custAddr={p.custAddr} setCustAddr={p.setCustAddr} custPhone={p.custPhone} setCustPhone={p.setCustPhone} custEmail={p.custEmail} setCustEmail={p.setCustEmail} jobAddr={p.jobAddr} setJobAddr={p.setJobAddr} currentUser={p.currentUser}/>

    {/* ROW 1: Single collapsible — Location + Material & Measure side by side */}
    <div style={{padding:"0 16px 12px"}}>
      <div style={{background:"rgba(255,255,255,0.65)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderRadius:12,border:"1px solid rgba(255,255,255,0.8)",boxShadow:"0 4px 24px rgba(0,0,0,0.07)",overflow:"hidden"}}>
        {accordionBtn("📐 Add Item",locOpen,setLocOpen,lid&&LOCATIONS.find(function(l){return l.id===lid;})?(LOCATIONS.find(function(l){return l.id===lid;}).label):(lid==="custom"?cl:null))}
        {locOpen&&(<div className="ist-2col" style={{marginBottom:0}}>
          <div className="ist-col-form">
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{"① Location"}</div>
              <LocationGrid value={lid} onChange={function(v){setLid(v);}}/>
              {lid==="custom"&&(<div style={{marginTop:8}}><Input label="Custom Location Name" value={cl} onChange={setCl} type="text" placeholder="e.g. Bonus room walls"/></div>)}
            </div>
          </div>
          <div className="ist-col-results">
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{"② Material & Measure"}</div>
              <MeasurementForm key={"qb-"+activeIdx} lid={lid} setLid={setLid} cl={cl} setCl={setCl} tab={matTab} onAdd={function(item){addItem(item);setLocOpen(false);}} hasPrice={true} hideLocation/>
            </div>
          </div>
        </div>)}
      </div>
    </div>

    {/* ROW 2: Full-width quote summary */}
    <div style={{padding:"0 16px"}}>

    {/* OPTION TABS */}
    <div style={{marginBottom:12}}>
      <div className="ist-option-tabs" style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
        {opts.map(function(o,idx){return(
          <button key={idx} onClick={function(){setActiveIdx(idx);setPricingId(null);}}
            style={{padding:"8px 14px",borderRadius:6,border:activeIdx===idx?"2px solid "+C.accent:"1px solid "+C.border,background:activeIdx===idx?C.accentBg:C.card,color:activeIdx===idx?C.accent:C.dim,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>
            {o.name}{o.items.length>0?" ("+o.items.length+")":""}
          </button>
        );})}
        <button onClick={addOption} style={{padding:"8px 12px",borderRadius:6,border:"1px dashed "+C.dim,background:"transparent",color:C.dim,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"+"}</button>
        <div className="ist-option-actions" style={{display:"flex",alignItems:"center",gap:8,marginLeft:8}}>
          {editingName?(<div className="ist-option-rename" style={{display:"flex",gap:6}}>
            <input style={{padding:"6px 10px",background:C.input,border:"1px solid "+C.accent,borderRadius:6,color:C.text,fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none"}}
              type="text" value={opt.name} onChange={function(e){updateOpt({name:e.target.value});}} autoFocus
              onKeyDown={function(e){if(e.key==="Enter")setEditingName(false);}}/>
            <button onClick={function(){setEditingName(false);}} style={{padding:"6px 10px",background:C.accent,border:"none",borderRadius:6,color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"OK"}</button>
          </div>):(<div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={function(){setEditingName(true);}} style={{background:"none",border:"none",color:C.dim,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Rename"}</button>
            {opts.length>1&&(<button onClick={function(){if(confirm("Delete \""+opt.name+"\"?"))removeOption(activeIdx);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Delete"}</button>)}
          </div>)}
        </div>
      </div>
    </div>

    {/* FROM TAKE OFF */}
    {unpriced.length>0&&(<div style={{marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>{"From Take Off — Price These ("+unpriced.length+")"}</div>
      <div style={{background:C.card,borderRadius:6,border:"1px solid "+C.border,overflow:"hidden"}}>
        {unpriced.map(function(item,idx){return(<div key={item.id} style={{padding:"12px 14px",borderBottom:idx<unpriced.length-1?"1px solid "+C.border:"none"}}>
          <div className="ist-price-import-row" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>{item.isRemoval?(<span><span style={{fontSize:10,fontWeight:700,color:C.danger,background:C.dangerBg,padding:"2px 6px",borderRadius:4,marginRight:6}}>{"REMOVAL"}</span>{item.location}</span>):item.location}</div><div style={{fontSize:12,color:C.dim,marginTop:2}}>{item.sqft.toLocaleString()+" sq ft"}{item.pitch?" · "+item.pitch:""}</div></div>
            <div className="ist-price-import-actions" style={{display:"flex",alignItems:"center",gap:6,marginLeft:12}}>
              {pricingId!==item.id&&(<button onClick={function(){setPricingId(item.id);setPricingMat(item.matNote||"");setPricingPrice("");}} style={{padding:"6px 14px",background:"transparent",border:"1px solid "+C.accent,borderRadius:6,color:C.accent,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Price"}</button>)}
              <button onClick={function(){p.setImportedItems(function(prev){return prev.filter(function(i){return i.id!==item.id;});});}} style={{padding:"4px 6px",background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:600}}>{"Remove"}</button>
            </div>
          </div>
          {pricingId===item.id&&(function(){
            var PMBTNS=[
              {id:"R11",label:"R11",value:"R11 Fiberglass Batts",sub:null},
              {id:"R13",label:"R13",value:null,sub:[{id:"x15",label:"x15",value:"R13 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R13 x24 Fiberglass Batts"}]},
              {id:"R19",label:"R19",value:null,sub:[{id:"x15",label:"x15",value:"R19 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R19 x24 Fiberglass Batts"}]},
              {id:"R30",label:"R30",value:null,sub:[{id:"x15",label:"x15",value:"R30 x15 Fiberglass Batts"},{id:"x24",label:"x24",value:"R30 x24 Fiberglass Batts"}]},
              {id:"opencell",label:"Open Cell",value:null,sub:["2\"","3\"","4\"","5\"","6\""].map(function(v){return{id:v,label:v,value:v+' Open Cell Foam'};})},
              {id:"closedcell",label:"Closed Cell",value:null,sub:["1\"","2\"","3\""].map(function(v){return{id:v,label:v,value:v+' Closed Cell Foam'};})},
              {id:"blownfg",label:"Blown Fiberglass",value:null,sub:["R13","R15","R19","R22","R26","R30","R38","R44","R49","R60"].map(function(r){return{id:r,label:r,value:"Blown Fiberglass "+r};})},
              {id:"blowncel",label:"Blown Cellulose",value:null,sub:["R13","R15","R19","R22","R26","R30","R38","R44","R49","R60"].map(function(r){return{id:r,label:r,value:"Blown Cellulose "+r};})},
              {id:"removal",label:"Removal",value:"Removal",sub:null},
            ];
            var bs=function(active){return{padding:"7px 11px",borderRadius:8,border:active?"2px solid "+C.accent:"1px solid rgba(0,0,0,0.08)",background:active?"rgba(37,99,235,0.1)":"rgba(255,255,255,0.6)",color:active?C.accent:C.text,fontSize:12,fontWeight:active?700:500,cursor:"pointer",fontFamily:"'Inter',sans-serif",transition:"all 0.12s"};};
            var activePrimary=PMBTNS.find(function(b){return pricingMat&&(b.value===pricingMat||(b.sub&&b.sub.some(function(s){return s.value===pricingMat;})));});
            var activePrimaryId=activePrimary?activePrimary.id:"";
            return(<div style={{marginTop:10,padding:12,background:C.bg,borderRadius:8,border:"1px solid "+C.border}}>
              <div style={{fontSize:11,color:C.accent,fontWeight:600,marginBottom:8}}>{"Adding to: "+opt.name}</div>
              <div style={{fontSize:10,fontWeight:700,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>{"Material"}{!pricingMat&&<span style={{color:C.danger,marginLeft:4}}>{"*"}</span>}</div>
              <div className="ist-material-btns" style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
                {PMBTNS.map(function(b){
                  var active=activePrimaryId===b.id;
                  return(<button key={b.id} onClick={function(){if(b.value){setPricingMat(b.value);}else{setPricingMat("");}}} style={bs(active)}>{b.label}</button>);
                })}
              </div>
              {activePrimary&&activePrimary.sub&&(<div className="ist-material-btns" style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8,paddingLeft:8,borderLeft:"3px solid "+C.accent}}>
                {activePrimary.sub.map(function(s){
                  return(<button key={s.id} onClick={function(){setPricingMat(s.value);}} style={bs(pricingMat===s.value)}>{s.label}</button>);
                })}
              </div>)}
              {pricingMat&&<div style={{fontSize:11,color:C.accent,fontWeight:600,marginBottom:8}}>{"✓ "+pricingMat}</div>}
              <div className="ist-price-entry-row" style={{display:"flex",gap:6,alignItems:"center"}}>
                <div style={{flex:1}}><Input label="$/sf" value={pricingPrice} onChange={setPricingPrice} placeholder="0.00" step="0.01"/></div>
                <button onClick={function(){handlePriceImport(item);}} style={{padding:"8px 14px",background:C.accent,border:"none",borderRadius:6,color:"#fff",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Add"}</button>
                <button onClick={function(){setPricingId(null);setPricingPrice("");setPricingMat("");}} style={{padding:"8px 10px",background:"none",border:"1px solid "+C.dim,borderRadius:6,color:C.dim,fontSize:12,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Cancel"}</button>
              </div>
            </div>);
          })()}
        </div>);})}
      </div>

    </div>)}

    {/* ADD MANUALLY */}
    {/* LIVE PRICING SNAPSHOT */}
    {opt.items.length>0&&(<div style={{padding:"0 16px 16px"}}>
      <div style={{background:"linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",borderRadius:18,padding:"18px",border:"1px solid rgba(255,255,255,0.14)",boxShadow:"0 18px 40px rgba(15,23,42,0.22)"}}>
        <div className="ist-pricing-hero-top" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.68)",textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>{opt.name+" live pricing"}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",lineHeight:1.35}}>The number on the right is the active sell price. The cards below show exactly what feeds it.</div>
          </div>
          <div className="ist-pricing-hero-total" style={{textAlign:"right",minWidth:180}}>
            <div style={{fontSize:11,fontWeight:800,color:"rgba(255,255,255,0.68)",textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>{hasManualOverride?"Live sell price":"Calculated sell price"}</div>
            <div style={{fontSize:40,fontWeight:900,color:"#fff",letterSpacing:"-0.04em",lineHeight:1}}>{"$"+Math.round(finalTotal).toLocaleString()}</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginTop:14}}>
          <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.12)"}}>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>{"Line items"}</div>
            <div style={{fontSize:24,fontWeight:800,color:"#fff"}}>{"$"+Math.round(lineItemsTotal).toLocaleString()}</div>
          </div>
          <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.12)"}}>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>{"Adders / extras"}</div>
            <div style={{fontSize:24,fontWeight:800,color:"#fff"}}>{(totalCharges>0?"+":"")+"$"+Math.round(totalCharges).toLocaleString()}</div>
          </div>
          <div style={{padding:"12px 14px",borderRadius:14,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.12)"}}>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>{"Credits"}</div>
            <div style={{fontSize:24,fontWeight:800,color:"#fff"}}>{(psoCredit>0?"-":"")+"$"+Math.round(psoCredit).toLocaleString()}</div>
          </div>
          <div style={{padding:"12px 14px",borderRadius:14,background:hasManualOverride?"rgba(251,191,36,0.18)":"rgba(255,255,255,0.1)",border:"1px solid "+(hasManualOverride?"rgba(251,191,36,0.35)":"rgba(255,255,255,0.12)")}}>
            <div style={{fontSize:10,fontWeight:800,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:4}}>{"Manual override"}</div>
            <div style={{fontSize:24,fontWeight:800,color:"#fff"}}>{(overrideDelta>0?"+":overrideDelta<0?"-":"")+"$"+Math.round(Math.abs(overrideDelta)).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>)}
    {/* ITEMS FOR ACTIVE OPTION */}
    {opt.items.length>0&&(<div style={{padding:"0 16px 20px"}}>
      <div style={{fontSize:12,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{opt.name+" — priced line items ("+opt.items.length+")"}</div>
      <div className="ist-items-card" style={{background:C.card,borderRadius:14,padding:16,border:"1px solid "+C.border,boxShadow:C.shadow}}>
        <div className="ist-items-hdr" style={{gap:12,padding:"0 0 10px",borderBottom:"1px solid "+C.borderLight,marginBottom:6,alignItems:"end"}}>
          <div style={{fontSize:10,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.12em"}}>{"Work item"}</div>
          <div style={{fontSize:10,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.12em",textAlign:"right"}}>{"Quantity × rate"}</div>
          <div style={{fontSize:10,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.12em",textAlign:"right"}}>{"Line total"}</div>
          <div></div>
        </div>
        {opt.items.map(function(item,idx){var itemRate=parseFloat(item.pricePerUnit)||0;var itemTotal=Math.round(item.total||0);return(<div key={item.id} className="ist-items-row" style={{gap:12,alignItems:"center",padding:"14px 0",borderBottom:idx<opt.items.length-1?"1px solid "+C.border:"none"}}>
          <div className="ic-desc" style={{minWidth:0}}>
            <div className="ic-desc-title" style={{fontSize:14,fontWeight:700,lineHeight:1.35,color:C.text}}>{item.location||item.description}</div>
            <div className="ic-desc-sub" style={{fontSize:12,color:C.textSec,marginTop:3,lineHeight:1.4}}>{item.material||"Material not set"}{item.pitch?" · "+item.pitch:""}{item.description&&item.location&&item.description!==item.location?" · "+item.description:""}</div>
          </div>
          <div className="ic-qty" style={{textAlign:"right"}}>
            <div className="ic-qty-main" style={{fontSize:14,fontWeight:700,color:C.text}}>{item.sqft.toLocaleString()+" sf × $"+itemRate.toFixed(2)+"/sf"}</div>
            <div className="ic-qty-sub" style={{fontSize:11,color:C.dim,marginTop:3}}>{"Qty/rate"}</div>
          </div>
          <div className="ic-tot" style={{textAlign:"right"}}>
            <div className="ic-total-main" style={{fontSize:18,fontWeight:900,color:C.text,letterSpacing:"-0.02em"}}>{"$"+itemTotal.toLocaleString()}</div>
            <div className="ic-total-sub" style={{fontSize:11,color:C.dim,marginTop:3}}>{"This line"}</div>
          </div>
          <div className="ic-rm" style={{marginLeft:"auto"}}><button title="Remove" aria-label="Remove line item" onClick={function(){removeItem(item.id);}} style={{background:"none",border:"none",color:C.danger,fontSize:11,cursor:"pointer",fontFamily:"'Inter',sans-serif",fontWeight:700,textTransform:"uppercase"}}><span className="ic-rm-label">{"Remove"}</span><span aria-hidden="true" style={{fontSize:14,lineHeight:1}}>×</span></button></div>
        </div>);})}

        {/* ADJUSTMENTS */}
        <div style={{paddingTop:12,marginTop:8,borderTop:"1px solid "+C.borderLight}}>
          <label className="ist-adjust-row" style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.pso} onChange={function(e){updateOpt({pso:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"PSO Credit Attic"}</span>
            {opt.pso&&(<span style={{fontSize:13,fontWeight:700,color:C.danger,marginLeft:"auto"}}>{"-$600"}</span>)}
          </label>
          <label className="ist-adjust-row" style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
            <input type="checkbox" checked={opt.psoKw||false} onChange={function(e){updateOpt({psoKw:e.target.checked,overrideTotal:""});}}
              style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"PSO Credit KW"}</span>
            {opt.psoKw&&(<span style={{fontSize:13,fontWeight:700,color:C.danger,marginLeft:"auto"}}>{"-$525"}</span>)}
          </label>
          <label className="ist-adjust-row" style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
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
          <label className="ist-adjust-row" style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
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
          <label className="ist-adjust-row" style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",cursor:"pointer"}}>
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
          <label className="ist-adjust-row" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:"1px solid "+C.borderLight,cursor:"pointer"}}>
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
          {/* Custom Line Items */}
          <div style={{borderTop:"1px solid "+C.borderLight,paddingTop:10,marginTop:2}}>
            <div style={{fontSize:11,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{"+ Custom Line Items"}</div>
            {(opt.customItems||[]).map(function(ci){return(
              <div key={ci.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,padding:"8px 10px",background:C.accentBg,borderRadius:6,border:"1px solid "+C.borderLight}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:C.text,fontWeight:500}}>{ci.description}</div>
                  <div style={{fontSize:12,color:C.accent,fontWeight:700,marginTop:2}}>{"$"+(parseFloat(ci.price)||0).toLocaleString()}</div>
                </div>
                <button onClick={function(){updateOpt({customItems:(opt.customItems||[]).filter(function(x){return x.id!==ci.id;}),overrideTotal:""});}} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"✕"}</button>
              </div>
            );})}
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <input type="text" value={customDesc} onChange={function(e){setCustomDesc(e.target.value);}} placeholder="e.g. Treat top of sheetrock with Sterifab"
                onKeyDown={function(e){if(e.key==="Enter"&&customPrice){var d=customDesc.trim();var pr=parseFloat(customPrice)||0;if(d&&pr>0){updateOpt({customItems:(opt.customItems||[]).concat([{id:Date.now()+Math.random(),description:d,price:pr}]),overrideTotal:""});setCustomDesc("");setCustomPrice("");}}} }
                style={{width:"100%",padding:"8px 10px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none",boxSizing:"border-box"}}/>
              <div className="ist-custom-price-row" style={{display:"flex",gap:6}}>
                <div style={{display:"flex",alignItems:"center",gap:4,flex:1}}>
                  <span style={{fontSize:13,color:C.text,fontWeight:600}}>{"$"}</span>
                  <input type="number" value={customPrice} onChange={function(e){setCustomPrice(e.target.value);}} placeholder="Price"
                    style={{flex:1,padding:"8px 10px",background:C.input,border:"1px solid "+C.inputBorder,borderRadius:6,color:C.text,fontSize:13,fontFamily:"'Inter',sans-serif",outline:"none"}}/>
                </div>
                <button onClick={function(){var d=customDesc.trim();var pr=parseFloat(customPrice)||0;if(!d||pr<=0)return;updateOpt({customItems:(opt.customItems||[]).concat([{id:Date.now()+Math.random(),description:d,price:pr}]),overrideTotal:""});setCustomDesc("");setCustomPrice("");}}
                  style={{padding:"8px 16px",background:C.accent,border:"none",borderRadius:6,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif"}}>{"Add"}</button>
              </div>
            </div>
          </div>

          <label className="ist-adjust-row" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderTop:"1px solid "+C.borderLight,cursor:"pointer"}}>
            <input type="checkbox" checked={p.showProductInfo||false} onChange={function(e){p.setShowProductInfo(e.target.checked);}} style={{width:18,height:18,accentColor:C.accent,cursor:"pointer"}}/>
            <span style={{fontSize:13,fontWeight:600,color:C.text}}>{"Product Information"}</span>
            <span style={{fontSize:11,color:C.dim,marginLeft:2}}>{"(adds spec sheet to PDF)"}</span>
          </label>
        </div>

        {/* TOTAL */}
        <div style={{paddingTop:12,marginTop:4,borderTop:"1px solid "+C.borderLight}}>
          <div style={{background:"rgba(255,255,255,0.88)",border:"1px solid "+C.border,borderRadius:18,padding:0,overflow:"hidden",boxShadow:"0 14px 34px rgba(15,23,42,0.09)"}}>
            <div className="ist-price-split" style={{gap:0}}>
              <div className="ist-price-split-left" style={{padding:"18px 18px 16px",borderRight:"1px solid "+C.borderLight}}>
                <div style={{fontSize:11,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>{opt.name+" pricing math"}</div>
                <div className="ist-price-split-title-copy" style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>Each row keeps the label on the left and its dollar impact on the right.</div>

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderTop:"1px solid "+C.borderLight,borderBottom:"1px solid "+C.borderLight}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:C.text}}>{"Line item total"}</div>
                    <div style={{fontSize:12,color:C.textSec}}>{opt.items.length+" priced item"+(opt.items.length!==1?"s":"")}</div>
                  </div>
                  <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:"-0.02em"}}>{"$"+Math.round(lineItemsTotal).toLocaleString()}</div>
                </div>

                {totalCharges > 0 && <div style={{padding:"14px 0 2px",borderBottom:"1px solid "+C.borderLight}}>
                  <div style={{fontSize:11,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>{"Adders and extras"}</div>
                  {extraLabor > 0 && <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:14,color:C.text,marginBottom:8}}><span>Extra labor</span><strong>{"+$"+Math.round(extraLabor).toLocaleString()}</strong></div>}
                  {tripCharge > 0 && <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:14,color:C.text,marginBottom:8}}><span>Trip charge</span><strong>{"+$"+Math.round(tripCharge).toLocaleString()}</strong></div>}
                  {energySeal > 0 && <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:14,color:C.text,marginBottom:8}}><span>Energy seal & plates</span><strong>{"+$"+Math.round(energySeal).toLocaleString()}</strong></div>}
                  {dumpster > 0 && <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:14,color:C.text,marginBottom:8}}><span>Dumpster</span><strong>{"+$"+Math.round(dumpster).toLocaleString()}</strong></div>}
                  {(opt.customItems||[]).map(function(ci){return <div key={ci.id} style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:14,color:C.text,marginBottom:8}}><span>{ci.description}</span><strong>{"+$"+Math.round(parseFloat(ci.price)||0).toLocaleString()}</strong></div>;})}
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:800,color:C.text,paddingTop:10,marginTop:2,borderTop:"1px dashed "+C.border}}><span>Subtotal after adders</span><span>{"$"+Math.round(priceAfterCharges).toLocaleString()}</span></div>
                </div>}

                {psoCredit > 0 && <div style={{padding:"14px 0 2px",borderBottom:"1px solid "+C.borderLight}}>
                  <div style={{fontSize:11,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:8}}>{"Credits and rebates"}</div>
                  {opt.pso && <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:14,color:C.green,marginBottom:8}}><span>PSO attic</span><strong>{"-$600"}</strong></div>}
                  {opt.psoKw && <div style={{display:"flex",justifyContent:"space-between",gap:12,fontSize:14,color:C.green,marginBottom:8}}><span>PSO kneewall</span><strong>{"-$525"}</strong></div>}
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:14,fontWeight:800,color:C.text,paddingTop:10,marginTop:2,borderTop:"1px dashed "+C.border}}><span>Calculated total</span><span>{"$"+Math.round(subtotal).toLocaleString()}</span></div>
                </div>}

                {psoCredit===0 && totalCharges===0 && <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0 2px",borderBottom:"1px solid "+C.borderLight}}><span style={{fontSize:14,fontWeight:800,color:C.text}}>{"Calculated total"}</span><span style={{fontSize:18,fontWeight:900,color:C.text}}>{"$"+Math.round(subtotal).toLocaleString()}</span></div>}
              </div>

              <div className="ist-price-split-right" style={{padding:"18px",background:"linear-gradient(180deg, rgba(239,246,255,0.82) 0%, rgba(255,255,255,0.96) 100%)"}}>
                <div style={{fontSize:11,fontWeight:800,color:C.accent,textTransform:"uppercase",letterSpacing:"0.14em",marginBottom:6}}>{"Live sell price control"}</div>
                <div style={{fontSize:13,color:C.textSec,marginBottom:14}}>Change the live price here. The calculated number stays visible right below it for comparison.</div>

                <div style={{padding:"14px",background:"#fff",border:"1px solid rgba(37,99,235,0.16)",borderRadius:16,boxShadow:"0 8px 20px rgba(37,99,235,0.08)"}}>
                  <div style={{fontSize:11,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:6}}>{hasManualOverride?"Live sell price":"Sell price"}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18,fontWeight:900,color:C.text}}>{"$"}</span>
                    <input className="ist-live-price-input" type="number" value={hasManualOverride?opt.overrideTotal:subtotal.toFixed(0)} onChange={function(e){updateOpt({overrideTotal:e.target.value === "" ? " " : e.target.value});}} onBlur={function(){if(opt.overrideTotal === " ") updateOpt({overrideTotal:""});}}
                      style={{flex:1,minWidth:0,width:"100%",padding:"12px 14px",background:"#fff",border:"1px solid rgba(37,99,235,0.22)",borderRadius:12,color:C.text,fontSize:26,fontWeight:900,fontFamily:"'Inter',sans-serif",outline:"none",textAlign:"right",boxShadow:"inset 0 1px 0 rgba(255,255,255,0.8)"}} step="1"/>
                  </div>
                </div>

                <div style={{display:"grid",gap:10,marginTop:14}}>
                  <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.75)",border:"1px solid "+C.borderLight,borderRadius:14}}>
                    <div className="ist-price-value-row" style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>{"Calculated total"}</span>
                      <span className="ist-price-main-value" style={{fontSize:22,fontWeight:900,color:C.text}}>{"$"+Math.round(subtotal).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.92)",border:"1px solid rgba(37,99,235,0.16)",borderRadius:14}}>
                    <div className="ist-price-value-row" style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.accent,textTransform:"uppercase",letterSpacing:"0.1em"}}>{"Live total"}</span>
                      <span className="ist-price-main-value" style={{fontSize:24,fontWeight:900,color:C.accent}}>{"$"+Math.round(finalTotal).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{padding:"12px 14px",background:"rgba(255,255,255,0.75)",border:"1px solid "+C.borderLight,borderRadius:14}}>
                    <div className="ist-price-value-row" style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:12}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.dim,textTransform:"uppercase",letterSpacing:"0.1em"}}>{"Override difference"}</span>
                      <span className="ist-price-main-value" style={{fontSize:20,fontWeight:900,color:overrideDelta>0?"#b45309":overrideDelta<0?C.danger:C.text}}>{(overrideDelta>0?"+":overrideDelta<0?"-":"")+"$"+Math.round(Math.abs(overrideDelta)).toLocaleString()}</span>
                    </div>
                    <div className="ist-override-percent" style={{fontSize:12,fontWeight:700,color:overrideDelta>0?"#b45309":overrideDelta<0?C.danger:C.text,marginTop:4,textAlign:"right"}}>{subtotal===0?"0.0%":(overrideDelta>0?"+":"")+overridePct.toFixed(1)+"% vs calculated"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={function(){if(confirm("Clear items from "+opt.name+"?"))updateOpt({items:[]});}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:6,border:"1px solid "+C.danger,background:"transparent",color:C.danger,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase"}}>{"Clear "+opt.name}</button>
    </div>)}

    {/* PRINT/SHARE */}
    {opts.some(function(o){return o.items.length>0;})&&(<div className="ist-print-actions" style={{marginBottom:16}}>
      <GreenBtn onClick={function(){generatePDF({name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr},opts,p.currentUser,p.showProductInfo||false);}}>{"Print Quote"}</GreenBtn>
      <GreenBtn mt={8} onClick={function(){shareQuote({name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr},opts,p.currentUser,p.showProductInfo||false);}}>{"Share Quote"}</GreenBtn>
      <GreenBtn mt={8} onClick={function(){var cust={name:p.custName,address:p.custAddr,phone:p.custPhone,email:p.custEmail,jobAddress:p.jobAddr};printQuoteAndTakeOff(cust,opts,p.currentUser,p.jobNotes,p.measurements,opts,p.showProductInfo||false);}}>{"Print Quote and Take Off"}</GreenBtn>
    </div>)}

    {opt.items.length===0&&unpriced.length===0&&(<div style={{textAlign:"center",padding:"40px 16px",color:C.dim}}><div style={{fontSize:14}}>{"Use Take Off to measure first, or add items manually"}</div></div>)}
    </div>{/* end bottom section */}
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
    if (!name) { setStatus("⚠️ Enter a job name first."); return; }
    setStatus("Saving...");
    var jobData = {
      custName: p.custName, custAddr: p.custAddr, custPhone: p.custPhone, custEmail: p.custEmail, jobAddr: p.jobAddr, jobNotes: p.jobNotes,
      measurements: p.measurements, quoteOpts: p.quoteOpts, importedItems: p.importedItems, section: p.section,
    };
    saveJob(name, p.currentUser, jobData).then(function(ok) {
      if (ok) {
        setStatus("✓ Saved: " + name);
        setSaveName("");
        setShowSave(false);
        refreshJobs();
        setTimeout(function() { setStatus(""); }, 3000);
      } else {
        setStatus("❌ Save failed — check your connection and try again.");
        setTimeout(function() { setStatus(""); }, 4000);
      }
    }).catch(function(e) {
      setStatus("❌ Error: " + (e.message || "Unknown error"));
      setTimeout(function() { setStatus(""); }, 4000);
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

  var hasWork = p.measurements.length > 0 || p.quoteOpts.some(function(o){return o.items.length>0;}) || (p.custName && p.custName.trim().length > 0) || (p.importedItems && p.importedItems.length > 0);

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

/* ══════════ WORK ORDER ══════════ */
function WorkOrderSection({measurements, quoteOpts, custName, custAddr, currentUser}) {
  var today = new Date().toISOString().slice(0,10);

  // WO number
  var initWoNum = (function() {
    try { var n = parseInt(localStorage.getItem("ist-wo-counter") || "0"); return n > 0 ? n : 1; } catch(e) { return 1; }
  })();

  var [woNum, setWoNum] = React.useState(String(initWoNum));
  var [dateReady, setDateReady] = React.useState(today);
  var [dateFinished, setDateFinished] = React.useState("");
  var [doorCode, setDoorCode] = React.useState("");
  var [builder, setBuilder] = React.useState(custName || "");
  var [address, setAddress] = React.useState(custAddr || "");
  var [addition, setAddition] = React.useState("");
  var [salesman, setSalesman] = React.useState(currentUser || "");
  var [notes, setNotes] = React.useState("");

  // Sync builder/address/salesman if props change
  React.useEffect(function() { setBuilder(custName || ""); }, [custName]);
  React.useEffect(function() { setAddress(custAddr || ""); }, [custAddr]);
  React.useEffect(function() { setSalesman(currentUser || ""); }, [currentUser]);

  // Mat type mapping
  function matTypeLabel(m) {
    var id = m.locationId || "";
    var map = {
      "band_joist":       "BJ",
      "ext_kneewall":     "BOXED KW",
      "ext_slopes":       "BOXED SLOPES",
      "ext_walls_garage": "GARAGE EXTERIOR",
      "ext_walls_house":  "HOUSE EXTERIOR",
      "flat_ceiling":     "FLAT CEILING",
      "gable_end":        "GABLE",
      "garage_common":    "COMMON WALL",
      "attic_area_garage":"GARAGE ATTIC",
      "attic_area_house": "HOUSE ATTIC",
      "attic_kneewall":   "ATTIC KW",
      "attic_slopes":     "OPEN SLOPES",
      "open_attic_walls": "OPEN ATTIC WALLS",
      "porch":            "PORCH",
      "porch_blocking":   "PORCH BLOCK",
      "roofline":         "RL",
      "roofline_garage":  "GARAGE RL",
      "roofline_house":   "HOUSE RL",
      "custom":           m.customLocation || m.location || "CUSTOM",
    };
    return map[id] || (m.location || m.locationId || "OTHER").toUpperCase();
  }

  // Build initial mat rows from measurements
  var wallIds = ["ext_walls_house","ext_walls_garage","garage_common","ext_kneewall","open_attic_walls","attic_kneewall"];

  // Build a map of locationId → R-value (or inches for foam) from quote items
  function buildRValueMap() {
    var map = {};
    var allItems = (quoteOpts || []).flatMap(function(o) { return o.items || []; });
    allItems.forEach(function(item) {
      if (!item.locationId || map[item.locationId]) return;
      var mat = item.material || item.description || "";
      // Foam: extract inches e.g. '3" Open Cell Foam' → '3"'
      var foamMatch = mat.match(/^(\d+\.?\d*)"?\s*(Open Cell|Closed Cell)/i);
      if (foamMatch) {
        map[item.locationId] = foamMatch[1] + '"';
        return;
      }
      // Fiberglass: extract R-value e.g. "R-13"
      var rMatch = mat.match(/R-?(\d+)/i);
      if (rMatch) map[item.locationId] = "R-" + rMatch[1];
    });
    return map;
  }

  function shortRValue(mat) {
    if (!mat) return "";
    // "R13 x15 Fiberglass Batts" → "13x15"
    var batt = mat.match(/R(\d+)\s*x(\d+)/i);
    if (batt) return batt[1]+"x"+batt[2];
    // "R11 Fiberglass Batts" → "11"
    var simple = mat.match(/^R(\d+)\s+Fiberglass/i);
    if (simple) return simple[1];
    // '4" Open Cell Foam' → '4" OC'
    var oc = mat.match(/^([\d.]+)"\s*Open Cell/i);
    if (oc) return oc[1]+'" OC';
    // '3" Closed Cell Foam' → '3" CC'
    var cc = mat.match(/^([\d.]+)"\s*Closed Cell/i);
    if (cc) return cc[1]+'" CC';
    // bare "Open Cell Foam" / "Closed Cell Foam"
    if (/open cell/i.test(mat)) return "Open Cell";
    if (/closed cell/i.test(mat)) return "Closed Cell";
    // "Blown Fiberglass R30" → "BF R30"
    var bfg = mat.match(/Blown Fiberglass\s*R?(\d+)/i);
    if (bfg) return "BF R"+bfg[1];
    // "Blown Cellulose R30" → "BC R30"
    var bcel = mat.match(/Blown Cellulose\s*R?(\d+)/i);
    if (bcel) return "BC R"+bcel[1];
    return mat;
  }

  function buildMatRows(meas) {
    var rMap = buildRValueMap();
    var rows = (meas || []).map(function(m, i) {
      var isWall = wallIds.includes(m.locationId || "");
      var ht = "";
      if (isWall && m.wallHeightLabel) {
        var match = m.wallHeightLabel.match(/(\d+)['']/);
        ht = match ? match[1] : m.wallHeightLabel.match(/(\d+)/)?.[1] || "";
      }
      var rawMat = (m.matNote && m.matNote.trim()) ? m.matNote.trim() : (rMap[m.locationId] || m.rValue || "");
      var rValue = shortRValue(rawMat) || rawMat;
      return {
        id: "mr-" + i,
        locationId: m.locationId || "",
        matType: matTypeLabel(m),
        wallHeight: ht,
        rValue: rValue,
        width: m.width || "",
        sqft: m.sqft ? String(Math.round(m.sqft)) : "",
        matOut: "",
        matIn: "",
        count: "",
      };
    });
    var atticList=["attic_area_garage","attic_area_house"];
    function getR(s){var m=String(s||"").match(/(\d+)/);return m?parseInt(m[1],10):0;}
    function getR2(s){var m=String(s||"").match(/\d+x(\d+)/);return m?parseInt(m[1],10):0;}
    var sorted=rows.slice().sort(function(a,b){
      var aAttic=atticList.includes(a.locationId||"");
      var bAttic=atticList.includes(b.locationId||"");
      if(aAttic!==bAttic) return aAttic?1:-1;
      var aR=getR(a.rValue),bR=getR(b.rValue);
      if(aR!==bR) return aR-bR;
      return getR2(a.rValue)-getR2(b.rValue);
    });
    return sorted;
  }

  var [matRows, setMatRows] = React.useState(function() { return buildMatRows(measurements); });

  React.useEffect(function() {
    setMatRows(buildMatRows(measurements));
  }, [measurements]);

  // Employees
  var emptyEmp = function() { return {name:"",sqft:"",labor:""}; };
  var [employees, setEmployees] = React.useState([emptyEmp(),emptyEmp(),emptyEmp(),emptyEmp(),emptyEmp()]);

  // R-value summary costs
  // Derive R-value categories from matNote on measurements
  var rCats = (function() {
    var seen = {}, order = [];
    (measurements || []).forEach(function(m) {
      var mat = (m.matNote || "").trim();
      if (!mat) return;
      var label = shortRValue(mat) || mat;
      if (!seen[label]) { seen[label] = true; order.push(label); }
    });
    if (order.length === 0) return ["R-11","R-13","R-19","R-30","BW","E/S"];
    return order.slice().sort(function(a,b){
      var aR=parseInt((a).match(/(\d+)/)||[0,0])||0;
      var bR=parseInt((b).match(/(\d+)/)||[0,0])||0;
      return aR-bR;
    });
  })();

  var [rCosts, setRCosts] = React.useState({});

  // Sum sqft per matNote from measurements
  function getRFootage(cat) {
    return (measurements || []).reduce(function(sum, m) {
      var label = shortRValue((m.matNote||"").trim()) || (m.matNote||"").trim();
      if (label === cat) return sum + (parseFloat(m.sqft) || 0);
      return sum;
    }, 0);
  }

  var atticIds=["attic_area_garage","attic_area_house"];
  function sortedMatRows(rows){
    return rows.slice().sort(function(a,b){
      var aAttic=atticIds.includes(a.locationId||"");
      var bAttic=atticIds.includes(b.locationId||"");
      if(aAttic!==bAttic) return aAttic?1:-1;
      // Extract first number from short value e.g. "13x15" → 13, "Open Cell" → 0
      var aR=parseInt((a.rValue||"").match(/(\d+)/)||[0,0])||0;
      var bR=parseInt((b.rValue||"").match(/(\d+)/)||[0,0])||0;
      if(aR!==bR) return aR-bR;
      // Secondary sort by second number e.g. 13x15 vs 13x24
      var aR2=parseInt(((a.rValue||"").match(/\d+x(\d+)/)||[0,0])[1])||0;
      var bR2=parseInt(((b.rValue||"").match(/\d+x(\d+)/)||[0,0])[1])||0;
      return aR2-bR2;
    });
  }

  function totalLabor() {
    return employees.reduce(function(s,e){ return s+(parseFloat(e.labor)||0); }, 0);
  }

  function updateMatRow(id, field, val) {
    setMatRows(function(rows) { return rows.map(function(r){ return r.id===id ? Object.assign({},r,{[field]:val}) : r; }); });
  }
  function addMatRow() {
    setMatRows(function(rows) { return rows.concat([{id:"mr-new-"+Date.now(),matType:"",rValue:"",width:"",sqft:"",matOut:"",matIn:"",count:""}]); });
  }
  function deleteMatRow(id) {
    setMatRows(function(rows) { return rows.filter(function(r){ return r.id!==id; }); });
  }
  function updateEmp(i, field, val) {
    setEmployees(function(emps) { return emps.map(function(e,idx){ return idx===i ? Object.assign({},e,{[field]:val}) : e; }); });
  }

  var iStyle = {fontFamily:"'Inter',sans-serif",fontSize:12,padding:"4px 6px",border:"1px solid "+C.inputBorder,borderRadius:4,background:C.input,color:C.text,width:"100%",boxSizing:"border-box"};
  var thStyle = {padding:"6px 8px",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",color:C.textSec,textAlign:"left",borderBottom:"2px solid "+C.border,whiteSpace:"nowrap"};
  var tdStyle = {padding:"4px 6px",fontSize:12,verticalAlign:"middle"};

  function handlePrint() {
    var rSummaryRows = rCats.map(function(cat) {
      var ft = getRFootage(cat);
      return '<tr><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;">'+cat+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+(ft?ft.toLocaleString():"")+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+(rCosts[cat]?"$"+rCosts[cat]:"")+'</td></tr>';
    }).join("");

    var matRowsHtml = sortedMatRows(matRows).map(function(r) {
      return '<tr><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;">'+r.matType+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;">'+r.rValue+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;color:'+(r.wallHeight?"#2563eb":"#999")+';">'+(r.wallHeight||r.width||"—")+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+r.sqft+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+r.matOut+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+r.matIn+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+r.count+'</td></tr>';
    }).join("");

    var empRowsHtml = employees.map(function(e) {
      return '<tr><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;">'+e.name+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+e.sqft+'</td><td style="padding:4px 8px;border:1px solid #ccc;font-size:12px;text-align:right;">'+(e.labor?"$"+e.labor:"")+'</td></tr>';
    }).join("");

    var TH = 'padding:4px 8px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#dbeafe;text-align:left;background:#0f1e46;border:none;';
    var TD = 'padding:3px 8px;font-size:11px;border-bottom:1px solid #e2e8f0;color:#0f172a;vertical-align:middle;';
    var TD2 = 'padding:3px 8px;font-size:11px;border-bottom:1px solid #e2e8f0;color:#0f172a;text-align:right;vertical-align:middle;';
    var matRowsHtmlThemed = sortedMatRows(matRows).map(function(r,i){
      var bg = i%2===0?'#f8fafc':'#fff';
      return '<tr style="background:'+bg+'"><td style="'+TD+'">'+r.matType+'</td><td style="'+TD+'">'+r.rValue+'</td><td style="'+TD+';color:'+(r.wallHeight?'#2563eb':'#94a3b8')+';">'+(r.wallHeight||r.width||'—')+'</td><td style="'+TD2+'">'+r.sqft+'</td><td style="'+TD2+'">'+r.matOut+'</td><td style="'+TD2+'">'+r.matIn+'</td><td style="'+TD2+'">'+r.count+'</td></tr>';
    }).join('');
    var empRowsHtmlThemed = employees.map(function(e,i){
      var bg = i%2===0?'#f8fafc':'#fff';
      return '<tr style="background:'+bg+'"><td style="'+TD+'">'+e.name+'</td><td style="'+TD2+'">'+e.sqft+'</td><td style="'+TD2+'">'+(e.labor?'$'+e.labor:'')+'</td></tr>';
    }).join('');
    var rSummaryRowsThemed = rCats.map(function(cat,i){
      var bg = i%2===0?'#f8fafc':'#fff';
      return '<tr style="background:'+bg+'"><td style="'+TD+'">'+cat+'</td><td style="'+TD2+'"></td><td style="'+TD2+'"></td></tr>';
    }).join('');

    var html = '<!DOCTYPE html><html><head><title>Work Order #'+woNum+'</title>'
      +'<style>'
      +'*{box-sizing:border-box;margin:0;padding:0;}'
      +'body{font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif;background:#fff;color:#0f172a;}'
      +'table{border-collapse:collapse;width:100%;}'
      +'@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}button{display:none !important;}@page{size:letter;margin:0.35in;}}'
      +'</style></head><body>'

      // ── HEADER BAND ──
      +'<div style="background:#0f1e46;padding:10px 20px 8px;position:relative;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;">'
      +'<div>'
      +'<div style="font-size:18px;font-weight:900;color:#fff;letter-spacing:0.04em;text-transform:uppercase;">Insulation Services of Tulsa</div>'
      +'<div style="font-size:9px;color:#b4c8f0;margin-top:3px;letter-spacing:0.06em;">Serving Northeastern Oklahoma  •  1 (918) 232-9055</div>'
      +'</div>'
      +'<div style="text-align:right;">'
      +'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#dbeafe;">Work Order</div>'
      +'<div style="font-size:26px;font-weight:900;color:#fff;line-height:1.1;">#'+woNum+'</div>'
      +'</div>'
      +'</div>'
      +'</div>'
      // Blue accent stripe
      +'<div style="height:4px;background:#2563eb;"></div>'

      // ── JOB INFO CARDS ──
      +'<div style="display:flex;gap:8px;padding:6px 20px 0;">'

      // Card: Job Details
      +'<div style="flex:2;background:#f8fafc;border-radius:6px;padding:6px 12px;border-left:4px solid #2563eb;">'
      +'<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:4px;">Job Details</div>'
      +'<table style="width:100%;border:none;"><tr>'
      +'<td style="font-size:10px;font-weight:700;color:#64748b;white-space:nowrap;padding:1px 8px 1px 0;">Date Ready</td>'
      +'<td style="font-size:11px;color:#0f172a;padding:1px 12px 1px 0;">'+dateReady+'</td>'
      +'<td style="font-size:10px;font-weight:700;color:#64748b;white-space:nowrap;padding:1px 8px 1px 0;">Date Finished</td>'
      +'<td style="font-size:11px;color:#0f172a;padding:1px 0;">'+dateFinished+'</td>'
      +'</tr><tr>'
      +'<td style="font-size:10px;font-weight:700;color:#64748b;padding:1px 8px 1px 0;">Builder</td>'
      +'<td style="font-size:11px;color:#0f172a;padding:1px 12px 1px 0;">'+builder+'</td>'
      +'<td style="font-size:10px;font-weight:700;color:#64748b;padding:1px 8px 1px 0;">Addition</td>'
      +'<td style="font-size:11px;color:#0f172a;padding:1px 0;">'+addition+'</td>'
      +'</tr><tr>'
      +'<td style="font-size:10px;font-weight:700;color:#64748b;padding:1px 8px 1px 0;">Address</td>'
      +'<td style="font-size:11px;color:#0f172a;padding:1px 0;" colspan="3">'+address+'</td>'
      +'</tr></table>'
      +'</div>'

      // Card: Assignment
      +'<div style="flex:1;background:#f8fafc;border-radius:6px;padding:6px 12px;border-left:4px solid #2563eb;">'
      +'<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:4px;">Assignment</div>'
      +'<table style="width:100%;border:none;"><tr>'
      +'<td style="font-size:10px;font-weight:700;color:#64748b;padding:1px 8px 1px 0;">Salesman</td>'
      +'<td style="font-size:11px;color:#0f172a;">'+salesman+'</td>'
      +'</tr><tr>'
      +'<td style="font-size:10px;font-weight:700;color:#64748b;padding:1px 8px 1px 0;">Door Code</td>'
      +'<td style="font-size:11px;color:#0f172a;">'+doorCode+'</td>'
      +'</tr></table>'
      +'</div>'
      +'</div>'

      // ── MATERIALS TABLE ──
      +'<div style="padding:6px 20px 0;">'
      +'<div style="font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#2563eb;margin-bottom:4px;">Materials</div>'
      +'<table style="border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">'
      +'<thead><tr>'
      +'<th style="'+TH+'">Mat Type</th>'
      +'<th style="'+TH+'">R-Value</th>'
      +'<th style="'+TH+'">Height</th>'
      +'<th style="'+TH+';text-align:right;">Sq Ft</th>'
      +'<th style="'+TH+';text-align:right;">Mat Out</th>'
      +'<th style="'+TH+';text-align:right;">Mat In</th>'
      +'<th style="'+TH+';text-align:right;">Count</th>'
      +'</tr></thead>'
      +'<tbody>'+matRowsHtmlThemed+'</tbody>'
      +'</table>'
      +'</div>'

      // ── EMPLOYEES + R-VALUE SUMMARY ──
      +'<div style="display:flex;gap:10px;padding:6px 20px 0;">'

      // Employees
      +'<div style="flex:1;">'
      +'<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#2563eb;margin-bottom:6px;">Employees</div>'
      +'<table style="border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">'
      +'<thead><tr>'
      +'<th style="'+TH+'">Employee</th>'
      +'<th style="'+TH+';text-align:right;">Sq Ft</th>'
      +'<th style="'+TH+';text-align:right;">Labor ($)</th>'
      +'</tr></thead>'
      +'<tbody>'+empRowsHtmlThemed
      +'<tr style="background:#0f1e46;">'
      +'<td style="padding:6px 10px;font-size:12px;font-weight:700;color:#fff;">TOTAL</td>'
      +'<td style="padding:6px 10px;"></td>'
      +'<td style="padding:6px 10px;font-size:13px;font-weight:900;color:#fff;text-align:right;">$'+totalLabor().toFixed(2)+'</td>'
      +'</tr>'
      +'</tbody></table>'
      +'</div>'

      // R-Value Summary
      +'<div style="flex:1;">'
      +'<div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#2563eb;margin-bottom:6px;">R-Value Summary</div>'
      +'<table style="border-radius:6px;overflow:hidden;border:1px solid #e2e8f0;">'
      +'<thead><tr>'
      +'<th style="'+TH+'">R-Value</th>'
      +'<th style="'+TH+';text-align:right;">Footage</th>'
      +'<th style="'+TH+';text-align:right;">Cost</th>'
      +'</tr></thead>'
      +'<tbody>'+rSummaryRowsThemed+'</tbody>'
      +'</table>'
      +'</div>'
      +'</div>'

      +'<div style="text-align:center;font-size:10px;font-weight:700;color:#64748b;padding:8px 0;letter-spacing:0.06em;text-transform:uppercase;">Work Order Must Be Filled Out Completely</div>'

      +'</body></html>';

    var w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  }

  var secHead = function(label) {
    return React.createElement("div", {style:{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",color:C.accent,marginBottom:8,marginTop:20,borderBottom:"1px solid "+C.border,paddingBottom:4}}, label);
  };

  var FI = function(props) {
    return React.createElement("div", {style:{flex:1,minWidth:120}},
      React.createElement("label", {style:{fontSize:11,fontWeight:600,color:C.textSec,display:"block",marginBottom:3}}, props.label),
      React.createElement("input", {type:props.type||"text",value:props.value,onChange:function(e){props.onChange(e.target.value);},placeholder:props.placeholder||"",style:Object.assign({},iStyle,{width:"100%"})})
    );
  };

  return React.createElement("div", {style:{maxWidth:900,margin:"0 auto",padding:"16px"}},
    // Title + Print button
    React.createElement("div", {style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}},
      React.createElement("div", {style:{fontSize:16,fontWeight:800,textTransform:"uppercase",letterSpacing:"0.06em",color:C.text}}, "Work Order"),
      React.createElement("button", {onClick:handlePrint,style:{background:C.accent,color:"#fff",border:"none",borderRadius:6,padding:"8px 18px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Inter',sans-serif",letterSpacing:"0.06em",textTransform:"uppercase"}}, "🖨 Print / PDF")
    ),

    // Header fields
    secHead("Job Info"),
    React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:10,marginBottom:8}},
      React.createElement(FI, {label:"WO #", value:woNum, onChange:function(v){setWoNum(v);try{localStorage.setItem("ist-wo-counter",v);}catch(e){}}}),
      React.createElement(FI, {label:"Date Ready", type:"date", value:dateReady, onChange:setDateReady}),
      React.createElement(FI, {label:"Date Finished", type:"date", value:dateFinished, onChange:setDateFinished}),
      React.createElement(FI, {label:"Door Code", value:doorCode, onChange:setDoorCode})
    ),
    React.createElement("div", {style:{display:"flex",flexWrap:"wrap",gap:10,marginBottom:8}},
      React.createElement(FI, {label:"Builder", value:builder, onChange:setBuilder}),
      React.createElement(FI, {label:"Address", value:address, onChange:setAddress}),
      React.createElement(FI, {label:"Addition", value:addition, onChange:setAddition}),
      React.createElement(FI, {label:"Salesman", value:salesman, onChange:setSalesman})
    ),

    // Materials table
    secHead("Materials"),
    React.createElement("div", {style:{overflowX:"auto"}},
      React.createElement("table", {style:{width:"100%",borderCollapse:"collapse",fontSize:12}},
        React.createElement("thead", null,
          React.createElement("tr", null,
            ["MAT TYPE","R-VALUE","HEIGHT","SQ FT","MAT OUT","MAT IN","COUNT",""].map(function(h,i) {
              return React.createElement("th", {key:i,style:thStyle}, h);
            })
          )
        ),
        React.createElement("tbody", null,
          sortedMatRows(matRows).map(function(r) {
            return React.createElement("tr", {key:r.id, style:{borderBottom:"1px solid "+C.borderLight}},
              React.createElement("td", {style:tdStyle}, React.createElement("input", {value:r.matType,onChange:function(e){updateMatRow(r.id,"matType",e.target.value);},style:Object.assign({},iStyle,{width:110})})),
              React.createElement("td", {style:tdStyle}, React.createElement("input", {value:r.rValue,onChange:function(e){updateMatRow(r.id,"rValue",e.target.value);},style:Object.assign({},iStyle,{width:70})})),
              React.createElement("td", {style:tdStyle}, React.createElement("input", {value:r.wallHeight||r.width||"",onChange:function(e){updateMatRow(r.id,"wallHeight",e.target.value);},placeholder:"—",style:Object.assign({},iStyle,{width:80,color:r.wallHeight?"#2563eb":undefined})})),

              React.createElement("td", {style:tdStyle}, React.createElement("input", {value:r.sqft,onChange:function(e){updateMatRow(r.id,"sqft",e.target.value);},style:Object.assign({},iStyle,{width:70})})),
              React.createElement("td", {style:tdStyle}, React.createElement("input", {type:"number",value:r.matOut,onChange:function(e){updateMatRow(r.id,"matOut",e.target.value);},style:Object.assign({},iStyle,{width:70})})),
              React.createElement("td", {style:tdStyle}, React.createElement("input", {type:"number",value:r.matIn,onChange:function(e){updateMatRow(r.id,"matIn",e.target.value);},style:Object.assign({},iStyle,{width:70})})),
              React.createElement("td", {style:tdStyle}, React.createElement("input", {type:"number",value:r.count,onChange:function(e){updateMatRow(r.id,"count",e.target.value);},style:Object.assign({},iStyle,{width:60})})),
              React.createElement("td", {style:tdStyle}, React.createElement("button", {onClick:function(){deleteMatRow(r.id);},style:{background:"none",border:"none",color:C.danger,fontSize:14,cursor:"pointer",fontWeight:700}}, "×"))
            );
          })
        )
      )
    ),
    React.createElement("button", {onClick:addMatRow,style:{marginTop:8,fontSize:11,fontWeight:700,background:"none",border:"1px dashed "+C.border,borderRadius:4,color:C.textSec,padding:"4px 14px",cursor:"pointer",fontFamily:"'Inter',sans-serif",textTransform:"uppercase",letterSpacing:"0.06em"}}, "+ Add Row"),

    secHead("Notes"),
    React.createElement("textarea", {value:notes,onChange:function(e){setNotes(e.target.value);},placeholder:"Job notes...",rows:3,style:{width:"100%",boxSizing:"border-box",padding:"8px",border:"1px solid "+C.inputBorder,borderRadius:6,fontSize:12,fontFamily:"'Inter',sans-serif",color:C.text,resize:"vertical"}}),


    React.createElement("div",{style:{textAlign:"center",fontSize:11,fontWeight:700,letterSpacing:"0.05em",color:C.dim,marginTop:24,paddingTop:12,borderTop:"1px solid "+C.border}},"Work Order Must Be Filled Out Completely")
  );
}

/* ══════════ MAIN APP ══════════ */

export default function App() {
  var s0 = useState(""), currentUser = s0[0], setCurrentUser = s0[1];
  var s1 = useState("takeoff"), sec = s1[0], setSec = s1[1];
  var s2 = useState([]), meas = s2[0], setMeas = s2[1];
  var s3 = useState([newOption("Option 1")]), qOpts = s3[0], setQOpts = s3[1];
  var s4 = useState([]), ii = s4[0], setIi = s4[1];
  var spi = useState(false), showProductInfo = spi[0], setShowProductInfo = spi[1];
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

  useEffect(function(){
    var saved=localStorage.getItem("ist-session");
    if(saved){try{var obj=JSON.parse(saved);if(obj.user&&obj.ts&&(Date.now()-obj.ts)<7200000){setCurrentUser(obj.user);}}catch(e){}}
  },[]);

  if (!currentUser) {
    return <LoginScreen onLogin={function(name){setCurrentUser(name);localStorage.setItem("ist-session",JSON.stringify({user:name,ts:Date.now()}));}} />;
  }

  function sendToWorkOrder() { setSec("workorder"); }

  function buildQuoteImportItems(measurements) {
    var grouped = {};
    (measurements || []).forEach(function(m) {
      var materialKey = (m.matNote || m.material || "").trim().toLowerCase();
      var key = [
        (m.locationId || "").trim().toLowerCase(),
        (m.location || "").trim().toLowerCase(),
        materialKey,
        m.isRemoval ? "removal" : "install"
      ].join("::");
      if (!grouped[key]) {
        grouped[key] = Object.assign({}, m, {
          id: "quote-import-" + key,
          sqft: 0,
          total: 0,
          priced: false,
          sourceMeasurementIds: [],
          combinedCount: 0,
          dimStrs: []
        });
      }
      grouped[key].sqft += parseFloat(m.sqft) || 0;
      grouped[key].total += parseFloat(m.total) || 0;
      grouped[key].combinedCount += 1;
      grouped[key].sourceMeasurementIds.push(m.id);
      if (m.dimStr && grouped[key].dimStrs.indexOf(m.dimStr) === -1) grouped[key].dimStrs.push(m.dimStr);
    });
    return Object.keys(grouped).map(function(k) {
      var item = grouped[k];
      return Object.assign({}, item, {
        sqft: Math.round(item.sqft),
        total: Math.ceil(item.total || 0),
        description: item.combinedCount > 1
          ? (item.location + " — combined " + item.combinedCount + " measurements")
          : item.description
      });
    });
  }

  function sendToQuote() {
    if (meas.length === 0) return;
    var combinedImports = buildQuoteImportItems(meas);
    setIi(function(prev) {
      var pricedBySource = {};
      (prev || []).filter(function(i) { return i.priced; }).forEach(function(i) {
        (i.sourceMeasurementIds || [i.id]).forEach(function(id) { pricedBySource[id] = true; });
      });
      var openPrev = (prev || []).filter(function(i) { return i.priced; });
      var fresh = combinedImports.filter(function(i) {
        return !(i.sourceMeasurementIds || []).some(function(id) { return pricedBySource[id]; });
      });
      return openPrev.concat(fresh);
    });
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
    localStorage.removeItem("ist-session");
    setCurrentUser("");
    setMeas([]); setQOpts([newOption("Option 1")]); setIi([]);
    setCn(""); setCa(""); setCph(""); setCe(""); setJa(""); setJn("");
    setSec("takeoff");
    setInitialLoad(true);
  }

  var cp2 = { custName: cn, setCustName: setCn, custAddr: ca, setCustAddr: setCa, custPhone: cph, setCustPhone: setCph, custEmail: ce, setCustEmail: setCe, jobAddr: ja, setJobAddr: setJa, jobNotes: jn, setJobNotes: setJn };

  return (
    <div className="ist-app" style={{ fontFamily: "'Inter', sans-serif", color: C.text, paddingBottom: 32 }}><div style={{ maxWidth: 1140, margin: "0 auto" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        html, body { background: linear-gradient(135deg, #e8eef8 0%, #dde6f5 40%, #cdd9f0 100%); margin: 0; min-height: 100vh; background-attachment: fixed; width: 100%; overflow-x: hidden; }
        #root { width: 100%; overflow-x: hidden; }
        .ist-app { background: transparent; min-height: 100vh; overflow-x: hidden; }
        .ist-app::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 70%); pointer-events: none; z-index: 0; }
        .ist-app > * { position: relative; z-index: 1; min-width: 0; }
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
        input::placeholder, textarea::placeholder { color: rgba(100,116,139,0.5) !important; }
        input, textarea, select { color-scheme: light; }
        * { box-sizing: border-box; }
        .ist-items-hdr { display:grid; grid-template-columns:minmax(0,1.6fr) minmax(150px,0.8fr) minmax(110px,0.6fr) 56px; }
        .ist-items-row { display:grid; grid-template-columns:minmax(0,1.55fr) minmax(160px,0.85fr) minmax(96px,0.45fr) 36px; }
        .ist-price-split { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(280px,0.85fr); }
        @media (max-width:600px) {
          .ist-nav-tabs button { min-width:0; font-size:10px !important; padding-left:3px !important; padding-right:3px !important; letter-spacing:0.01em !important; }
          .ist-nav-tabs span { margin-left:2px !important; padding-left:4px !important; padding-right:4px !important; }
          .ist-option-tabs { display:grid !important; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px !important; align-items:stretch !important; }
          .ist-option-tabs > button { min-height:42px; padding:10px 8px !important; white-space:normal; overflow-wrap:anywhere; }
          .ist-option-actions { grid-column:1 / -1; margin-left:0 !important; width:100%; justify-content:stretch; }
          .ist-option-actions > div { width:100%; }
          .ist-option-actions button { min-height:40px; flex:1; border-radius:8px !important; background:rgba(255,255,255,0.55) !important; }
          .ist-option-rename { width:100%; }
          .ist-option-rename input { min-width:0; flex:1; width:100%; }
          .ist-price-import-row { flex-direction:column; align-items:stretch !important; gap:10px; }
          .ist-price-import-actions { margin-left:0 !important; width:100%; display:grid !important; grid-template-columns:1fr 1fr; }
          .ist-price-import-actions button { min-height:40px; }
          .ist-material-btns { display:grid !important; grid-template-columns:repeat(2,minmax(0,1fr)); padding-left:0 !important; border-left:none !important; }
          .ist-material-btns button { min-height:40px; padding:9px 8px !important; white-space:normal; }
          .ist-price-entry-row { display:grid !important; grid-template-columns:1fr 1fr; align-items:end !important; }
          .ist-price-entry-row > div { grid-column:1 / -1; min-width:0; }
          .ist-price-entry-row button { min-height:42px; }
          .ist-pricing-hero-top { flex-direction:column; gap:12px !important; }
          .ist-pricing-hero-total { min-width:0 !important; width:100%; text-align:left !important; }
          .ist-pricing-hero-total > div:last-child { font-size:34px !important; overflow-wrap:anywhere; }
          .ist-items-hdr { display:none; }
          .ist-items-card { padding:4px 10px !important; border-radius:12px !important; }
          .ist-items-row { grid-template-columns:minmax(0,1fr) auto !important; grid-template-areas:"desc total" "qty remove" !important; gap:3px 10px !important; padding:9px 0 !important; align-items:center !important; }
          .ic-desc { grid-area:desc !important; min-width:0; }
          .ic-qty { grid-area:qty !important; text-align:left !important; min-width:0; }
          .ic-tot { grid-area:total !important; text-align:right !important; min-width:max-content; }
          .ic-rm { grid-area:remove !important; margin-left:0 !important; justify-self:end; }
          .ic-desc-title { font-size:13px !important; line-height:1.15 !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .ic-desc-sub { font-size:10.5px !important; line-height:1.2 !important; margin-top:1px !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .ic-qty-main { font-size:12px !important; line-height:1.15 !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .ic-qty-sub, .ic-total-sub { display:none !important; }
          .ic-total-main { font-size:15px !important; line-height:1.1 !important; }
          .ic-rm button { width:28px !important; height:24px !important; min-height:0 !important; padding:0 !important; border:none !important; border-radius:999px; background:rgba(220,38,38,0.08) !important; color:#b91c1c !important; font-size:14px !important; line-height:1 !important; }
          .ic-rm-label { display:none !important; }
          .ist-adjust-row { flex-wrap:wrap; align-items:flex-start !important; }
          .ist-adjust-row input[type="checkbox"] { flex:0 0 auto; }
          .ist-adjust-row > span { min-width:0; overflow-wrap:anywhere; }
          .ist-adjust-row > div { margin-left:28px !important; width:calc(100% - 28px); justify-content:flex-start; }
          .ist-adjust-row > div input { width:100% !important; max-width:180px; }
          .ist-custom-price-row { display:grid !important; grid-template-columns:1fr; }
          .ist-custom-price-row button { min-height:42px; }
          .ist-price-split { grid-template-columns:1fr; width:100%; overflow:hidden; }
          .ist-price-split, .ist-price-split * { min-width:0; max-width:100%; }
          .ist-price-split-left { border-right:none !important; border-bottom:1px solid rgba(0,0,0,0.06) !important; padding:12px !important; }
          .ist-price-split-right { padding:12px !important; }
          .ist-price-split-title-copy { display:none !important; }
          .ist-live-price-input { min-width:0 !important; width:100% !important; max-width:100% !important; font-size:22px !important; padding:10px 10px !important; }
          .ist-price-value-row { gap:8px !important; align-items:center !important; }
          .ist-price-value-row > span:first-child { font-size:10px !important; letter-spacing:0.06em !important; line-height:1.15 !important; }
          .ist-price-value-row > span:last-child, .ist-price-main-value { font-size:18px !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .ist-override-percent { font-size:11px !important; white-space:normal !important; text-align:right !important; }
          .ist-measure-fullscreen { font-size:13px; }
          .ist-measure-fullscreen .ist-measure-sheet select, .ist-measure-fullscreen .ist-measure-sheet input { font-size:12px !important; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .ist-measure-fullscreen .ist-measure-sheet > div { min-height:46px; display:flex; flex-direction:column; justify-content:center; }
          .ist-print-actions { padding-bottom:max(8px, env(safe-area-inset-bottom)); }
          .ist-measure-sheet { grid-template-columns:62px 78px minmax(136px,1fr) 50px 48px 56px 30px !important; overflow-x:auto !important; }
          .ist-measure-sheet input, .ist-measure-sheet select { font-size:12px !important; }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", padding: "18px 20px 0", borderBottom: "none", borderRadius: "0 0 24px 24px", textAlign: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 8px 40px rgba(180,200,240,0.25), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>👤 {currentUser}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={function(){if(window.confirm("Clear everything?")){setMeas([]);setQOpts([newOption("Option 1")]);setIi([]);setCn("");setCa("");setCph("");setCe("");setJa("");setJn("");setSec("takeoff");}}} style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 6, color: C.danger, fontSize: 10, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 700, textTransform: "uppercase", padding: "5px 10px", letterSpacing: "0.04em" }}>{"🗑 Clear"}</button>
            <button onClick={handleLogout} style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 6, color: C.textSec, fontSize: 10, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 600, textTransform: "uppercase", padding: "5px 10px" }}>{"Switch User"}</button>
          </div>
        </div>
        <h1 style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: "0.05em", margin: 0, textTransform: "uppercase" }}>{"Insulation Services of Tulsa"}</h1>
        <div style={{ fontSize: 10, color: C.dim, marginTop: 3, letterSpacing: "0.14em", textTransform: "uppercase" }}>{COMPANY.tagline}</div>

        <div className="ist-nav-tabs" style={{ display: "flex", gap: 0, overflow: "hidden", borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: 14 }}>
          {[
            { id: "takeoff", label: "TAKE OFF", badge: meas.length || null },
            { id: "quote", label: "QUOTE", badge: qOpts.reduce(function(s,o){return s+o.items.length;},0) || null },
            { id: "workorder", label: "WORK ORDER", badge: null },
            { id: "jobs", label: "JOBS", badge: null },
          ].map(function(t) {
            var active = sec === t.id;
            return (
              <button key={t.id} onClick={function() { setSec(t.id); }}
                style={{ flex: 1, padding: "10px 6px", border: "none", borderRight: "1px solid rgba(0,0,0,0.05)", cursor: "pointer", fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", background: active ? "rgba(255,255,255,0.5)" : "transparent", color: active ? C.accent : C.dim, transition: "all 0.15s ease", boxShadow: active ? "inset 0 -2px 0 "+C.accent : "none" }}>
                {t.label}
                {t.badge ? (<span style={{ display: "inline-block", marginLeft: 5, background: active ? C.accent : "rgba(0,0,0,0.08)", color: active ? "#fff" : C.textSec, fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 6, minWidth: 18, textAlign: "center" }}>{t.badge}</span>) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {sec === "takeoff" && (<TakeOff measurements={meas} setMeasurements={setMeas} onSendToQuote={sendToQuote} onSendToWorkOrder={sendToWorkOrder} currentUser={currentUser} quoteOpts={qOpts} {...cp2} />)}
        {sec === "quote" && (<QuoteBuilderSection quoteOpts={qOpts} setQuoteOpts={setQOpts} importedItems={ii} setImportedItems={setIi} currentUser={currentUser} measurements={meas} showProductInfo={showProductInfo} setShowProductInfo={setShowProductInfo} {...cp2} />)}
        {sec === "workorder" && (<WorkOrderSection measurements={meas} quoteOpts={qOpts} custName={cn} custAddr={ca} currentUser={currentUser} jobAddr={ja} />)}
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


    </div></div>
  );
}
