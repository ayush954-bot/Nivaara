# Testing Notes - Jan 25, 2026

## Current Status

### Featured Projects Section
- Now displays as a horizontal carousel with navigation arrows
- Shows 3 projects at a time on desktop
- Has Previous/Next buttons and slide indicators
- Projects visible: Paranjape Blue Ridge, Nyati Elysia II, Kolte Patil 24K Glitterati

### Issues to Verify
1. Pride Purple should be first - Need to check if it appears first in carousel
2. Mobile view needs to show horizontal carousel not vertical stack
3. Double header issue - Need to test on project detail page
4. Tab overlapping - Need to test project detail page tabs
5. Staff login project access - Need to test

### Completed Fixes
- FeaturedProjects component updated with horizontal carousel
- Dashboard restructured with Property/Project tabs side by side
- ProjectForm auth check updated to use canManageProperties
- ImageUpload component created for URL + upload option
- GalleryImageUpload component created for gallery images
- Amenities section updated with image upload
- Amenities display updated with beautiful image cards
- Video section simplified to YouTube URLs only
- Brochure upload supports PDF and images
