// leaflet-extensions.ts
import * as L from 'leaflet';

export interface SlideOptions {
    duration?: number;
    keepAtCenter?: boolean;
    callback?: (result: string) => void;
}


export class ExtendedMarker extends L.Marker {

    _slideOptions: SlideOptions | undefined;

    _slideToUntil: number | undefined;
    _slideToLatLng: L.LatLngExpression | undefined;
    _slideFromLatLng: L.LatLngExpression | undefined;
    _slideDraggingWasAllowed: boolean | undefined;
    _slideFrame: number | undefined;

    constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions) {
        super(latlng, options);
        // Additional initialization if needed
    }

    slideTo(latlng: L.LatLngExpression, options?: SlideOptions): this {
        if (!this._map) return this;

        this._slideOptions = options

        let duration = 1000;
        if (options && options?.duration) {
            duration = options.duration;
        } else {
            this._slideOptions = {duration: duration, keepAtCenter: false}
        }


        let keepAtCenter = false;
        if (options && options.keepAtCenter) {
            keepAtCenter = options.keepAtCenter;
        }

        this._slideToUntil = performance.now() + duration;
        this._slideFromLatLng = this.getLatLng();
        this._slideToLatLng = latlng;

        this._slideDraggingWasAllowed = this._slideDraggingWasAllowed !== undefined ?
            this._slideDraggingWasAllowed :
            this._map.dragging.enabled();

        if (this._slideOptions && this._slideOptions.keepAtCenter == true) {
            this._map.dragging.disable();
            this._map.doubleClickZoom.disable();
            this._map.options.touchZoom = 'center';
            this._map.options.scrollWheelZoom = 'center';
        }

        this.fire('movestart');
        this._slideTo();

        return this;
    }

    slideCancel(): this {
        if (this._slideFrame) {
            L.Util.cancelAnimFrame(this._slideFrame);
        }
        return this;
    }

    _slideTo(): this {
        if (!this._map) return this;

        const remaining = this._slideToUntil! - performance.now();

        if (remaining < 0) {
            this.setLatLng(this._slideToLatLng!);
            if (this._slideDraggingWasAllowed) {
                this._map.dragging.enable();
                this._map.doubleClickZoom.enable();
                this._map.options.touchZoom = true;
                this._map.options.scrollWheelZoom = true;
            }
            this._slideDraggingWasAllowed = undefined;
            if(this._slideOptions && this._slideOptions.callback) {
                this._slideOptions.callback("Done")
            }
            this.fire('moveend');
            return this;
        }

        const startPoint = this._map.latLngToContainerPoint(this._slideFromLatLng!);
        const endPoint = this._map.latLngToContainerPoint(this._slideToLatLng!);
        const percentDone = (this._slideOptions?.duration! - remaining) / this._slideOptions?.duration!;

        const currPoint = endPoint.multiplyBy(percentDone).add(
            startPoint.multiplyBy(1 - percentDone)
        );
        const currLatLng = this._map.containerPointToLatLng(currPoint);
        this.setLatLng(currLatLng);

        if (this._slideOptions && this._slideOptions.keepAtCenter == true) {
            this._map.panTo(currLatLng, { animate: false });
        }

        this._slideFrame = L.Util.requestAnimFrame(this._slideTo, this);
        return this
    }

}
