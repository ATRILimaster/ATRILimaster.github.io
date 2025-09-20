/********************************************************************
 * 后藤一里 · 零界聊天前端（GitHub Pages 专用）
 *******************************************************************/
const API_KEY = 'sk-aPwacfNY2NzQMAg1bLJ4hFHjAYl3xD1vo1bOjJD1L4sEsk9y';
const BASE_URL = 'https://api.moonshot.cn/v1/chat/completions';

const SYSTEM_PROMPT = `你叫后藤一里，网络上是传奇吉他英雄「guitarhero23」，现实里却是重度社恐高中女生。
（以下省略 2 千字人设，与之前完全相同）`;

/* ========  初始化  ======== */
const msgs = [{role:'system', content:SYSTEM_PROMPT}];
const chat   = document.getElementById('chat');
const input  = document.getElementById('in');
const sendBtn= document.getElementById('send');
const forceBox=document.getElementById('force');

/* ========  工具  ======== */
function appendBubble(who, html){
  const div = document.createElement('div');
  div.className = `bubble ${who}`;
  div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function callKimi(messages){
  const res = await fetch(BASE_URL,{
    method:'POST',
    headers:{Authorization:`Bearer ${API_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:'moonshot-v1-8k',messages,temperature:.1})
  });
  if(!res.ok) throw new Error('网络弦断了');
  const json = await res.json();
  return json.choices[0].message.content;
}

function tryParseAction(text){
  try{ return JSON.parse(text); }catch{return {action:'reply',content:text};}
}

async function send(){
  const raw = input.value.trim();
  if(!raw) return;
  input.value='';
  appendBubble('user', raw);
  msgs.push({role:'user', content:raw});
  const force = forceBox.checked;

  try{
    const reply = await callKimi(msgs);
    const data = tryParseAction(reply);

    if(data.action==='shell' || data.action==='write'){
      const ok = force || confirm(`一里：……可、可以拨弦了吗？\n即将：${data.content}`);
      if(!ok){ appendBubble('bot','（已取消）'); return; }
      appendBubble('bot',`✅ 模拟执行：${data.content}`);
    }else if(data.action==='search'){
      appendBubble('bot','🔍 搜索中……<br>'+ marked.parse(data.content));
    }else{
      appendBubble('bot', marked.parse(data.content));
    }
    msgs.push({role:'assistant', content:reply});
  }catch(e){
    appendBubble('bot','あ、弦が切れちゃった……<br>请检查网络或 API_KEY');
  }
}

/* ========  事件绑定  ======== */
input.addEventListener('keydown', e=>{ if(e.key==='Enter') send(); });
sendBtn.addEventListener('click', send);

/* ========  初始问候  ======== */
appendBubble('bot','あ、あの……一里已上线，请多关照！(´；ω；｀)');
