# EduHeat — Standalone Web Distribution

This folder contains the complete, standalone **HTML, JavaScript, CSS, and JSON** distribution of EduHeat, designed for direct deployment to **GitHub** and **GitHub Pages**.

## 📁 Files Included

- **`index.html`**: Complete single-page application (Dashboard, Live Weather, Cooling Places with search for Chembur, Ghatkopar, Kurla, Dadar, Powai, Andheri, Vidyavihar, Somaiya Campus Map, and Cost Calculator).
- **`style.css`**: Responsive design system matching the Google Stitch aesthetic (forest green, emerald accents, clean card layout).
- **`app.js`**: Pure vanilla JavaScript handling tab navigation, Leaflet OpenStreetMap rendering, locality filtering, and live electricity cost calculations.
- **`data.json`**: Grounded OpenStreetMap dataset with 51 cooling places, Somaiya Vidyavihar campus boundary polygons/building footprints, and Mumbai localities.

---

## 🚀 How to Put This on GitHub

### Option A: Using GitHub Desktop (Easiest)
1. Open **GitHub Desktop**.
2. Click **File** > **New Repository**.
3. Name it `eduheat` and set the Local Path to this folder (`github_web`).
4. Click **Create Repository**, then click **Publish repository** to GitHub.

### Option B: Using Git Command Line
In this directory, open a terminal and run:
```bash
git init
git add .
git commit -m "Initial commit: EduHeat HTML, JS, CSS, JSON bundle"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/eduheat.git
git push -u origin main
```

---

## 🌐 How to Enable Free Live Hosting on GitHub Pages

1. Go to your repository on [GitHub.com](https://github.com).
2. Click **Settings** (tab at the top right of the repo).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`.
   - **Branch**: Select `main` and folder `/ (root)`.
5. Click **Save**.
6. Within 1 minute, GitHub will give you a live public web link:
   `https://YOUR_USERNAME.github.io/eduheat/`

---

## 💻 Local Preview
You can also run this locally right now without any server:
- Simply double-click **`index.html`** in your file manager to open it directly in Google Chrome, Microsoft Edge, or any web browser!
