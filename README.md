# Cornerstone DICOM Viewer

Rendering DICOM medical images using Cornerstone.js. This viewer supports multiple rendering methods and can load DICOM files from local uploads or Google Healthcare API. Developed with ReactJS.

## ✨ Features

- **DICOM Image Loading**: Load DICOM files from local uploads
- **Google Healthcare Integration**: Connect to Google Healthcare DICOM stores
- **Multiple Rendering Methods**:
  - 2D Stack rendering (setStack)
  - 3D Volume rendering (setVolume)
- **Modern React Interface**: Clean, responsive UI built with React 19
- **Real-time Rendering**: Instant image display with Cornerstone.js

## 🛠️ Tech Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Cornerstone.js** - Medical imaging library
- **Cornerstone WADO Image Loader** - DICOM loading and parsing
- **DICOM Parser** - Parse DICOM files

## 📦 Installation

1. Clone the repository:

```bash
git clone https://github.com/DarineZeyad/cornerstone-playground.git
cd cornerstone-playground
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🏗️ Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages. Every push to the `main` branch will trigger a build and deployment.

### Manual Deployment

1. Build the project:

```bash
npm run build
```

2. Deploy the `dist` folder to your hosting provider

## 📁 Project Structure

```
cornerstone-playground/
├── public/                 # Static assets
├── src/
│   ├── App.tsx           # Main DICOM viewer component
│   ├── App.css           # Application styles
│   ├── main.tsx          # Application entry point
│   └── types.d.ts        # TypeScript type definitions
├── .github/
│   └── workflows/        # GitHub Actions workflows
├── package.json          # Dependencies and scripts
└── vite.config.ts        # Vite configuration
```

## 🔧 Configuration

### Vite Configuration

The project is configured with:

- React plugin for JSX support
- Base path for GitHub Pages deployment
- Development server on port 3000

### Cornerstone.js Setup

The application includes:

- Cornerstone Core for image rendering
- WADO Image Loader for DICOM loading
- DICOM Parser for file parsing
- Google Healthcare API integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🙏 Acknowledgments

- [Cornerstone.js](https://github.com/cornerstonejs/cornerstone) - Medical imaging library
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://reactjs.org/) - UI library
