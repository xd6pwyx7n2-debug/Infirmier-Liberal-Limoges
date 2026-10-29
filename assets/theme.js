(function(){
  var d=document.documentElement,k='theme',t=null;
  try{t=localStorage.getItem(k)}catch(e){}
  if(t==='dark'||t==='light')d.setAttribute('data-theme',t);
  var sun='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var moon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  function dark(){var a=d.getAttribute('data-theme');return a?a==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches}
  document.addEventListener('DOMContentLoaded',function(){
    var b=document.createElement('button');b.type='button';b.className='theme-toggle';
    function paint(){var x=dark();b.innerHTML=x?sun:moon;b.setAttribute('aria-label',x?'Passer en mode clair':'Passer en mode sombre');b.title=b.getAttribute('aria-label');
      var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',x?'#0c1a1f':'#0e5a6e')}
    b.addEventListener('click',function(){var n=dark()?'light':'dark';d.setAttribute('data-theme',n);try{localStorage.setItem(k,n)}catch(e){}paint()});
    paint();document.body.appendChild(b);
  });
})();
