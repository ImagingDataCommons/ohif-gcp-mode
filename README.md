# GCP Mode

This mode adds the following functionalities to your OHIF viewer fork:
- Load a study using GCP healthcare URLs e.g. `http://localhost:3000/projects/project-x/locations/us/datasets/some-dataset/dicomStores/test-samples/study/1.3.6.1.4.1.123.5.2.1.123.123.123`
- Automatic load of the latest derived display set of active series (no need to double-click the derived display set (e.g. SRs, SEGs) thumbnail in the left panel to render a derived display set)

## Adding the mode to your OHIF fork
1. Update OHIF's app package.json file to include this mode as a dependency, pointing to a branch since this mode is not being published to NPM:
```js
/** File: platform/app/package.json */

"dependencies": {
  "ohif-gcp-mode": "https://github.com/ImagingDataCommons/ohif-gcp-mode#main", /** You can use any valid branch name here (#main or #master or #your-branch) */
  ...
```

2. Update OHIF's plugin file to load this mode:
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

3. Add GCP DICOMWeb configuration to your OHIF fork configuration file. 
This configuration is what allows you to build and use a DICOMWeb data source configuration as soon as you enter a GCP URL e.g. `http://localhost:3000/projects/project-x/locations/us/datasets/some-dataset/dicomStores/test-samples/study/1.3.6.1.4.1.123.5.2.1.123.123.123`.
```js
/** File: platform/app/public/config/default.js (or your own config file) */

dataSources: [
  {
    friendlyName: 'GCP DICOMWeb',
    namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
    sourceName: 'gcp-dicomweb',
    configuration: {
      name: 'gcp-dicomweb',
      qidoSupportsIncludeField: false,
      imageRendering: 'wadors',
      thumbnailRendering: 'wadors',
      enableStudyLazyLoad: true,
      supportsFuzzyMatching: false,
      supportsWildcard: false,
      singlepart: 'bulkdata,video,pdf',
      useBulkDataURI: false,
      onConfiguration: (dicomWebConfig, options) => {
        const { params } = options;
        const { project, location, dataset, dicomStore } = params;
        const pathUrl = `https://healthcare.googleapis.com/v1/projects/${project}/locations/${location}/datasets/${dataset}/dicomStores/${dicomStore}/dicomWeb`;
        return {
          ...dicomWebConfig,
          wadoRoot: pathUrl,
          qidoRoot: pathUrl,
          wadoUri: pathUrl,
          wadoUriRoot: pathUrl,
        };
      },
    },
  },
  ...
],
```
