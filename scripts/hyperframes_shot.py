"""Build a silent, native HyperFrames shot from the same current media and poses as the main edit."""
import html
import json
import shutil


def encode(value):
    return json.dumps(value, ensure_ascii=False).replace('<', r'\u003c')


def build(root, source_folder, dest, recipe, shot, plan, score, missing):
    import reference_edits as edits
    from video_sources import Catalog
    for filename in ('agent-editorial.js', 'motion-core.js'):
        shutil.copyfile(root/'assets/agent-editorial'/filename, dest/filename)
    shutil.copyfile(root/'assets/reference-edits/shot-motion.js', dest/'shot-motion.js')
    if missing:
        (dest/'shot-data.js').write_text('window.FUSION_SHOT='+encode(score)+';\n', encoding='utf-8')
        return {'pending': missing}

    fps = plan['fps']
    duration = (shot['end_frame']-shot['start_frame'])/fps
    media = edits.Media(source_folder, dest, Catalog(root))
    bound = {key: edits._current_slot(key, slot, shot['inputs'][key], recipe, media, duration, fps)
             for key, slot in recipe['slots'].items()}
    layers = []
    for i, layer in enumerate(recipe['layers']):
        name = layer['slot']
        slot, item = score['slots'][name], bound[name]
        surface = slot['surface']
        if item['kind']=='text':
            content = f'<span data-fusion-content class="fusion-{surface}">{html.escape(item["text"])}</span>'
            align = ' centered' if surface=='focus' or surface=='caption' and not item.get('placement') else ''
            if surface=='query':
                content = ('<span class="fusion-query"><i class="fusion-search-handle" aria-hidden="true"></i>'
                           f'<span data-fusion-content>{html.escape(item["text"])}</span></span>')
                align = ' search'
            layers.append(f'<div class="fusion-layer fusion-text{align}" data-fusion-layer="{i}">{content}</div>')
            continue
        # Imported media is relative to the HF project. Its source clock belongs to the native video track.
        src = html.escape(item['src'], quote=True)
        attrs = f'id="material-{i}" data-fusion-content src="{src}" style="object-fit:{item["fit"]}"'
        start, end = (layer['keys'][n]['at']*duration for n in (0,-1))
        clip = f'class="clip" data-start="{start:.8f}" data-duration="{end-start:.8f}" data-track-index="{i+1}"'
        if item['kind']=='video':
            offset = item['source_in']+start-item['first']*duration
            content = f'<video {attrs} {clip} muted playsinline preload="auto" data-media-start="{max(0,offset):.8f}"></video>'
        else:
            content = f'<img {attrs} {clip} alt="">'
        layers.append(f'<div class="fusion-layer" data-fusion-layer="{i}"><div class="fusion-mat fusion-{surface}">{content}</div></div>')
        slot['binding']['path'] = item['src']
        if item.get('from_project'):
            slot['binding']['implementation'] = item['from_project'].get('capability')
            slot['binding'].pop('from_project', None)
    script = 'window.FUSION_SHOT='+encode(score)+';\n'
    (dest/'shot-data.js').write_text(script, encoding='utf-8')
    shutil.copyfile(root/'assets/modules/director/assets/studio/vendor/gsap.min.js', dest/'gsap.min.js')
    entry = (root/'assets/reference-edits/hyperframes.html').read_text(encoding='utf-8')
    entry = (entry.replace('FUSION_ID', 'fusion-shot-'+str(score['number']))
             .replace('FUSION_WIDTH', str(plan['width'])).replace('FUSION_HEIGHT', str(plan['height']))
             .replace('FUSION_DURATION', str(duration)).replace('<!-- FUSION_LAYERS -->', '\n'.join(layers)))
    (dest/'index.html').write_text(entry, encoding='utf-8')
    return {'entry':'index.html', 'pending':[], 'duration':duration, 'media':len(media.assets), 'audio':'silent-shot'}
