import { Asset } from 'expo';
import ExpoPixi, { PIXI } from 'expo-pixi';

async function setupSpriteSheetAsync(resource, spriteSheet) {
  const asset = Asset.fromModule(resource);
  await asset.downloadAsync();

  console.log({ asset });
  const texture = ExpoPixi.texture(asset);

  let textures = {};
  for (const sprite of spriteSheet) {
    const { name, x, y, width, height } = sprite;
    console.log(x, y, width, height);

    try {
      const frame = new PIXI.Rectangle(x, y, width, height);
      textures[name] = new PIXI.Texture(texture.baseTexture, frame);
    } catch ({ message }) {
      console.error(message);
    }
  }
  return textures;
}

export default setupSpriteSheetAsync;
