import { useState, useEffect, useCallback } from "react";

const T = {
  bg:"#0b0f14", panel:"#12171f", card:"#171e2a", cardHover:"#1c2536",
  border:"#222d3d", accent:"#e8771a", accentGlow:"rgba(232,119,26,0.12)",
  green:"#34d399", greenDim:"rgba(52,211,153,0.15)",
  yellow:"#fbbf24", yellowDim:"rgba(251,191,36,0.15)",
  red:"#f87171", redDim:"rgba(248,113,113,0.15)",
  blue:"#60a5fa", blueDim:"rgba(96,165,250,0.15)",
  text:"#e1e7ef", textSoft:"#94a3b8", textMuted:"#586579", white:"#fff",
};

const REFRESH = 15000;

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

  const urgCol = u => ({low:T.green,medium:T.blue,high:T.yellow,critical:T.red}[u]||T.textMuted);
  const urgBg = u => ({low:T.greenDim,medium:T.blueDim,high:T.yellowDim,critical:T.redDim}[u]||"transparent");
  const confCol = s => s>=80?T.green:s>=50?T.yellow:T.red;

  const stats = {
    total: enquiries.length,
    urgent: enquiries.filter(e=>e.enquiry?.urgency==="high"||e.enquiry?.urgency==="critical").length,
    avgConf: enquiries.length ? Math.round(enquiries.reduce((a,e)=>a+(e.confidence_score||0),0)/enquiries.length) : 0,
    industries: [...new Set(enquiries.map(e=>e.enquiry?.industry).filter(Boolean))].length,
  };

  return (
    <div style={{background:T.bg,minHeight:"100vh",color:T.text,fontFamily:"'Libre Franklin',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
        *{box-sizing:border-box;margin:0;padding:0}body{background:${T.bg}}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}
        button:focus{outline:none}
      `}</style>

      {/* HEADER */}
      <header style={{borderBottom:`1px solid ${T.border}`,background:T.panel}}>
        <div style={{maxWidth:1120,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:8,height:8,background:T.green,borderRadius:"50%",boxShadow:`0 0 10px ${T.green}`,animation:"pulse 3s infinite"}}/>
            <span style={{fontSize:17,fontWeight:800,color:T.white}}>NSP</span>
            <span style={{fontSize:17,fontWeight:300,color:T.textSoft}}>CASES</span>
            <span style={{fontSize:10,color:T.accent,fontFamily:"'IBM Plex Mono',monospace",marginLeft:8,padding:"2px 8px",background:T.accentGlow,borderRadius:4}}>ENQUIRY DASHBOARD</span>
          </div>
          <nav style={{display:"flex"}}>
            {[{k:"dashboard",l:"Dashboard",i:"◫"},{k:"architecture",l:"Architecture",i:"⬡"}].map(tab=>(
              <button key={tab.k} onClick={()=>setView(tab.k)} style={{
                padding:"8px 18px",background:view===tab.k?T.accentGlow:"transparent",
                border:"none",borderBottom:`2px solid ${view===tab.k?T.accent:"transparent"}`,
                color:view===tab.k?T.accent:T.textMuted,cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit"
              }}>{tab.i} {tab.l}</button>
            ))}
          </nav>
        </div>
      </header>

      <main style={{maxWidth:1120,margin:"0 auto",padding:"28px 24px"}}>

        {/* DASHBOARD */}
        {view==="dashboard"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:800,color:T.white}}>Enquiry Dashboard</h2>
                <p style={{fontSize:12,color:T.textMuted,marginTop:2}}>
                  Auto-refreshes every {REFRESH/1000}s{lastRefresh&&<> · Last: {lastRefresh.toLocaleTimeString()}</>}
                </p>
              </div>
              <button onClick={()=>fetchData(true)} style={{
                padding:"8px 16px",background:T.card,border:`1px solid ${T.border}`,borderRadius:6,
                color:T.textSoft,cursor:"pointer",fontSize:11,fontFamily:"'IBM Plex Mono',monospace",display:"flex",alignItems:"center",gap:6
              }}>
                {loading?<span style={{width:12,height:12,border:`2px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>:"↻"} Refresh
              </button>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
              {[
                {l:"Total Enquiries",v:stats.total,c:T.white},
                {l:"Avg Confidence",v:`${stats.avgConf}%`,c:confCol(stats.avgConf)},
                {l:"High Priority",v:stats.urgent,c:stats.urgent>0?T.yellow:T.green},
                {l:"Industries",v:stats.industries,c:T.blue},
              ].map((s,i)=>(
                <div key={i} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,padding:"14px 16px",textAlign:"center"}}>
                  <div style={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",color:T.textMuted,textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>{s.l}</div>
                  <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Error */}
            {error&&<div style={{padding:14,background:T.redDim,border:`1px solid ${T.red}`,borderRadius:8,fontSize:12,fontFamily:"'IBM Plex Mono',monospace",color:T.red,marginBottom:16}}>Failed to load: {error}</div>}

            {/* Loading */}
            {loading&&enquiries.length===0&&!error&&(
              <div style={{textAlign:"center",padding:"60px 20px",color:T.textMuted}}>
                <div style={{width:24,height:24,border:`2px solid ${T.border}`,borderTopColor:T.accent,borderRadius:"50%",animation:"spin 0.7s linear infinite",margin:"0 auto 16px"}}/>
                <p style={{fontSize:13}}>Loading enquiries from Google Sheets...</p>
              </div>
            )}

            {/* Empty */}
            {!loading&&enquiries.length===0&&!error&&(
              <div style={{textAlign:"center",padding:"80px 20px",color:T.textMuted}}>
                <div style={{fontSize:48,marginBottom:16,opacity:0.2}}>◫</div>
                <p style={{fontSize:15,marginBottom:8,color:T.textSoft}}>No enquiries yet</p>
                <p style={{fontSize:12}}>Send an email to the company inbox — n8n will process it and it'll appear here automatically.</p>
              </div>
            )}

            {/* Enquiry Cards */}
            {enquiries.map(enq=>(
              <div key={enq.id} onClick={()=>setSelectedId(enq.id===selectedId?null:enq.id)} style={{
                background:selectedId===enq.id?T.cardHover:T.card,border:`1px solid ${selectedId===enq.id?T.accent:T.border}`,
                borderRadius:8,padding:18,cursor:"pointer",marginBottom:10,transition:"all 0.15s"
              }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                      <span style={{fontWeight:700,fontSize:14,color:T.white}}>{enq.customer?.company||"Unknown"}</span>
                      <Badge t={enq.enquiry?.industry} c={T.blue} bg={T.blueDim}/>
                      <Badge t={enq.enquiry?.urgency?.toUpperCase()} c={urgCol(enq.enquiry?.urgency)} bg={urgBg(enq.enquiry?.urgency)}/>
                      {enq.enquiry?.attachments_mentioned&&<Badge t="📎 ATTACHMENTS" c={T.textSoft} bg={T.panel}/>}
                    </div>
                    <p style={{margin:0,fontSize:12,color:T.textSoft,lineHeight:1.5}}>{enq.summary}</p>
                  </div>
                  <div style={{textAlign:"right",marginLeft:16,flexShrink:0}}>
                    <div style={{fontSize:22,fontWeight:800,color:confCol(enq.confidence_score),fontFamily:"'IBM Plex Mono',monospace"}}>{enq.confidence_score}%</div>
                    <div style={{fontSize:9,color:T.textMuted,fontFamily:"'IBM Plex Mono',monospace"}}>CONF</div>
                  </div>
                </div>

                {selectedId===enq.id&&(
                  <div style={{marginTop:16,paddingTop:16,borderTop:`1px solid ${T.border}`,animation:"fadeUp 0.2s ease"}}>
                    <Lbl>Customer</Lbl>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:16}}>
                      <F l="Name" v={enq.customer?.name}/><F l="Company" v={enq.customer?.company}/>
                      <F l="Email" v={enq.customer?.email}/><F l="Phone" v={enq.customer?.phone}/>
                    </div>

                    <Lbl>Products</Lbl>
                    {enq.enquiry?.items?.length>0?enq.enquiry.items.map((item,i)=>(
                      <div key={i} style={{background:T.bg,borderRadius:6,padding:14,border:`1px solid ${T.border}`,marginBottom:8}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <span style={{fontWeight:700,fontSize:13,color:T.accent}}>{item.product_type}</span>
                          <Badge t={`QTY ${item.quantity}`} c={T.accent} bg={T.accentGlow}/>
                        </div>
                        <p style={{fontSize:12,color:T.textSoft,margin:"0 0 6px",lineHeight:1.5}}>{item.description}</p>
                        {item.dimensions&&(item.dimensions.length_mm||item.dimensions.width_mm||item.dimensions.height_mm)&&(
                          <div style={{fontSize:12,fontFamily:"'IBM Plex Mono',monospace",marginBottom:8}}>
                            <span style={{color:T.textMuted}}>Dims ({item.dimensions.type}): </span>
                            <span style={{color:T.blue,fontWeight:600}}>{item.dimensions.length_mm??"—"} × {item.dimensions.width_mm??"—"} × {item.dimensions.height_mm??"—"} mm</span>
                          </div>
                        )}
                        {item.requirements?.length>0&&(
                          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                            {item.requirements.map((r,j)=>(
                              <span key={j} style={{fontSize:10,padding:"2px 7px",background:T.panel,border:`1px solid ${T.border}`,borderRadius:4,color:T.textSoft,fontFamily:"'IBM Plex Mono',monospace"}}>{r}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )):(enq.items_detail&&<p style={{fontSize:12,color:T.textSoft,marginBottom:12}}>{enq.items_detail}</p>)}

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:8}}>
                      <div>
                        <Lbl>Services needed</Lbl>
                        {enq.enquiry?.services_needed?.length>0?enq.enquiry.services_needed.map((s,i)=>(
                          <div key={i} style={{fontSize:12,color:T.text,marginBottom:4}}><span style={{color:T.green,fontSize:10}}>●</span> {s}</div>
                        )):<span style={{fontSize:12,color:T.textMuted}}>None specified</span>}
                      </div>
                      <div>
                        <Lbl>Missing info</Lbl>
                        {enq.missing_info?.length>0?enq.missing_info.map((m,i)=>(
                          <div key={i} style={{fontSize:12,color:T.yellow,marginBottom:4}}>▲ {m}</div>
                        )):<span style={{fontSize:12,color:T.green}}>All info provided ✓</span>}
                      </div>
                    </div>

                    {enq.suggested_followup&&<div style={{marginTop:12}}><Lbl>Suggested follow-up</Lbl><p style={{fontSize:12,lineHeight:1.6,color:T.text}}>{enq.suggested_followup}</p></div>}
                    {enq.attachment_analysis&&<div style={{marginTop:12}}><Lbl>Attachment analysis</Lbl><p style={{fontSize:12,lineHeight:1.6,color:T.text}}>{enq.attachment_analysis}</p></div>}

                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:10,borderTop:`1px solid ${T.border}`}}>
                      <div style={{fontSize:12}}><span style={{color:T.textMuted}}>Deadline: </span><span style={{color:enq.enquiry?.deadline?T.white:T.textMuted,fontWeight:enq.enquiry?.deadline?600:400}}>{enq.enquiry?.deadline||"Not specified"}</span></div>
                      <div style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:T.textMuted}}>Processed: {enq.processed_at?new Date(enq.processed_at).toLocaleString():"—"}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ARCHITECTURE */}
        {view==="architecture"&&(
          <div style={{animation:"fadeUp 0.3s ease"}}>
            <h2 style={{margin:"0 0 4px",fontSize:20,fontWeight:800,color:T.white}}>System Architecture</h2>
            <p style={{margin:"0 0 28px",fontSize:12,color:T.textMuted}}>n8n automation backend + React dashboard frontend</p>

            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:32,marginBottom:24}}>
              <div style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:T.accent,marginBottom:20,textTransform:"uppercase",letterSpacing:"1.5px"}}>Automated pipeline</div>
              {[
                {i:"📧",t:"Gmail trigger",d:"n8n watches company inbox for new enquiry emails",tag:"n8n",tc:T.green},
                {i:"📎",t:"Attachment check",d:"Detects images/drawings → prepares base64 for Vision API",tag:"n8n",tc:T.green},
                {i:"🤖",t:"GPT-4o API",d:"Extracts customer, dimensions, requirements, use case + summarises",tag:"OpenAI",tc:T.accent},
                {i:"🖼️",t:"Vision processing",d:"If attachments: GPT-4o Vision analyses CAD drawings / product images",tag:"OpenAI",tc:T.accent},
                {i:"📊",t:"Google Sheets",d:"Structured data appended to enquiry tracker spreadsheet",tag:"n8n",tc:T.green},
                {i:"🔔",t:"Slack notification",d:"Team alerted with summary, urgency flag, missing info",tag:"n8n",tc:T.green},
                {i:"◫",t:"React dashboard",d:"This dashboard — reads from Google Sheets, auto-refreshes every 15s",tag:"Vercel",tc:T.blue},
              ].map((s,idx)=>(
                <div key={idx} style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32,flexShrink:0}}>
                    <div style={{width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,background:T.bg,borderRadius:6,border:`1px solid ${T.border}`}}>{s.i}</div>
                    {idx<6&&<div style={{width:1,height:24,background:T.border}}/>}
                  </div>
                  <div style={{paddingBottom:idx<6?16:0,flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:13,fontWeight:700,color:T.white}}>{s.t}</span>
                      <Badge t={s.tag} c={s.tc} bg={`${s.tc}22`}/>
                    </div>
                    <p style={{margin:"3px 0 0",fontSize:12,color:T.textSoft}}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
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

            <Panel title="Key decisions">
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
                {[
                  {q:"Why GPT-4o?",a:"Native JSON mode guarantees valid output. Vision API handles CAD drawings. Swappable with Claude or Gemini — same prompt works."},
                  {q:"Why n8n over Make?",a:"Self-hostable, no vendor lock-in, better code nodes. NSP keeps full control of their pipeline."},
                  {q:"Why Google Sheets?",a:"Zero learning curve. Everyone knows Sheets. Easy to graduate to a CRM later."},
                  {q:"Why confidence scoring?",a:"Team sees at a glance which enquiries are ready to quote vs which need follow-up."},
                ].map((d,i)=>(
                  <div key={i}>
                    <div style={{fontSize:12,fontWeight:700,color:T.accent,marginBottom:4}}>{d.q}</div>
                    <div style={{fontSize:12,color:T.textSoft,lineHeight:1.6}}>{d.a}</div>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        )}
      </main>
    </div>
  );
}

function Badge({t,c,bg}){return <span style={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,padding:"2px 8px",background:bg||`${c}22`,color:c,borderRadius:4,letterSpacing:"0.5px"}}>{t}</span>}
function F({l,v}){return <div><div style={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",color:"#586579",textTransform:"uppercase",letterSpacing:"0.5px",marginBottom:3}}>{l}</div><div style={{fontSize:13,color:v?"#e1e7ef":"#586579",fontWeight:v?500:400}}>{v||"—"}</div></div>}
function Lbl({children}){return <div style={{fontSize:10,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",color:"#586579",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:10}}>▸ {children}</div>}
function Panel({title,children}){return <div style={{background:"#171e2a",border:"1px solid #222d3d",borderRadius:8,padding:18,marginBottom:16}}><div style={{fontSize:10,fontWeight:700,fontFamily:"'IBM Plex Mono',monospace",color:"#e8771a",letterSpacing:"1.5px",marginBottom:14,paddingBottom:10,borderBottom:"1px solid #222d3d"}}>{title}</div>{children}</div>}
function P({children,last}){return <p style={{fontSize:12,lineHeight:1.8,color:"#94a3b8",margin:last?"0":"0 0 8px"}}>{children}</p>}
