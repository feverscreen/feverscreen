/* tslint:disable */
/* eslint-disable */
declare class CptvDecoder {
    /**
     * Initialises a new player and associated stream reader.
     * @param url (String)
     * @param size (Number)
     * @returns True on success, or an error string on failure (String | Boolean)
     */
    initWithCptvUrlAndKnownSize(url: string, size: number): Promise<string | boolean>;

    /**
     * Initialises a new player and associated stream reader.
     * @param url (String)
     * @returns True on success, or an error string on failure (String | Boolean)
     */
    initWithCptvUrl(url: string): Promise<string | boolean>;

    /**
     * NodeJS usage only:
     * Initialise a new player with a local file.  Uses readFileAsync to stream the CPTV file.
     * @param filePath (String)
     * @returns True on success, or an error string on failure (String | Boolean)
     */
    initWithCptvFile(filePath: string): Promise<string | boolean>;

    /**
     * Initialise a new player with an already loaded local file.
     * @param fileBytes (Uint8Array)
     * @returns True on success, or an error string on failure (String | Boolean)
     */
    initWithLocalCptvFile(fileBytes: Uint8Array): Promise<string | boolean>;

    /**
     * Get the header and duration in seconds for an already loaded byte array
     * This function reads and consumes the entire file, without decoding actual frames.
     * @param fileBytes (Uint8Array)
     */
    getBytesMetadata(fileBytes: Uint8Array): Promise<CptvHeader>;

    /**
     * Get the header and duration in seconds of a local CPTV file given by filePath.
     * This function reads and consumes the entire file, without decoding actual frames.
     * @param filePath (String)
     */
    getFileMetadata(filePath: string): Promise<CptvHeader>;

    /**
     * Get the header and duration of a remote CPTV file given by url.
     * This function reads and consumes the enture file, without decoding actual frames.
     * @param url (String)
     */
    getStreamMetadata(url: string): Promise<CptvHeader>;

    /**
     * If the file stream has completed, this gives the total number
     * of playable frames in the file (excluding any background frame).
     */
    getTotalFrames(): Promise<number | null>;

    /**
     * Get the header for the CPTV file as JSON.
     * Optional fields will always be present, but set to `undefined`
     */
    getHeader(): Promise<CptvHeader>;

    /**
     * Get the next frame in the sequence, if there is one.
     */
    getNextFrame(): Promise<CptvFrame | null>;

    /**
     * Stream load progress from 0..1
     */
    getLoadProgress(): Promise<number>;

    /**
     * Terminate the decoder worker thread
     */
    close(): void;

    /**
     * If the decode halted with errors.  Use this in the API to see if we should continue processing a file, or mark it
     * as damaged.
     */
    hasStreamError(): Promise<boolean>

    /**
     * Get any stream error message
     */
    getStreamError(): Promise<string | null>
}

export interface CptvHeader {
    timestamp: number;
    width: number;
    height: number;
    compression: number;
    deviceName: string;
    fps: number;
    brand: string | null;
    model: string | null;
    deviceId: number | null;
    serialNumber: number | null;
    firmwareVersion: string | null;
    motionConfig: string | null;
    previewSecs: number | null;
    latitude: number | null;
    longitude: number | null;
    locTimestamp: number | null;
    altitude: number | null;
    accuracy: number | null;
    hasBackgroundFrame: boolean;
    // Duration in seconds, *including* any background frame.  This is for compatibility with current
    // durations stored in DB which *include* background frames, the user may wish to subtract 1/fps seconds
    // to get the actual duration.
    // Only set if we used one of the getFileMetadata|getStreamMetadata, and scan the entire file.
    duration?: number;
    totalFrames?: number;
}

export interface CptvFrameHeader {
    timeOnMs: number;
    lastFfcTimeMs: number | null;
    lastFfcTempC: number | null;
    frameTempC: number | null;
    isBackgroundFrame: boolean;
    imageData: {
        width: number;
        height: number;
        /**
         * Minimum value for this frame
         */
        min: number;
        /**
         * Maximum value for this frame
         */
        max: number;
    }
}

export interface CptvFrame {
    /**
     * Raw u16 data of `width` * `height` length where width and height can be found in the CptvHeader
     */
    data: Uint16Array;

    /**
     * Frame header
     */
    meta: CptvFrameHeader;
}

/**
 * Helper function for rendering a raw frame into an Rgba destination buffer
 * @param targetFrameBuffer (Uint8ClampedArray) - destination frame buffer.  Must be width * height * 4 length
 * @param frame (Uint16Array) - Source raw frame of width * height uint16 pixels
 * @param colourMap (Uint32Array) Array of Rgba colours in uin32 form for mapping into 0..255 space
 * @param min (number) min value to use for normalisation
 * @param max (number) max value to use for normalisation
 */
export function renderFrameIntoFrameBuffer(
    targetFrameBuffer: Uint8ClampedArray,
    frame: Uint16Array,
    colourMap: Uint32Array,
    min: number,
    max: number
): void;

/**
 * Get the frame index at a given time offset, taking into account the presence of a background frame.
 * @param time {Number}
 * @param duration {Number}
 * @param fps {Number}
 * @param totalFramesIncludingBackground {Number}
 * @param hasBackgroundFrame {Boolean}
 */
export function getFrameIndexAtTime(
    time: number,
    duration: number,
    fps: number,
    totalFramesIncludingBackground: number | false,
    hasBackgroundFrame: boolean
): number;

/**
 * Default Colour maps to use for rendering frames on both front-end and back-end.
 */
export const ColourMaps: readonly [string, Uint32Array][];
