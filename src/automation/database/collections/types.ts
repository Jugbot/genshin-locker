import { OldRxCollection } from "rxdb";

type MaybePromise<T> = T | Promise<T>

export type MigrationStrategy<OldDocData, DocData> = (
  oldDocumentData: OldDocData,
  oldRxCollection: OldRxCollection
) => MaybePromise<DocData | null>;
