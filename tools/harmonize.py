"""Aligne les pages générées avec l'en-tête, le pied de page et le CSS de l'accueil : python3 tools/harmonize.py fichier.html ..."""
import re,sys,hashlib
home=open('index.html',encoding='utf-8').read()
f=re.search(r'<footer>(.*?)</footer>',home,re.S).group(1)
f=re.sub(r'href="([^"]*)"',lambda m:m.group(0) if m.group(1).startswith(('http','/','mailto','tel')) or m.group(1)=='#' else 'href="/'+m.group(1).lstrip('/')+'"' if not m.group(1).startswith('#') else 'href="/'+m.group(1)+'"',f)
f=re.sub(r'<h4>\s*(.*?)\s*</h4>',r'<p class="foot-title">\1</p>',f); f=re.sub(r'\s+',' ',f)
foot='<footer class="site-foot">'+f+'</footer>'
nav='''<ul class="site-nav">
        <li><a href="/#services">Soins</a></li>
        <li><a href="/#cabinet">Le cabinet</a></li>
        <li><a href="/#zone">Zone d'intervention</a></li>
        <li><a href="/#faq">FAQ</a></li>
        <li><a href="/blog/actualites.html">Conseils</a></li>
        <li><a href="/#contact">Contact</a></li>
        <li>'''
v=hashlib.md5(open('assets/site.css','rb').read()).hexdigest()[:8]
for p in sys.argv[1:]:
    s=open(p,encoding='utf-8').read()
    s=re.sub(r'<ul class="site-nav">.*?<li><a class="nav-phone"',lambda m:nav+'<a class="nav-phone"',s,count=1,flags=re.S)
    s=s.replace('<span>Cabinet Infirmier Limoges</span></a>','<span>Cabinet Infirmier</span></a>',1)
    s=re.sub(r'<footer class="site-footer">.*?</footer>',lambda m:foot,s,flags=re.S)
    s=re.sub(r'<link rel="stylesheet" href="/assets/(pages|legacy|theme|inner)\.css">\n?','',s)
    if 'assets/site.css' not in s: s=s.replace('<script src="/assets/theme.js">','<link rel="stylesheet" href="/assets/site.css?v=%s">\n<script src="/assets/theme.js">'%v,1)
    open(p,'w',encoding='utf-8').write(s)
