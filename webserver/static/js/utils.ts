export const BlobReader = (function () {
  // For comparability with older browsers/iOS that don't yet support arrayBuffer() or text()
  // directly off the blob object
  return {
    arrayBuffer(blob: Blob): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
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
    },
    text(blob: Blob): Promise<string> {
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.addEventListener(
          "load",
          (_event: ProgressEvent<FileReader>) => {
            resolve(fileReader.result as string);
          }
        );
        fileReader.addEventListener(
          "error",
          (_event: ProgressEvent<FileReader>) => {
            reject();
          }
        );
        fileReader.readAsText(blob);
      });
    },
  };
})();
