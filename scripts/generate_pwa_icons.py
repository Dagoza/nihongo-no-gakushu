import os
import subprocess

def create_svg(is_maskable=False):
    bg_rx = "0" if is_maskable else "115"
    # Scale kanji slightly smaller for maskable to stay well inside safe zone
    scale = 0.82 if is_maskable else 1.0
    
    # Calculate transform to center if scaled
    transform = f'transform="translate(256 256) scale({scale}) translate(-256 -256)"' if is_maskable else ''
    
    border = '' if is_maskable else '''
  <!-- Inner border for depth -->
  <rect x="8" y="8" width="496" height="496" rx="107" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="4" />'''

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3730a3" />
      <stop offset="45%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#e11d48" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#090d16" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="{bg_rx}" fill="url(#bgGrad)" />
  {border}

  <g {transform}>
    <!-- Subtle Japanese Hinomaru / Sun motif -->
    <circle cx="256" cy="256" r="155" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.12)" stroke-width="2" />
    <circle cx="256" cy="256" r="95" fill="rgba(255,255,255,0.05)" />

    <!-- Vector Kanji 日 -->
    <g filter="url(#shadow)">
      <!-- Left vertical stroke -->
      <path d="M 148 139 L 148 387" stroke="#ffffff" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <!-- Top and Right stroke -->
      <path d="M 148 139 L 364 139 L 364 387" stroke="#ffffff" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <!-- Middle horizontal stroke -->
      <path d="M 148 256 L 364 256" stroke="#ffffff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <!-- Bottom horizontal stroke -->
      <path d="M 148 373 L 364 373" stroke="#ffffff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </g>
  </g>
</svg>'''

def main():
    icons_dir = os.path.abspath('public/icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    # 1. Standard SVG
    standard_svg = os.path.join(icons_dir, 'icon.svg')
    with open(standard_svg, 'w') as f:
        f.write(create_svg(is_maskable=False))
        
    # 2. Maskable SVG
    maskable_svg = os.path.join(icons_dir, 'maskable-icon.svg')
    with open(maskable_svg, 'w') as f:
        f.write(create_svg(is_maskable=True))
        
    # Base 512 pngs
    base_512 = os.path.join(icons_dir, 'icon-512x512.png')
    subprocess.run(['sips', '-s', 'format', 'png', standard_svg, '--out', base_512], check=True)
    
    maskable_512 = os.path.join(icons_dir, 'maskable-icon-512x512.png')
    subprocess.run(['sips', '-s', 'format', 'png', maskable_svg, '--out', maskable_512], check=True)

    # Standard sizes
    sizes = [72, 96, 128, 144, 152, 180, 192, 384]
    for size in sizes:
        out_name = f'apple-touch-icon.png' if size == 180 else f'icon-{size}x{size}.png'
        out_path = os.path.join(icons_dir, out_name)
        subprocess.run(['sips', '-z', str(size), str(size), base_512, '--out', out_path], check=True)
        if size == 180:
            # Also copy to root public for iOS default /apple-touch-icon.png
            subprocess.run(['cp', out_path, os.path.abspath('public/apple-touch-icon.png')], check=True)

    # Maskable 192
    maskable_192 = os.path.join(icons_dir, 'maskable-icon-192x192.png')
    subprocess.run(['sips', '-z', '192', '192', maskable_512, '--out', maskable_192], check=True)

    # Favicons
    fav32 = os.path.join(icons_dir, 'favicon-32x32.png')
    fav16 = os.path.join(icons_dir, 'favicon-16x16.png')
    subprocess.run(['sips', '-z', '32', '32', base_512, '--out', fav32], check=True)
    subprocess.run(['sips', '-z', '16', '16', base_512, '--out', fav16], check=True)
    
    # Root favicon
    fav_ico = os.path.abspath('public/favicon.ico')
    subprocess.run(['sips', '-s', 'format', 'ico', '-z', '32', '32', base_512, '--out', fav_ico], check=True)

    print("All PWA icons generated successfully!")

if __name__ == '__main__':
    main()
