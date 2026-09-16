import re
f = 'src/components/slides/10-QA.astro'
c = open(f, 'r', encoding='utf-8').read()
c = re.sub(r'<img src="/qr_code\.png"[^>]+>', '', c)
c = c.replace('@ivkadatsky', 'TG: @ivkadatsky')
c = c.replace('font-size: 1.5em;', 'font-size: 2.5em; font-weight: bold;')
open(f, 'w', encoding='utf-8').write(c)
