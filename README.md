# GCP Mode for OHIF Viewer

The **GCP Mode** enhances the OHIF viewer, providing specialized functionality for integrating Google Cloud Platform healthcare services.

## Key Features

- **Load Studies via GCP URLs:** Enables loading studies directly from GCP healthcare URLs.
  - Example URL format:
    ```
    http://localhost:3000/projects/project-x/locations/us/datasets/some-dataset/dicomStores/test-samples/study/1.3.6.1.4.1.123.5.2.1.123.123.123
    ```

## How to Add GCP Mode to Your OHIF Fork

### 1. Add GCP Mode as a Dependency

Update `package.json` to include `@idc/gcp-mode` as a dependency. This package is scoped under `@idc` and is not published to the public NPM registry — pin it to a specific Git commit hash (not a branch name) to prevent dependency confusion.

```json
/** File: platform/app/package.json */
"dependencies": {
  "@idc/gcp-mode": "https://github.com/ImagingDataCommons/ohif-gcp-mode#<commit-sha>",
  ...
}
```

### 2. Update OHIF's plugin file to load this mode:

```js
/** File: platform/app/pluginConfig.json */

"modes": [
  ...
  {
    "packageName": "@idc/gcp-mode",
    "version": "0.0.1"
  },
 ...
```
