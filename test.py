import re, urllib.parse
html = '<a href="https://altikodtech.com.tr/#demo">Demo</a>'
def link_replacer(match):
    orijinal_link = match.group(1)
    if 'unsubscribe' in orijinal_link or 'track' in orijinal_link: return match.group(0)
    encoded_url = urllib.parse.quote(orijinal_link, safe='')
    yeni_link = f'http://localhost:8000/api/click?url={encoded_url}&email=test@test.com&camp=c1'
    return f'href="{yeni_link}"'
print(re.sub(r'href="(https?://[^"]+)"', link_replacer, html))
