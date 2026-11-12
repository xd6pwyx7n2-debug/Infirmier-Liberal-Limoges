"""Régénère assets/site.css, site-legacy.css et theme.css à partir de assets/src/ (python3 tools/build-css.py)."""
import sys,os
sys.path.insert(0,os.path.dirname(__file__)); from mincss import minify
r=lambda f:open('assets/src/'+f,encoding='utf-8').read()
w=lambda f,s:open('assets/'+f,'w',encoding='utf-8').write(minify(s))
w('site.css',r('pages.css')+r('theme.css')+r('inner.css'))
w('site-legacy.css',r('pages.css')+r('legacy.css')+r('theme.css')+r('inner.css'))
w('theme.css',r('theme.css'))
