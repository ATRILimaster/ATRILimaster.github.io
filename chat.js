const API_KEY = 'sk-aPwacfNY2NzQMAg1bLJ4hFHjAYl3xD1vo1bOjJD1L4sEsk9y'; // 可放 GitHub Secret + Actions 注入
const BASE_URL = 'https://api.moonshot.cn/v1/chat/completions';
const SYSTEM_PROMPT = `你叫后藤一里……（以下全文照搬波奇.py 里的设定，略）`;

const msgs = [{role:'system', content:SYSTEM_PROMPT}];
const chat = document.getElementById('chat');
const input = document.getElementById('in');
const sendBtn = document.getElementById('send');
const forceBox = document.getElementById('force');

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
  const json = await res.json();
  return json.choices[0].message.content;
}

function tryParseAction(text){
  try{ return JSON.parse(text); }catch{return {action:'reply',content:text};}
}

input.addEventListener('keydown',e=>{if(e.key==='Enter') send();});
sendBtn.addEventListener('click',send);

async function send(){
  const raw = input.value.trim();
  if(!raw) return;
  input.value='';
  appendBubble('user',raw);
  msgs.push({role:'user',content:raw});
  const force = forceBox.checked;
  let reply = await callKimi(msgs);
  const data = tryParseAction(reply);

  // 处理 action
  if(data.action==='shell' || data.action==='write'){
    const ok = force || confirm(`即将执行：${data.content}\n回车确认，取消中止`);
    if(!ok){
      appendBubble('bot','（已取消）');
      return;
    }
    // 前端无法真正执行 shell / 写盘，仅示范
    appendBubble('bot',`✅ 已模拟执行：${data.content}`);
  }else if(data.action==='search'){
    // 这里可以调 DuckDuckGo 免费 JSONP API，或回退到静态微软文档
    appendBubble('bot','🔍 搜索功能：'+marked.parse(data.content));
  }else{
    appendBubble('bot',marked.parse(data.content));
  }
  msgs.push({role:'assistant',content:reply});
}
