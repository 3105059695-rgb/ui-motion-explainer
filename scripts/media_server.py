"""Local static media HTTP serving with bounded single-byte-range responses.

Chromium needs byte ranges to seek ordinary video URLs reliably. No downloads,
dependencies or buffering of whole media files are required. Multiple ranges
are explicitly rejected; this small local server does not emit multipart data.
"""
from datetime import timezone
from email.utils import parsedate_to_datetime
from http.server import SimpleHTTPRequestHandler
import os
import re


class SingleRangeHTTPRequestHandler(SimpleHTTPRequestHandler):
    """Preserve normal static serving; add exact GET/HEAD single-range support."""

    def end_headers(self):
        if getattr(self, '_advertise_ranges', False):
            self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    @staticmethod
    def _date_matches(value, modified):
        try:
            date = parsedate_to_datetime(value)
            if date.tzinfo is None:
                date = date.replace(tzinfo=timezone.utc)
            return int(modified) <= date.timestamp()
        except (TypeError, ValueError, OverflowError):
            return False

    @staticmethod
    def _byte_range(value, size):
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', value.strip(), re.IGNORECASE)
        if match is None or size == 0:
            raise ValueError('Invalid or unsatisfiable byte range')
        first, last = match.groups()
        if not first:
            length = int(last) if last else 0
            if length <= 0:
                raise ValueError('Empty suffix range')
            return max(0, size - length), size - 1
        start = int(first)
        end = int(last) if last else size - 1
        if start >= size or end < start:
            raise ValueError('Unsatisfiable byte range')
        return start, min(end, size - 1)

    def _range_error(self, size, message):
        self.send_response(416, message)
        self.send_header('Content-Range', f'bytes */{size}')
        self.send_header('Content-Length', '0')
        self.end_headers()

    def send_head(self):
        self._copy_range = None
        target = self.translate_path(self.path)
        self._advertise_ranges = os.path.isfile(target)
        ranges = self.headers.get_all('Range', [])
        if not ranges or not self._advertise_ranges:
            return super().send_head()
        try:
            stream = open(target, 'rb')
        except OSError:
            return super().send_head()
        try:
            facts = os.fstat(stream.fileno())
            size = facts.st_size
            # This handler does not issue ETags. An unmatched/unsupported If-Range
            # validator must get the whole current representation, not a slice.
            if_range = self.headers.get('If-Range')
            if if_range is not None and not self._date_matches(if_range, facts.st_mtime):
                stream.close()
                return super().send_head()
            modified_since = self.headers.get('If-Modified-Since')
            if modified_since and 'If-None-Match' not in self.headers and self._date_matches(modified_since, facts.st_mtime):
                stream.close()
                self.send_response(304)
                self.end_headers()
                return None
            if len(ranges) != 1 or ',' in ranges[0]:
                stream.close()
                self._range_error(size, 'Only one byte range is supported')
                return None
            try:
                start, end = self._byte_range(ranges[0], size)
            except ValueError:
                stream.close()
                self._range_error(size, 'Invalid or unsatisfiable byte range')
                return None
            stream.seek(start)
            self._copy_range = (start, end)
            self.send_response(206)
            self.send_header('Content-Type', self.guess_type(target))
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.send_header('Content-Length', str(end - start + 1))
            self.send_header('Last-Modified', self.date_time_string(facts.st_mtime))
            self.end_headers()
            return stream
        except BaseException:
            stream.close()
            raise

    def copyfile(self, source, outputfile):
        selected = getattr(self, '_copy_range', None)
        if selected is None:
            return super().copyfile(source, outputfile)
        remaining = selected[1] - selected[0] + 1
        while remaining:
            block = source.read(min(64 * 1024, remaining))
            if not block:
                break
            outputfile.write(block)
            remaining -= len(block)
