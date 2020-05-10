// Reexport babylonjs so that the bundler can optimize the bundle size

export { Engine } from '@babylonjs/core/Engines/engine';
export { Scene } from '@babylonjs/core/scene';

export { Color3 } from '@babylonjs/core/Maths/math.color';
export { Color4 } from '@babylonjs/core/Maths/math.color';
export { Vector3 } from '@babylonjs/core/Maths/math.vector';
export { Vector4 } from '@babylonjs/core/Maths/math.vector';

export { Animation } from '@babylonjs/core/Animations/animation';
export { } from '@babylonjs/core/Animations/animatable';

export {  } from '@babylonjs/core/Materials/standardMaterial';
export { Mesh } from '@babylonjs/core/Meshes/mesh';
export { DiscBuilder } from '@babylonjs/core/Meshes/Builders/discBuilder';
export { SphereBuilder } from '@babylonjs/core/Meshes/Builders/sphereBuilder';

export { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
export { DirectionalLight } from '@babylonjs/core/Lights/directionalLight';
export { } from '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
export { ShadowGenerator } from '@babylonjs/core/Lights/Shadows/shadowGenerator';

export { } from '@babylonjs/core/Physics/physicsEngineComponent';
export { CannonJSPlugin } from '@babylonjs/core/Physics/Plugins/cannonJSPlugin';
export { PhysicsImpostor } from '@babylonjs/core/Physics/physicsImpostor'
