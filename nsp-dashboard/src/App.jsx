import { useState, useEffect, useCallback } from "react";

/* ── Design tokens ────────────────────────────────
   Three-layer surface system: bg → surface → raised
   Color is semantic only: green=good, yellow=warn, red=bad, blue=info, accent=brand
   Typography hierarchy via weight+size, not color variety
*/
const mono = "'IBM Plex Mono',monospace";
const T = {
  bg:"#0a0d12",
  surface:"#111419",
  surfaceHover:"#161b24",
  surfaceActive:"#1b2130",
  border:"#1e2430",
  borderHover:"#2a3344",
  accent:"#e8771a",
  accentSoft:"rgba(232,119,26,0.08)",
  green:"#22c55e",  greenSoft:"rgba(34,197,94,0.08)",
  yellow:"#eab308", yellowSoft:"rgba(234,179,8,0.08)",
  red:"#ef4444",    redSoft:"rgba(239,68,68,0.08)",
  blue:"#3b82f6",   blueSoft:"rgba(59,130,246,0.08)",
  text:"#dfe3eb",
  textSec:"#8a94a6",
  textMut:"#4f5868",
  white:"#f0f2f5",
};

const REFRESH = 15000;

/* ── App ──────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("dashboard");
  const [enquiries, setEnquiries] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchData = useCallback(async (showLoad = false) => {
    if (showLoad) setLoading(true);
    try {
      const r = await fetch("/api/enquiries");
      if (!r.ok) throw new Error(`API ${r.status}`);
      const d = await r.json();
      setEnquiries(d.enquiries || []);
      setLastRefresh(new Date());
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(true); }, [fetchData]);
  useEffect(() => { const iv = setInterval(() => fetchData(), REFRESH); return () => clearInterval(iv); }, [fetchData]);

  const urgCol = u => ({low:T.green,medium:T.blue,high:T.yellow,critical:T.red}[u]||T.textMut);
  const urgBg = u => ({low:T.greenSoft,medium:T.blueSoft,high:T.yellowSoft,critical:T.redSoft}[u]||"transparent");
  const confCol = s => s>=80?T.green:s>=50?T.yellow:T.red;
  const confBg = s => s>=80?T.greenSoft:s>=50?T.yellowSoft:T.redSoft;

  const stats = {
    total: enquiries.length,
    urgent: enquiries.filter(e=>e.enquiry?.urgency==="high"||e.enquiry?.urgency==="critical").length,
    avgConf: enquiries.length ? Math.round(enquiries.reduce((a,e)=>a+(e.confidence_score||0),0)/enquiries.length) : 0,
    industries: [...new Set(enquiries.map(e=>e.enquiry?.industry).filter(Boolean))].length,
  };

  return (
    <div style={{background:T.bg,minHeight:"100vh",color:T.text,fontFamily:"'Libre Franklin',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes appear{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes live{0%,100%{opacity:1}50%{opacity:.3}}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:${T.bg}}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        ::-webkit-scrollbar-track{background:transparent}
        button{font-family:inherit}
        button:focus-visible{outline:2px solid ${T.accent};outline-offset:2px}
        .nav-tab{transition:all 150ms ease}
        .nav-tab:hover{color:${T.text} !important;background:${T.surfaceHover} !important}
        .stat{transition:border-color 150ms ease}
        .stat:hover{border-color:${T.borderHover} !important}
        .enq-card{transition:all 150ms ease}
        .enq-card:hover{background:${T.surfaceHover} !important;border-color:${T.borderHover} !important}
        .btn-ghost{transition:all 150ms ease}
        .btn-ghost:hover{background:${T.surfaceHover} !important;border-color:${T.borderHover} !important;color:${T.text} !important}
        @media(max-width:768px){
          .stats-grid{grid-template-columns:repeat(2,1fr) !important}
          .detail-4{grid-template-columns:1fr 1fr !important}
          .detail-2{grid-template-columns:1fr !important}
          .panels-2{grid-template-columns:1fr !important}
          .decisions-grid{grid-template-columns:1fr !important}
          .hdr-inner{padding:0 16px !important}
          .main-wrap{padding:24px 16px !important}
        }
        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr !important}
          .detail-4{grid-template-columns:1fr !important}
          .hdr-inner{flex-direction:column !important;gap:8px !important;height:auto !important;padding:12px 16px !important}
          .enq-top{flex-direction:column !important}
          .enq-score{margin-left:0 !important;margin-top:12px !important}
        }
        @media(prefers-reduced-motion:reduce){
          .enq-card,.stat{opacity:1 !important;animation:none !important}
        }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{background:T.surface,borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,zIndex:10}}>
        <div className="hdr-inner" style={{maxWidth:1080,margin:"0 auto",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:52}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:8,height:8,background:T.green,borderRadius:"50%",boxShadow:`0 0 6px ${T.green}`,animation:"live 3s infinite"}}/>
            <span style={{fontSize:14,fontWeight:700,color:T.white,letterSpacing:"0.5px"}}>NSP</span>
            <span style={{fontSize:14,fontWeight:400,color:T.textSec,letterSpacing:"1.5px"}}>CASES</span>
          </div>
          <nav style={{display:"flex",gap:4}}>
            {[{k:"dashboard",l:"Dashboard"},{k:"architecture",l:"Architecture"}].map(tab=>(
              <button key={tab.k} className="nav-tab" onClick={()=>setView(tab.k)} style={{
                padding:"6px 14px",background:view===tab.k?T.surfaceActive:"transparent",
                border:"none",borderRadius:6,color:view===tab.k?T.white:T.textMut,
                cursor:"pointer",fontSize:13,fontWeight:view===tab.k?600:400,
              }}>{tab.l}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="main-wrap" style={{maxWidth:1080,margin:"0 auto",padding:"32px 32px 48px"}}>

        {/* ── DASHBOARD ── */}
        {view==="dashboard"&&(
          <div style={{animation:"appear 0.25s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:700,color:T.white,lineHeight:1.3}}>Enquiries</h2>
                <p style={{fontSize:12,color:T.textMut,marginTop:2,fontFamily:mono}}>
                  Refreshes every {REFRESH/1000}s{lastRefresh&&<> · {lastRefresh.toLocaleTimeString()}</>}
                </p>
              </div>
              <button className="btn-ghost" onClick={()=>fetchData(true)} style={{
                padding:"7px 14px",background:T.surface,border:`1px solid ${T.border}`,
                borderRadius:6,color:T.textSec,cursor:"pointer",fontSize:12,
                fontFamily:mono,display:"flex",alignItems:"center",gap:6,
              }}>
                {loading?<span style={{width:12,height:12,border:`1.5px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.6s linear infinite"}}/>:"↻"} Refresh
              </button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:32}}>
              {[
                {l:"Total Enquiries",v:stats.total,c:T.white},
                {l:"Avg Confidence",v:`${stats.avgConf}%`,c:confCol(stats.avgConf)},
                {l:"High Priority",v:stats.urgent,c:stats.urgent>0?T.yellow:T.green},
                {l:"Industries",v:stats.industries,c:T.blue},
              ].map((s,i)=>(
                <div key={i} className="stat" style={{
                  background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"16px 20px",
                  animation:"appear 0.3s ease forwards",animationDelay:`${i*60}ms`,opacity:0,
                }}>
                  <div style={{fontSize:11,fontFamily:mono,color:T.textMut,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:8}}>{s.l}</div>
                  <div style={{fontSize:24,fontWeight:700,color:s.c,fontFamily:mono,lineHeight:1}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Error */}
            {error&&<div style={{padding:"12px 16px",background:T.redSoft,border:`1px solid ${T.red}20`,borderRadius:6,fontSize:12,fontFamily:mono,color:T.red,marginBottom:16}}>Failed to load: {error}</div>}

            {/* Loading */}
            {loading&&enquiries.length===0&&!error&&(
              <div style={{textAlign:"center",padding:"64px 20px",color:T.textMut}}>
                <div style={{width:20,height:20,border:`2px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.6s linear infinite",margin:"0 auto 16px"}}/>
                <p style={{fontSize:13}}>Loading enquiries...</p>
              </div>
            )}

            {/* Empty */}
            {!loading&&enquiries.length===0&&!error&&(
              <div style={{textAlign:"center",padding:"72px 20px",border:`1px dashed ${T.border}`,borderRadius:8}}>
                <div style={{width:48,height:48,borderRadius:10,background:T.surface,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontSize:20,color:T.textMut}}>◫</div>
                <p style={{fontSize:15,fontWeight:600,color:T.textSec,marginBottom:6}}>No enquiries yet</p>
                <p style={{fontSize:13,color:T.textMut,maxWidth:380,margin:"0 auto",lineHeight:1.6}}>
                  Send an email to the company inbox — n8n will process it and it'll appear here automatically.
                </p>
              </div>
            )}

            {/* Enquiry cards */}
            {enquiries.map((enq,idx)=>(
              <div key={enq.id} className="enq-card" onClick={()=>setSelectedId(enq.id===selectedId?null:enq.id)} style={{
                background:selectedId===enq.id?T.surfaceActive:T.surface,
                border:`1px solid ${selectedId===enq.id?T.accent+"40":T.border}`,
                borderRadius:8,padding:"16px 20px",cursor:"pointer",marginBottom:8,
                animation:"appear 0.3s ease forwards",animationDelay:`${idx*50}ms`,opacity:0,
              }}>
                <div className="enq-top" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:600,fontSize:14,color:T.white}}>{enq.customer?.company||"Unknown"}</span>
                      <Badge t={enq.enquiry?.industry} c={T.blue} bg={T.blueSoft}/>
                      <Badge t={enq.enquiry?.urgency?.toUpperCase()} c={urgCol(enq.enquiry?.urgency)} bg={urgBg(enq.enquiry?.urgency)}/>
                      {enq.enquiry?.attachments_mentioned&&<Badge t="ATTACHMENTS" c={T.textSec} bg={T.surfaceHover}/>}
                    </div>
                    <p style={{fontSize:13,color:T.textSec,lineHeight:1.5,margin:0}}>{enq.summary}</p>
                  </div>
                  <div className="enq-score" style={{marginLeft:20,flexShrink:0,textAlign:"center",background:confBg(enq.confidence_score),borderRadius:8,padding:"8px 14px",minWidth:62}}>
                    <div style={{fontSize:20,fontWeight:700,color:confCol(enq.confidence_score),fontFamily:mono,lineHeight:1}}>{enq.confidence_score}%</div>
                    <div style={{fontSize:9,color:T.textMut,fontFamily:mono,letterSpacing:"1px",marginTop:4}}>CONF</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {selectedId===enq.id&&(
                  <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`,animation:"appear 0.2s ease"}}>
                    <Lbl>Customer</Lbl>
                    <div className="detail-4" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:16,marginBottom:20}}>
                      <F l="Name" v={enq.customer?.name}/><F l="Company" v={enq.customer?.company}/>
                      <F l="Email" v={enq.customer?.email}/><F l="Phone" v={enq.customer?.phone}/>
                    </div>

                    <Lbl>Products</Lbl>
                    {enq.enquiry?.items?.length>0?enq.enquiry.items.map((item,i)=>(
                      <div key={i} style={{background:T.bg,borderRadius:6,padding:"14px 16px",border:`1px solid ${T.border}`,marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <span style={{fontWeight:600,fontSize:13,color:T.accent}}>{item.product_type}</span>
                          <Badge t={`QTY ${item.quantity}`} c={T.accent} bg={T.accentSoft}/>
                        </div>
                        <p style={{fontSize:13,color:T.textSec,margin:0,lineHeight:1.5}}>{item.description}</p>
                        {item.dimensions&&(item.dimensions.length_mm||item.dimensions.width_mm||item.dimensions.height_mm)&&(
                          <div style={{fontSize:12,fontFamily:mono,marginTop:8,padding:"6px 10px",background:T.surfaceHover,borderRadius:4,display:"inline-block"}}>
                            <span style={{color:T.textMut}}>{item.dimensions.type}: </span>
                            <span style={{color:T.blue,fontWeight:500}}>{item.dimensions.length_mm??"—"} × {item.dimensions.width_mm??"—"} × {item.dimensions.height_mm??"—"} mm</span>
                          </div>
                        )}
                        {item.requirements?.length>0&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                            {item.requirements.map((r,j)=>(
                              <span key={j} style={{fontSize:11,padding:"3px 10px",background:T.surfaceHover,border:`1px solid ${T.border}`,borderRadius:20,color:T.textSec,fontFamily:mono}}>{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )):(enq.items_detail&&<p style={{fontSize:13,color:T.textSec,marginBottom:12}}>{enq.items_detail}</p>)}

                    <div className="detail-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginTop:12}}>
                      <div>
                        <Lbl>Services needed</Lbl>
                        {enq.enquiry?.services_needed?.length>0?enq.enquiry.services_needed.map((s,i)=>(
                          <div key={i} style={{fontSize:13,color:T.text,marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                            <span style={{color:T.green,fontSize:6}}>●</span> {s}
                          </div>
                        )):<span style={{fontSize:13,color:T.textMut}}>None specified</span>}
                      </div>
                      <div>
                        <Lbl>Missing info</Lbl>
                        {enq.missing_info?.length>0?enq.missing_info.map((m,i)=>(
                          <div key={i} style={{fontSize:13,color:T.yellow,marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:10}}>▲</span> {m}
                          </div>
                        )):<span style={{fontSize:13,color:T.green}}>All info provided ✓</span>}
                      </div>
                    </div>

                    {enq.suggested_followup&&<div style={{marginTop:16}}><Lbl>Suggested follow-up</Lbl><p style={{fontSize:13,lineHeight:1.6,color:T.text}}>{enq.suggested_followup}</p></div>}
                    {enq.attachment_analysis&&<div style={{marginTop:16}}><Lbl>Attachment analysis</Lbl><p style={{fontSize:13,lineHeight:1.6,color:T.text}}>{enq.attachment_analysis}</p></div>}

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,paddingTop:12,borderTop:`1px solid ${T.border}`}}>
                      <div style={{fontSize:13}}><span style={{color:T.textMut}}>Deadline: </span><span style={{color:enq.enquiry?.deadline?T.white:T.textMut,fontWeight:enq.enquiry?.deadline?500:400}}>{enq.enquiry?.deadline||"Not specified"}</span></div>
                      <div style={{fontSize:11,fontFamily:mono,color:T.textMut}}>{enq.processed_at?new Date(enq.processed_at).toLocaleString():"—"}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ARCHITECTURE ── */}
        {view==="architecture"&&(
          <div style={{animation:"appear 0.25s ease"}}>
            <h2 style={{fontSize:20,fontWeight:700,color:T.white,lineHeight:1.3,marginBottom:4}}>System Architecture</h2>
            <p style={{fontSize:12,fontFamily:mono,color:T.textMut,marginBottom:32}}>n8n automation backend + React dashboard frontend</p>

            {/* Pipeline */}
            <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"24px 28px",marginBottom:24}}>
              <div style={{fontSize:10,fontFamily:mono,color:T.textMut,textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:24,fontWeight:500}}>Processing pipeline</div>
              {[
                {n:1,t:"Gmail trigger",d:"n8n watches company inbox for new enquiry emails",tag:"n8n",tc:T.green},
                {n:2,t:"Attachment check",d:"Detects images/drawings → prepares base64 for Vision API",tag:"n8n",tc:T.green},
                {n:3,t:"GPT-4o API",d:"Extracts customer, dimensions, requirements, use case + summarises",tag:"OpenAI",tc:T.accent},
                {n:4,t:"Vision processing",d:"If attachments: GPT-4o Vision analyses CAD drawings / product images",tag:"OpenAI",tc:T.accent},
                {n:5,t:"Google Sheets",d:"Structured data appended to enquiry tracker spreadsheet",tag:"n8n",tc:T.green},
                {n:6,t:"Slack notification",d:"Team alerted with summary, urgency flag, missing info",tag:"n8n",tc:T.green},
                {n:7,t:"React dashboard",d:"This dashboard — reads from Google Sheets, auto-refreshes every 15s",tag:"Vercel",tc:T.blue},
              ].map((s,idx)=>(
                <div key={idx} style={{display:"flex",gap:16,alignItems:"flex-start",animation:"appear 0.3s ease forwards",animationDelay:`${idx*70}ms`,opacity:0}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32,flexShrink:0}}>
                    <div style={{width:32,height:32,borderRadius:"50%",border:`1.5px solid ${s.tc}50`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:600,fontFamily:mono,color:s.tc,background:T.bg}}>{s.n}</div>
                    {idx<6&&<div style={{width:1,height:28,background:T.border}}/>}
                  </div>
                  <div style={{flex:1,paddingBottom:idx<6?8:0,paddingTop:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                      <span style={{fontSize:13,fontWeight:600,color:T.white}}>{s.t}</span>
                      <Badge t={s.tag} c={s.tc} bg={`${s.tc}12`}/>
                    </div>
                    <p style={{fontSize:12,color:T.textSec,lineHeight:1.5,margin:0}}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Panels */}
            <div className="panels-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
              <Panel title="Prompt engineering">
                <P>Extraction prompt includes NSP's real product taxonomy (Road Trunks, Rack Cases, 50/50 Splits) so the AI categorises against actual product lines.</P>
                <P>Output schema enforces structured JSON with confidence scoring — team instantly sees what's missing and what to follow up on.</P>
                <P last>Handles edge cases: vague dimensions, multiple items per email, missing contacts, attachment references.</P>
              </Panel>
              <Panel title="Scalability">
                <P>Quoting engine: extracted dimensions → material calculator → auto-generate price estimates.</P>
                <P>CRM integration: auto-create contacts in HubSpot/Pipedrive from extracted customer data.</P>
                <P>Auto-reply drafts: acknowledgement emails with estimated timeline based on urgency.</P>
                <P last>Analytics: track enquiry volume by industry, conversion rates, average quote turnaround.</P>
              </Panel>
            </div>

            {/* Key decisions */}
            <Panel title="Key decisions">
              <div className="decisions-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:0}}>
                {[
                  {q:"Why GPT-4o?",a:"Native JSON mode guarantees valid output. Vision API handles CAD drawings. Swappable with Claude or Gemini — same prompt works."},
                  {q:"Why n8n over Make?",a:"Self-hostable, no vendor lock-in, better code nodes. NSP keeps full control of their pipeline."},
                  {q:"Why Google Sheets?",a:"Zero learning curve. Everyone knows Sheets. Easy to graduate to a CRM later."},
                  {q:"Why confidence scoring?",a:"Team sees at a glance which enquiries are ready to quote vs which need follow-up."},
                ].map((d,i)=>(
                  <div key={i} style={{padding:"16px 20px",borderTop:i>=2?`1px solid ${T.border}`:"none",borderLeft:i%2===1?`1px solid ${T.border}`:"none"}}>
                    <div style={{fontSize:13,fontWeight:600,color:T.white,marginBottom:6}}>{d.q}</div>
                    <div style={{fontSize:12,color:T.textSec,lineHeight:1.6}}>{d.a}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer style={{borderTop:`1px solid ${T.border}`,padding:"16px 24px",textAlign:"center"}}>
        <p style={{fontSize:11,fontFamily:mono,color:T.textMut}}>
          Built by <span style={{color:T.textSec}}>Ranjith</span>
          <span style={{margin:"0 8px",opacity:0.3}}>·</span>
          NSP Cases AI Enquiry Processor
        </p>
      </footer>
    </div>
  );
}

/* ── Helper components ────────────────────────── */
function Badge({t,c,bg}){
  return <span style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",fontWeight:500,padding:"2px 8px",background:bg||`${c}12`,color:c,borderRadius:3,letterSpacing:"0.3px"}}>{t}</span>;
}
function F({l,v}){
  return <div><div style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:"#4f5868",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:4}}>{l}</div><div style={{fontSize:13,color:v?"#dfe3eb":"#4f5868",fontWeight:v?500:400}}>{v||"—"}</div></div>;
}
function Lbl({children}){
  return <div style={{fontSize:10,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",color:"#4f5868",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10}}>{children}</div>;
}
function Panel({title,children}){
  return <div style={{background:"#111419",border:"1px solid #1e2430",borderRadius:8,padding:"20px 24px",marginBottom:12}}><div style={{fontSize:11,fontWeight:600,fontFamily:"'IBM Plex Mono',monospace",color:"#8a94a6",textTransform:"uppercase",letterSpacing:"1px",marginBottom:16,paddingBottom:12,borderBottom:"1px solid #1e2430"}}>{title}</div>{children}</div>;
}
function P({children,last}){
  return <p style={{fontSize:13,lineHeight:1.7,color:"#8a94a6",margin:last?"0":"0 0 8px"}}>{children}</p>;
}
