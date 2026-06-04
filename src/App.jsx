import { useState, useRef } from "react";

// API keys from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY || "";
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_KEY || "";

const MEMES = [
  { id:0, img:"/memes/000.png", caption:"GOT NAME?", sentiment:"happiness", intention:"entertaining", script:"Hey there, got a meme to share. Let's see what you've got." },
  { id:5, img:"/memes/005.png", caption:"Upside down Mr.Potato Head looks exactly like Steve Harvey", sentiment:"happiness", intention:"entertaining", script:"Check out Mr. Potato Head flipped upside down. He's giving Steve Harvey some serious competition with that look." },
  { id:9, img:"/memes/009.png", caption:"That moment when you still don't know her last name", sentiment:"happiness", intention:"entertaining", script:"That moment when you realize you still don't know Penny's last name. Classic Big Bang Theory mystery." },
  { id:1, img:"/memes/001.png", caption:"SOME MAGICIANS CAN WALK ON WATER CHUCK NORRIS CAN SWIM THROUGH LAND.", sentiment:"love", intention:"entertaining", script:"Some magicians can walk on water, but Chuck Norris? He swims through land with ease." },
  { id:2, img:"/memes/002.png", caption:"My doors is always open, but i shall never drag you through it.", sentiment:"love", intention:"expressive", script:"My heart's door is always open, but I'll never force you inside. Enter only when you're truly welcome." },
  { id:11, img:"/memes/011.png", caption:"Remember him? Yeah, he's growing up...", sentiment:"love", intention:"entertaining", script:"Remember this little champion? Time flies, he's growing up right before our eyes." },
  { id:3, img:"/memes/003.png", caption:"I DON'T KNOW WHO YOU ARE I'VE LOST ALL MY PHONE CONTACTS", sentiment:"fear", intention:"entertaining", script:"Uh-oh, I have no clue who you are. I accidentally wiped all my contacts." },
  { id:14, img:"/memes/014.png", caption:"CHILL DUDE I ONLY TOOK ONE COOKIE. OKK?", sentiment:"fear", intention:"expressive", script:"Whoa calm down I swear I just took one cookie okay please don't be mad." },
  { id:26, img:"/memes/026.png", caption:"When you login to your neighbors router using 1234", sentiment:"fear", intention:"entertaining", script:"Sneaking into your neighbour's Wi-Fi feels like walking a tightrope. Exciting, but one wrong step might just expose you." },
  { id:4, img:"/memes/004.png", caption:"I'M DREAMING OF A WHITE CHRISTMAS", sentiment:"sorrow", intention:"expressive", script:"Wishing for a peaceful, snowy Christmas feels a little bittersweet this year." },
  { id:8, img:"/memes/008.png", caption:"HOW YOU FEEL WHEN IT'S BEEN 500 DAYS WITHOUT NEW GAME OF THRONES", sentiment:"sorrow", intention:"entertaining", script:"Waiting 500 days without new Game of Thrones episodes feels like endless boredom and growing sadness." },
  { id:13, img:"/memes/013.png", caption:"You can't see me, I am a flower...", sentiment:"sorrow", intention:"entertaining", script:"Trying to blend in like a shy flower, but those horns give the game away." },
  { id:6, img:"/memes/006.png", caption:"PEOPLE KEPT CALLING ME AVERY BULLOCK FROM AMERICAN DAD", sentiment:"surprise", intention:"entertaining", script:"People kept saying I'm Avery Bullock from American Dad. No way! I'm serious about my job and could take him down if I wanted." },
  { id:7, img:"/memes/007.png", caption:"WHAT IF THERE'S MORE TO LIFE THAN TREATS AND CATNIP", sentiment:"surprise", intention:"entertaining", script:"Wait, what if life is about more than just treats and catnip? Mind blown!" },
  { id:19, img:"/memes/019.png", caption:"Me, A new Spongebob Meme format, The Internet", sentiment:"anger", intention:"expressive", script:"Here I am caught in the internet's endless chew like a new SpongeBob meme devouring what's left of my patience." },
  { id:29, img:"/memes/029.png", caption:"YOU ARE RUBBISH", sentiment:"anger", intention:"offensive", script:"You're nothing but yesterday's garbage. Trash with no value." },
  { id:25, img:"/memes/025.png", caption:"Friends: you should drink less. Me: LESS", sentiment:"hate", intention:"entertaining", script:"Friends say, drink less, but I'm all about going more, raising the bottle like a warrior charging into battle." },
  { id:35, img:"/memes/035.png", caption:"Edward... you sparkle. I know. That's kind of gay.", sentiment:"hate", intention:"offensive", script:"Edward, you sparkle. I know. And that's honestly pretty lame." },
  { id:47, img:"/memes/047.png", caption:"Princess Leia then and now. Feel old yet?", sentiment:"hate", intention:"offensive", script:"Look at Princess Leia, once a galactic hero, now just a tired old man, feeling ancient yet?" },
];

const SENTIMENTS=["Happiness","Love","Anger","Sorrow","Fear","Hate","Surprise"];
const SK=["happiness","love","anger","sorrow","fear","hate","surprise"];

const MOODS=[
  {id:"default",label:"Default",axis:-1},
  {id:"happiness",label:"Happiness",axis:0},
  {id:"love",label:"Love",axis:1},
  {id:"anger",label:"Anger",axis:2},
  {id:"sorrow",label:"Sorrow",axis:3},
  {id:"fear",label:"Fear",axis:4},
  {id:"hate",label:"Hate",axis:5},
  {id:"surprise",label:"Surprise",axis:6},
];

const CT={emotional_inversion:{l:"Emotional inversion",c:"#7c6bc4"},contextual_subversion:{l:"Contextual subversion",c:"#c4713c"},cultural_reference:{l:"Cultural reference",c:"#3c967c"},absurdist_juxtaposition:{l:"Absurdist juxtaposition",c:"#3c7cc4"},ironic_understatement:{l:"Ironic understatement",c:"#c43c7c"}};
const IX={conflict:{l:"Conflict",c:"#c43c7c"},synergy:{l:"Synergy",c:"#3c967c"},redundancy:{l:"Redundancy",c:"#96783c"}};

function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]];}return b;}

// Gemini-powered meme analysis (replaces hardcoded genA)
async function analyzeWithGemini(meme) {
  try {
    const prompt = `Analyze this meme for affective audio generation. Caption: "${meme.caption}" Sentiment: ${meme.sentiment} Intention: ${meme.intention}

Return ONLY valid JSON with this exact structure:
{"is":[7 floats 0-1 for Happiness,Love,Anger,Sorrow,Fear,Hate,Surprise based on IMAGE visual mood],"ts":[same 7 for TEXT mood],"ct":"emotional_inversion|contextual_subversion|cultural_reference|absurdist_juxtaposition|ironic_understatement","it":"conflict|synergy|redundancy","im":"2-3 word image mood","tm":"2-3 word text mood","fm":"short fused mood phrase","ce":"one sentence explaining the cross-modal interaction"}`;

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ contents:[{parts:[{text:prompt}]}], generationConfig:{responseMimeType:"application/json"} })
    });
    const d = await r.json();
    const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text);
  } catch(e) {
    console.error("Gemini analysis failed, using fallback:", e);
    return genFallback(meme);
  }
}

// Fallback if Gemini fails
function genFallback(m) {
  const si=SK.indexOf(m.sentiment),ci=(si+3)%7;
  const is=SK.map((_,i)=>+(i===si?.35+Math.random()*.2:.04+Math.random()*.1).toFixed(3));
  const ts=SK.map((_,i)=>+(i===ci?.5+Math.random()*.3:i===si?.07+Math.random()*.1:.04+Math.random()*.12).toFixed(3));
  const d=Math.sqrt(is.reduce((s,v,i)=>s+(v-ts[i])**2,0)/7);
  const tps=Object.keys(CT);
  return{is,ts,ct:tps[Math.floor(Math.abs(si*1.7)%tps.length)],
    it:d>.25?"conflict":d>.15?"synergy":"redundancy",
    im:["Calm, composed","Joyful, warm","Warm, gentle","Tense, uneasy","Melancholic, quiet","Hostile, cold","Startled, alert"][si],
    tm:["Anxious, urgent","Playful, light","Aggressive, sharp","Resigned, flat","Panicked, desperate","Bitter, cutting","Confused, lost"][ci],
    fm:["Sarcastic calm","Ironic affection","Tense warmth","Resigned tension","Melancholic panic","Cold bitterness","Bewildered alertness"][si],
    ce:"Image conveys "+["calm","joy","warmth","tension","sadness","hostility","surprise"][si]+" while text suggests "+["anxiety","playfulness","aggression","resignation","panic","bitterness","confusion"][ci]};
}

// Gemini TTS voice generation
async function geminiTTS(text, mood) {
  const voiceMap = {
    default:"Kore", happiness:"Kore", love:"Aoede", anger:"Fenrir",
    sorrow:"Aoede", fear:"Puck", hate:"Fenrir", surprise:"Puck",
  };
  const voice = voiceMap[mood] || "Kore";

  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      contents:[{parts:[{text:`Say with ${mood} emotion: ${text}`}]}],
      generationConfig:{
        responseModalities:["AUDIO"],
        speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:voice}}}
      }
    })
  });
  const d = await r.json();
  const pcmData = d.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!pcmData) throw new Error("No audio data");
  return pcmToWavUrl(pcmData, 24000);
}

// Convert PCM16 to WAV for browser playback
function pcmToWavUrl(base64Pcm, sampleRate) {
  const bin = atob(base64Pcm);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i=0;i<len;i++) bytes[i]=bin.charCodeAt(i);
  const hdr = new ArrayBuffer(44);
  const v = new DataView(hdr);
  const w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  w(0,'RIFF');v.setUint32(4,36+len,true);w(8,'WAVE');
  w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);
  v.setUint16(22,1,true);v.setUint32(24,sampleRate,true);v.setUint32(28,sampleRate*2,true);
  v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,len,true);
  return URL.createObjectURL(new Blob([hdr,bytes],{type:'audio/wav'}));
}

function Radar({is,ts,fs,vs}){
  const cx=170,cy=170,r=130,n=7;
  const pt=(i,v)=>{const a=Math.PI*2*i/n-Math.PI/2;return[cx+r*v*Math.cos(a),cy+r*v*Math.sin(a)];};
  const poly=s=>s.map((v,i)=>pt(i,v).join(",")).join(" ");
  return(
    <svg viewBox="0 0 340 340" style={{width:"100%"}}>
      {[.25,.5,.75,1].map(l=><polygon key={l} points={Array.from({length:n},(_,i)=>pt(i,l).join(",")).join(" ")} fill="none" stroke="rgba(0,0,0,.06)" strokeWidth=".5"/>)}
      {SENTIMENTS.map((_,i)=>{const[x,y]=pt(i,1);return<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(0,0,0,.04)" strokeWidth=".5"/>;})}
      <polygon points={poly(is)} fill="rgba(100,140,220,.1)" stroke="rgba(100,140,220,.6)" strokeWidth="1.5"/>
      <polygon points={poly(ts)} fill="rgba(220,120,80,.1)" stroke="rgba(220,120,80,.6)" strokeWidth="1.5"/>
      <polygon points={poly(fs)} fill="rgba(150,130,220,.08)" stroke="rgba(150,130,220,.5)" strokeWidth="1.5" strokeDasharray="4 2"/>
      <polygon points={poly(vs)} fill="rgba(60,180,140,.16)" stroke="rgba(60,180,140,.8)" strokeWidth="2.5"/>
      {SENTIMENTS.map((l,i)=>{const[x,y]=pt(i,1.22);return<text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="rgba(0,0,0,.35)" fontFamily="system-ui">{l}</text>;})}
      {is.map((v,i)=>{const[x,y]=pt(i,v);return<circle key={"i"+i} cx={x} cy={y} r="3" fill="rgba(100,140,220,.7)"/>;})}
      {ts.map((v,i)=>{const[x,y]=pt(i,v);return<circle key={"t"+i} cx={x} cy={y} r="3" fill="rgba(220,120,80,.7)"/>;})}
      {fs.map((v,i)=>{const[x,y]=pt(i,v);return<circle key={"f"+i} cx={x} cy={y} r="3.5" fill="rgba(150,130,220,.6)"/>;})}
      {vs.map((v,i)=>{const[x,y]=pt(i,v);return<circle key={"v"+i} cx={x} cy={y} r="5" fill="rgba(60,180,140,.85)"/>;})}
    </svg>);
}

export default function App(){
  const[picks,setPicks]=useState(()=>shuffle(MEMES).slice(0,5));
  const[sel,setSel]=useState(null);
  const[data,setData]=useState(null);
  const[moodId,setMoodId]=useState("default");
  const[playing,setPlaying]=useState(false);
  const audioRef=useRef(null);

  const[loading,setLoading]=useState(false);

  const stop=()=>{if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;}setPlaying(false);};
  const doShuffle=()=>{setPicks(shuffle(MEMES).slice(0,5));setSel(null);setData(null);stop();};
  const doSelect=async(m)=>{
    setSel(m);setData(null);setMoodId("default");stop();setLoading(true);
    const analysis = await analyzeWithGemini(m);
    setData(analysis);
    setLoading(false);
  };

  const fs=data?data.is.map((v,i)=>(v+data.ts[i])/2):null;
  const curMood=MOODS.find(m=>m.id===moodId);
  const vs=fs?(moodId==="default"?[...fs]:fs.map((v,i)=>{
    const boost = i===curMood.axis ? 0.6 : (Math.abs(i-curMood.axis)===1||(curMood.axis===0&&i===6)||(curMood.axis===6&&i===0)) ? 0.2 : -0.1;
    return Math.min(1,Math.max(0.02, v + boost));
  })):null;
  const dist=data?Math.sqrt(data.is.reduce((s,v,i)=>s+(v-data.ts[i])**2,0)/7).toFixed(2):"0";

  const[generating,setGenerating]=useState(false);

  const playOriginal=()=>{
    if(!sel)return; stop();
    const id=String(sel.id).padStart(3,"0");
    const a=new Audio(`/audio/${id}_script.mp3`);
    audioRef.current=a;
    a.onplay=()=>setPlaying(true);
    a.onended=()=>setPlaying(false);
    a.onerror=()=>{setPlaying(false);alert("Audio file not found");};
    a.play().catch(()=>setPlaying(false));
  };

  const generateAndPlay=async()=>{
    if(!sel)return;
    setGenerating(true); stop();
    try{
      const audioUrl = await geminiTTS(sel.script, moodId);
      const a = new Audio(audioUrl);
      audioRef.current = a;
      a.onplay=()=>setPlaying(true);
      a.onended=()=>{setPlaying(false);URL.revokeObjectURL(audioUrl);};
      a.onerror=()=>{setPlaying(false);};
      a.play().catch(()=>setPlaying(false));
    }catch(e){console.error("TTS error:",e);}
    setGenerating(false);
  };

  const fileRef=useRef(null);
  const handleUpload=(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    const url=URL.createObjectURL(file);
    const uploaded={id:"upload",img:url,caption:"User uploaded meme",sentiment:"unknown",intention:"unknown",script:"Uploaded meme — analyzing..."};
    setSel(uploaded);setData(null);setMoodId("default");stop();setLoading(true);
    analyzeWithGemini(uploaded).then(a=>{ setData(a); setLoading(false); });
  };

  const moodLabel=moodId==="default"?"Default (= Fused)":curMood?.label||"Default";

  return(
    <div style={{position:"relative",minHeight:"100vh",fontFamily:"'SF Pro Display','Segoe UI',system-ui,sans-serif",color:"#2a2440",background:"#ffffff"}}>
      {/* Clean white background */}

      <div style={{position:"relative",zIndex:1,maxWidth:800,margin:"0 auto",padding:"32px 24px"}}>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:6}}>
            <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,rgba(127,119,221,.9),rgba(83,74,183,.9))",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <h1 style={{fontSize:30,fontWeight:700,margin:0,letterSpacing:"-0.5px",color:"#2a2440"}}>MemeSonic</h1>
          </div>
          <p style={{fontSize:13,color:"#9994ad",margin:0,letterSpacing:".4px",fontWeight:400}}>Unified affective meme audio generation & retrieval</p>
        </div>

        {/* Explore bar */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",background:"rgba(255,255,255,.7)",backdropFilter:"blur(12px)",borderRadius:16,border:"1px solid rgba(200,195,220,.3)",marginBottom:22}}>
          <span style={{fontSize:10,fontWeight:700,color:"#b5b0cc",textTransform:"uppercase",letterSpacing:"1.5px",flexShrink:0}}>Explore</span>
          <div style={{display:"flex",gap:8,flex:1,justifyContent:"center"}}>
            {picks.map(m=>(
              <div key={m.id} onClick={()=>doSelect(m)} style={{width:54,height:54,borderRadius:12,overflow:"hidden",cursor:"pointer",flexShrink:0,border:sel?.id===m.id?"2.5px solid rgba(127,119,221,.8)":"2px solid rgba(200,195,220,.3)",transition:"all .25s ease",transform:sel?.id===m.id?"scale(1.08)":"scale(1)",boxShadow:sel?.id===m.id?"0 4px 16px rgba(127,119,221,.2)":"none"}}>
                <img src={m.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
              </div>
            ))}
          </div>
          <button onClick={doShuffle} style={{fontSize:11,padding:"8px 16px",borderRadius:10,border:"none",background:"rgba(127,119,221,.1)",cursor:"pointer",color:"#7F77DD",fontWeight:600}}>Shuffle</button>
          <label style={{fontSize:11,padding:"8px 16px",borderRadius:10,border:"none",background:"#7F77DD",cursor:"pointer",color:"#fff",fontWeight:600}}>
            Upload
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{display:"none"}}/>
          </label>
        </div>

        {!sel&&!loading&&<div style={{textAlign:"center",padding:"80px 20px",color:"#c8c4da",fontSize:15,fontWeight:500}}>Select a meme to begin</div>}

      {loading&&(
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{width:36,height:36,border:"3px solid rgba(200,195,220,.3)",borderTopColor:"#7F77DD",borderRadius:"50%",animation:"spin .8s linear infinite",margin:"0 auto 16px"}}/>
          <p style={{fontSize:14,color:"#9994ad",margin:0}}>Analyzing meme with Gemini...</p>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

        {sel&&data&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {/* LEFT: Meme image + layer analysis */}
            <div>
              <div style={{background:"#fff",borderRadius:14,border:"1px solid #eee",overflow:"hidden",marginBottom:12}}>
                <img src={sel.img} alt={sel.caption} style={{width:"100%",display:"block"}}/>
                <div style={{fontSize:11,color:"#8a8598",padding:"10px 14px",lineHeight:1.5,fontStyle:"italic",borderTop:"1px solid #f0f0f0"}}>"{sel.caption}"</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {[
                  {label:"Image",mood:data.im,dot:"rgba(100,140,220,.7)",bg:"rgba(100,140,220,.06)",bc:"rgba(100,140,220,.15)",tc:"rgba(60,100,180,.7)"},
                  {label:"Text",mood:data.tm,dot:"rgba(220,120,80,.7)",bg:"rgba(220,120,80,.06)",bc:"rgba(220,120,80,.15)",tc:"rgba(180,80,40,.7)"},
                  {label:"Fused",mood:data.fm,dot:"rgba(150,130,220,.7)",bg:"rgba(150,130,220,.06)",bc:"rgba(150,130,220,.15)",tc:"rgba(100,80,180,.7)"},
                ].map(l=>(
                  <div key={l.label} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:l.bg,border:`1px solid ${l.bc}`}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:l.dot,flexShrink:0}}/>
                    <span style={{fontSize:11,fontWeight:600,color:l.tc,minWidth:38}}>{l.label}</span>
                    <span style={{fontSize:11,color:l.tc,opacity:.8}}>{l.mood}</span>
                  </div>
                ))}
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                  {IX[data.it]&&<span style={{fontSize:9,padding:"3px 10px",borderRadius:12,background:"#f8f8f8",border:"1px solid #eee",color:IX[data.it].c,fontWeight:600}}>{IX[data.it].l}</span>}
                  {CT[data.ct]&&<span style={{fontSize:9,padding:"3px 10px",borderRadius:12,background:"#f8f8f8",border:"1px solid #eee",color:CT[data.ct].c,fontWeight:600}}>{CT[data.ct].l}</span>}
                </div>
                <p style={{fontSize:10,color:"#bbb",margin:"2px 0 0"}}>Distance: <span style={{color:"#c0392b",fontWeight:700,fontFamily:"monospace"}}>{dist}</span></p>
                <p style={{fontSize:9,color:"#ccc",margin:"2px 0 0",lineHeight:1.3}}>{data.ce}</p>
              </div>
            </div>

            {/* RIGHT: Radar + Mood + Voice */}
            <div>
              <div style={{display:"flex",gap:10,fontSize:10,color:"#999",marginBottom:6}}>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:"rgba(100,140,220,.6)"}}/> Image</span>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:"rgba(220,120,80,.6)"}}/> Text</span>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:9,height:2.5,background:"rgba(150,130,220,.5)",borderRadius:2}}/> Fused</span>
                <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:"rgba(60,180,140,.8)"}}/> <span style={{fontWeight:600}}>Voice</span></span>
              </div>
              <div style={{background:"#fafafa",borderRadius:12,padding:"8px 4px",border:"1px solid #f0f0f0",marginBottom:12}}>
                <Radar is={data.is} ts={data.ts} fs={fs} vs={vs}/>
              </div>

              <p style={{fontSize:9,fontWeight:700,color:"#bbb",textTransform:"uppercase",letterSpacing:"1.5px",margin:"0 0 6px"}}>Select mood</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4,marginBottom:10}}>
                {MOODS.map(m=>(
                  <button key={m.id} onClick={()=>setMoodId(m.id)}
                    style={{padding:"7px 4px",fontSize:10,border:moodId===m.id?"2px solid #7F77DD":"1px solid #eee",borderRadius:8,background:moodId===m.id?"#f5f3ff":"#fff",cursor:"pointer",fontWeight:moodId===m.id?600:400,color:moodId===m.id?"#534AB7":"#999"}}>
                    {m.label}
                  </button>
                ))}
              </div>

              <div style={{display:"flex",gap:6,marginBottom:8}}>
                <button onClick={playing?stop:playOriginal}
                  style={{flex:1,padding:10,border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",
                    background:playing?"linear-gradient(135deg,#E24B4A,#A32D2D)":"linear-gradient(135deg,#648CDC,#3C64B4)",color:"#fff"}}>
                  {playing?"Stop":"Play original"}
                </button>
                {moodId!=="default"&&(
                  <button onClick={generating?undefined:generateAndPlay} disabled={generating}
                    style={{flex:1,padding:10,border:"none",borderRadius:8,fontSize:11,fontWeight:600,cursor:generating?"wait":"pointer",
                      background:generating?"#eee":"linear-gradient(135deg,#3CB48C,#0F6E56)",color:generating?"#999":"#fff"}}>
                    {generating?"Generating...":"Apply mood"}
                  </button>
                )}
              </div>

              <div style={{padding:"10px 14px",background:"#fafafa",borderRadius:10,border:"1px solid #f0f0f0"}}>
                <p style={{fontSize:10,color:"#bbb",margin:"0 0 4px"}}>Script</p>
                <p style={{fontSize:12,color:"#444",margin:0,fontStyle:"italic",lineHeight:1.6}}>"{sel.script}"</p>
                <p style={{fontSize:9,color:"#ccc",margin:"4px 0 0"}}>{moodLabel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:36,paddingTop:18,borderTop:"1px solid rgba(200,195,220,.2)",textAlign:"center"}}>
          <p style={{fontSize:10,color:"#c8c4da",margin:"0 0 4px",letterSpacing:".4px"}}>Meme input → Layer separation → Conflict detection → Mood extraction → Voice generation</p>
          <p style={{fontSize:9,color:"#d8d4ea",margin:0}}>© 2026 Hongbee Park, Ruyi Yang, Yiqiao Huang · MIT Media Lab · Modeling Multimodal AI</p>
        </div>
      </div>
    </div>
  );
}
