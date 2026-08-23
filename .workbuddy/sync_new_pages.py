# -*- coding: utf-8 -*-
"""扫描 D 盘吴军目录中新生成的交互网页，复制到导航页 timeline/ 并转英文命名。
规则：
- "XX历史-交互网页" 目录：入口 00-风格选择.html -> index.html，风格A/B/C -> style-a/b/c.html，并改写内部相对链接
- 单文件（如 罗马历史 只有 风格A-*.html）：复制为 index.html
"""
import os, re, shutil, json, sys

SRC = r"D:/BaiduNetdiskDownload/￥299元-吴军·《吴军来信·世界文明史》（完结）"
NAV = r"C:/Users/Administrator/WorkBuddy/个人导航页"
TIMELINE = os.path.join(NAV, "timeline")

HREF_RE = re.compile(r'href="风格([ABC])-[^"]+\.html"')

def transform_style_entry(src_path, dst_path, href_map=None):
    """复制入口页并改写内部风格链接；纯复制风格页。"""
    if href_map:
        with open(src_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = HREF_RE.sub(lambda m: f'href="{href_map.get(m.group(1), "style-" + m.group(1).lower() + ".html")}"', content)
        with open(dst_path, "w", encoding="utf-8") as f:
            f.write(content)
    else:
        shutil.copy2(src_path, dst_path)
    print(f"  {os.path.basename(src_path)} -> {os.path.relpath(dst_path, NAV)}")

def process_full_dir(dirname, target):
    """处理完整交互网页目录（含 00-风格选择.html 与 风格A/B/C）"""
    src_dir = os.path.join(SRC, dirname)
    dst_dir = os.path.join(TIMELINE, target)
    os.makedirs(dst_dir, exist_ok=True)
    style_files = {}
    for fn in os.listdir(src_dir):
        m = re.match(r'^风格([ABC])-(.+\.html)$', fn)
        if m:
            style_files[m.group(1)] = fn
    print(f"== {dirname} -> timeline/{target}/")
    # 入口页
    entry = os.path.join(src_dir, "00-风格选择.html")
    if os.path.exists(entry):
        href_map = {k: f"style-{k.lower()}.html" for k in style_files}
        transform_style_entry(entry, os.path.join(dst_dir, "index.html"), href_map)
    else:
        print("  ! 缺少 00-风格选择.html")
    # 风格页
    for k, fn in sorted(style_files.items()):
        transform_style_entry(os.path.join(src_dir, fn), os.path.join(dst_dir, f"style-{k.lower()}.html"))

def process_single_file(dirname, target, filename):
    """处理只有单个风格文件的目录"""
    dst_dir = os.path.join(TIMELINE, target)
    os.makedirs(dst_dir, exist_ok=True)
    print(f"== {dirname} -> timeline/{target}/ (单文件)")
    transform_style_entry(os.path.join(SRC, dirname, filename), os.path.join(dst_dir, "index.html"))

if __name__ == "__main__":
    mode = sys.argv[1] if len(sys.argv) > 1 else "all"
    if mode in ("all", "russia"):
        process_full_dir("俄罗斯历史-交互网页", "russia")
    if mode in ("all", "renaissance"):
        process_full_dir("文艺复兴历史-交互网页", "renaissance")
    if mode in ("all", "rome"):
        process_single_file("罗马历史-交互网页", "rome", "风格A-罗马帝国-帝国大理石.html")
    print("done")
