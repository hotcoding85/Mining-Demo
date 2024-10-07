import * as THREE from 'three'
import RBush from 'rbush';
import bbox from '@turf/bbox';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import getPixels from 'image-pixels'
import QuadTextureMaterial from './QuadTextureMaterial'
import _ from 'lodash';
import STOP_SIGN_PNG from 'assets/images/stop_sign.png'
const tileMaterial = new THREE.MeshNormalMaterial({wireframe: true})
const baseTileSize = 512
const token = 'sk.eyJ1IjoibXlreXRhcyIsImEiOiJjbTExNjUwODgwbHN0MmxzZ3l1YzFmdmlsIn0.pbDu9G65zies9q30ZwlbQA'
export class Source {
    constructor(api, token, options) {
      this.supportedApis = {
        'osm': this.mapUrlOSM.bind(this),
        'mapbox': this.mapUrlMapbox.bind(this),
        'eox': this.mapUrlSentinel2Cloudless.bind(this),
        'maptiler': this.mapUrlmapTiler.bind(this),
      }
      if (!(api in this.supportedApis)) {
        throw new Error('Unknown source api');
      }
      this.api = api
      this.token = token
      this.options = options
    }
  
    mapUrlOSM(z, x, y) {
      return `https://c.tile.openstreetmap.org/${z}/${x}/${y}.png`
    }

    async mapUrlMapbox(z, x, y) {
      const styleId = "cm0nq8gmt002p01pq62w695ce";
      const token = this.token;
      const url = `https://api.mapbox.com/v4/mykytas.3bho3ytt/${z}/${x}/${y}.webp?sku=101nNnqDhoG1q&access_token=${token}`
      // return await this.isValidImage(url, z, x, y)
      return `./images/${z}_${x}_${y}.webp`
    }
    async isValidImage(url, z, x, y) {
        const styleId = "cm0nq8gmt002p01pq62w695ce";
        const token = this.token;
        try {
            const response = await fetch(url);
            
            // Check if the request was successful (status code 200)
            if (response.status === 200) {
                // Check if the content type is an image
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.startsWith('image')) {
                  return url
                } 
            } 
              return `https://api.mapbox.com/styles/v1/mykytas/${styleId}/tiles/${z}/${x}/${y}?access_token=${token}&zoomwheel=true&fresh=true`;
        } catch (error) {
          return `https://api.mapbox.com/styles/v1/mykytas/${styleId}/tiles/${z}/${x}/${y}?access_token=${token}&zoomwheel=true&fresh=true`;
        }
    }
    
  
    mapUrlSentinel2Cloudless(z, x, y) {
      // cf. https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml
      return `https://tiles.maps.eox.at/wmts?layer=s2cloudless_3857&style=default&tilematrixset=g&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix=${z}&TileCol=${x}&TileRow=${y}`
    }
  
    mapUrlmapTiler(z, x, y) {
      return `https://api.maptiler.com/tiles/satellite/${z}/${x}/${y}.jpg?key=${this.token}`
    }
  
    mapUrl(z, x, y) {
      return this.supportedApis[this.api](z, x, y)
    }
  
}
const index = new RBush();
class Tile {
  constructor(map, z, x, y, size = baseTileSize, geojsonData) {
    this.map = map
    this.z = z
    this.x = x
    this.y = y
    this.size = size
    this.baseURL = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${token}`
    this.shape = null
    this.elevation = null
    this.seamX = false
    this.seamY = false
    this.geojsonData = geojsonData
    
    if (!this.geojsonData) return
    

  }

  calculateCentroid(coordinates) {
    let x = 0, y = 0, z = 0;
    const total = coordinates.length;
  
    coordinates.forEach(([lon, lat]) => {
      const latitude = (lat * Math.PI) / 180;
      const longitude = (lon * Math.PI) / 180;
  
      x += Math.cos(latitude) * Math.cos(longitude);
      y += Math.cos(latitude) * Math.sin(longitude);
      z += Math.sin(latitude);
    });
  
    x = x / total;
    y = y / total;
    z = z / total;
  
    const centralLongitude = Math.atan2(y, x);
    const centralSquareRoot = Math.sqrt(x * x + y * y);
    const centralLatitude = Math.atan2(z, centralSquareRoot);
  
    return [(centralLongitude * 180) / Math.PI, (centralLatitude * 180) / Math.PI];
  }

  key() {
    return `${this.z}/${this.x}/${this.y}`
  }
  keyNeighX() {
    return `${this.z}/${this.x + 1}/${this.y}`
  }
  keyNeighY() {
    return `${this.z}/${this.x}/${this.y + 1}`
  }

  url() {
    return `${this.baseURL}`
  }

  mapUrl() {
    // return this.map.source.mapUrl(this.z, this.x, this.y)
    return this.map.imageData[this.z + '_' + this.x + '_' + this.y]
  }
  pixelToLatLng(
    tileX,
    tileY,
    pixelX,
    pixelY,
    zoom
  ){
    const n = Math.pow(2, zoom);
  
    // Convert tile + pixel coordinates to world coordinates
    const worldX = (tileX + pixelX / 256) / n;
    const worldY = (tileY + pixelY / 256) / n;
  
    // Convert world coordinates to latitude and longitude
    const longitude = worldX * 360 - 180;
    const latitude = (Math.atan(Math.sinh(Math.PI * (1 - 2 * worldY)))) * (180 / Math.PI);
  
    return { latitude, longitude };
  }

  computeElevation(pixels) {
    if (!pixels) {
      this.elevation = [];
      return
    }
    this.shape = [pixels.height, pixels.width]
    const height = this.shape[0];
    const width = this.shape[1];
    const elevation = new Float32Array(height * width);
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
          const ij = i + height * j;
          // const rgba = pixels.data.slice(ij * 4, ij * 4 + 4);

          let elevationValue = 0;
          const coord = this.pixelToLatLng(this.x, this.y, i, j, this.z);
          const candidates = index.search({
              minX: coord.longitude,
              minY: coord.latitude,
              maxX: coord.longitude,
              maxY: coord.latitude
          });
          let nearestFeature = null;

          candidates.forEach((item) => {
              const isInside = booleanPointInPolygon([coord.longitude, coord.latitude], item.feature.geometry);
              if (isInside) {
                nearestFeature = item.feature;
                  return false; // Exit loop early if point is inside a polygon
              }
          });
          if (nearestFeature) {
            elevationValue = Math.round(parseFloat(nearestFeature.geometry.elevation) * 100) / 100 - 400;
          }

          if (!nearestFeature || isNaN(elevationValue)) {
            // elevationValue = parseFloat(rgba[0] * 256 + rgba[1] + rgba[2] / 256 - 32768)
            // elevationValue = ((rgba[0] * 256 * 256 + rgba[1] * 256 + rgba[2]) * 0.1) - 10000 - 400;
            elevationValue = 90
          }

          // Here you can decide how to use rgba values if needed
          // For now, it simply uses elevationValue
          elevation[ij] = elevationValue
      }
    }

    this.elevation = elevation;
  }

  buildGeometry() {
    if (!this.shape) return
    const geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      this.shape[0] / 2,
      this.shape[1] / 2
    )
    const nPosition = Math.sqrt(geometry.attributes.position.count)
    const nElevation = Math.sqrt(this.elevation.length)
    const ratio = nElevation / (nPosition - 1)
    let x, y
    for (
      // let i = nPosition;
      let i = 0;
      i < geometry.attributes.position.count - nPosition;
      i++
    ) {
      // if (i % nPosition === 0 || i % nPosition === nPosition - 1) continue;
      if (i % nPosition === nPosition - 1) continue
      x = Math.floor(i / nPosition)
      y = i % nPosition
      geometry.attributes.position.setZ(
        i,
        this.elevation[
          Math.round(Math.round(x * ratio) * nElevation + y * ratio)
        ] * 2
      )
    }
    geometry.computeVertexNormals()
    this.geometry = geometry
  }

  childrens() {
    return [
      new Tile(this.map, this.z + 1, this.x * 2, this.y * 2, baseTileSize, this.geojsonData),
      new Tile(this.map, this.z + 1, this.x * 2, this.y * 2 + 1, baseTileSize, this.geojsonData),
      new Tile(this.map, this.z + 1, this.x * 2 + 1, this.y * 2, baseTileSize, this.geojsonData),
      new Tile(this.map, this.z + 1, this.x * 2 + 1, this.y * 2 + 1, baseTileSize, this.geojsonData),
    ]
  }

  // buildMaterial() {
  //   const urls = this.childrens().map(tile => tile.mapUrl())
  //   return QuadTextureMaterial(urls)
  // }

  async buildMaterial() {
    const urls = await Promise.all(this.childrens().map(tile => tile.mapUrl()));
    return QuadTextureMaterial(urls)
  }

  buildmesh() {
    this.buildMaterial().then((material) => {
      this.mesh.material = material
    })
    this.mesh = new THREE.Mesh(this.geometry, tileMaterial)
  }

  fetch() {
    return new Promise((resolve, reject) => {
      // Simulating the delay with setTimeout
      setTimeout(() => {
        const pixels = {
            width: 256,
            height: 256,
            data: []
        };
        this.map.progress++;
        this.computeElevation(pixels);
        this.buildGeometry();
        this.buildmesh();
        resolve(this); // Resolving the promise after delay
      }, 1); // 1ms delay for bulk action
    })
  }

  setPosition(center) {
    const position = Utils.tile2position(
      this.z,
      this.x,
      this.y,
      center,
      this.size
    )
    this.mesh.position.set(...Object.values(position))
  }

  resolveSeamY(neighbor) {
    const tPosition = this.mesh.geometry.attributes.position.count
    const nPosition = Math.sqrt(tPosition)
    const nPositionN = Math.sqrt(
      neighbor.mesh.geometry.attributes.position.count
    )
    if (nPosition !== nPositionN) {
      console.error("resolveSeamY only implemented for geometries of same size")
      return
    }
    for (let i = tPosition - nPosition; i < tPosition; i++) {
      this.mesh.geometry.attributes.position.setZ(
        i,
        neighbor.mesh.geometry.attributes.position.getZ(
          i - (tPosition - nPosition)
        )
      )
    }
  }

  resolveSeamX(neighbor) {
    const tPosition = this.mesh.geometry.attributes.position.count
    const nPosition = Math.sqrt(tPosition)
    const nPositionN = Math.sqrt(
      neighbor.mesh.geometry.attributes.position.count
    )
    if (nPosition !== nPositionN) {
      console.error("resolveSeamX only implemented for geometries of same size")
      return
    }
    for (let i = nPosition - 1; i < tPosition; i += nPosition) {
      this.mesh.geometry.attributes.position.setZ(
        i,
        neighbor.mesh.geometry.attributes.position.getZ(i - nPosition + 1)
      )
    }
  }

  resolveSeams(cache) {
    let worked = false
    const neighY = cache[this.keyNeighY()]
    const neighX = cache[this.keyNeighX()]
    if (this.seamY === false && neighY && neighY.mesh) {
      this.resolveSeamY(neighY)
      this.seamY = true
      worked = true
    }
    if (this.seamX === false && neighX && neighX.mesh) {
      this.resolveSeamX(neighX)
      this.seamX = true
      worked = true
    }
    if (worked) {
      this.mesh.geometry.attributes.position.needsUpdate = true
      this.mesh.geometry.computeVertexNormals()
    }
  }
}
class Utils {
  static long2tile (lon, zoom) {
    return (lon + 180) / 360 * Math.pow(2, zoom)
  }

  static lat2tile (lat, zoom) {
    return (
      (1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
      )
  }

  static geo2tile (geoLocation, zoom) {
    const maxTile = Math.pow(2, zoom);
    return {
      x: Math.abs(Math.floor(Utils.long2tile(geoLocation[1], zoom)) % maxTile),
      y: Math.abs(Math.floor(Utils.lat2tile(geoLocation[0], zoom)) % maxTile)
    } 
  }

  static tile2position(z, x, y, center, tileSize) {
    const offsetAtZ = (z) => {
      return {
        x: center.x / Math.pow(2, 10 - z),
        y: center.y / Math.pow(2, 10 - z),
      };
    };
    const offset = offsetAtZ(z);
    return {
      x: (x - center.x - (offset.x % 1) + (center.x % 1)) * tileSize,
      y: (-y + center.y + (offset.y % 1) - (center.y % 1)) * tileSize,
      z: 0
    }
  }

  static position2tile(z, x, y, center, tileSize) {
    const centerPosition = Utils.tile2position(z, center.x, center.y, center, tileSize)
    const deltaX = Math.round((x - centerPosition.x) / tileSize)
    const deltaY = Math.round(-(y - centerPosition.y) / tileSize)
    return {x: deltaX + center.x, y: deltaY + center.y, z}
  }

  static latLngToTilePixel(latitude, longitude, zoom, tileSize = baseTileSize) {
    const sinLat = Math.sin(latitude * Math.PI / 180);
    
    // Normalize world X (longitude)
    const worldX = (longitude + 180) / 360;
    
    // Project latitude to world Y using Mercator projection
    const worldY = 0.5 - (Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI));
    
    // Calculate world pixel coordinates
    const scale = tileSize * Math.pow(2, zoom);
    const pixelX = Math.floor(worldX * scale);
    const pixelY = Math.floor(worldY * scale);
    
    // Calculate the tile coordinates
    const tileX = Math.floor(pixelX / tileSize);
    const tileY = Math.floor(pixelY / tileSize);
    
    // Calculate the pixel coordinates within the tile
    const tilePixelX = pixelX % tileSize;
    const tilePixelY = pixelY % tileSize;
    
    return {
        tileX,
        tileY,
        tilePixelX,
        tilePixelY
    };
  }

  static pointToTilePixel(x, y, center, z, tileSize = baseTileSize) {
    const centerPosition = Utils.tile2position(z, center.x, center.y, center, tileSize);
    const deltaX = Math.round((x - centerPosition.x) / tileSize);
    const deltaY = Math.round(-(y - centerPosition.y) / tileSize);

    let tilePixelX = ((x - centerPosition.x) % tileSize + tileSize / 2) % tileSize;
    let tilePixelY = (-(y - centerPosition.y) % tileSize + tileSize / 2) % tileSize;
    
    if (tilePixelX < 0) tilePixelX = tilePixelX + tileSize
    if (tilePixelY < 0) tilePixelY = tilePixelY + tileSize
    // Calculate the tile coordinates
    const tileX = deltaX + center.x;
    const tileY = deltaY + center.y;

    return {
        tileX,
        tileY,
        tilePixelX,
        tilePixelY
    };
}



  static tilePixelToLatLng(tileX, tileY, tilePixelX, tilePixelY, zoom, tileSize = baseTileSize) {
    // // Calculate world pixel coordinates
    const scale = tileSize * Math.pow(2, zoom);
    const pixelX = (tileX * tileSize) + tilePixelX;
    const pixelY = (tileY * tileSize) + tilePixelY;

    // Normalize world coordinates
    const worldX = pixelX / scale;
    const worldY = pixelY / scale;

    // Convert world coordinates to latitude and longitude
    const longitude = worldX * 360 - 180;
    const n = Math.PI - 2 * Math.PI * worldY;
    const latitude = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

    return {
        latitude,
        longitude
    };

  }
}

export class Map {
  constructor (scene, camera, source, geoLocation, nTiles, zoom=10, options, geojson, image_data) {
    this.scene = scene
    this.camera = camera
    this.source = source
    this.geoLocation = geoLocation
    this.nTiles = nTiles
    this.zoom = zoom
    this.options = options
    this.tileSize = baseTileSize
    this.geojson = geojson
    this.tileCache = {};
    this.progress = 1;
    this.routes = []
    this.tubeMeshes = [];
    this.stopSignSprites = [];
    this.filteredCategories = [];
    this.imageData = image_data
    this.init()

    geojson.features.map((feature) => {
      let bounds = bbox(feature);
      let item = {
          minX: bounds[0],
          minY: bounds[1],
          maxX: bounds[2],
          maxY: bounds[3],
          feature: feature
      };
      index.insert(item);
    });
  }

  setRoutes(_routes) {
    if (_routes.length !== this.routes.length){
      this.routes = _routes
    }
  }

  calculateWorldPosition(centerTile, tileX, tileY, tilePixelX, tilePixelY, tileSize) {
    // Calculate the offset of the current tile relative to the center tile
    const tileOffsetX = (tileX - centerTile.tileX) * tileSize;
    const tileOffsetY = -(tileY - centerTile.tileY) * tileSize;
  
    // Calculate the total world position by adding the pixel offset inside the tile
    const worldX = tileOffsetX + tilePixelX - tileSize / 2;
    const worldY = tileOffsetY - tilePixelY + tileSize / 2;
  
    // Assuming z=0 for 2D tile map, adjust if 3D height is needed
    return { x: worldX, y: worldY, z: 0 };
  }

  convertGeoToPixel (lat, lng, zoom = this.zoom) {
    return Utils.latLngToTilePixel(lat, lng, zoom);
  }

  convertXYToPixel (x, y, center = this.center, zoom = this.zoom) {
    return Utils.pointToTilePixel(x, y, center, zoom, baseTileSize)
  }

  convertTileToGeo (tileX, tileY, x, y, zoom = this.zoom, tileSize = this.tileSize) {
    return Utils.tilePixelToLatLng(tileX, tileY, x, y, zoom, tileSize)
  }

  drawRoutes() {
    if (!this.routes || this.routes.length === 0) {
      return;
    }
    // Get the top-left corner's tile coordinates (view's origin)
    const centerLatLng = this.geoLocation; // Assuming getCenter() gets the current view center position
    const centerPixel = Utils.latLngToTilePixel(centerLatLng[0], centerLatLng[1], this.zoom);
    _.map(this.routes, (_route) => {
        if (_route.category !== 'STOP_SIGNS' && _route.status == 'ACTIVE') {
            const points = [];
            const coordinates = _route.geoJson.geometry.coordinates;
            // Loop over each coordinate and calculate its pixel position relative to the current view
            for (let i = 0; i < coordinates.length; i++) {
                const lat = coordinates[i][1]; // Latitude
                const lng = coordinates[i][0]; // Longitude

                // Convert lat/lng to tile pixel
                const tilePixel = Utils.latLngToTilePixel(lat, lng, this.zoom);
                const tileX = tilePixel.tileX;          // tile X coordinate of the point
                const tileY = tilePixel.tileY;          // tile Y coordinate of the point
                const tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
                const tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

                const worldPos = this.calculateWorldPosition(centerPixel, tileX, tileY, tilePixelX, tilePixelY, baseTileSize);
                // Create a THREE.Vector3 using view-relative pixel coordinates
                const point = new THREE.Vector3(worldPos.x, worldPos.y, 0);

                // Get the elevation for this point and set the Z coordinate
                let elevationValue = 0
                const candidates = index.search({
                  minX: lng,
                  minY: lat,
                  maxX: lng,
                  maxY: lat
                });
      
                let nearestFeature = null;
      
                candidates.forEach((item) => {
                    const isInside = booleanPointInPolygon([lng, lat], item.feature.geometry);
                    if (isInside) {
                        nearestFeature = item.feature;
                        return false; // Exit loop early if point is inside a polygon
                    }
                });
                if (nearestFeature) {
                  elevationValue = Math.round(parseFloat(nearestFeature.geometry.elevation) * 100) / 100 - 400;
                }
      
                if (!nearestFeature || isNaN(elevationValue)) {
                  // elevationValue = parseFloat(rgba[0] * 256 + rgba[1] + rgba[2] / 256 - 32768)
                  elevationValue = this.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
                }
                point.z = elevationValue * 2
                points.push(point);
            }

            // Create a curve from the points for TubeGeometry
            const curve = new THREE.CatmullRomCurve3(points);

            // Tube Geometry parameters: path, tubular segments, radius, radial segments, closed
            const tubeGeometry = new THREE.TubeGeometry(curve, 100, 15, 10, false);

            // Create the tube material with color from _route.color
            const tubeMaterial = new THREE.MeshBasicMaterial({ color: _route.color, opacity: 0.4, transparent: true, depthTest: false, depthWrite: false });

            // Create the tube mesh
            const tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);

            // Add the tube mesh to the scene
            this.tubeMeshes.push({
              index: _route.category,
              value: tubeMesh
            })
            this.scene.add(tubeMesh);
        } else  if (_route.category == 'STOP_SIGNS' && _route.status == 'ACTIVE') {
          // Handle the STOP_SIGNS category by showing an image at the point
          const coordinates = _route.geoJson.geometry.coordinates;
          if (coordinates.length === 1) { // Assuming there's only one point for STOP_SIGNS
            const lat = coordinates[0][1];
            const lng = coordinates[0][0];

            // Convert lat/lng to tile pixel
            const tilePixel = Utils.latLngToTilePixel(lat, lng, this.zoom);
            const tileX = tilePixel.tileX;          // tile X coordinate of the point
            const tileY = tilePixel.tileY;          // tile Y coordinate of the point
            const tilePixelX = tilePixel.tilePixelX; // pixel X position inside the tile
            const tilePixelY = tilePixel.tilePixelY; // pixel Y position inside the tile

            const worldPos = this.calculateWorldPosition(centerPixel, tileX, tileY, tilePixelX, tilePixelY, baseTileSize);

            // Create a sprite or mesh for the image
            const imageTexture = new THREE.TextureLoader().load(STOP_SIGN_PNG); // Load your image
            const spriteMaterial = new THREE.SpriteMaterial({ map: imageTexture });
            const sprite = new THREE.Sprite(spriteMaterial);

            // Set the sprite position at the calculated world position
            // Get the elevation for this point and set the Z coordinate
            const candidates = index.search({
              minX: lng,
              minY: lat,
              maxX: lng,
              maxY: lat
            });
  
            let nearestFeature = null;
  
            candidates.forEach((item) => {
                const isInside = booleanPointInPolygon([lng, lat], item.feature.geometry);
                if (isInside) {
                    nearestFeature = item.feature;
                    return false; // Exit loop early if point is inside a polygon
                }
            });
            let elevationValue = 0
            if (nearestFeature) {
              elevationValue = Math.round(parseFloat(nearestFeature.geometry.elevation) * 100) / 100 - 400;
            }
  
            if (!nearestFeature || isNaN(elevationValue)) {
              // elevationValue = parseFloat(rgba[0] * 256 + rgba[1] + rgba[2] / 256 - 32768)
              elevationValue = this.getElevationAt([tilePixelX, tilePixelY], tileX, tileY);
            }
            sprite.position.set(worldPos.x, worldPos.y, (elevationValue * 2 + 60));
            sprite.scale.set(50, 50, 1);
            sprite.renderOrder = 999
            // Add the sprite to the scene
            this.scene.add(sprite);

            // Optionally, you can push this into an array like `this.tubeMeshes` if you want to toggle its visibility later
            this.stopSignSprites.push(sprite);

          }
        }
        this.setFilteredCategories(this.filteredCategories)
    });
  }


  
  setFilteredCategories(_categories) {
    this.filteredCategories = _categories;
    
    if (this.tubeMeshes.length > 0) {
        _.map(this.tubeMeshes, _tube => {
            // Check if the category of the current tube is in the filtered categories
            if (this.filteredCategories.includes(_tube.index)) {
                // Show the tube
                _tube.value.visible = true;
            } else {
                // Hide the tube
                _tube.value.visible = false;
            }
        });
    }
    // Filter stopSignSprites
    if (this.stopSignSprites.length > 0) {
      _.map(this.stopSignSprites, (_sprite) => {
        if (this.filteredCategories.includes('STOP_SIGNS')) {
          _sprite.visible = true; // Show the stop sign sprite if 'STOP_SIGNS' is in the filtered list
        } else {
          _sprite.visible = false; // Hide the stop sign sprite if 'STOP_SIGNS' is not in the filtered list
        }
      });
    }
  }

  init() {
    this.center = Utils.geo2tile(this.geoLocation, this.zoom)
    const tileOffset = Math.floor(this.nTiles / 2)

    for (let i = 0; i < this.nTiles; i++) {
      for (let j = 0; j < this.nTiles; j++) {
        const tile = new Tile(this, this.zoom, this.center.x + i - tileOffset, this.center.y + j - tileOffset, baseTileSize, this.geojson)
        this.tileCache[tile.key()] = tile
      }
    }

    const promises = Object.values(this.tileCache).map(tile =>
      tile.fetch().then(tile => {
        tile.setPosition(this.center)
        this.scene.add(tile.mesh)
        return tile
      })
    )

    Promise.all(promises).then(tiles => {
      tiles.reverse().forEach(tile => {  // reverse to avoid seams artifacts
        tile.resolveSeams(this.tileCache)
      })
    })

  }

  addFromPosition(posX, posY) {
    const {
      x,
      y,
      z
    } = Utils.position2tile(this.zoom, posX, posY, this.center, this.tileSize)
    const tile = new Tile(this, this.zoom, x, y, baseTileSize)

    if (tile.key() in this.tileCache) return

    this.tileCache[tile.key()] = tile
    tile.fetch().then(tile => {
      tile.setPosition(this.center)
      this.scene.add(tile.mesh)
    }).then(() => {
      Object.values(this.tileCache).forEach(tile => tile.resolveSeams(this.tileCache))
    })
  }

  clean() {
    Object.values(this.tileCache).forEach(tile => {
      this.scene.remove(tile.mesh)
      tile.mesh.geometry.dispose();
      ['mapSW', 'mapNW', 'mapSE', 'mapNE'].forEach(key => tile.mesh.material.uniforms[key].value.dispose())
      tile.mesh.material.dispose()
    })
    this.tileCache = {}
    this.progress = 1;
  }

  getElevationAt(point, x, y) {
    const tile = this.tileCache[`${this.zoom}/${x}/${y}`];
    if (!tile || !tile.elevation) {
      // console.error("No elevation data found for this tile.");
      return 0; // Return a default elevation
    }
    // Fetch the elevation from the tile's elevation map
    const elevationIndex = Math.floor(point[1] / 2) * tile.shape[1] + Math.floor(point[0] / 2);
    return tile.elevation[elevationIndex] || 0;
  }
}
export class MapPicker {
  constructor(camera, map, domElement, controls) {
    this.vec = new THREE.Vector3(); // create once and reuse
    this.position = new THREE.Vector3(); // create once and reuse
    this.camera = camera
    this.map = map
    this.domElement = domElement
    this.controls = controls

    this.selectedPoints = [];
    // this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    // this.domElement.addEventListener('dblclick', this.onMouseDblClick.bind(this))
    // this.domElement.addEventListener('click', this.onMouseClick.bind(this))
  }

  computeWorldPosition(event) {
    // cf. https://stackoverflow.com/a/13091694/343834
    this.vec.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      1);

    this.vec.unproject(this.camera);
    this.vec.sub(this.camera.position).normalize();
    
    var distance = -this.camera.position.z / this.vec.z;

    this.position.copy(this.camera.position).add(this.vec.multiplyScalar(distance));
  }

  onMouseMove(event) {
    this.computeWorldPosition(event)
  }

  onMouseDblClick (event) {
    this.computeWorldPosition(event)
    this.map.addFromPosition(this.position.x, this.position.y)
  }
  onMouseClick(event) {
    this.computeWorldPosition(event)
    const position = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
    this.selectedPoints.push(position);

    // If two points are selected, draw the line
    if (this.selectedPoints.length === 2) {
      // this.drawLineBetweenPoints(this.selectedPoints[0], this.selectedPoints[1]);
      this.selectedPoints = []; // Reset points
    }

  }
  
  drawLineBetweenPoints(point1, point2) {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 10, depthTest: false, depthWrite: false });
    
    // Create the points array directly from the two selected points
    const points = [point1.clone(), point2.clone()];
  
    const {
      x,
      y,
      z
    } = Utils.position2tile(this.map.zoom, point1.x, point1.y, this.map.center, this.map.tileSize)
    const tile = new Tile(this, this.map.zoom, x, y, baseTileSize)
    // Get the elevation for the two points from the terrain
    const elevation1 = this.map.getElevationAt(point1);
    const elevation2 = this.map.getElevationAt(point2);
  
    // Adjust Z based on elevation
    points[0].z = elevation1;
    points[1].z = elevation2;
  
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    this.map.scene.add(line);
  }

  go(lat, lon) {
    this.map.clean()
    this.map.geoLocation = [lat, lon]
    this.map.init()
  }
}
