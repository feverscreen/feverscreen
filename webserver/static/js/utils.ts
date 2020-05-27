export const BlobReader = (function (): {
  arrayBuffer: (blob: Blob) => Promise<ArrayBuffer>;
} {
  // For comparability with older browsers/iOS that don't yet support arrayBuffer()
  // directly off the blob object
  const arrayBuffer: (blob: Blob) => Promise<ArrayBuffer> =
    "arrayBuffer" in Blob.prototype &&
    typeof (Blob.prototype as any).arrayBuffer === "function"
      ? (blob: Blob) => (blob as any).arrayBuffer()
      : (blob: Blob) =>
          new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.addEventListener(
              "load",
              (_event: ProgressEvent<FileReader>) => {
                resolve(fileReader.result as ArrayBuffer);
              }
            );
            fileReader.addEventListener(
              "error",
              (_event: ProgressEvent<FileReader>) => {
                reject();
              }
            );
            fileReader.readAsArrayBuffer(blob);
          });

  return {
    arrayBuffer,
  };
})();
