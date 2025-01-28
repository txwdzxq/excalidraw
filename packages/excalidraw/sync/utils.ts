import msgpack from "msgpack-lite";

import type { CLIENT_MESSAGE_BINARY } from "./protocol";

export const Utils = {
  try<T>(cb: () => T): [T, null] | [null, Error] {
    try {
      const result = cb();
      return [result, null];
    } catch (error) {
      if (error instanceof Error) {
        return [null, error];
      }

      if (typeof error === "string") {
        return [null, new Error(error)];
      }

      return [null, new Error("Unknown error")];
    }
  },
};

export const Network = {
  encodeClientMessage: (message: CLIENT_MESSAGE_BINARY) => {
    const { payload, ...metadata } = message;
    const metadataBuffer = msgpack.encode(metadata) as Uint8Array;

    // contains the length of the rest of the message, so that we could decode it server side
    const headerBuffer = new ArrayBuffer(4);
    new DataView(headerBuffer).setUint32(0, metadataBuffer.byteLength);

    // concatenate into [header(4 bytes)][metadata][payload]
    return Uint8Array.from([
      ...new Uint8Array(headerBuffer),
      ...metadataBuffer,
      ...message.payload,
    ]);
  },
  decodeClientMessage: (message: ArrayBuffer) => {
    const headerLength = 4;
    const header = new Uint8Array(message, 0, headerLength);
    const metadataLength = new DataView(
      header.buffer,
      header.byteOffset,
    ).getUint32(0);

    const metadata = new Uint8Array(
      message,
      headerLength,
      headerLength + metadataLength,
    );

    const payload = new Uint8Array(message, headerLength + metadataLength);
    const rawMessage = {
      ...msgpack.decode(metadata),
      payload,
    } as CLIENT_MESSAGE_BINARY;

    return rawMessage;
  },
};
