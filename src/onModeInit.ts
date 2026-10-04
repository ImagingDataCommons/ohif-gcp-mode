/**
 * GCP Mode initialization.
 *
 * Creates data sources for GCP Healthcare API route-based access:
 * - 'gcp-mode-dicomweb-data-source': Configured from route params
 * - 'gcp-mode-merge': Merge data source when ?gcp= query param is also present
 */
export default ({ extensionManager }: withAppTypes) => {
  const QUERY_PARAM_KEY = 'gcp';
  const gcpDataSourceName = 'gcp-mode-dicomweb-data-source';

  console.debug('[GCP Mode] Initializing...');

  extensionManager.addDataSource({
    friendlyName: 'GCP DICOMWeb Data Source',
    namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
    sourceName: gcpDataSourceName,
    configuration: {
      name: gcpDataSourceName,
      qidoSupportsIncludeField: false,
      imageRendering: 'wadors',
      thumbnailRendering: 'wadors',
      enableStudyLazyLoad: true,
      supportsFuzzyMatching: false,
      supportsWildcard: false,
      singlepart: 'bulkdata,video,pdf',
      bulkDataURI: { enabled: false },
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
  });

  const query = new URLSearchParams(window.location.search);
  const gcpURLFromQueryParam = query.get(QUERY_PARAM_KEY);
  if (gcpURLFromQueryParam) {
    console.debug('[GCP Mode] Activating merge data source using gcp query param...');
    extensionManager.addDataSource(
      {
        sourceName: 'gcp-mode-merge',
        namespace: '@ohif/extension-default.dataSourcesModule.merge',
        configuration: {
          name: 'gcp-mode-merge',
          friendlyName: 'GCP Merge Data Source',
          seriesMerge: {
            dataSourceNames: [gcpDataSourceName, QUERY_PARAM_KEY],
            defaultDataSourceName: gcpDataSourceName,
          },
        },
      },
      { activate: true }
    );
  } else {
    extensionManager.setActiveDataSource(gcpDataSourceName);
  }
};
