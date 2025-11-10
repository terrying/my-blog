declare module 'html-to-image' {
  export function toBlob(node: HTMLElement, options?: any): Promise<Blob | null>
  export function toPng(node: HTMLElement, options?: any): Promise<string>
  export function toJpeg(node: HTMLElement, options?: any): Promise<string>
}


