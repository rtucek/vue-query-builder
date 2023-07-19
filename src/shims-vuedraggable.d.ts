declare module 'vuedraggable/src/vuedraggable.js' {
  type element<El> = {
    element: El,
  }

  type Older = {
    oldIndex: number,
  }

  type Newer = {
    newIndex: number,
  }

  export type Moved<El> = element<El> & Older & Newer

  export type Added<El> = element<El> & Newer

  export type Removed<El> = element<El> & Older

  export type ChangeEvent<El> = {
    moved?: Moved<El>,
    added?: Added<El>,
    removed?: Removed<El>,
  }
}
