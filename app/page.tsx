 "use client";

import { useMemo, useState } from "react";

type Holding = {
  id:number; name:string; type:"Indian MF"|"US Equity"; value:number; expected:number; risk:number;
};

const initial:Holding[] = [
  {id:1,name:"Nippon India Small Cap",type:"Indian MF",value:96965,expected:12.5,risk:24},
  {id:2,name:"Kotak Arbitrage Fund",type:"Indian MF",value:75500,expected:7.0,risk:5},
  {id:3,name:"Motilal Oswal Midcap",type:"Indian MF",value:55732,expected:13.0,risk:23},
  {id:4,name:"Quant ELSS Tax Saver",type:"Indian MF",value:51692,expected:12.0,risk:22},
  {id:5,name:"HDFC Mid Cap Fund",type:"Indian MF",value:50832,expected:12.5,risk:22},
  {id:6,name:"Parag Parikh Flexi Cap",type:"Indian MF",value:74500,expected:11.5,risk:18},
  {id:7,name:"Parag Parikh ELSS Tax Saver",type:"Indian MF",value:35000,expected:11.5,risk:19},
  {id:8,name:"NVDA",type:"US Equity",value:82100,expected:14.0,risk:32},
  {id:9,name:"SOXX",type:"US Equity",value:52600,expected:10.5,risk:25},
  {id:10,name:"VOO",type:"US Equity",value:12400,expected:9.5,risk:17},
  {id:11,name:"Roundhill Memory ETF",type:"US Equity",value:9400,expected:12.0,risk:30}
];

const fmt=(n:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(n);
const clamp=(x:number,a:number,b:number)=>Math.min(b,Math.max(a,x));

function forecast(start:number,sip:number,step:number,years:number,rate:number,vol:number){
  const months=years*12, paths=800, out:number[][]=[];
  for(let p=0;p<paths;p++){
    let v=start, series:number[]=[];
    for(let m=1;m<=months;m++){
      const annual = rate + vol*(Math.random()*2-1)*0.9;
      const monthly=Math.pow(1+annual/100,1/12)-1;
      const monthlySip=sip*Math.pow(1+step/100,Math.floor((m-1)/12));
      v=v*(1+monthly)+monthlySip;
      if(m%12===0) series.push(v);
    }
    out.push(series);
  }
  return Array.from({length:years},(_,i)=>{
    const vals=out.map(x=>x[i]).sort((a,b)=>a-b);
    return {year:i+1,p10:vals[Math.floor(paths*.1)],p50:vals[Math.floor(paths*.5)],p90:vals[Math.floor(paths*.9)]};
  });
}

export default function Home(){
  const [holdings,setHoldings]=useState(initial);
  const [risk,setRisk]=useState<"Conservative"|"Balanced"|"Aggressive">("Balanced");
  const [sip,setSip]=useState(30000);
  const [step,setStep]=useState(10);
  const [years,setYears]=useState(10);
  const [returnAssumption,setReturnAssumption]=useState(11);
  const [vol,setVol]=useState(16);

  const total=holdings.reduce((a,h)=>a+h.value,0);
  const weightedReturn=holdings.reduce((a,h)=>a+h.value*h.expected,0)/total;
  const weightedRisk=holdings.reduce((a,h)=>a+h.value*h.risk,0)/total;

  const target = risk==="Conservative"
    ? {equity:55,midSmall:15,stable:30}
    : risk==="Balanced"
    ? {equity:70,midSmall:20,stable:10}
    : {equity:82,midSmall:28,stable:0};

  const suggestions=useMemo(()=>{
    const stable=holdings.filter(h=>h.name.includes("Arbitrage")).reduce((a,h)=>a+h.value,0);
    const mid=holdings.filter(h=>/Midcap|Small Cap|ELSS/.test(h.name)).reduce((a,h)=>a+h.value,0);
    const us=holdings.filter(h=>h.type==="US Equity").reduce((a,h)=>a+h.value,0);
    return {stable,mid,us};
  },[holdings]);

  const forecastData=useMemo(()=>forecast(total,sip,step,years,returnAssumption,vol),[total,sip,step,years,returnAssumption,vol]);

  function update(id:number,key:"value"|"expected"|"risk",value:number){
    setHoldings(h=>h.map(x=>x.id===id?{...x,[key]:value}:x));
  }
  function reset(){setHoldings(initial);setRisk("Balanced");setSip(30000);setStep(10);setYears(10);setReturnAssumption(11);setVol(16)}

  return <main>
    <header className="top">
      <div><div className="eyebrow">PERSONAL INVESTING LAB</div><h1>Portfolio Optimizer</h1><p>Allocation, risk & 10-year wealth forecasting — built around your existing holdings.</p></div>
      <button className="ghost" onClick={reset}>Reset assumptions</button>
    </header>

    <section className="hero-grid">
      <div className="card hero">
        <span>Current portfolio</span><strong>{fmt(total)}</strong>
        <div className="metrics"><div><small>Weighted expected return</small><b>{weightedReturn.toFixed(1)}%</b></div><div><small>Risk score</small><b>{weightedRisk.toFixed(1)}</b></div><div><small>Monthly SIP</small><b>{fmt(sip)}</b></div></div>
      </div>
      <div className="card">
        <div className="section-title">Risk profile</div>
        <div className="seg">{(["Conservative","Balanced","Aggressive"] as const).map(x=><button key={x} className={risk===x?"active":""} onClick={()=>setRisk(x)}>{x}</button>)}</div>
        <p className="muted">Target mix: {target.equity}% core equity · {target.midSmall}% mid/small · {target.stable}% stable.</p>
      </div>
    </section>

    <section className="grid2">
      <div className="card">
        <div className="section-title">Your holdings</div>
        <p className="muted">Values are editable. The app treats these as the optimizer's starting universe.</p>
        <div className="table-wrap"><table><thead><tr><th>Holding</th><th>Value</th><th>Exp. return</th><th>Risk</th></tr></thead><tbody>
          {holdings.map(h=><tr key={h.id}><td><b>{h.name}</b><small>{h.type}</small></td><td><input type="number" value={h.value} onChange={e=>update(h.id,"value",+e.target.value)}/></td><td><input type="number" step=".5" value={h.expected} onChange={e=>update(h.id,"expected",+e.target.value)}/>%</td><td><input type="number" step=".5" value={h.risk} onChange={e=>update(h.id,"risk",+e.target.value)}/></td></tr>)}
        </tbody></table></div>
      </div>

      <div className="card">
        <div className="section-title">Optimizer readout</div>
        <div className="bars">
          <Bar label="US equity" value={suggestions.us/total*100}/>
          <Bar label="Mid/small + ELSS" value={suggestions.mid/total*100}/>
          <Bar label="Stable / arbitrage" value={suggestions.stable/total*100}/>
        </div>
        <div className="recommend"><b>What I'd change first</b><p>{risk==="Conservative"?"Increase stable allocation and trim concentrated US/thematic exposure.":risk==="Balanced"?"Reduce overlapping mid-cap exposure and use new SIP money to rebalance rather than selling everything.":"Keep growth exposure, but cap single-stock/thematic concentration and let broad-market equity do more of the heavy lifting."}</p></div>
        <div className="notice">This is an analytical model, not personalized financial advice. Return/risk assumptions are editable estimates.</div>
      </div>
    </section>

    <section className="card">
      <div className="section-title">10-year forecast</div>
      <div className="controls">
        <label>Monthly SIP ₹<input type="number" value={sip} onChange={e=>setSip(+e.target.value)}/></label>
        <label>Annual SIP step-up %<input type="number" value={step} onChange={e=>setStep(+e.target.value)}/></label>
        <label>Horizon years<input type="number" min="1" max="30" value={years} onChange={e=>setYears(clamp(+e.target.value,1,30))}/></label>
        <label>Expected annual return %<input type="number" step=".5" value={returnAssumption} onChange={e=>setReturnAssumption(+e.target.value)}/></label>
        <label>Annual volatility %<input type="number" step=".5" value={vol} onChange={e=>setVol(+e.target.value)}/></label>
      </div>
      <div className="chart">
        {forecastData.map(d=><div className="barcol" key={d.year} title={`Year ${d.year}: ${fmt(d.p50)}`}><div className="range" style={{height:`${Math.max(8,d.p90/forecastData[forecastData.length-1].p90*170)}px`}}><i style={{bottom:`${(d.p10/d.p90)*100}%`}}></i></div><span>Y{d.year}</span></div>)}
      </div>
      <div className="forecast-cards">
        {forecastData.filter((_,i)=>[0,4,9,years-1].includes(i)).map(d=><div key={d.year}><small>Year {d.year}</small><b>{fmt(d.p50)}</b><span>10–90%: {fmt(d.p10)} – {fmt(d.p90)}</span></div>)}
      </div>
    </section>

    <footer>Last updated with the portfolio snapshot available in this build. Replace approximate values with your latest broker/MF statement before relying on outputs.</footer>
  </main>
}

function Bar({label,value}:{label:string,value:number}){return <div className="barrow"><div><span>{label}</span><b>{value.toFixed(1)}%</b></div><div className="track"><i style={{width:`${Math.min(100,value)}%`}}/></div></div>}
