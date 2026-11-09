import json, re, pathlib
P = pathlib.Path(__file__).resolve().parent.parent  # presentation/
src = P/'deck'/'project'
deck = json.loads((src/'deck.json').read_text())
blob = {
 'c4a9e74323790e952c056a5292b7f96a':'logo','47c158b71962e6e867e1496de2d6e624':'s00a','c9bb8327968ad690a0e6e7b3db102878':'s00c',
 'ccd505129c04ad3f0da50f9bb0aed082':'s00d','f7676de019d545061ec3a9e1aace2434':'s00dc','8fe3615440eceff62dd33b101e7f1533':'s00e',
 '38e95361412a5614ae8b4afb3b0ff47e':'s00f','ef81ad8387c857099ccf3fc8a98908e0':'s13','601801cc35c664f9d98beda8107c9c7e':'s03',
 'f49975e23243ffa05e854ee3eeecf145':'s02','a2e4bbcb2d31a04edace126f415b98ee':'s01','2e719164e861da7054fb3a5d997ebfc7':'s10b',
 'c11e40f6d141edf8a121513795a2a183':'s08','8e3c24c0e43acb4587edfefead946421':'s09','80871da782e60e077683ad5e2827be88':'s07',
 '4b44823694d228f2e33b625426f8dbb9':'s05','dde23144c87c55a9d6cb89faae78da6f':'bm'}
out = []
for i, sid in enumerate(deck['order'], 1):
    h = (src/'slides'/f'{sid}.html').read_text().strip()
    h = re.sub(r'/_blob/([0-9a-f]{32})', lambda m: f'deck/assets/{blob[m.group(1)]}.png', h)
    h = re.sub(r'(<x-embed[^>]*>)(.*?)(</x-embed>)', lambda m: m.group(1)+'<template>'+m.group(2)+'</template>'+m.group(3), h, flags=re.S)
    out.append(f'<!-- ===== {i:02d} · {sid} ===== -->\n{h}')
slides = '\n\n'.join(out)
tpl = (pathlib.Path(__file__).parent/'shell.html').read_text()
(P/'index.html').write_text(tpl.replace('<!--SLIDES-->', slides))
print('slides', len(out), 'bytes', len(tpl)+len(slides))
