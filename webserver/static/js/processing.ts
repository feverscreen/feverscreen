export function moduleTemperatureAnomaly(timeSinceFFC: number) {
    const v0=timeSinceFFC*0.006+0.12;
    const v1=Math.exp(-0.0075*timeSinceFFC-1.16);
    const ev0=Math.exp(-15*v0);
    const ev1=Math.exp(-15*v1);
    return (ev0*v0+ev1*v1)/(ev0+ev1);
}

export function sensorAnomaly(timeSinceFFC: number) {
    const v0=timeSinceFFC*0.06-0.3;
    const v1=Math.exp(-0.022*timeSinceFFC-0.2);
    const ev0=Math.exp(-2*v0);
    const ev1=Math.exp(-2*v1);
    return (ev0*v0+ev1*v1)/(ev0+ev1)*100;
}

export const fahrenheitToCelsius = (f: number) => (f - 32.0) * (5.0 / 9);
export const celsiusToFahrenheit = (c: number) => c * (9.0 / 5) + 32;
