# Logo Background Removal - Technical Notes

## Issue
The original logo (nivaara-logo-old.png) had a light gray background (#F5F5F5 approximately) that created a visible box around the logo in the website header.

## Solution
Used Python PIL/Pillow to programmatically remove the light background:
- Threshold set to 220 (RGB values)
- All pixels with R, G, B > 220 converted to transparent
- Saved as PNG with alpha channel

## Files
- Original: `nivaara-logo-old.png` (with light gray background)
- Final: `nivaara-logo.png` (transparent background)
- Script: `/home/ubuntu/remove_bg_v2.py`

## Result
Logo now blends seamlessly with the website header without any visible background box.
