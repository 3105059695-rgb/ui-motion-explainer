"""Compose an approved chest-up circle locally; never calls a paid service."""
import argparse
import json
import subprocess
from pathlib import Path


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('source', type=Path)
    p.add_argument('output', type=Path)
    p.add_argument('--crop', nargs=4, type=int, metavar=('X', 'Y', 'W', 'H'), required=True)
    p.add_argument('--diameter', type=int, default=400)
    p.add_argument('--margin', type=int, default=48)
    a = p.parse_args()
    if a.output.exists():
        p.error('Output exists; choose a new filename.')
    info = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(a.source)], text=True, encoding='utf-8'))
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    if not any(s['codec_type'] == 'audio' for s in info['streams']):
        p.error('Narration audio is required.')
    x, y, w, h = a.crop
    d, m = a.diameter, a.margin
    if min(x, y, m) < 0 or w != h or w <= 0 or x+w > v['width'] or y+h > v['height'] or d < 2 or d % 2 or d+2*m > 1080:
        p.error('Invalid square crop or circle placement.')
    c = (d-1)/2
    graph = (f"[0:v]crop={w}:{h}:{x}:{y},scale={d}:{d}:flags=lanczos,format=rgba,"
             f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='255*clip({d/2}-sqrt(pow(X-{c},2)+pow(Y-{c},2)),0,1)'[circle];"
             f"color=c=0xf8f7fb:s=1920x1080:r={v['r_frame_rate']}[bg];"
             f"[bg][circle]overlay={m}:{1080-m-d}:shortest=1,format=yuv420p[out]")
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-n', '-i', str(a.source), '-filter_complex', graph,
                    '-map', '[out]', '-map', '0:a:0', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
                    '-c:a', 'copy', '-shortest', '-movflags', '+faststart', str(a.output)], check=True)
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(a.output), '-f', 'null', '-'], check=True)
    out = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_format', '-of', 'json', str(a.output)], text=True, encoding='utf-8'))
    if abs(float(out['format']['duration'])-float(info['format']['duration'])) > 0.2:
        raise RuntimeError('Duration mismatch')
    a.output.with_suffix('.circle.json').write_text(json.dumps({'source': str(a.source.resolve()), 'crop_xywh': a.crop,
        'diameter': d, 'margin': m, 'audio': 'copied', 'decode': 'passed', 'visual_review': 'required'}, indent=2), encoding='utf-8')
    print(a.output.resolve())


if __name__ == '__main__':
    main()
