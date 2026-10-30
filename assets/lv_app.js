
'use strict';
const D=JSON.parse(document.getElementById('lvdata').textContent),R=D.rows,H=D.headers;
let page='main',sort='type',dir='desc',mapView='theme',query='';
const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=n=>typeof n==='number'?n.toLocaleString('ko-KR'):String(n||'미확인');
const cardMoney=v=>v===''||v===null||v===undefined||!Number.isFinite(Number(v))?'미확인':Math.round(Number(v)).toLocaleString('ko-KR');
const theme=r=>{const t=String(r['테마']||'').trim();return !t||/미확인|검증자료 없음|조회 미실시|정보 없음/.test(t)?'테마 미확인':t};
const numeric=(r,k)=>{const v=Number(r[k]);return Number.isFinite(v)?v:0};
const typeorder={'거래량·가격 동시':0,'가격최저':1,'거래량최저':2};
const sorted=rs=>rs.sort((a,b)=>{if(sort==='type')return (typeorder[a['검색유형']]??9)-(typeorder[b['검색유형']]??9)||numeric(b,'당일거래량')-numeric(a,'당일거래량');if(sort==='theme')return theme(a).localeCompare(theme(b),'ko')||numeric(b,'당일거래량')-numeric(a,'당일거래량')||numeric(b,'거래대금(억원)')-numeric(a,'거래대금(억원)');const k=sort==='volume'?'당일거래량':'거래대금(억원)';return (dir==='desc'?-1:1)*(numeric(a,k)-numeric(b,k))||String(a['종목코드']).localeCompare(String(b['종목코드']))});
const sector=r=>{const t=String(r['업종·주요사업']||'').trim();return !t||/미확인|검증자료 없음|조회 미실시|정보 없음/.test(t)?'업종 미확인':t};
function populateFacet(id,items,label){const el=$(id);el.innerHTML='<option value="all">전체 '+label+'</option>'+Array.from(new Set(items)).sort((a,b)=>a.localeCompare(b,'ko')).map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');}
function inRange(raw,v,kind){if(v==='all')return true;const n=Number(raw),valid=raw!==''&&raw!==null&&raw!==undefined&&Number.isFinite(n);if(v==='missing')return !valid;if(!valid)return false;if(kind==='volume')return v==='v1'?n<10000:v==='v2'?n>=10000&&n<100000:v==='v3'?n>=100000&&n<500000:n>=500000;return v==='m1'?n<1:v==='m2'?n>=1&&n<10:v==='m3'?n>=10&&n<50:n>=50;}
function combinedMatch(r){const selected=$('industryThemeFilter').value;if(selected==='all')return true;return theme(r)===selected||sector(r)===selected;}
function highGapMatch(r){const v=$('lvHighGapFilter').value;if(v==='all')return true;const raw=r['20봉 고가 대비 종가(%)'];const n=Number(raw);if(raw===''||raw===null||raw===undefined||!Number.isFinite(n))return v==='missing';return v==='below-20'?n< -20:v==='-20--10'?n>= -20&&n< -10:v==='-10-0'?n>= -10&&n<0:v==='0-plus'?n>=0:false;}
function matchesFilters(r){const t=$('typeFilter').value,th=$('themeFilter').value,se=$('sectorFilter').value;const q=query.trim().toLowerCase();return combinedMatch(r)&&highGapMatch(r)&&(t==='all'||r['검색유형']===t)&&(th==='all'||theme(r)===th)&&(se==='all'||sector(r)===se)&&inRange(r['당일거래량'],$('volumeFilter').value,'volume')&&inRange(r['거래대금(억원)'],$('moneyFilter').value,'money')&&(!q||[r['종목코드'],r['종목명'],r['테마'],r['업종·주요사업']].some(v=>String(v??'').toLowerCase().includes(q)));}
function updateFilterStatus(count){const active=[...['typeFilter','themeFilter','sectorFilter','volumeFilter','moneyFilter','industryThemeFilter','lvHighGapFilter'].map(id=>$(id).value).filter(v=>v!=='all'),...(query.trim()?[query.trim()]:[])];$('filterStatus').textContent=active.length?active.length+'개 검색 조건 동시 적용 · '+count+'종목 표시':'전체 목록 · '+count+'종목 표시';}
function getTracked(){return D.tracked[page]||[];}
function render(){document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('title').textContent=({main:'당일 최저가 발생 종목','3day':'3일 연속 저가 상승','2day':'2일 연속 저가 상승','1day':'1일 저가 상승',flat:'저가 상승→하락→재상승'})[page];$('sort').hidden=false;$('direction').hidden=false;$('mapView').hidden=page==='main';let rs=page==='main'?R:getTracked();rs=sorted(rs.filter(matchesFilters));$('count').textContent=rs.length+'종목';updateFilterStatus(rs.length);$('guide').hidden=page==='main';if(page==='main'){let h='<div class="tablebox"><table><thead><tr>'+['번호','검색유형','종목코드','종목명','종가','테마','거래량','거래대금(억원)'].map(t=>'<th>'+t+'</th>').join('')+'</tr></thead><tbody>';rs.forEach((r,i)=>{h+='<tr tabindex="0" data-code="'+esc(r['종목코드'])+'"><td><span class="rank">'+(i+1)+'</span></td><td>'+esc(r['검색유형'])+'</td><td>'+esc(r['종목코드'])+'</td><td><b>'+esc(r['종목명'])+'</b></td><td class="numeric">'+esc(nf(r['종가']))+'</td><td>'+esc(theme(r))+'</td><td class="numeric">'+esc(nf(r['당일거래량']))+'</td><td class="numeric">'+esc(nf(r['거래대금(억원)']))+'</td></tr>'});$('content').innerHTML=h+'</tbody></table></div><div class="mobileCards">'+rs.map((r,i)=>'<button type="button" class="mobileCard" data-code="'+esc(r['종목코드'])+'"><div class="mobileCardHead"><div><strong>'+esc((i+1)+'. '+r['종목명'])+'</strong><small>'+esc(r['종목코드'])+' · '+esc(theme(r))+'</small></div><span class="mobileCardType">'+esc(r['검색유형'])+'</span></div><div class="mobileCardNumbers"><span>종가<b>'+esc(nf(r['종가']))+'</b></span><span>거래량<b>'+esc(nf(r['당일거래량']))+'</b></span><span>거래대금(억)<b>'+esc(cardMoney(r['거래대금(억원)']))+'</b></span></div></button>').join('')+'</div>';}
else if(!rs.length){$('content').innerHTML='<div class="notice"><b>해당 조건으로 판정된 추적 종목이 없습니다.</b><br>추적은 과거 LV 발생일 이후 3거래일까지만 수행하며, 해당 기간의 자료가 부족하거나 조건을 만족하지 않으면 표시하지 않습니다.</div>';}
else{let key=r=>mapView==='theme'?(theme(r)==='테마 미확인'?(r['업종·주요사업']||'업종 미확인'):theme(r)):mapView==='volume'?'거래량 분류':mapView==='money'?'거래대금 분류':'전체';let groups=Object.groupBy?Object.groupBy(rs,key):rs.reduce((a,r)=>((a[key(r)]??=[]).push(r),a),{});$('content').innerHTML=Object.entries(groups).map(([g,items])=>'<div class="mapgroup"><h3>'+esc(g)+' · '+items.length+'종목</h3><div class="map">'+items.map(r=>{let w=Math.max(.75,Math.min(2.3,Math.sqrt(numeric(r,'당일거래량')/100000)*.55+Math.sqrt(numeric(r,'거래대금(억원)')/10)*.35));return '<button class="block" style="--grow:'+w+';--tile:#205c82" data-code="'+esc(r['종목코드'])+'"><small>'+esc(r['종목코드'])+'</small><b>'+esc(r['종목명'])+'</b><small>'+esc(theme(r))+'</small></button>'}).join('')+'</div></div>').join('');}
}
function chartSvg(r,col){const arr=D.history[r['종목코드']]||[],event=String(r['_origin']||r['최저값발생일']||D.date).slice(0,10);let ix=arr.findIndex(x=>x[0]===event);if(ix<0)ix=arr.findIndex(x=>x[0]===D.date);if(ix<0)return '<div class="muted">해당 발생일의 일봉이 없습니다.</div>';const points=arr.slice(Math.max(0,ix-5),Math.min(arr.length,ix+6)),ys=col==='price'?points.map(a=>a[2]):points.map(a=>a[3]);const finite=ys.filter(v=>Number.isFinite(v));if(!finite.length)return '<div class="muted">차트 원본값이 없습니다.</div>';const W=330,HT=116,L=12,T=10,B=95,max=Math.max(...finite),min=col==='price'?Math.min(...finite):0,scale=v=>B-(v-min)/((max-min)||1)*(B-T),step=(W-2*L)/Math.max(1,points.length-1),baseline=points.findIndex(a=>a[0]===event);let svg='<svg viewBox="0 0 330 116" preserveAspectRatio="none" aria-label="'+(col==='price'?'종가':'거래량 및 거래대금')+' 추이">';for(const y of [20,50,80])svg+='<line x1="10" y1="'+y+'" x2="320" y2="'+y+'" stroke="#d9e3ed" stroke-dasharray="3 3"/>';if(baseline>=0)svg+='<line x1="'+(L+baseline*step)+'" y1="5" x2="'+(L+baseline*step)+'" y2="98" stroke="#d8a34b" stroke-dasharray="3 3"/>';if(col==='price'){const path=points.map((a,i)=>(i?'L':'M')+(L+i*step).toFixed(2)+' '+scale(a[2]).toFixed(2)).join(' ');svg+='<path d="'+path+'" fill="none" stroke="#218665" stroke-width="2.5"/>';}else{points.forEach((a,i)=>{let x=L+i*step; if(a[3]!=null)svg+='<rect x="'+(x-7)+'" y="'+scale(a[3])+'" width="6" height="'+(B-scale(a[3]))+'" fill="#497fba"/>';if(a[4]!=null){const m=Math.max(1,...points.map(z=>z[4]||0)),h=(a[4]/m)*(B-T);svg+='<rect x="'+x+'" y="'+(B-h)+'" width="6" height="'+h+'" fill="#d9a056"/>';}});}svg+='<text x="10" y="110" font-size="10" fill="#617083">'+esc(points[0][0].slice(5))+'</text><text x="320" y="110" text-anchor="end" font-size="10" fill="#617083">'+esc(points[points.length-1][0].slice(5))+'</text></svg>';return svg;}
function lvFullTrackingComparison(r){
 if(page==='main')return null;
 const data=window.LV_TRACKING?.[D.date]?.[page]||[];
 const found=data.find(x=>x['종목코드']===r['종목코드']&&x['최초LV발생일']===r['_origin']);
 if(!found)return null;
 const keys=H.filter(k=>k!=='손절가');
 const days=found._days;
 let html='<div class="sec">LV 추적 · 손절가 제외 24항목 (원본 신호일 D0 고정)</div><div class="lvLowCompare"><table><thead><tr><th>항목</th>'+days.map((d,i)=>'<th>D'+i+'<small style="display:block">'+esc(d)+'</small></th>').join('')+'</tr></thead><tbody>';
 for(const key of keys){html+='<tr><th>'+esc(key)+'</th>'+days.map(d=>{const value=found._values?.[d]?.[key];return '<td>'+esc(value===null||value===undefined||value===''?'—':typeof value==='number'?value.toLocaleString('ko-KR',{maximumFractionDigits:3}):value)+'</td>';}).join('')+'</tr>';}
 return html+'</tbody></table></div>';
}
function lvLowComparison(r){
 if(page==='main')return '';
 const full=lvFullTrackingComparison(r);if(full!==null)return full;
 const code=String(r['종목코드']), origin=String(r['_origin']||D.date).slice(0,10);
 const history=(D.history[code]||[]).filter(a=>a[0]<=D.date);
 const start=history.findIndex(x=>x[0]===origin);
 if(start<0)return '<div class="muted">최초 LV 신호일의 일봉 자료가 없습니다.</div>';
 const points=history.slice(start,Math.min(start+4,history.length));
 const fields=[4,6,7,8,9,10,11,12,13,14,15,16,18,19,23,24,25];
 const labels=['당일최저가 D0','1일 상승 D1','2일 상승 D2','3일 상승 / 횡보 D3'];
 const valid=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
 const fmt=(v,i)=>v===null||v===undefined||v===''?'—':i===13?esc(v):typeof v==='number'?esc(v.toLocaleString('ko-KR',{maximumFractionDigits:2})):esc(v);
 const src=D.progress?.[code]||{};
 const table=fields.map(i=>{
  const key=H[i-1];
  const cells=points.map((p,n)=>{
   if(n===0)return fmt(r[key],i);
   if(i>=23)return '—'; // 뉴스·판단·주의는 거래일별 검증값이 없는 한 생성 금지
   return fmt(src[p[0]]?.[String(i)],i);
  });
  return '<tr><th>'+i+'. '+esc(key)+'</th>'+cells.map(v=>'<td>'+v+'</td>').join('')+'</tr>';
 }).join('');
 const status=points.map((p,i)=>{
  if(!i)return 'LV 신호';const before=points[i-1];
  if(!valid(p[1])||!valid(p[2])||!valid(before[1])||!valid(before[2]))return '미확인';
  if(p[1]>before[1]&&p[2]>before[2])return '저가·종가 상승';
  return p[1]<before[1]?'저가 하락':'상승 미충족';
 });
 return '<div class="sec">최초 LV 신호일부터 거래일별 17항목 비교 (손절가 제외)</div><div class="lvLowCompare"><table><thead><tr><th>항목</th>'+points.map((p,i)=>'<th>'+labels[i]+'<small style="display:block">'+esc(p[0])+'</small></th>').join('')+'</tr></thead><tbody>'+table+'<tr><th>추적 판정</th>'+status.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr></tbody></table></div>';
}
function details(code){const r=[...(D.tracked[page]||[]),...R].find(x=>x['종목코드']===code);if(!r)return;const cards=[['종가',r['종가']],['당일저가',r['당일저가']],['거래량',r['당일거래량']],['거래대금(억원)',r['거래대금(억원)']]];let html='<div class="drawerhead"><div><div class="muted">'+esc(r['검색유형'])+' · '+esc(theme(r))+'</div><h2>'+esc(r['종목명'])+' <small class="muted">'+esc(code)+'</small></h2></div><button class="btn" id="close" aria-label="상세 패널 닫기">✕ 닫기</button></div><div class="kpis">'+cards.map(([k,v])=>'<div class="kpi"><small>'+esc(k)+'</small><strong>'+esc(nf(v))+'</strong></div>').join('')+'</div><div class="charts"><div class="mini"><h4>종가 · 발생일 전후 최대 5거래일</h4><canvas class="chartCanvas" id="priceChart" hidden></canvas><div class="chartFallback" id="priceFallback">'+chartSvg(r,'price')+'</div></div><div class="mini"><h4>거래량(파랑) · 거래대금(금색)</h4><canvas class="chartCanvas" id="flowChart" hidden></canvas><div class="chartFallback" id="flowFallback">'+chartSvg(r,'vol')+'</div><small class="muted">파랑: 거래량(주) / 금색: 거래대금(억원), 각각 별도 척도</small></div></div><div class="mini lvExtraChart"><h4>일봉 캔들 + EMA 5·10·20</h4><div id="lvEmaChart"></div></div>'+lvLowComparison(r)+'<div class="sec">LV 통합점검표 · '+(page==='main'?'전체 25항목':'추적 원본 확인항목')+'</div>'+H.map((k,i)=>page==='main'||(i>=3&&i<=15)||i===17||i===18||(i>=22&&i<=24)?'<div class="detailrow"><label>'+(i+1)+'. '+esc(k)+'</label><span>'+esc(r[k]===''?'미확인':nf(r[k]))+'</span></div>':'').join('');$('drawer').innerHTML=html;$('backdrop').classList.add('visible');$('close').onclick=closeDrawer;$('close').focus();setupCharts(r);if(window.renderLVCandle)window.renderLVCandle(code,D.date);}

let activeCharts=[];
function setupCharts(r){
 activeCharts.forEach(c=>c.destroy());activeCharts=[];
 if(typeof Chart==='undefined')return; // 인터넷 없는 환경에서는 기존 SVG 차트 유지
 const hist=D.history[r['종목코드']]||[],event=String(r['_origin']||r['최저값발생일']||D.date).slice(0,10);
 let ix=hist.findIndex(a=>a[0]===event);if(ix<0)ix=hist.findIndex(a=>a[0]===D.date);if(ix<0)return;
 const pts=hist.slice(Math.max(0,ix-5),Math.min(hist.length,ix+6));
 if(!pts.length)return;
 const labels=pts.map(a=>a[0].slice(5)),common={responsive:true,maintainAspectRatio:false,animation:{duration:350},plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}},interaction:{mode:'index',intersect:false},scales:{x:{ticks:{maxTicksLimit:5,font:{size:9}},grid:{display:false}},y:{ticks:{maxTicksLimit:3,font:{size:9}}}}};
 ['priceChart','flowChart'].forEach(id=>$(id).hidden=false);
 let p,f;try{p=new Chart($('priceChart'),{type:'line',data:{labels,datasets:[{label:'종가 (원)',data:pts.map(a=>a[2]),borderColor:'#218665',backgroundColor:'#21866518',pointRadius:2,tension:.2,fill:true,spanGaps:false}]},options:{...common}});
 f=new Chart($('flowChart'),{type:'bar',data:{labels,datasets:[{label:'거래량 (주)',data:pts.map(a=>a[3]),backgroundColor:'#497fba',yAxisID:'y',borderRadius:2},{label:'거래대금 (억원)',data:pts.map(a=>a[4]),backgroundColor:'#d9a056',yAxisID:'y1',borderRadius:2}]},options:{...common,scales:{...common.scales,y:{position:'left',ticks:{maxTicksLimit:3,font:{size:9}}},y1:{position:'right',grid:{drawOnChartArea:false},ticks:{maxTicksLimit:3,font:{size:9}}}}}});
 activeCharts=[p,f];['priceFallback','flowFallback'].forEach(id=>$(id).hidden=true);
 }catch(err){if(p)p.destroy();if(f)f.destroy();activeCharts=[];['priceChart','flowChart'].forEach(id=>$(id).hidden=true);console.warn('Chart.js render failed; SVG fallback retained',err);}
}

function closeDrawer(){$('backdrop').classList.remove('visible');activeCharts.forEach(c=>c.destroy());activeCharts=[];}
const mobileToggle=$('mobileFilterToggle'),filterControls=$('filterControls');
// All search filters stay visible on desktop and mobile.
document.querySelectorAll('#nav button').forEach(b=>b.onclick=()=>{page=b.dataset.page;render();});$('q').oninput=e=>{query=e.target.value;render()};$('sort').onchange=e=>{sort=e.target.value;render()};['typeFilter','themeFilter','sectorFilter','volumeFilter','moneyFilter','industryThemeFilter','lvHighGapFilter'].forEach(id=>$(id).onchange=render);$('clearFilters').onclick=()=>{$('q').value='';query='';['typeFilter','themeFilter','sectorFilter','volumeFilter','moneyFilter','industryThemeFilter','lvHighGapFilter'].forEach(id=>$(id).value='all');render()};$('direction').onclick=()=>{dir=dir==='desc'?'asc':'desc';$('direction').textContent=dir==='desc'?'내림차순 ↓':'오름차순 ↑';render()};$('mapView').onchange=e=>{mapView=e.target.value;render()};$('content').addEventListener('click',e=>{const el=e.target.closest('[data-code]');if(el)details(el.dataset.code)});$('content').addEventListener('keydown',e=>{if(e.key==='Enter'){const el=e.target.closest('[data-code]');if(el)details(el.dataset.code)}});$('backdrop').onclick=e=>{if(e.target===$('backdrop'))closeDrawer()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});populateFacet('industryThemeFilter',[...R.map(theme),...R.map(sector)],'업종·테마');populateFacet('themeFilter',R.map(theme),'테마');populateFacet('sectorFilter',R.map(sector),'업종');$('total').textContent=R.length;$('volnum').textContent=R.filter(r=>r['검색유형'].includes('거래량')).length;$('pricenum').textContent=R.filter(r=>r['검색유형'].includes('가격')).length;$('both').textContent=R.filter(r=>r['검색유형']==='거래량·가격 동시').length;render();
