// 위경도 → 폰 화면 좌표(360×800 논리 px). 지도 탭이 쓴다.
// 범위는 앱 mapViewMock.initialRegion(가운데 36.3266, 127.4262 · 경도 폭 0.012)이다. 경도 0.012 를 화면 폭 360 에 맞추고,
// 위도는 메르카토르 근사(경도 배율 / cos 위도)로 잰다. 화면 가운데(180, 400)가 범위 가운데다.
export type LatLng = { lat: number; lng: number };
export type Point = { x: number; y: number };

const CENTER: LatLng = { lat: 36.3266, lng: 127.4262 };
const PX_PER_LNG = 360 / 0.012;
const PX_PER_LAT = PX_PER_LNG / Math.cos((CENTER.lat * Math.PI) / 180);

export function project(p: LatLng): Point {
    return {
        x: 180 + (p.lng - CENTER.lng) * PX_PER_LNG,
        y: 400 - (p.lat - CENTER.lat) * PX_PER_LAT,
    };
}

export function lerp(from: Point, to: Point, t: number): Point {
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}
