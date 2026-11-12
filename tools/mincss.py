import re
def minify(css):
    # protect strings and url()
    keep=[]
    def hold(m): keep.append(m.group(0)); return f'\x00{len(keep)-1}\x00'
    css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
    css=re.sub(r'"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|url\([^)]*\)',hold,css)
    css=re.sub(r'\s+',' ',css)
    css=re.sub(r' ?([{};,>]) ?',r'\1',css)
    css=re.sub(r'([{;]) ?([a-zA-Z-]+) ?: ',r'\1\2:',css)   # declaration colon
    css=css.replace(';}','}')
    css=re.sub(r'\(\s+','(',css); css=re.sub(r'\s+\)',')',css)
    css=re.sub(r'\x00(\d+)\x00',lambda m:keep[int(m.group(1))],css)
    return css.strip()
