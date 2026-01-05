# Admin Panel User Guide

Complete guide for using The Daily Aesthetic Admin Panel.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Login](#login)
3. [Managing Projects](#managing-projects)
4. [Managing Articles](#managing-articles)
5. [Managing Products](#managing-products)
6. [Security Best Practices](#security-best-practices)
7. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

Before using the admin panel, ensure:
1. The backend server is running on `http://localhost:3000`
2. The frontend is being served (e.g., on `http://localhost:8080`)
3. Admin tables have been set up using `npm run admin:setup`

### First-Time Setup

1. Navigate to `http://localhost:8080/admin/login.html`
2. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
3. **IMPORTANT:** Change the default password immediately after first login

## Login

### Accessing the Login Page

Navigate to: `http://localhost:8080/admin/login.html`

### Login Process

1. Enter your username
2. Enter your password
3. Click "Sign In"
4. You'll be redirected to the admin dashboard

### Session Management

- Sessions last for 24 hours
- After 24 hours, you'll need to login again
- Logout anytime by clicking the "Logout" button in the top-right corner

## Managing Projects

Projects are design showcases featured on the front page.

### Viewing Projects

1. Login to the admin panel
2. Click on the "Projects" tab (default view)
3. All projects are listed with preview images and details

### Adding a New Project

1. Click the "Add Project" button (top-right)
2. Fill in the form:
   - **Title:** Project name (required)
   - **Date:** Display date (e.g., "January 2024")
   - **Image URL:** URL to project image
   - **Excerpt:** Short description for listings
   - **Description:** Full project description
   - **Tags:** Comma-separated tags (e.g., "minimalism, design, architecture")
3. Click "Save Changes"

### Editing a Project

1. Find the project in the list
2. Click the edit icon (pencil)
3. Update the fields
4. Click "Save Changes"

### Deleting a Project

1. Find the project in the list
2. Click the delete icon (trash)
3. Confirm deletion in the popup
4. The project will be permanently removed

## Managing Articles

Articles are blog posts and editorial content.

### Viewing Articles

1. Click on the "Articles" tab
2. All articles are listed with details

### Adding a New Article

1. Click the "Add Article" button
2. Fill in the form:
   - **Title:** Article headline (required)
   - **Author:** Writer's name
   - **Date:** Publication date
   - **Image URL:** Featured image URL
   - **Content:** Full article text (supports line breaks)
3. Click "Save Changes"

### Editing an Article

1. Find the article in the list
2. Click the edit icon
3. Update the fields
4. Click "Save Changes"

### Deleting an Article

1. Find the article in the list
2. Click the delete icon
3. Confirm deletion
4. The article will be permanently removed

## Managing Products

Products are items featured in the shop section.

### Viewing Products

1. Click on the "Products" tab
2. All products are listed with images and prices

### Adding a New Product

1. Click the "Add Product" button
2. Fill in the form:
   - **Title:** Product name (required)
   - **Price:** Product price (e.g., 49.99)
   - **Date:** Date added or release date
   - **Image URL:** Product image URL
   - **Description:** Product details
   - **Tags:** Comma-separated tags
3. Click "Save Changes"

### Editing a Product

1. Find the product in the list
2. Click the edit icon
3. Update the fields
4. Click "Save Changes"

### Deleting a Product

1. Find the product in the list
2. Click the delete icon
3. Confirm deletion
4. The product will be permanently removed

## Security Best Practices

### Password Security

1. **Change Default Password:** Immediately change the default `admin123` password
2. **Use Strong Passwords:** Minimum 8 characters with letters, numbers, and symbols
3. **Regular Updates:** Change your password periodically
4. **Don't Share:** Keep your credentials private

### Changing Your Password

Currently, password changes must be done via API:

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "your_new_secure_password"
  }'
```

Your session token can be found in your browser's localStorage as `adminToken`.

### Session Security

- Always logout when finished
- Don't leave the admin panel open on shared computers
- Sessions automatically expire after 24 hours
- Clear your browser cache if using a public computer

### Production Security

When deploying to production:

1. **Use HTTPS:** Always use SSL/TLS encryption
2. **Strong Passwords:** Enforce strong password policies
3. **Database Security:** Secure your PostgreSQL instance
4. **Firewall:** Restrict admin panel access by IP if possible
5. **Regular Updates:** Keep dependencies updated
6. **Backup:** Regular database backups

## Troubleshooting

### Can't Login

**Problem:** "Invalid credentials" error

**Solutions:**
- Verify you're using the correct username and password
- Check that the admin setup script has been run: `npm run admin:setup`
- Ensure the backend server is running
- Check browser console for errors

### Session Expired

**Problem:** "Invalid or expired session" error

**Solutions:**
- Login again (sessions expire after 24 hours)
- Clear browser cache and cookies
- Check that your system clock is correct

### Changes Not Saving

**Problem:** Click "Save Changes" but nothing happens

**Solutions:**
- Check browser console for errors
- Verify backend server is running
- Ensure all required fields are filled
- Check network tab for failed API requests

### Images Not Displaying

**Problem:** Image URLs show broken images

**Solutions:**
- Verify the image URL is correct and accessible
- Check that the image URL uses HTTPS
- Ensure the image server allows cross-origin requests (CORS)
- Try using a different image hosting service

### Backend Connection Failed

**Problem:** Can't connect to API

**Solutions:**
- Verify backend is running on port 3000
- Check API_BASE_URL in `/admin/js/admin.js` and `/admin/js/login.js`
- Ensure CORS is enabled on the backend
- Check for firewall or network issues

## Tips and Best Practices

### Content Management

1. **Consistent Formatting:** Use consistent date formats and tag naming
2. **Image Optimization:** Use optimized images for better performance
3. **SEO-Friendly:** Write descriptive titles and excerpts
4. **Preview Before Publishing:** Check how content looks on the main site

### Image URLs

For best results:
- Use high-quality images (minimum 800x600px)
- Host images on reliable CDN (Cloudinary, Imgur, etc.)
- Use consistent aspect ratios
- Optimize file sizes (< 500KB recommended)

### Tags

- Use lowercase for consistency
- Separate with commas
- Keep tag names short and descriptive
- Reuse common tags for better categorization

### Workflow

1. Draft content in a text editor first
2. Prepare and upload images
3. Add content via admin panel
4. Preview on the main website
5. Make adjustments if needed

## Additional Resources

- [Main README](README.md) - Full project documentation
- [API Documentation](README.md#api-endpoints) - API endpoint details
- [GitHub Issues](https://github.com/yourusername/daily-aesthetic/issues) - Report bugs

## Support

For issues, questions, or feature requests, please open an issue on GitHub or contact the development team.

---

**Version:** 1.0.0
**Last Updated:** January 2026
