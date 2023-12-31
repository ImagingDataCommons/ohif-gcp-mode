import { hydrateStructuredReport } from '@ohif/extension-cornerstone-dicom-sr';
import { cache as cs3DCache, volumeLoader } from '@cornerstonejs/core';

const delay = 0;

function getDerivedSequences(displaySetUID, servicesManager) {
  const { displaySetService } = servicesManager.services;

  const displaySetCache = displaySetService.getDisplaySetCache();
  const derivedDisplaySets = [...displaySetCache.values()].filter(ds => {
    if (ds?.getReferenceDisplaySet) {
      ds?.getReferenceDisplaySet();
    }
    return (
      (ds?.referencedDisplaySetInstanceUID === displaySetUID ||
        ds.Modality === 'SR') &&
      !ds?.isHydrated
    );
  });
  return derivedDisplaySets;
}

export default function loadDerivedDisplaySets(
  servicesManager,
  extensionManager,
  commandsManager,
  evt
) {
  async function checkVolume(displaySet, imageIds) {
    const VOLUME_LOADER_SCHEME = 'cornerstoneStreamingImageVolume';
    const volumeLoaderSchema =
      displaySet.volumeLoaderSchema ?? VOLUME_LOADER_SCHEME;

    const volumeId = `${volumeLoaderSchema}:${displaySet.displaySetInstanceUID}`;

    let volume = cs3DCache.getVolume(volumeId);

    if (!volume) {
      volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });
    }
  }

  const {
    userAuthenticationService,
    segmentationService,
    displaySetService,
    viewportGridService,
  } = servicesManager.services;

  const { viewports } = viewportGridService.getState();
  const { viewportId, imageIds } = evt.detail;
  const mainViewport = viewports.get(viewportId); 
  if (mainViewport) {
    if (mainViewport.displaySetInstanceUIDs.length === 1) {
      const mainDisplaySet = displaySetService.getDisplaySetByUID(
        mainViewport.displaySetInstanceUIDs[0]
      );
      const derivedDisplaySets = getDerivedSequences(
        mainViewport.displaySetInstanceUIDs[0],
        servicesManager
      );

      derivedDisplaySets.forEach(async displaySet => {
        const headers = userAuthenticationService.getAuthorizationHeader();
        await checkVolume(mainDisplaySet, imageIds);
        await displaySet.load({ headers });
        const derivedDisplaySetInstanceUID = displaySet.displaySetInstanceUID;

        if (displaySet.Modality === 'SEG') {
          let segmentationId = null;

          // We need the hydration to notify panels about the new segmentation added
          const suppressEvents = false;

          segmentationId = await segmentationService.createSegmentationForSEGDisplaySet(
            displaySet,
            segmentationId,
            suppressEvents
          );
          setTimeout(() => {
            if (
              !mainViewport.displaySetInstanceUIDs.includes(
                derivedDisplaySetInstanceUID
              )
            ) {
              mainViewport.displaySetInstanceUIDs.push(
                derivedDisplaySetInstanceUID
              );
            }
            commandsManager.runCommand('loadSegmentationDisplaySetsForViewport', {
              displaySets: [displaySet],
              viewportId,
            });
          }, delay);
        } else if (displaySet.Modality === 'RTSTRUCT') {
          let segmentationId = null;

          // We need the hydration to notify panels about the new segmentation added
          const suppressEvents = false;

          segmentationId = await segmentationService.createSegmentationForRTDisplaySet(
            displaySet,
            segmentationId,
            suppressEvents
          );
          setTimeout(() => {
            if (
              !mainViewport.displaySetInstanceUIDs.includes(
                derivedDisplaySetInstanceUID
              )
            ) {
              mainViewport.displaySetInstanceUIDs.push(
                derivedDisplaySetInstanceUID
              );
            }
            commandsManager.runCommand(
              "loadSegmentationDisplaySetsForViewport",
              {
                displaySets: [displaySet],
                viewportId,
              }
            );
          }, delay);
        } else if (displaySet.Modality === 'SR') {
          setTimeout(() => {
            if (
              !mainViewport.displaySetInstanceUIDs.includes(
                derivedDisplaySetInstanceUID
              )
            ) {
              mainViewport.displaySetInstanceUIDs.push(
                derivedDisplaySetInstanceUID
              );
            }
            hydrateStructuredReport(
              { servicesManager, extensionManager },
              derivedDisplaySetInstanceUID
            );
          }, delay);
        }
      });
    }
  }
}
