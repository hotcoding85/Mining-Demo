import {
  ShaderMaterial,
  TextureLoader,
  UniformsLib,
  DataTexture,
  RGBAFormat,
  Texture
} from 'three'
import vertexShader from './quadtexture_vert.glsl'
import fragmentShader from './quadtexture_frag.glsl'

const loader = new TextureLoader()

const QuadTextureMaterial = async (images) => {
  // return Promise.all(urls.map(url => loader.loadAsync(url))).then(maps => {
  //   return new ShaderMaterial({
  //     uniforms: {
  //       mapNW: {value: maps[0]},
  //       mapSW: {value: maps[1]},
  //       mapNE: {value: maps[2]},
  //       mapSE: {value: maps[3]},
  //       ...UniformsLib.common,
  //       ...UniformsLib.lights,
  //       ...UniformsLib.fog,
  //     },
  //     vertexShader,
  //     fragmentShader,
  //     defines: {
  //       USE_MAP: true,
  //       USE_UV: true,
  //     },
  //     lights: true,
  //     fog: true,
  //   })
  // })
  const textures = await Promise.all(images.map(async (arrayBuffer) => {
    // Convert ArrayBuffer into a Blob
    const blob = new Blob([arrayBuffer], { type: 'image/webp' }); // Assuming WebP format
    const imageBitmap = await createImageBitmap(blob, { imageOrientation: 'flipY' });
  
    // Create a Texture using the decoded ImageBitmap
    const texture = new Texture(imageBitmap);
    
    // Mark the texture as needing an update
    texture.needsUpdate = true;
    return texture;
  }));
  return Promise.resolve().then(() => {
    return new ShaderMaterial({
      uniforms: {
        mapNW: { value: textures[0] },
        mapSW: { value: textures[1] },
        mapNE: { value: textures[2] },
        mapSE: { value: textures[3] },
        ...UniformsLib.common,
        ...UniformsLib.lights,
        ...UniformsLib.fog,
      },
      vertexShader,
      fragmentShader,
      defines: {
        USE_MAP: true,
        USE_UV: true,
      },
      lights: true,
      fog: true,
    });
  });
}

export default QuadTextureMaterial
