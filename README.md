# GCP Mode for OHIF Viewer

The **GCP Mode** enhances the OHIF viewer, providing specialized functionality for integrating Google Cloud Platform healthcare services.

## Key Features

- **Load Studies via GCP URLs:** Enables loading studies directly from GCP healthcare URLs.
  - Example URL format:
    ```
    http://localhost:3000/projects/project-x/locations/us/datasets/some-dataset/dicomStores/test-samples/study/1.3.6.1.4.1.123.5.2.1.123.123.123
    ```
- **Automatic Derived Display Set Loading:** Automatically renders the latest derived display set for an active series (e.g., SRs, SEGs) without needing to select these thumbnails manually.

## How to Add GCP Mode to Your OHIF Fork

### 1. Add GCP Mode as a Dependency

Update `package.json` to include `ohif-gcp-mode` as a dependency. Since this mode is not published to NPM, specify the GitHub repository and branch name.

```json
/** File: platform/app/package.json */
"dependencies": {
  "ohif-gcp-mode": "https://github.com/ImagingDataCommons/ohif-gcp-mode#main",
  ...
}
```

### 2. Update OHIF's plugin file to load this mode:

```js
/** File: platform/app/pluginConfig.json */

"modes": [
  ...
  {
    "packageName": "ohif-gcp-mode",
    "version": "0.0.1" /** The version here does not matter since we are using a branch name to define this mode dependency instead of npm publishing */
  },
 ...
```
