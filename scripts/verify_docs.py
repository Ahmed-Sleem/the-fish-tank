#!/usr/bin/env python3
"""Validate the planning deliverables; this does not validate an unbuilt game."""
from pathlib import Path
import hashlib
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    'GAME_IDEA.md': '60715ded001bf858027b4cf48de44c6bf7730139037b3ac64b102f86b392abe7',
    'TECH_SPEC.md': 'e6f31557d9b7be31a707489bb00073e15d776423b75d438df18626a8b3bb5b6f',
    '_working_docs/AGENT_RULES.md': '6ddd622a91c177c07ecb10e33bd1a4c324f5ef0056e6f6b51ed7866a027c3f29',
    '_working_docs/CHUNKING_MECHANISM.md': 'f76e629d1d39b477ab6a824a5b6e0459fd306f324c1de756769fbf019308b104',
}
REQUIRED = [*SOURCES, 'README.md', 'IMPLEMENTATION_PLAN.md', 'DECISIONS.md',
            'THIRD_PARTY_NOTICES.md', '_working_docs/AUDIT_AND_TODO.md',
            '_working_docs/IMPLEMENTATION_LOG.md', '_working_docs/CHANGELOG.md',
            '_working_docs/NEXT_SESSIONS_ROADMAP.md']


def verify():
    errors = []
    for name in REQUIRED:
        path = ROOT / name
        if not path.is_file() or not path.read_text().strip():
            errors.append(f'missing/empty deliverable: {name}')
    for name, expected in SOURCES.items():
        path = ROOT / name
        if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            errors.append(f'original source changed: {name}')
    plan_path = ROOT / 'IMPLEMENTATION_PLAN.md'
    plan = plan_path.read_text() if plan_path.exists() else ''
    sections = re.findall(r'^### S(\d{2}) — .+?\n(.*?)(?=^### S|^## |\Z)', plan, re.M | re.S)
    if [number for number, _ in sections] != [f'{i:02}' for i in range(1, 40)]:
        errors.append('session sequence must be S01–S39 exactly once')
    for number, body in sections:
        for field in ('**Phase:**', '**Dependency:**', '**Status:**', '**Read first:**',
                      '**Bounded work:**', '**Deliverables / likely paths:**',
                      '**Verification / negative cases:**', '**Exit gate:**', '**Do not include:**'):
            if field not in body:
                errors.append(f'S{number} missing {field}')
    for title, count in [('### GAME_IDEA §17 acceptance checklist (original order)', 22),
                         ('### TECH_SPEC section ownership', 24)]:
        block = plan.split(title, 1)[-1].split('\n##', 1)[0] if title in plan else ''
        numbers = re.findall(r'^\| (\d+)(?: [^|]*)? \|', block, re.M)
        if numbers != [str(i) for i in range(1, count + 1)]:
            errors.append(f'incomplete coverage table: {title}')
    phase_block = plan.split('## 5. Phase acceptance checkpoints', 1)[-1].split('## 6.', 1)[0]
    if re.findall(r'^\| (\d+) ', phase_block, re.M) != [str(i) for i in range(1, 13)]:
        errors.append('phase gates must cover 1–12 in order')
    for name in REQUIRED:
        path = ROOT / name
        if not path.exists():
            continue
        for target in re.findall(r'\[[^\]]+\]\(([^\s)]+)\)', path.read_text()):
            if target.startswith(('http:', 'https:', '#', 'mailto:')):
                continue
            if not (path.parent / target.split('#')[0]).exists():
                errors.append(f'broken local link: {name} -> {target}')
    # Scan tracked and untracked deliverables, excluding ignored files and Git internals.
    files = subprocess.check_output(['git', 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], cwd=ROOT).decode().split('\0')
    patterns = [r'gh[pousr]_[A-Za-z0-9]{30,}', r'github_pat_[A-Za-z0-9_]{30,}',
                r'AIza[A-Za-z0-9_-]{30,}', r'sk-[A-Za-z0-9_-]{24,}',
                r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----']
    for name in files:
        path = ROOT / name
        if not name or not path.is_file():
            continue
        if path.name == '.env' or path.name.startswith('.env.'):
            errors.append(f'environment file included: {name}')
        try:
            text = path.read_text()
        except (UnicodeDecodeError, OSError):
            continue
        if any(re.search(pattern, text) for pattern in patterns):
            errors.append(f'possible credential in {name} (value not printed)')
    return errors


if __name__ == '__main__':
    failures = verify()
    if failures:
        print('\n'.join(f'FAIL: {error}' for error in failures))
        sys.exit(1)
    print('PASS: source hashes, required docs, 39 session contracts, 12 phase gates, 22 idea / 24 spec mappings, local links, credential-pattern scan')
    print('LIMIT: structural docs checks and heuristic secret scan only; no app, provider or deployment validation.')
