import zipfile, re, sys

def ext(p):
    out=[]
    with zipfile.ZipFile(p, 'r') as z:
        s=[f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
        s.sort(key=lambda x: int(re.search(r'slide(\d+)', x).group(1)))
        for sf in s:
            t=re.findall(r'<a:t>(.*?)</a:t>', z.read(sf).decode('utf-8'))
            out.append('Slide: ' + ' '.join(t))
    return '\n'.join(out)

with open('scratch_extracted.txt', 'w', encoding='utf-8') as f:
    f.write('--- Krylov ---\n')
    f.write(ext('НРФ170926/Krylov_AI_for_business_v12.pptx') + '\n\n')
    f.write('--- Iskov ---\n')
    f.write(ext('НРФ170926/NRF_VPIskov.pptx') + '\n\n')
