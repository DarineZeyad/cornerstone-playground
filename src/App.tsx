import "./App.css";
import { useState, useRef, useEffect } from "react";
import * as cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

function App() {
  const [renderMethod, setRenderMethod] = useState<"stack" | "volume">("stack");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dicomStorePath, setDicomStorePath] = useState("");
  const [bearerToken, setBearerToken] = useState("");
  const [useGoogleHealthcare, setUseGoogleHealthcare] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewerRef.current) {
      cornerstone.enable(viewerRef.current);
    }

    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;
    cornerstoneWADOImageLoader.webWorkerManager.initialize({
      maxWebWorkers: navigator.hardwareConcurrency || 1,
      startWebWorkersOnDemand: true,
      taskConfiguration: {
        decodeTask: {
          initializeCodecsOnStartup: true,
          usePDFJS: false,
          strict: false,
        },
      },
    });

    cornerstoneWADOImageLoader.configure({
      beforeSend: (xhr: XMLHttpRequest) => {
        if (bearerToken) {
          xhr.setRequestHeader("Authorization", `Bearer ${bearerToken}`);
        }
      },
    });

    if (
      cornerstoneWADOImageLoader.external &&
      cornerstoneWADOImageLoader.external.wadors
    ) {
      cornerstone.registerImageLoader(
        "wadors",
        cornerstoneWADOImageLoader.external.wadors
      );
    }
    if (
      cornerstoneWADOImageLoader.external &&
      cornerstoneWADOImageLoader.external.wadouri
    ) {
      cornerstone.registerImageLoader(
        "wadouri",
        cornerstoneWADOImageLoader.external.wadouri
      );
    }
  }, [bearerToken]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(files);
    setUseGoogleHealthcare(false);
  };

  const handleRender = async () => {
    if (!viewerRef.current) return;

    if (uploadedFiles.length === 0 && (!dicomStorePath || !bearerToken)) {
      alert(
        "Please either upload DICOM files or provide Google Healthcare DICOM store path and Bearer token"
      );
      return;
    }

    setIsLoading(true);
    try {
      if (!cornerstone.getEnabledElement(viewerRef.current)) {
        cornerstone.enable(viewerRef.current);
      }

      let instances: any[] = [];
      let imageIds: string[] = [];

      if (useGoogleHealthcare && dicomStorePath && bearerToken) {
        const baseUrl = dicomStorePath.split("/studies/")[0];

        const studyResponse = await fetch(`${dicomStorePath}/metadata`, {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
            Accept: "application/dicom+json",
          },
        });

        if (!studyResponse.ok) {
          const errorText = await studyResponse.text();
          throw new Error(
            `Failed to fetch study: ${studyResponse.status} - ${errorText}`
          );
        }

        instances = await studyResponse.json();

        if (!instances || instances.length === 0) {
          throw new Error("No instances found in study");
        }

        const studyUid = dicomStorePath.split("/studies/")[1];

        const SOP_CLASS_UID = "00020002";
        instances = instances.filter((instance: any) => {
          return (
            instance[SOP_CLASS_UID]?.Value[0] !==
              "1.2.840.10008.5.1.4.1.1.11.1" && // PR instances
            instance[SOP_CLASS_UID]?.Value[0] !==
              "1.2.840.10008.5.1.4.1.1.88.22" // Enhanced SR
          );
        });

        imageIds = instances.map(
          (instance: any) =>
            `wadors:${baseUrl}/studies/${studyUid}/series/${instance["0020000E"]?.Value?.[0]}/instances/${instance["00020003"]?.Value?.[0]}/frames/1`
        );
      } else {
        imageIds = uploadedFiles.map((file) => {
          const blob = new Blob([file], { type: "application/dicom" });
          const blobUrl = URL.createObjectURL(blob);
          return `wadouri:${blobUrl}`;
        });
      }

      const images = await Promise.all(
        imageIds.map(async (imageId, index) => {
          if (useGoogleHealthcare && instances.length > 0) {
            cornerstoneWADOImageLoader.wadors.metaDataManager.add(
              imageId,
              instances[index]
            );
          }
          return await cornerstone.loadAndCacheImage(imageId);
        })
      );

      const element = viewerRef.current;
      cornerstone.displayImage(element, images[0]);
    } catch (error) {
      console.error("Error rendering DICOM files:", error);
      alert(`Error rendering DICOM files: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>Cornerstone DICOM Viewer</h1>

      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept=".dcm,.dicom"
          style={{ display: "none" }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="upload-button"
        >
          Upload DICOM Files
        </button>

        {uploadedFiles.length > 0 && (
          <div className="file-info">
            <p>Selected files: {uploadedFiles.length}</p>
            <ul>
              {uploadedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="healthcare-section">
        <h3>Google Healthcare DICOM Store</h3>
        <div className="input-group">
          <label>
            DICOM Store Path:
            <input
              type="text"
              value={dicomStorePath}
              onChange={(e) => setDicomStorePath(e.target.value)}
              placeholder="https://healthcare.googleapis.com/v1/.../studies/STUDY_UID"
              className="text-input"
            />
          </label>
        </div>
        <div className="input-group">
          <label>
            Bearer Token:
            <input
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              placeholder="Enter your Bearer token"
              className="text-input"
            />
          </label>
        </div>
        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={useGoogleHealthcare}
              onChange={(e) => setUseGoogleHealthcare(e.target.checked)}
            />
            Use Google Healthcare
          </label>
        </div>
      </div>

      <div className="render-options">
        <h3>Rendering Method:</h3>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="stack"
              checked={renderMethod === "stack"}
              onChange={(e) =>
                setRenderMethod(e.target.value as "stack" | "volume")
              }
            />
            setStack (2D Stack)
          </label>
          <label>
            <input
              type="radio"
              value="volume"
              checked={renderMethod === "volume"}
              onChange={(e) =>
                setRenderMethod(e.target.value as "stack" | "volume")
              }
            />
            setVolume (3D Volume)
          </label>
        </div>

        <div className="button-group">
          <button
            onClick={handleRender}
            disabled={
              (uploadedFiles.length === 0 &&
                (!dicomStorePath || !bearerToken)) ||
              isLoading
            }
            className="render-button"
          >
            {isLoading ? "Rendering..." : "Render DICOM"}
          </button>
        </div>
      </div>

      <div className="viewer-container">
        <div
          ref={viewerRef}
          className="cornerstone-viewer"
          style={{ width: "512px", height: "512px", border: "1px solid #ccc" }}
        />
      </div>
    </div>
  );
}

export default App;
