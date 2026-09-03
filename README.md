# GCP Mode for OHIF Viewer

## Overview

The **GCP Mode** is a fully-featured OHIF Viewer mode designed for direct integration with [Google Cloud Healthcare API](https://cloud.google.com/healthcare-api/docs/concepts/dicom). It provides a dedicated URL routing pattern that maps directly to GCP Healthcare DICOM store paths, enabling seamless navigation and viewing of medical imaging studies stored in Google Cloud.

This mode is developed and maintained by the [NCI Imaging Data Commons (IDC)](https://imaging.datacommons.cancer.gov/) team.

## Key Features

### Direct URL Routing
- **Native GCP Path Support**: URL structure mirrors GCP Healthcare API paths for intuitive navigation
- **Automatic Data Source Configuration**: Dynamically configures DICOMweb endpoints based on URL parameters
- **Study Merging**: Supports combining series from multiple data sources via the `gcp` query parameter

### Comprehensive Viewer Capabilities
- **Measurement Tools**: Length, Bidirectional, Arrow Annotation, Elliptical/Rectangular/Circular ROI, Freehand ROI, Spline ROI, Livewire Contour
- **Navigation Tools**: Zoom, Pan, Trackball Rotate, Window/Level, Crosshairs, Stack Scroll
- **Advanced Features**: Cine playback, Image Overlay, Reference Lines, Magnify, Calibration, DICOM Tag Browser

### Multi-Modality Support
Supports visualization of various DICOM objects:
- Standard imaging modalities (CT, MR, US, XR, etc.)
- DICOM Video
- DICOM PDF
- DICOM Segmentation (SEG) - view only
- DICOM Parametric Maps (PMAP)
- DICOM Structured Reports (SR/SR-3D)
- DICOM RT Structure Sets
- Whole Slide Imaging (WSI)

### Panel Layout
- **Left Panel**: Series thumbnail list with measurement tracking
- **Right Panel**: Segmentation viewer and measurements panel (collapsed by default)
- **Resizable Panels**: Adjustable panel widths for optimal workflow

## Installation

### Prerequisites
- OHIF Viewer v3.x
- Node.js >= 14
- Yarn >= 1.16.0 or npm >= 6

### Required OHIF Extensions
This mode depends on the following OHIF extensions:
- `@ohif/extension-default` (^3.0.0)
- `@ohif/extension-cornerstone` (^3.0.0)
- `@ohif/extension-measurement-tracking` (^3.0.0)
- `@ohif/extension-cornerstone-dicom-sr` (^3.0.0)
- `@ohif/extension-cornerstone-dicom-seg` (^3.0.0)
- `@ohif/extension-cornerstone-dicom-pmap` (^3.0.0)
- `@ohif/extension-cornerstone-dicom-rt` (^3.0.0)
- `@ohif/extension-dicom-pdf` (^3.0.1)
- `@ohif/extension-dicom-video` (^3.0.1)

### 1. Add as a Dependency

In your OHIF fork's `platform/app/package.json`, include `@idc/gcp-mode` as a dependency. This package is scoped under `@idc` and is not published to the public NPM registry. Pin it to a specific Git commit hash (not a branch name) to ensure reproducible builds and prevent dependency confusion.

```json
{
  "dependencies": {
    "@idc/gcp-mode": "https://github.com/ImagingDataCommons/ohif-gcp-mode#<commit-sha>"
  }
}
```

### 2. Register the Mode

Update `platform/app/pluginConfig.json` to load the mode:

```json
{
  "modes": [
    {
      "packageName": "@idc/gcp-mode",
      "version": "0.0.1"
    }
  ]
}
```

## Usage

Access studies using the GCP Healthcare API path structure:

```
http://localhost:3000/projects/<project>/locations/<location>/datasets/<dataset>/dicomStores/<dicomStore>/study/<StudyInstanceUID>
```

### Example

```
http://localhost:3000/projects/my-gcp-project/locations/us-central1/datasets/imaging-dataset/dicomStores/clinical-images/study/1.3.6.1.4.1.123.5.2.1.123.123.123
```

### URL Parameters

| Parameter | Description |
|-----------|-------------|
| `project` | GCP project ID |
| `location` | GCP region (e.g., `us-central1`, `europe-west1`) |
| `dataset` | Healthcare dataset name |
| `dicomStore` | DICOM store name |
| `StudyInstanceUIDs` | DICOM Study Instance UID |

### Optional Query Parameters

| Parameter | Description |
|-----------|-------------|
| `gcp` | Additional GCP Healthcare URL for merging series from another source |

## Configuration

The mode automatically configures the DICOMweb data source with settings optimized for GCP Healthcare API:

| Setting | Value |
|---------|-------|
| `imageRendering` | `wadors` |
| `thumbnailRendering` | `wadors` |
| `enableStudyLazyLoad` | `true` |
| `supportsFuzzyMatching` | `false` |
| `supportsWildcard` | `false` |
| `singlepart` | `bulkdata,video,pdf` |

## Development

```bash
git clone https://github.com/ImagingDataCommons/ohif-gcp-mode.git
cd ohif-gcp-mode
yarn install
yarn dev
```

### Build for Production

```bash
yarn build
```

### Run Tests

```bash
yarn test:unit
```

## Related Projects

- [OHIF Viewer](https://github.com/OHIF/Viewers) - Open Health Imaging Foundation Viewer
- [GCP Extension](https://github.com/ImagingDataCommons/ohif-gcp-extension) - OHIF extension for GCP Healthcare API query parameter support
- [Imaging Data Commons](https://imaging.datacommons.cancer.gov/) - NCI cloud-based repository of cancer imaging data

## License

MIT License - see [LICENSE](LICENSE) for details.
