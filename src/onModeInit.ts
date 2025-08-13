export default ({ extensionManager }) => {
    const QUERY_PARAM_KEY = "gcp";
    const gcpDataSourceName = "gcp-mode-dicomweb-data-source";
    
    console.debug("Initializing GCP Mode...");
    
    extensionManager.addDataSource({
      friendlyName: "GCP DICOMWeb Data Source",
      namespace: "@ohif/extension-default.dataSourcesModule.dicomweb",
      sourceName: gcpDataSourceName,
      configuration: {
        name: gcpDataSourceName,
        qidoSupportsIncludeField: false,
        imageRendering: "wadors",
        thumbnailRendering: "wadors",
        enableStudyLazyLoad: true,
        supportsFuzzyMatching: false,
        supportsWildcard: false,
        singlepart: "bulkdata,video,pdf",
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
    });
    const query = new URLSearchParams(window.location.search);
    const gcpURLFromQueryParam = query.get(QUERY_PARAM_KEY);
    if (gcpURLFromQueryParam) {
      console.debug("Activating merge data source using gcp query param...");
      extensionManager.addDataSource(
        {
          sourceName: "gcp-mode-merge",
          namespace: "@ohif/extension-default.dataSourcesModule.merge",
          configuration: {
            name: "gcp-mode-merge",
            friendlyName: "GCP Merge Data Source",
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
  