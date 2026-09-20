const SUPABASE_URL="https://abvdosqnbwoscbvzsjde.supabase.co";
const SUPABASE_PUBLISHABLE_KEY="sb_publishable_qyAVw3nNQksO3RXxMyPS0g_whEtuJiG";

function redirectToAuth(){const next=encodeURIComponent(location.pathname.split('/preview/')[1]||'app.html');location.replace('./?next='+next)}
async function boot(){
  document.body.classList.add('auth-checking');
  if(!window.supabase?.createClient){redirectToAuth();return}
  const client=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data}=await client.auth.getSession();
  if(!data?.session){redirectToAuth();return}
  const user=document.getElementById('appUser');if(user)user.textContent='👤 '+(data.session.user?.email||'Đã đăng nhập');
  document.body.classList.remove('auth-checking');
  document.getElementById('appLogout')?.addEventListener('click',async()=>{
    await client.auth.signOut();
    redirectToAuth();
  });
  client.auth.onAuthStateChange((_event,session)=>{
    if(!session)redirectToAuth();
    else if(document.getElementById('appUser'))document.getElementById('appUser').textContent='👤 '+(session.user?.email||'Đã đăng nhập');
  });
}
boot();
