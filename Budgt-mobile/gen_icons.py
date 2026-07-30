import os
from PIL import Image, ImageDraw, ImageFont

sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
}

base_dir = r"c:\Users\User\OneDrive\Documents\Programming\Budgt\Budgt-mobile\app\src\main\res"

for folder, size in sizes.items():
    folder_path = os.path.join(base_dir, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # ── Square / Squircle Icon ──
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Squircle background
    radius = int(size * 0.22)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=(244, 245, 247, 255))
    
    font_size = int(size * 0.65)
    font = None
    font_paths = ["C:\\Windows\\Fonts\\arialbd.ttf", "C:\\Windows\\Fonts\\segoeuib.ttf", "C:\\Windows\\Fonts\\calibrib.ttf"]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font = ImageFont.truetype(fp, font_size)
                break
            except Exception:
                pass
    if font is None:
        font = ImageFont.load_default()
        
    bx = int(size * 0.38)
    by = int(size * 0.50)
    draw.text((bx, by), "B", fill=(33, 37, 45, 255), font=font, anchor="mm")
    
    tx = int(size * 0.74)
    ty = int(size * 0.44)
    tw = int(size * 0.10)
    th = int(size * 0.12)
    triangle = [(tx, ty - th), (tx - tw, ty + th), (tx + tw, ty + th)]
    draw.polygon(triangle, fill=(5, 196, 138, 255))
    
    img.save(os.path.join(folder_path, "ic_launcher.png"))
    
    # ── Round Icon ──
    img_round = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw_r = ImageDraw.Draw(img_round)
    draw_r.ellipse([0, 0, size, size], fill=(244, 245, 247, 255))
    draw_r.text((bx, by), "B", fill=(33, 37, 45, 255), font=font, anchor="mm")
    draw_r.polygon(triangle, fill=(5, 196, 138, 255))
    
    img_round.save(os.path.join(folder_path, "ic_launcher_round.png"))

print("Generated all launcher PNG icons successfully!")
