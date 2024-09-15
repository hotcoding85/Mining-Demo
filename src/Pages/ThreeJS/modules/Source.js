import * as THREE from 'three'
import RBush from 'rbush';
import bbox from '@turf/bbox';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import getPixels from 'image-pixels'
import QuadTextureMaterial from './QuadTextureMaterial'
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
      return await this.isValidImage(url, z, x, y)
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
    this.elevationMap = new window.Map()
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
    return this.map.source.mapUrl(this.z, this.x, this.y)
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
          const rgba = pixels.data.slice(ij * 4, ij * 4 + 4);

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
            elevationValue = Math.round(parseFloat(nearestFeature.properties.height) * 100) / 100 - 400;
          }

          if (!nearestFeature || isNaN(elevationValue)) {
            // elevationValue = parseFloat(rgba[0] * 256 + rgba[1] + rgba[2] / 256 - 32768)
            elevationValue = ((rgba[0] * 256 * 256 + rgba[1] * 256 + rgba[2]) * 0.1) - 10000 - 400;
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
      getPixels(this.url(), (err, pixels) => {
        if (err) console.error(err)
        
        this.computeElevation(pixels)
        this.buildGeometry()
        this.buildmesh()
        resolve(this)
      })
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
}

export class Map {
  constructor (scene, camera, source, geoLocation, nTiles, zoom=10, options, geojson) {
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

  init() {
    this.center = Utils.geo2tile(this.geoLocation, this.zoom)
    console.log({loc: this.geoLocation, center: this.center})
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
  }

  getElevationAt(point) {
    const tileKey = Utils.position2tile(this.zoom, point.x, point.y, this.center, this.tileSize);
    const tile = this.tileCache[`${tileKey.z}/${tileKey.x}/${tileKey.y}`];

    if (!tile || !tile.elevation) {
      console.error("No elevation data found for this tile.");
      return 0; // Return a default elevation
    }

    // Convert point's position to pixel coordinates within the tile
    const pixelX = (point.x % tile.size) / tile.size * tile.shape[1];
    const pixelY = (point.y % tile.size) / tile.size * tile.shape[0];
    
    // Fetch the elevation from the tile's elevation map
    const elevationIndex = Math.floor(pixelY) * tile.shape[1] + Math.floor(pixelX);
    // console.log(pixelX, pixelY)
    
    return tile.elevation[elevationIndex] * 2 || 300;
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
    this.domElement.addEventListener('mousemove', this.onMouseMove.bind(this))
    this.domElement.addEventListener('dblclick', this.onMouseDblClick.bind(this))
    // this.domElement.addEventListener('click', this.onMouseClick.bind(this))
  }

  computeWorldPosition(event) {
    // cf. https://stackoverflow.com/a/13091694/343834
    this.vec.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5);

    this.vec.unproject(this.camera);

    this.vec.sub(this.camera.position).normalize();

    var distance = -this.camera.position.z / this.vec.z;

    this.position.copy(this.camera.position).add(this.vec.multiplyScalar(distance));
  }

  onMouseMove(event) {
    // this.computeWorldPosition(event)
  }

  onMouseDblClick (event) {

  }
  onMouseClick(event) {
    this.computeWorldPosition(event)
    // this.map.addFromPosition(this.position.x, this.position.y)
    console.log(this.position.x, this.position.y)
    this.computeWorldPosition(event);
    const position = new THREE.Vector3(this.position.x, this.position.y, this.position.z);
    this.selectedPoints.push(position);

    // If two points are selected, draw the line
    if (this.selectedPoints.length === 2) {
      this.drawLineBetweenPoints(this.selectedPoints[0], this.selectedPoints[1]);
      this.selectedPoints = []; // Reset points
    }

  }
  
  drawLineBetweenPoints(point1, point2) {
    const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 4,depthTest: false });
    
    const points = [];
    const numPoints = 1; // Number of points to sample along the line
  
    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const interpolatedPoint = new THREE.Vector3().lerpVectors(point1, point2, t);
  
      // Get the elevation for this point from the terrain
      const elevation = this.map.getElevationAt(interpolatedPoint);
      interpolatedPoint.z = elevation; // Adjust Z based on elevation
  
      points.push(interpolatedPoint);
    }
  
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
