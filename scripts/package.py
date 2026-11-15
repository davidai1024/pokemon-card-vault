from pathlib import Path
import zipfile, zlib

root = Path("dist")
version = Path("VERSION").read_text().strip()
output = Path("releases") / ("kanto-vault-" + version + ".zip")
output.parent.mkdir(exist_ok=True)
original_compressor = zipfile._get_compressor
zipfile._get_compressor = lambda kind, level=None: zlib.compressobj(9, zlib.DEFLATED, -15, 9) if kind == zipfile.ZIP_DEFLATED else original_compressor(kind, level)
with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for item in sorted(root.rglob("*")):
        if item.is_file() and item.name != ".DS_Store":
            archive.write(item, item.relative_to(root))
with zipfile.ZipFile(output) as archive:
    assert "index.html" in archive.namelist()
    assert archive.testzip() is None
if output.stat().st_size > 10 * 1024 * 1024:
    output.unlink()
    raise SystemExit("Package exceeds the 10 MiB upload limit")
print(str(output) + " (" + str(output.stat().st_size) + " bytes)")
