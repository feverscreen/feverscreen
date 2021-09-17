export interface CptvFileParams {
    recordingDateTime?: Date | string; // Must be an ISO formatted date string.
    deviceName?: string;
    deviceId?: number;
    brand?: string;
    model?: string;
    serialNumber?: number;
    firmwareVersion?: string;
    latitude?: number;
    longitude?: number;
    duration?: number;
    hasBackgroundFrame: boolean;
    motionConfig?: string; // JSON
    previewSecs?: undefined,
    locTimestamp?: undefined,
    altitude?: undefined,
    accuracy?: undefined,
}

export function createTestCptvFile(params: CptvFileParams): Promise<Uint8Array>;
