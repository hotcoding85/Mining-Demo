import JSZip from '@turbowarp/jszip';
import { addOrUpdateData } from '../interfaces/IDB';

onmessage = (event) => {
    fetch('/images.zip')
    .then(response => response.arrayBuffer())
    .then((zipBuffer) => {
        return JSZip.loadAsync(zipBuffer);
    }).then(async (zipData) => {
        let image_data = {};
        const promises: any = [];
        zipData.forEach((relativePath, file) => {
            // Check if the file is a WebP image
            if (file.name.endsWith('.webp')) {
                // Create a promise for each image processing
                const promise = file.async('arraybuffer').then(data => {
                    // Extract the filename without extension
                    const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
                    // Store the image data in the object
                    image_data[fileNameWithoutExtension] = data;
                });
                promises.push(promise);
            }
        });
        await Promise.all(promises);
        // await addOrUpdateData('imageData', image_data);
        postMessage(image_data)
    });

}