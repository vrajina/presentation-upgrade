import cv2
import sys
from pyzbar.pyzbar import decode

def extract_qr(image_path, output_path):
    img = cv2.imread(image_path)
    if img is None:
        print(f"Error loading {image_path}")
        return
    
    decoded_objects = decode(img)
    if not decoded_objects:
        print("No QR code found")
        # If no QR found, just copy the image and assume it IS the QR code
        cv2.imwrite(output_path, img)
        return
        
    for obj in decoded_objects:
        if obj.type == 'QRCODE':
            rect = obj.rect
            x, y, w, h = rect.left, rect.top, rect.width, rect.height
            # Add padding
            padding = 20
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = min(img.shape[1] - x, w + 2*padding)
            h = min(img.shape[0] - y, h + 2*padding)
            
            cropped = img[y:y+h, x:x+w]
            cv2.imwrite(output_path, cropped)
            print("Successfully extracted QR code")
            return

extract_qr("C:/Users/kadackij/.gemini/antigravity/brain/3780e874-fba9-4333-a6e7-15d878823393/.user_uploaded/media_1789554274943.png", "public/qr_code.png")
