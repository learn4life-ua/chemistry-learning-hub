#!/usr/bin/env python3
"""One-off import of licensed Commons photos for the chemistry picture quiz."""
import io, json, re, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'puzzles/pictures/photos'
PAGE = ROOT / 'puzzles/pictures/pictures.js'
DEST.mkdir(parents=True, exist_ok=True)
PHOTOS = [
 ('КОЛБА','Erlenmeyer flask.jpg','01_flask.jpg'),
 ('КОРОЗІЯ','Rusty Nail.jpg','02_corrosion.jpg'),
 ('МІДЬ','Kupferlackdraht rolle.jpg','03_copper.jpg'),
 ('КРИСТАЛ','Amethyst crystal.jpg','04_crystal.jpg'),
 ('ІНДИКАТОР','Universal indicator paper.jpg','05_indicator.jpg'),
 ('ОСАД','Lead (II) iodide precipitating out of solution.JPG','06_precipitate.jpg'),
 ('ГОРІННЯ','Burning Bunsen burner.jpg','07_combustion.jpg')
]
HEADERS = {'User-Agent':'ChemistryLearningHubImageImport/1.0 (educational GitHub Pages website)'}

def fetch(url):
 last = None
 for attempt in range(5):
  try:
   req = urllib.request.Request(url, headers=HEADERS)
   with urllib.request.urlopen(req, timeout=35) as response:
    return response.read()
  except Exception as exc:
   last=exc
   print('Retrying',url,str(exc),flush=True)
   time.sleep(3*(attempt+1))
 raise RuntimeError('Download failed: '+url+' '+str(last))

updated=PAGE.read_text(encoding='utf-8')
for term,source,filename in PHOTOS:
 api='https://commons.wikimedia.org/w/api.php?'+urllib.parse.urlencode({
  'action':'query','format':'json','formatversion':2,
  'titles':'File:'+source,'prop':'imageinfo','iiprop':'url','iiurlwidth':800})
 info=json.loads(fetch(api))
 pages=info['query']['pages']
 if not pages or 'imageinfo' not in pages[0]:
  raise RuntimeError('No image found: '+source)
 direct=pages[0]['imageinfo'][0].get('thumburl') or pages[0]['imageinfo'][0]['url']
 print('Downloading',term,source,flush=True)
 raw=fetch(direct)
 with Image.open(io.BytesIO(raw)) as im:
  im=ImageOps.exif_transpose(im).convert('RGB')
  im.thumbnail((1120,810),Image.Resampling.LANCZOS)
  canvas=Image.new('RGB',(1200,900),(249,250,251))
  canvas.paste(im,((1200-im.width)//2,(900-im.height)//2))
  canvas.save(DEST/filename,quality=91,optimize=True,subsampling=0)
 pattern=re.compile(r'("word":\s*"'+re.escape(term)+r'"\s*,\s*"image":\s*")[^"]+("\s*,)')
 updated,count=pattern.subn(lambda m:m.group(1)+'photos/'+filename+m.group(2),updated)
 if count!=1:raise RuntimeError('Missing quiz item: '+term)
 print('Saved',filename,(DEST/filename).stat().st_size,flush=True)
 time.sleep(6)
PAGE.write_text(updated,encoding='utf-8')
print('OK: 7 photographs copied locally. No runtime Wikimedia dependency.',flush=True)
