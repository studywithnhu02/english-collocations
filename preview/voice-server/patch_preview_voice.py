from pathlib import Path
import re

INDEX = Path(__file__).resolve().parent.parent / "index.html"

OLD_START = "const synth=window.speechSynthesis;let voices=[];"
OLD_END = "if(synth&&'onvoiceschanged' in synth)synth.onvoiceschanged=loadVoices;loadVoices();"

NEW_VOICE = r'''const VOICE_API='http://127.0.0.1:8765';
const synth=window.speechSynthesis;let voices=[];const preferredVoiceNames=['Samantha','Ava','Jenny','Aria','Karen','Moira','Google US English','Microsoft Jenny Online (Natural) - English (United States)','Microsoft Aria Online (Natural) - English (United States)','Microsoft Ava Online (Natural) - English (United States)'];
let activeVoiceId=null,activeUtterance=null,activeAudio=null,activeAudioUrl=null;
function loadVoices(){voices=synth?synth.getVoices():[]}
function pickUSVoice(){if(!voices.length)loadVoices();const us=voices.filter(v=>/^en-US$/i.test(v.lang)||/^en_US$/i.test(v.lang));if(!us.length)return voices.find(v=>/^en/i.test(v.lang))||null;const exact=us.find(v=>preferredVoiceNames.some(name=>v.name.toLowerCase()===name.toLowerCase()));if(exact)return exact;const preferred=us.find(v=>preferredVoiceNames.some(name=>v.name.toLowerCase().includes(name.toLowerCase())));return preferred||us.find(v=>/female|samantha|ava|jenny|aria|karen|moira/i.test(v.name))||us.find(v=>!v.localService)||us[0]}
function setVoiceButton(btn,playing,loading=false){if(!btn)return;btn.textContent=loading?'…':(playing?'⏸':'▶');btn.classList.toggle('playing',playing);btn.title=loading?'Đang tạo giọng…':(playing?'Tạm dừng':'Phát giọng')}
function stopVoice(){if(synth)synth.cancel();if(activeAudio){activeAudio.pause();activeAudio.currentTime=0}if(activeAudioUrl){URL.revokeObjectURL(activeAudioUrl);activeAudioUrl=null}document.querySelectorAll('.voice-btn.playing').forEach(b=>setVoiceButton(b,false));document.querySelectorAll('.voice-btn').forEach(b=>{if(b.textContent==='…')setVoiceButton(b,false)});activeVoiceId=null;activeUtterance=null;activeAudio=null}
function browserSpeak(text,id,btn){if(!synth){alert('Trình duyệt này chưa hỗ trợ phát âm.');return}stopVoice();const utter=new SpeechSynthesisUtterance(text);utter.lang='en-US';const voice=pickUSVoice();if(voice)utter.voice=voice;utter.rate=.94;utter.pitch=1.02;utter.volume=1;activeVoiceId=id;activeUtterance=utter;setVoiceButton(btn,true);utter.onend=()=>{if(activeUtterance===utter){setVoiceButton(btn,false);activeVoiceId=null;activeUtterance=null}};utter.onerror=()=>{if(activeUtterance===utter){setVoiceButton(btn,false);activeVoiceId=null;activeUtterance=null}};synth.speak(utter)}
async function localVoiceAvailable(){try{const r=await fetch(VOICE_API+'/health',{method:'GET'});return r.ok}catch(e){return false}}
async function speakText(text,id,btn){const clean=text.trim();if(!clean)return;if(activeVoiceId===id){if(activeAudio){if(activeAudio.paused){activeAudio.play();setVoiceButton(btn,true)}else{activeAudio.pause();setVoiceButton(btn,false)}return}if(synth&&synth.speaking){if(synth.paused){synth.resume();setVoiceButton(btn,true)}else{synth.pause();setVoiceButton(btn,false)}return}}
stopVoice();setVoiceButton(btn,false,true);activeVoiceId=id;
try{const ok=await localVoiceAvailable();if(!ok){browserSpeak(clean,id,btn);return}const response=await fetch(VOICE_API+'/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:clean})});if(!response.ok)throw new Error('Local XTTS unavailable');const blob=await response.blob();activeAudioUrl=URL.createObjectURL(blob);const audio=new Audio(activeAudioUrl);activeAudio=audio;setVoiceButton(btn,true);audio.onended=()=>{if(activeAudio===audio){setVoiceButton(btn,false);activeVoiceId=null;activeAudio=null;if(activeAudioUrl){URL.revokeObjectURL(activeAudioUrl);activeAudioUrl=null}}};audio.onerror=()=>{if(activeAudio===audio){setVoiceButton(btn,false);activeVoiceId=null;activeAudio=null}};await audio.play()}catch(e){browserSpeak(clean,id,btn)}}
function toggleVoice(id,btn){const row=btn.closest('tr');const text=row?.querySelector('[data-f="e"]')?.innerText||'';speakText(text,id,btn)}
function toggleNewVoice(id,btn){const row=btn.closest('tr');const text=row?.querySelector('[data-f="e"]')?.innerText||'';speakText(text,id,btn)}
if(synth&&'onvoiceschanged' in synth)synth.onvoiceschanged=loadVoices;loadVoices();'''

text = INDEX.read_text(encoding="utf-8")
start = text.find(OLD_START)
end = text.find(OLD_END)
if start == -1 or end == -1:
    raise SystemExit("Could not find existing voice block; refusing to patch.")
end += len(OLD_END)
text = text[:start] + NEW_VOICE + text[end:]

old_card = '<section class="card"><h2 style="font-size:18px;margin-top:0">🔊 Voice Preview</h2><p style="color:var(--muted);font-size:13px;margin-bottom:0">Ưu tiên voice English (US) nữ/natural có sẵn trên thiết bị. Chất lượng và tên voice phụ thuộc trình duyệt/ hệ điều hành.</p></section>'
new_card = '<section class="card"><h2 style="font-size:18px;margin-top:0">🎙️ Voice Clone Preview</h2><p style="color:var(--muted);font-size:13px;margin-bottom:8px">Ưu tiên voice clone XTTS-v2 chạy trên máy của bạn, dùng sample voice local. Không dùng API trả phí.</p><div class="config" id="voiceLocalStatus">🔌 Đang kiểm tra local voice server…<br><span style="font-size:10px">127.0.0.1:8765</span></div></section>'
if old_card in text:
    text = text.replace(old_card, new_card, 1)

INDEX.write_text(text, encoding="utf-8")
print(f"Patched {INDEX}")
