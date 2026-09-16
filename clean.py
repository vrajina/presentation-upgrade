import re, glob
for file in glob.glob('src/components/slides/*.astro'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(r'<div class="module-sign"[^>]*>.*?</div>', '', content)
    with open(file, 'w', encoding='utf-8') as f:
        f.write(new_content)
