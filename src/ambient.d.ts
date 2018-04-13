declare module "blueimp-gallery" {
  function Gallery(...p: any[]): any;
  export = Gallery;
}

declare module "blueimp-load-image" {
  function parseMetadata(
      fileOrBlob: (File | Blob),
      func: Function,
      options: any
   ): any;
}
