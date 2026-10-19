"""The public entry must not equate renderer exit code zero with delivery success."""
import contextlib
import io
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import ui


class OutputEntryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.project = Path(self.temp.name).resolve()

    def render(self, extra=(), passed=True):
        output = io.StringIO()
        with patch.object(ui.production_entry, 'export_check', return_value={'production_export': True}), \
             patch.object(ui, 'command', return_value=['mock-render']), \
             patch.object(ui.subprocess, 'run') as run, \
             patch.object(ui.production_entry, 'verify_output', return_value={'technical_passed': passed}) as verify, \
             contextlib.redirect_stdout(output):
            run.return_value.returncode = 0
            result = ui.main(['render', '--engine', 'base', '--', '--project', str(self.project), *extra])
        return result, verify, output.getvalue()

    def test_successful_full_render_is_verified_against_actual_output(self):
        result, verify, _ = self.render()
        self.assertEqual(0, result)
        verify.assert_called_once_with(self.project, self.project / 'renders/preview.mp4', None,
                                       root=ui.ROOT, expected_plan_sha256=None)

    def test_successful_renderer_with_invalid_output_returns_failure(self):
        result, verify, _ = self.render(passed=False)
        self.assertEqual(1, result)
        verify.assert_called_once()

    def test_explicit_preview_cannot_claim_verified_full_delivery(self):
        for arguments in (['--stills-only'], ['--start', '1'], ['--end', '2']):
            with self.subTest(arguments=arguments):
                result, verify, output = self.render(arguments)
                self.assertEqual(0, result)
                verify.assert_not_called()
                self.assertIn('"full_delivery_verified": false', output)

    def test_explicit_output_directory_is_verified(self):
        target = self.project / 'custom-output'
        _, verify, _ = self.render(['--out', str(target)])
        self.assertEqual(target / 'preview.mp4', verify.call_args.args[1])


if __name__ == '__main__':
    unittest.main()
