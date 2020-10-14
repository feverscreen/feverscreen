export const BlobReader = (function(): {
  arrayBuffer: (blob: Blob) => Promise<ArrayBuffer>;
} {
  // For comparability with older browsers/iOS that don't yet support arrayBuffer()
  // directly off the blob object
  const arrayBuffer: (blob: Blob) => Promise<ArrayBuffer> =
    "arrayBuffer" in Blob.prototype &&
    typeof (Blob.prototype as Blob)["arrayBuffer"] === "function"
      ? (blob: Blob) => blob["arrayBuffer"]()
      : (blob: Blob) =>
          new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.addEventListener("load", () => {
              resolve(fileReader.result as ArrayBuffer);
            });
            fileReader.addEventListener("error", () => {
              reject();
            });
            fileReader.readAsArrayBuffer(blob);
          });

  return {
    arrayBuffer
  };
})();

export class DegreesCelsius {
  public val: number;
  constructor(val: number) {
    this.val = val;
  }
  public toString(): string {
    if (this.val === undefined) {
      debugger;
    }
    return `${this.val.toFixed(1)}°`;
  }
}

export const temperatureForSensorValue = (
  savedThermalRefValue: number,
  rawValue: number,
  currentThermalRefValue: number
): DegreesCelsius => {
  return new DegreesCelsius(
    savedThermalRefValue + (rawValue - currentThermalRefValue) * 0.01
  );
};

export function saveCurrentVersion(binaryVersion: string, appVersion: string) {
  window.localStorage.setItem(
    "softwareVersion",
    JSON.stringify({
      appVersion,
      binaryVersion
    })
  );
}

export function checkForSoftwareUpdates(
  binaryVersion: string,
  appVersion: string,
  shouldReloadIfChanged = true
): boolean {
  const prevVersionJSON = window.localStorage.getItem("softwareVersion");
  if (prevVersionJSON) {
    try {
      const prevVersion = JSON.parse(prevVersionJSON);
      if (
          binaryVersion && appVersion && (
        prevVersion.binaryVersion != binaryVersion ||
        prevVersion.appVersion != appVersion
          )
      ) {
        if (shouldReloadIfChanged) {
          saveCurrentVersion(binaryVersion, appVersion);
          console.log(
            "reload because version changed",
            JSON.stringify(prevVersion),
            binaryVersion,
            appVersion
          );
          window.location.reload();
        } else {
          saveCurrentVersion(binaryVersion, appVersion);
          // Display info that the software has updated since last started up.
          return true;
        }
      }
    } catch (e) {
      saveCurrentVersion(binaryVersion, appVersion);
      return false;
    }
  } else {
    saveCurrentVersion(binaryVersion, appVersion);
  }
  return false;
}
