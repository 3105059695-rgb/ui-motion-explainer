"""Usage: python scripts/subset-font.py /path/to/NotoSansSC.ttf

Requires fontTools and brotli. The checked-in WOFF2 already covers index.html.
"""
import sys
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
font = TTFont(sys.argv[1])
options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']
options.name_IDs = ['*']
options.name_legacy = True
options.name_languages = ['*']
subsetter = subset.Subsetter(options=options)
subsetter.populate(text=(root/'index.html').read_text(encoding='utf-8'))
subsetter.subset(font)
font.flavor = 'woff2'
output = root/'assets/NotoSansSC-subset.woff2'
font.save(output)
print(output.name, output.stat().st_size, 'bytes')
