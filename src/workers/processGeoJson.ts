import JSZip from '@turbowarp/jszip'
import RBush from 'rbush';
import bbox from '@turf/bbox';
import { addOrUpdateData } from '../interfaces/IDB';

onmessage = (event) => {
    fetch('/240817_Pits_3D_WGS84.zip')
        .then((response) => {
            return response.arrayBuffer()
        })
        .then((zipBuffer) => {
            return JSZip.loadAsync(zipBuffer)
        })
        .then(data => {
            return data.file('240817_Pits_3D_WGS84.geojson')?.async("string");
        }).then((text) => {
            var geojsonData = JSON.parse(text as string);
            const indexRBush = new RBush();
            geojsonData.features.map((feature) => {
                const bounds = bbox(feature);
                const item = {
                    minX: bounds[0],
                    minY: bounds[1],
                    maxX: bounds[2],
                    maxY: bounds[3],
                    feature: feature
                };
                indexRBush.insert(item);
            })
            const indexedData = indexRBush.toJSON()
            return indexedData
        }).then(async (data) => {
            // await addOrUpdateData('mainGeoJson', data);
            postMessage(data)
        })
}