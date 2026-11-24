"""Build and verify a deterministic runtime-only staging package (standard library)."""
from pathlib import Path
import hashlib
import zipfile

root = Path(__file__).resolve().parents[1]
output = root / 'staging_packages'
output.mkdir(exist_ok=True)
archive = output / 'redmine_done_ratio_step-1.0.5-staging-20261124.zip'
files = [root / name for name in ('init.rb', 'README.md', 'CHANGELOG.md', 'LICENSE.txt')]
for directory in ('app', 'assets', 'config', 'lib'):
    files.extend(path for path in (root / directory).rglob('*') if path.is_file())
assert "version '1.0.5'" in (root / 'init.rb').read_text(encoding='utf-8')
expected = {}
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as package:
    for path in sorted(files):
        name = 'redmine_done_ratio_step/' + path.relative_to(root).as_posix()
        data = path.read_bytes()
        info = zipfile.ZipInfo(name, date_time=(2026, 11, 24, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        package.writestr(info, data)
        expected[name] = data
with zipfile.ZipFile(archive) as package:
    assert package.testzip() is None
    assert set(package.namelist()) == set(expected)
    for name, data in expected.items():
        assert package.read(name) == data, name
digest = hashlib.sha256(archive.read_bytes()).hexdigest()
archive.with_suffix('.zip.sha256').write_text(f'{digest}  {archive.name}\n', encoding='ascii')
print(f'ZIP: {archive}\nBytes: {archive.stat().st_size}\nSHA256: {digest}\nVerified entries: {len(expected)}')
