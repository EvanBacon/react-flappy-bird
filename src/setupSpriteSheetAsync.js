import { PIXI } from 'expo-pixi';
const { Rectangle, Texture } = PIXI;
async function setupSpriteSheetAsync(resource, spriteSheet) {
  const texture = await Texture.fromExpoAsync(resource);

  let textures = {};
  for (const sprite of spriteSheet) {
    const { name, x, y, width, height } = sprite;
    try {
      const frame = new Rectangle(x, y, width, height);
      textures[name] = new global.PIXI.Texture(texture.baseTexture, frame);
    } catch ({ message }) {
      console.error(message);
    }
  }
  return textures;
}

export default setupSpriteSheetAsync;
