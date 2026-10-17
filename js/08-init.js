function init(){if(!data.model||data.model==='gemini-2.5-flash')data.model='gemini-3.8-flash';refreshDashboard();renderCode();if(data.name)$('welcomeName').textContent=' , '+data.name;$('apiKey').value='';}
window.addEventListener('error',e=>{const panel=document.getElementById('appError');if(panel){panel.classList.remove('hide');panel.textContent='A page error occurred: '+(e.message||'Unknown error')+'. Refresh the page; if it continues, report this message.'}});
window.addEventListener('unhandledrejection',e=>{const panel=document.getElementById('appError');if(panel){panel.classList.remove('hide');panel.textContent='A background task failed: '+String(e.reason?.message||e.reason||'Unknown error')}});
init();
