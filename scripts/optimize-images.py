#!/usr/bin/env python3
"""
Optimization script for Alison Ferazzini Photography assets.
- Preserves all original images in images/ untouched.
- Creates cropped, web-ready logo derivatives with both solid warm ivory and transparent backgrounds.
- Generates responsive WebP images (thumb, medium, large) + LQIP base64 data URIs.
- Outputs structured metadata in src/data/photos.json.
"""

import os
import json
import base64
import io
from PIL import Image, ImageFilter, ImageOps
import numpy as np

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES_DIR = os.path.join(WORKSPACE_DIR, 'images')
PUBLIC_DIR = os.path.join(WORKSPACE_DIR, 'public')
PUBLIC_PHOTOS_DIR = os.path.join(PUBLIC_DIR, 'images', 'photos')
PUBLIC_LOGO_DIR = os.path.join(PUBLIC_DIR, 'images', 'logo')
DATA_DIR = os.path.join(WORKSPACE_DIR, 'src', 'data')

os.makedirs(PUBLIC_PHOTOS_DIR, exist_ok=True)
os.makedirs(PUBLIC_LOGO_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Curated metadata mapping for the 24 photos
PHOTO_DETAILS = {
    "weareiconico-scenico-tramonto-persone.jpg": {
        "title": "Golden Hour sul Lago di Garda",
        "category": "lifestyle",
        "categoryLabel": "Eventi & Lifestyle",
        "context": "We Are Iconico · Lago di Garda",
        "description": "Luce dorata e silhouette al tramonto sulle sponde del lago. L'atmosfera spontanea di una serata estiva sul Garda.",
        "featured": True,
        "heroCandidate": True
    },
    "takeover-night-scenico-folla.jpg": {
        "title": "Energia & Luci — Takeover Night",
        "category": "dj-events",
        "categoryLabel": "DJ Set & Nightlife",
        "context": "Takeover Night · Evento Club",
        "description": "Fascio di luce blu, scintille e folla in movimento. L'impatto visivo della musica e del clubbing contemporaneo.",
        "featured": True,
        "heroCandidate": True
    },
    "wedding-sposi.jpg": {
        "title": "Il Brindisi degli Sposi",
        "category": "weddings",
        "categoryLabel": "Matrimoni & Cerimonie",
        "context": "Matrimonio sul Lago",
        "description": "Un bacio spontaneo e calici levati tra le foglie verdi. Un'emozione autentica catturata nel momento più intimo.",
        "featured": True,
        "heroCandidate": True
    },
    "food-sushiroll-yumesushifusion.jpg": {
        "title": "Signature Roll — Crunch & Salse",
        "category": "food-drink",
        "categoryLabel": "Food & Drink",
        "context": "Yume Sushi Fusion",
        "description": "Dettaglio ravvicinato su consistenze, granella croccante e gocce di salsa. Precisione e profondità di campo per il food contemporaneo.",
        "featured": True,
        "heroCandidate": True
    },
    "weareiconico-lago-cheers-drink.jpg": {
        "title": "Cheers al Tramonto",
        "category": "lifestyle",
        "categoryLabel": "Eventi & Lifestyle",
        "context": "We Are Iconico · Riva del Lago",
        "description": "Brindisi con cocktail ghiacciati e il riflesso dell'acqua sullo sfondo.",
        "featured": True,
        "heroCandidate": False
    },
    "weareiconico-persone.jpg": {
        "title": "Condivisione & Sorrisi",
        "category": "lifestyle",
        "categoryLabel": "Eventi & Lifestyle",
        "context": "We Are Iconico · Social Atmosphere",
        "description": "Ritratti spontanei e conversazioni tra amici durante un evento pomeridiano.",
        "featured": False,
        "heroCandidate": False
    },
    "aperipirlo.jpg": {
        "title": "Il Rituale del Pirlo Bresciano",
        "category": "food-drink",
        "categoryLabel": "Food & Drink",
        "context": "AperiPirlo · Tradizione & Design",
        "description": "Il calice con fetta d'arancia e bollicine, protagonista dell'aperitivo tra Brescia e il Lago di Garda.",
        "featured": True,
        "heroCandidate": False
    },
    "aperipirlo-ragazza.jpg": {
        "title": "Vibrazioni Aperitivo",
        "category": "lifestyle",
        "categoryLabel": "Eventi & Lifestyle",
        "context": "AperiPirlo Event",
        "description": "Ritratto dinamico con calice e luce calda d'ambiente.",
        "featured": False,
        "heroCandidate": False
    },
    "aperipirlo-persone.jpg": {
        "title": "Atmosfera di Gruppo",
        "category": "lifestyle",
        "categoryLabel": "Eventi & Lifestyle",
        "context": "AperiPirlo Event",
        "description": "L'energia di un locale vivo attraverso volti e scambi autentici.",
        "featured": False,
        "heroCandidate": False
    },
    "takeover-night-evento.jpg": {
        "title": "Console & Sound Experience",
        "category": "dj-events",
        "categoryLabel": "DJ Set & Nightlife",
        "context": "Takeover Night · DJ Set",
        "description": "La postazione console immersa in un gioco di ombre e bagliori d'atmosfera.",
        "featured": True,
        "heroCandidate": False
    },
    "takeover-night-ragazza.jpg": {
        "title": "Nightlife Mood & Neon Vibes",
        "category": "dj-events",
        "categoryLabel": "DJ Set & Nightlife",
        "context": "Takeover Night",
        "description": "Ritratto in luce mista con sfumature violacee ed espressività contemporanea.",
        "featured": True,
        "heroCandidate": False
    },
    "food-gyoza2-yumesushifusion.jpg": {
        "title": "Gyoza Gourmet alla Piastra",
        "category": "food-drink",
        "categoryLabel": "Food & Drink",
        "context": "Yume Sushi Fusion",
        "description": "Doratura perfetta, vapore e impiattamento geometrico d'ispirazione orientale.",
        "featured": True,
        "heroCandidate": False
    },
    "food-yumesushifusion.jpg": {
        "title": "Composizione Kaiseki Contemporanea",
        "category": "food-drink",
        "categoryLabel": "Food & Drink",
        "context": "Yume Sushi Fusion",
        "description": "Vista dall'alto e armonia cromatica dei piatti degustazione.",
        "featured": False,
        "heroCandidate": False
    },
    "wedding-cerimonia.jpg": {
        "title": "La Promessa all'Aperto",
        "category": "weddings",
        "categoryLabel": "Matrimoni & Cerimonie",
        "context": "Cerimonia nel Parco",
        "description": "Lo scambio dei voti incorniciato da alberi secolari e sguardi commossi.",
        "featured": True,
        "heroCandidate": False
    },
    "wedding-tavolo-persone.jpg": {
        "title": "La Festa al Banchetto",
        "category": "weddings",
        "categoryLabel": "Matrimoni & Cerimonie",
        "context": "Ricevimento Nuziale",
        "description": "La gioia dei commensali, il tintinnio dei bicchieri e la cura del mise en place.",
        "featured": False,
        "heroCandidate": False
    },
    "wedding2-taglio-torta.jpg": {
        "title": "Il Momento della Torta Nuziale",
        "category": "weddings",
        "categoryLabel": "Matrimoni & Cerimonie",
        "context": "Villa sul Garda · Taglio della Torta",
        "description": "I festeggiamenti serali con gli sposi sorridenti davanti alla torta monumentale.",
        "featured": True,
        "heroCandidate": False
    },
    "wedding2-sposa-bambino.jpg": {
        "title": "Tenerezza & Dettagli",
        "category": "weddings",
        "categoryLabel": "Matrimoni & Cerimonie",
        "context": "Momenti Intimi di Nozze",
        "description": "La sposa con un bambino in braccio: un ricordo sincero e ricco di calore umano.",
        "featured": False,
        "heroCandidate": False
    },
    "wedding2-balli.jpg": {
        "title": "Open Bar & Balli di Nozze",
        "category": "weddings",
        "categoryLabel": "Matrimoni & Cerimonie",
        "context": "Party Finale di Matrimonio",
        "description": "Movimento, risate e pista da ballo scatenata a fine serata.",
        "featured": False,
        "heroCandidate": False
    },
    "compleanno-in-casa-giardino-bambino-mamma.jpg": {
        "title": "Festa in Giardino — Primi Passi",
        "category": "private-events",
        "categoryLabel": "Eventi Privati & Aziendali",
        "context": "Compleanno Privato in Giardino",
        "description": "Un compleanno all'aperto tra palloncini verdi, un'auto giocattolo e la complicità mamma-figlio.",
        "featured": True,
        "heroCandidate": False
    },
    "compleanno-in-casa-bambino.jpg": {
        "title": "La Curiosità di un Bambino",
        "category": "private-events",
        "categoryLabel": "Eventi Privati & Aziendali",
        "context": "Festa di Compleanno in Famiglia",
        "description": "Espressione innocente e luce naturale in ambiente domestico.",
        "featured": False,
        "heroCandidate": False
    },
    "compleanno-in-casa-bambino-mamma.jpg": {
        "title": "Abbraccio di Famiglia",
        "category": "private-events",
        "categoryLabel": "Eventi Privati & Aziendali",
        "context": "Festa di Compleanno in Famiglia",
        "description": "Scatti spontanei tra le mura di casa per custodire una ricorrenza speciale.",
        "featured": False,
        "heroCandidate": False
    },
    "sponsor-maglie-proudofmemilan.jpg": {
        "title": "Streetwear & Brand Identity",
        "category": "private-events",
        "categoryLabel": "Eventi Privati & Aziendali",
        "context": "Proud of Me · Milano",
        "description": "Lancio promozionale per brand streetwear con modelli, auto e identità urban contemporanea.",
        "featured": True,
        "heroCandidate": False
    },
    "sponsor-maglie-proudofmemilan2.jpg": {
        "title": "Editorial Urban Shoot",
        "category": "private-events",
        "categoryLabel": "Eventi Privati & Aziendali",
        "context": "Proud of Me · Milano",
        "description": "Content creation per social media con pose decise e branding in evidenza.",
        "featured": False,
        "heroCandidate": False
    },
    "sponsor-magie-proudofmemilan3.jpg": {
        "title": "Dettaglio Collezione Streetwear",
        "category": "private-events",
        "categoryLabel": "Eventi Privati & Aziendali",
        "context": "Proud of Me · Milano",
        "description": "Focus sui tessuti, grafiche e accessori per la comunicazione digitale del brand.",
        "featured": False,
        "heroCandidate": False
    }
}

def optimize_logo():
    print("--- OPTIMIZING LOGO DERIVATIVES ---")
    logo_path = os.path.join(IMAGES_DIR, 'logo.jpg')
    img = Image.open(logo_path).convert('RGB')
    arr = np.array(img).astype(float)
    
    # Background color detected
    top_edge = arr[0:15, :, :].reshape(-1, 3)
    mean_bg = top_edge.mean(axis=0)
    
    # Distance from bg
    diff = np.max(np.abs(arr - mean_bg), axis=2)
    mask = diff > 10
    y_indices, x_indices = np.where(mask)
    min_x, max_x = x_indices.min(), x_indices.max()
    min_y, max_y = y_indices.min(), y_indices.max()
    
    pad_x = 18
    pad_y = 12
    crop_box = (
        max(0, min_x - pad_x),
        max(0, min_y - pad_y),
        min(arr.shape[1], max_x + pad_x),
        min(arr.shape[0], max_y + pad_y)
    )
    cropped_solid = img.crop(crop_box)
    
    # Save cropped solid original background
    solid_out = os.path.join(PUBLIC_LOGO_DIR, 'logo-trimmed.png')
    cropped_solid.save(solid_out, 'PNG', optimize=True)
    cropped_solid.save(os.path.join(PUBLIC_LOGO_DIR, 'logo-trimmed.webp'), 'WEBP', quality=95)
    print(f"Saved logo-trimmed.png: size {cropped_solid.size}")
    
    # Transparent version:
    cropped_arr = np.array(cropped_solid).astype(float)
    diff_cropped = np.max(np.abs(cropped_arr - mean_bg), axis=2)
    
    # Alpha curve: smooth anti-aliased edge
    alpha = np.clip((diff_cropped - 5.0) / 28.0 * 255.0, 0, 255).astype(np.uint8)
    
    # Reconstruct RGBA keeping dark text and pink camera intact
    rgba = np.zeros((cropped_arr.shape[0], cropped_arr.shape[1], 4), dtype=np.uint8)
    rgba[:, :, :3] = np.array(cropped_solid)
    rgba[:, :, 3] = alpha
    
    trans_img = Image.fromarray(rgba, 'RGBA')
    trans_out = os.path.join(PUBLIC_LOGO_DIR, 'logo-transparent.png')
    trans_img.save(trans_out, 'PNG', optimize=True)
    trans_img.save(os.path.join(PUBLIC_LOGO_DIR, 'logo-transparent.webp'), 'WEBP', quality=95)
    print(f"Saved logo-transparent.png: size {trans_img.size}")
    
    # White / Light inverted version for dark backgrounds:
    # Text becomes warm white (#FAF7F4), camera remains blush pink
    white_arr = rgba.copy()
    # Find pink pixels (R high, B high, G slightly lower)
    is_pink = (white_arr[:, :, 0] > 180) & (white_arr[:, :, 1] > 140) & (white_arr[:, :, 1] < 225) & (white_arr[:, :, 2] > 160) & (white_arr[:, :, 0] - white_arr[:, :, 1] > 20)
    # Non-pink pixels with alpha > 0 turn to white/ivory
    for y in range(white_arr.shape[0]):
        for x in range(white_arr.shape[1]):
            if white_arr[y, x, 3] > 0 and not is_pink[y, x]:
                white_arr[y, x, 0] = 250
                white_arr[y, x, 1] = 247
                white_arr[y, x, 2] = 244
    
    white_img = Image.fromarray(white_arr, 'RGBA')
    white_out = os.path.join(PUBLIC_LOGO_DIR, 'logo-white.png')
    white_img.save(white_out, 'PNG', optimize=True)
    white_img.save(os.path.join(PUBLIC_LOGO_DIR, 'logo-white.webp'), 'WEBP', quality=95)
    print(f"Saved logo-white.png: size {white_img.size}")

    # Generate elegant Favicon with the pink camera and AF initials
    favicon_crop = img.crop((180, 180, 360, 360))
    favicon_img = favicon_crop.resize((64, 64), Image.Resampling.LANCZOS)
    favicon_img.save(os.path.join(PUBLIC_DIR, 'favicon.png'), 'PNG')
    # 32x32 standard ico/png
    favicon_img.resize((32, 32), Image.Resampling.LANCZOS).save(os.path.join(PUBLIC_DIR, 'favicon.ico'))
    print("Saved favicon.png & favicon.ico")

def generate_lqip(img):
    # Generates a tiny 20px blurred thumbnail as base64 data URI
    tiny = img.copy()
    tiny.thumbnail((24, 24), Image.Resampling.BILINEAR)
    buf = io.BytesIO()
    tiny.save(buf, format='WEBP', quality=40)
    encoded = base64.b64encode(buf.getvalue()).decode('utf-8')
    return f"data:image/webp;base64,{encoded}"

def optimize_photos():
    print("\n--- OPTIMIZING PHOTOGRAPHS ---")
    photos_data = []
    
    all_files = sorted([f for f in os.listdir(IMAGES_DIR) if f.endswith('.jpg') and f != 'logo.jpg'])
    print(f"Found {len(all_files)} photographs to process.")
    
    for filename in all_files:
        src_path = os.path.join(IMAGES_DIR, filename)
        base_name, _ = os.path.splitext(filename)
        
        with Image.open(src_path) as orig:
            width, height = orig.size
            aspect_ratio = round(width / height, 3)
            
            # LQIP
            lqip = generate_lqip(orig)
            
            # Generate responsive derivatives:
            # 1. Large (max dimension 1440)
            large = orig.copy()
            large.thumbnail((1440, 1440), Image.Resampling.LANCZOS)
            large_name = f"{base_name}-1440.webp"
            large_path = os.path.join(PUBLIC_PHOTOS_DIR, large_name)
            large.save(large_path, 'WEBP', quality=84)
            
            # 2. Medium (max dimension 960)
            medium = orig.copy()
            medium.thumbnail((960, 960), Image.Resampling.LANCZOS)
            medium_name = f"{base_name}-960.webp"
            medium_path = os.path.join(PUBLIC_PHOTOS_DIR, medium_name)
            medium.save(medium_path, 'WEBP', quality=82)
            
            # 3. Thumb (max dimension 520)
            thumb = orig.copy()
            thumb.thumbnail((520, 520), Image.Resampling.LANCZOS)
            thumb_name = f"{base_name}-520.webp"
            thumb_path = os.path.join(PUBLIC_PHOTOS_DIR, thumb_name)
            thumb.save(thumb_path, 'WEBP', quality=80)
            
            # Details from map
            details = PHOTO_DETAILS.get(filename, {
                "title": base_name.replace('-', ' ').title(),
                "category": "lifestyle",
                "categoryLabel": "Eventi & Lifestyle",
                "context": "Alison Ferazzini Photography",
                "description": "Scatto professionale curato da Alison Ferazzini.",
                "featured": False,
                "heroCandidate": False
            })
            
            photo_entry = {
                "id": base_name,
                "filename": filename,
                "title": details["title"],
                "category": details["category"],
                "categoryLabel": details["categoryLabel"],
                "context": details["context"],
                "description": details["description"],
                "featured": details["featured"],
                "heroCandidate": details["heroCandidate"],
                "width": width,
                "height": height,
                "aspectRatio": aspect_ratio,
                "lqip": lqip,
                "src": f"/images/photos/{medium_name}",
                "srcLarge": f"/images/photos/{large_name}",
                "srcMedium": f"/images/photos/{medium_name}",
                "srcThumb": f"/images/photos/{thumb_name}",
                "srcset": f"/images/photos/{thumb_name} 520w, /images/photos/{medium_name} 960w, /images/photos/{large_name} 1440w",
                "sizes": "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            photos_data.append(photo_entry)
            print(f"Processed: {filename} ({width}x{height}) -> {thumb.size}, {medium.size}, {large.size}")

    # Save to src/data/photos.json
    json_path = os.path.join(DATA_DIR, 'photos.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(photos_data, f, indent=2, ensure_ascii=False)
    print(f"\nSuccessfully wrote {len(photos_data)} photo entries to {json_path}")

if __name__ == "__main__":
    optimize_logo()
    optimize_photos()
    print("\nALL IMAGE DERIVATIVES GENERATED SUCCESSFULLY!")
