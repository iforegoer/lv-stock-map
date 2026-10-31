
(()=>{'use strict';
 const M=JSON.parse(document.getElementById('integrateddata').textContent);
 window.LV_TRACKING=M.tracking||{};
 const lvDates=Object.keys(M.lv).sort().reverse(), lvPicker=document.getElementById('lvDate');
 lvPicker.innerHTML=lvDates.map(d=>'<option value="'+d+'">'+d+'</option>').join('');
 lvPicker.value=D.date;
 lvPicker.addEventListener('change',()=>{const d=lvPicker.value;R.splice(0,R.length,...M.lv[d].rows);D.date=d;D.tracked=M.lv[d].tracked;
   document.querySelector('.heading .muted').textContent='기준일: '+d+' · LV 원본 Excel 전 종목';
   populateFacet('industryThemeFilter',[...R.map(theme),...R.map(sector)],'업종·테마');
   populateFacet('themeFilter',R.map(theme),'테마');populateFacet('sectorFilter',R.map(sector),'업종');
   document.getElementById('total').textContent=R.length;
   document.getElementById('volnum').textContent=R.filter(r=>r['검색유형'].includes('거래량')).length;
   document.getElementById('pricenum').textContent=R.filter(r=>r['검색유형'].includes('가격')).length;
   document.getElementById('both').textContent=R.filter(r=>r['검색유형']==='거래량·가격 동시').length;
   render();});
 const buttons=[...document.querySelectorAll('#marketNav button')];
 let market='lv',smDate='',highDate='';
 const e=id=>document.getElementById(id);
 const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const nfmt=v=>typeof v==='number'?v.toLocaleString('ko-KR',{maximumFractionDigits:2}):String(v??'미확인');
 function refresh(){buttons.forEach(b=>b.classList.toggle('active',b.dataset.market===market));e('lvSection').hidden=market!=='lv';e('otherMarket').hidden=market==='lv';if(market==='lv')return;
  e('otherTitle').textContent=market==='sm'?'S_M 통합점검표 · 6개 유형':'고가 종목';const store=market==='sm'?M.sm:M.high, dates=Object.keys(store).sort().reverse();const picker=e('marketDate');const previous=market==='sm'?smDate:highDate;const selected=dates.includes(previous)?previous:(dates[0]||'');picker.innerHTML=dates.map(d=>'<option value="'+escapeHtml(d)+'">'+escapeHtml(d)+'</option>').join('');picker.value=selected;if(market==='sm')smDate=selected;else highDate=selected;populateMarketType();populateMarketFacet();renderCards(); }
 function populateMarketType(){const sel=e('marketType'),rows=(M.sm[e('marketDate').value]||[]);sel.hidden=market!=='sm';const old=sel.value,types=['양측수급지속형','기관주도형','외국인주도형','수급충돌형','유동성·특수구조주의형','기타관찰형'];sel.innerHTML='<option value="all">전체 유형</option>'+types.map(t=>'<option value="'+escapeHtml(t)+'">'+escapeHtml(t)+'</option>').join('');sel.value=types.includes(old)?old:'all';const info=e('smTypeSummary');info.hidden=market!=='sm';if(market==='sm'){info.innerHTML=types.map(t=>'<span class="type-pill">'+escapeHtml(t)+' '+rows.filter(r=>(r['유형']||r['_group'])===t).length+'종목</span>').join('');}}
 function populateMarketFacet(){const store=market==='sm'?M.sm:M.high,rows=store[e('marketDate').value]||[];const values=new Set();rows.forEach(r=>{[r['업종 및 테마'],r['업종·주요사업'],r['테마'],r['업종']].forEach(v=>{if(v&&String(v).trim()!=='미확인'&&!String(v).includes('구체주요사업별도 확인'))values.add(String(v).trim())})});const sel=e('marketFacet');sel.innerHTML='<option value="all">전체 업종·테마</option>'+[...values].sort((a,b)=>a.localeCompare(b,'ko')).map(v=>'<option>'+escapeHtml(v)+'</option>').join('');}
 function renderCards(){const store=market==='sm'?M.sm:M.high, date=e('marketDate').value, q=e('marketSearch').value.trim().toLowerCase();let rows=(store[date]||[]).filter(r=>Object.entries(r).some(([k,v])=>!k.startsWith('_')&&String(v??'').toLowerCase().includes(q))).filter(r=>{const f=e('marketFacet').value;return f==='all'||[r['업종 및 테마'],r['업종·주요사업'],r['테마'],r['업종']].some(v=>String(v??'')===f)});const type=e('marketType').value;if(market==='sm'&&type!=='all')rows=rows.filter(r=>(r['유형']||r['_group'])===type);const sort=e('marketSort').value;rows=rows.slice().sort((a,b)=>sort==='name'?String(a['종목명']).localeCompare(String(b['종목명']),'ko'):Number(b[sort==='volume'?'거래량':'거래대금(억원)']||0)-Number(a[sort==='volume'?'거래량':'거래대금(억원)']||0));e('otherInfo').textContent=date?date+' · '+rows.length+'종목':'해당 유형의 날짜별 Excel 파일이 없습니다.';
 const cards=e('otherCards');cards.innerHTML=rows.map((r,i)=>{const price=r['종가']??'', rate=r['주가등락률(%)']??r['주가등락률']??'', vol=r['거래량']??'',money=r['거래대금(억원)']??'';
 const cells=[['종가',price],['등락률(%)',rate],['거래량',vol],['거래대금(억원)',money]].filter(([,v])=>v!==''&&v!==null&&v!==undefined&&v!=='미확인');
 return '<button type="button" class="market-card" data-idx="'+i+'"><strong>'+(i+1)+'. '+escapeHtml(r['종목명'])+'</strong><small>'+escapeHtml(r['종목코드'])+(market==='sm'&&(r['유형']||r['_group'])?' · '+escapeHtml(r['유형']||r['_group']):'')+'</small><div class="market-card-values">'+cells.map(([k,v])=>'<span>'+escapeHtml(k)+'<b>'+escapeHtml(nfmt(v))+'</b></span>').join('')+'</div></button>';}).join('');
 cards.querySelectorAll('.market-card').forEach(b=>b.addEventListener('click',()=>{const r=rows[Number(b.dataset.idx)];const d=e('marketDrawer'),back=e('marketBackdrop');d.innerHTML='<div class="drawerhead"><h2>'+escapeHtml(r['종목명'])+' <small>'+escapeHtml(r['종목코드'])+'</small></h2><button class="btn" id="marketClose">✕ 닫기</button></div><div class="mini"><h4>일봉 캔들(시가·고가·저가·종가) + EMA 5·10·20</h4><div id="emaChart"></div></div>'+Object.entries(r).filter(([k,v])=>!k.startsWith('_')&&v!==''&&v!==null&&v!==undefined&&v!=='미확인').map(([k,v])=>'<div class="detailrow"><label>'+escapeHtml(k)+'</label><span>'+escapeHtml(nfmt(v))+'</span></div>').join('');back.classList.add('visible');e('marketClose').onclick=()=>back.classList.remove('visible');renderEma(r['종목코드'],date);}));}
 function renderEma(code,date,targetId="emaChart"){
  const el=e(targetId),allHist=(M.history[code]||[]).filter(a=>a[0]<=date);const count=Number(el.dataset.bars||40);const hist=allHist.slice(-count);
  if(!hist.length){el.textContent='일봉 자료 없음';return;}
  const closes=hist.map(a=>Number(a[1]));
  const ema=period=>{let avg=null;const k=2/(period+1);return closes.map((v,i)=>{if(i<period-1)return null;if(i===period-1){avg=closes.slice(0,period).reduce((a,b)=>a+b,0)/period;return avg;}avg=v*k+avg*(1-k);return avg;});};
  const lines=[ema(5),ema(10),ema(20)];
  const complete=hist.filter(a=>[a[2],a[3],a[4]].every(v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))));
  if(!complete.length){el.textContent='OHLC 자료 없음 — 캔들을 표시할 수 없습니다.';return;}
  const all=[...hist.flatMap(a=>[Number(a[1]),Number(a[2]),Number(a[3]),Number(a[4])]).filter(Number.isFinite),...lines.flat().filter(v=>v!==null&&Number.isFinite(v))];
  const min=Math.min(...all),max=Math.max(...all),w=640,h=250,left=35,right=14,top=14,bottom=28;
  const yp=v=>top+(max-v)/((max-min)||1)*(h-top-bottom),xp=i=>left+i*(w-left-right)/Math.max(1,hist.length-1);
  const cw=Math.max(2,Math.min(10,(w-left-right)/Math.max(1,hist.length)*.6));
  let bars='';let hits='';hist.forEach((a,i)=>{const [d,close,open,high,low]=a;if([close,open,high,low].some(v=>v===null||v===undefined||!Number.isFinite(Number(v))))return;const x=xp(i),up=Number(close)>=Number(open),color=up?'#d64b4b':'#2784c5';const y1=yp(Math.max(open,close)),y2=yp(Math.min(open,close));bars+='<line x1="'+x+'" y1="'+yp(high)+'" x2="'+x+'" y2="'+yp(low)+'" stroke="'+color+'" stroke-width="1.5"/><rect x="'+(x-cw/2)+'" y="'+y1+'" width="'+cw+'" height="'+Math.max(1,y2-y1)+'" fill="'+color+'"/>';hits+='<rect class="candle-hit" data-day="'+escapeHtml(d)+'" data-close="'+escapeHtml(nfmt(close))+'" data-volume="'+escapeHtml(a[5] == null?'미확인':nfmt(a[5]))+'" data-money="'+escapeHtml(a[6] == null?'미확인':nfmt(a[6]))+'" x="'+(x-Math.max(5,cw))+'" y="0" width="'+Math.max(10,cw*2)+'" height="250" fill="transparent"/>';});
  const colors=['#d98b2d','#2e9b7a','#8355b8'];const paths=lines.map((arr,j)=>{let begun=false;const points=arr.map((v,i)=>{if(v===null||!Number.isFinite(v)){begun=false;return '';}const p=(begun?'L':'M')+xp(i).toFixed(1)+','+yp(v).toFixed(1);begun=true;return p;}).join(' ');return '<path d="'+points+'" fill="none" stroke="'+colors[j]+'" stroke-width="2"/>';});
  el.innerHTML='<div class="chart-toolbar"><button type="button" class="chart-zoom-in">＋ 확대</button><button type="button" class="chart-zoom-out">－ 축소</button><span class="chart-barnum">최근 '+hist.length+'봉</span></div><div class="candle-wrap"><svg viewBox="0 0 640 250" style="width:100%;height:250px" role="img" aria-label="가격 캔들 차트 및 EMA 5 10 20일">'+bars+paths.join('')+hits+'</svg><div class="candle-tooltip" hidden></div></div><div class="ema-legend"><span style="color:#d64b4b">■ 상승봉</span> <span style="color:#2784c5">■ 하락봉</span> '+['EMA5','EMA10','EMA20'].map((x,i)=>'<span style="color:'+colors[i]+'">● '+x+'</span>').join(' ')+'</div>';
  const repaint=n=>{el.dataset.bars=String(Math.max(10,Math.min(120,n)));renderEma(code,date,targetId);};
  el.querySelector('.chart-zoom-in').onclick=()=>repaint(count-10);
  el.querySelector('.chart-zoom-out').onclick=()=>repaint(count+10);
  const tip=el.querySelector('.candle-tooltip');
  el.querySelectorAll('.candle-hit').forEach(hit=>{
   hit.addEventListener('mouseenter',()=>{tip.hidden=false;tip.textContent=hit.dataset.day+' | 종가 '+hit.dataset.close+'원 | 거래량 '+hit.dataset.volume+'주 | 거래대금 '+hit.dataset.money+'억원';});
   hit.addEventListener('mouseleave',()=>{tip.hidden=true;});
  });

 }

 window.renderLVCandle=(code,date)=>renderEma(code,date,'lvEmaChart');
 buttons.forEach(b=>b.addEventListener('click',()=>{market=b.dataset.market;refresh()}));e('marketDate').addEventListener('change',()=>{if(market==='sm')smDate=e('marketDate').value;else highDate=e('marketDate').value;populateMarketType();populateMarketFacet();renderCards()});['marketSearch','marketFacet','marketSort','marketType'].forEach(id=>e(id).addEventListener(id==='marketSearch'?'input':'change',renderCards));e('marketBackdrop').onclick=ev=>{if(ev.target===e('marketBackdrop'))e('marketBackdrop').classList.remove('visible');};
 refresh();
})();
