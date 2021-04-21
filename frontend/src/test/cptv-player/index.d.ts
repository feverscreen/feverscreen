/* tslint:disable */
/* eslint-disable */
declare class CptvPlayer {
    /**
     * Initialises a new player and associated stream reader.
     * @param url (String)
     * @param size (Number)
     * @returns True on success, or an error string on failure (String | Boolean)
     */
    initWithCptvUrlAndSize(url: string, size: number): Promise<string | boolean>;

    /**
     * NodeJS usage only:
     * Initialise a new player with a local file.  Uses readFileAsync to stream the CPTV file.
     * @param filePath (String)
     * @returns True on success, or an error string on failure (String | Boolean)
     */
    initWithCptvFile(filePath: string): Promise<string | boolean>;

    /**
     * Returns the frame data for the frame at index `frameNum` indexed from the
     * first playable frame (not including any background frame).  If the frame is out of
     * bounds, or has not yet been loaded from the stream, returns null.
     * @param frameNum (Number)
     */
    getFrameAtIndex(frameNum: number): CptvFrame | null;

    /**
     * Returns the frame header for the frame at index `frameNum` indexed from the
     * first playable frame (not including any background frame).  If the frame is out of
     * bounds, or has not yet been loaded from the stream, returns null.
     * @param frameNum (Number)
     */
    getFrameHeaderAtIndex(frameNum: number): CptvFrameHeader | null;

    /**
     * Get the number of loaded playable frames in the file.
     */
    getLoadedFrames(): number | null;

    /**
     * If the file stream has completed, this gives the total number
     * of playable frames in the file (excluding any background frame).
     */
    getTotalFrames(): number | null;

    /**
     * Downloads enough of the CPTV file to be able to have `frameNum`
     * If the file contains a background frame at the beginning, this is not included,
     * so for example asking for frame 0 in that case would actually give the second
     * frame in the file (which is the first "playable" frame)
     * @param frameNum (Number)
     */
    seekToFrame(frameNum: number): Promise<void>;

    /**
     * Get the header for the CPTV file as JSON.
     * Optional fields will always be present, but set to `undefined`
     */
    getHeader(): Promise<CptvHeader>;

    /**
     * Return the background frame data of the CPTV file, if any
     */
    getBackgroundFrame(): CptvFrame | null;

    /**
     * Stream load progress from 0..1
     */
    getLoadProgress(): number;
}

export interface CptvHeader {
    timestamp: number;
    width: number;
    height: number;
    compression: number;
    deviceName: string;
    fps: number | null;
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
    hasBackgroundFrame: boolean | null;
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

        originalMax?: number;
    }
}

export interface CptvFrame {
    /**
     * Used for normalisation of output:
     * Min value for clip decoded so far in stream.  If stream is fully decoded this will be the min for
     * the entire clip.
     * NOTE: Frames that occur within 5 seconds of an FFC event do not contribute to global min/max, since
     *  the values are all over the place.  For playback remap those values into the known sane range.
     */
    min: number;
    /**
     * Used for normalisation of output:
     * Max value for clip decoded so far in stream.  If stream is fully decoded this will be the max for
     * the entire clip.
     * NOTE: Frames that occur within 5 seconds of an FFC event do not contribute to global min/max, since
     *  the values are all over the place.  For playback remap those values into the known sane range.
     */
    max: number;
    /**
     * Raw u16 data of `width` * `height` length where width and height can be found in the CptvHeader
     */
    data: Uint16Array;
}
