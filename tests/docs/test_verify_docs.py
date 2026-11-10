"""Regress the actual installed-workflow handoff, isolated from production files."""
import importlib.util
from pathlib import Path
import shutil
import tempfile
import unittest
from unittest.mock import patch

REPO = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('verify_docs', REPO / 'scripts/verify_docs.py')
checker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(checker)


class InstalledWorkflowChecks(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        for relative in dict.fromkeys([
            *checker.REQUIRED, '.github/workflows/ci.yml', '.github/workflows/pages.yml',
        ]):
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(REPO / relative, target)
        self.root_patch = patch.object(checker, 'ROOT', self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)
        # Git file listing/secret scan is separate; this isolated fixture tests docs contracts.
        self.git_patch = patch.object(checker.subprocess, 'check_output', return_value=b'')
        self.git_patch.start()
        self.addCleanup(self.git_patch.stop)

    def test_installed_workflows_suffice_without_old_download_copies(self):
        self.assertFalse((self.root / 'docs/github-pages-setup/ci.yml').exists())
        self.assertFalse((self.root / 'docs/github-pages-setup/pages.yml').exists())
        self.assertEqual(checker.verify(), [])

    def test_each_installed_workflow_is_required(self):
        for filename in ('ci.yml', 'pages.yml'):
            with self.subTest(filename=filename):
                path = self.root / '.github/workflows' / filename
                original = path.read_bytes()
                try:
                    path.unlink()
                    self.assertIn(
                        f'missing/empty deliverable: .github/workflows/{filename}',
                        checker.verify(),
                    )
                finally:
                    path.write_bytes(original)

    def test_each_installed_workflow_contract_is_checked(self):
        self.assertEqual(sum(map(len, checker.WORKFLOW_RULES.values())), 14)
        for filename, clauses in checker.WORKFLOW_RULES.items():
            path = self.root / '.github/workflows' / filename
            original = path.read_text()
            for clause in clauses:
                with self.subTest(filename=filename, clause=clause):
                    try:
                        self.assertIn(clause, original)
                        path.write_text(original.replace(clause, 'REMOVED_CONTRACT'))
                        self.assertIn(
                            f'Installed workflow {filename} missing contract: {clause}',
                            checker.verify(),
                        )
                    finally:
                        path.write_text(original)

    def test_player_guide_links_are_checked(self):
        readme = self.root / 'README.md'
        readme.write_text(readme.read_text() + '\n[Broken guide](docs/missing-player-guide.md)\n')
        self.assertIn(
            'broken local link: README.md -> docs/missing-player-guide.md',
            checker.verify(),
        )


if __name__ == '__main__':
    unittest.main()
