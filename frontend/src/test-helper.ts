const FAKE_TEST_URL = 'https://cypress-will-monitor.cacophony.org';
import { CalibrationConfig, ScreeningEvent } from "@/types";

export class TestInfo {
    frameNumber : number;
    displayEvents : Record<number, string>;
    lastEvent: string;
    

    constructor() {
        this.frameNumber = 0;
        this.displayEvents = {};
        this.lastEvent = "";
    }

    setFrameNumber(frame : number) {
        this.frameNumber = frame;
    }
    
    recordEvent(description: string) {
        if (this.lastEvent !== description) {
            this.displayEvents[this.frameNumber] = description;
            this.lastEvent = description;
        }
    }

    async sendRecordedEvents() {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", FAKE_TEST_URL + '/events');
        xhr.send(JSON.stringify({ events: this.displayEvents}));
    }


    async recordScreeningEvent(data : ScreeningEvent) {
        let xhr = new XMLHttpRequest();
        xhr.open("POST", FAKE_TEST_URL + '/screen');
        xhr.send(JSON.stringify({
            TemperatureRawValue: Math.round(data.rawTemperatureValue),
            RefTemperatureValue: data.thermalReference.val,
            Meta: {
              Sample: { x: data.sampleX, y: data.sampleY },
              Telemetry: data.frame.frameInfo.Telemetry
            }}));
    }
}
