import * as BABYLON from './babylon';
import { MToonMaterial } from 'babylon-mtoon-material';
import cannon from 'cannon';
import MobileDetect from 'mobile-detect';
import domready from './domready';
import hsl_to_rgb from './hsl_to_rgb';

class InteractiveScene {
  private canvas: HTMLCanvasElement;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;

  private camera: BABYLON.ArcRotateCamera;
  private camera_rotate: BABYLON.Animation;
  private light: BABYLON.DirectionalLight;
  private shadow: BABYLON.ShadowGenerator;

  private base_meshes: Array<BABYLON.Mesh>;
  private meshes: Array<BABYLON.Mesh>;

  private ground_mesh: BABYLON.Mesh;
  private ground_mesh_hue_shift: BABYLON.Animation;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.base_meshes = [];
    this.meshes = [];
  }

  create_scene(): void {
    // setup scene and background color
    this.scene = new BABYLON.Scene(this.engine);
    this.scene.clearColor = new BABYLON.Color4(2 / 15, 2 / 15, 2 / 15, 1.0);

    // physics engine
    let gravity_vector = new BABYLON.Vector3(0, -9.81, 0);
    let physics_plugin = new BABYLON.CannonJSPlugin(true, 10, cannon);
    this.scene.enablePhysics(gravity_vector, physics_plugin);

    // camera
    const camera_radius = 30;
    this.camera = new BABYLON.ArcRotateCamera('camera', 0, Math.PI * 0.6, camera_radius, BABYLON.Vector3.Zero(), this.scene);

    // camera movement bound
    this.camera.allowUpsideDown = false;
    this.camera.lowerBetaLimit = 0;
    this.camera.upperBetaLimit = Math.PI * 0.6;
    this.camera.lowerRadiusLimit = camera_radius;
    this.camera.upperRadiusLimit = camera_radius;
    this.camera.attachControl(this.canvas);

    // camera auto rotate
    const camera_rotate_framerate = 60;
    const camera_rotate_time = 30;
    this.camera_rotate = new BABYLON.Animation('camera_rotate', 'alpha', camera_rotate_framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
    this.camera_rotate.setKeys([
      {
        frame: 0,
        value: 0
      }, {
        frame: camera_rotate_framerate * camera_rotate_time,
        value: Math.PI * 2
      }
    ]);
    this.camera.animations.push(this.camera_rotate);
    this.scene.beginAnimation(this.camera, 0, camera_rotate_framerate * camera_rotate_time, true);

    // light and shadow
    this.light = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(-Math.sin(Math.PI / 12), -Math.cos(Math.PI / 12), 0), this.scene);
    this.light.position.scaleInPlace(500);
    this.shadow = new BABYLON.ShadowGenerator(2048, this.light);

    // generate base meshes
    for (let i = 0; i < 30; i++) {
      let material = new MToonMaterial(`mtoonmaterial_${i}`, this.scene);

      let base_hue = Math.random();
      let base_sat = Math.random() * 0.5 + 0.5;
      material.diffuseColor = new BABYLON.Color3(...hsl_to_rgb(base_hue, base_sat, 0.7));
      material.shadeColor = new BABYLON.Color3(...hsl_to_rgb(base_hue, base_sat, 0.5));

      material.shadeToony = 0.5;
      material.shadeShift = -1 / 6;
      material.freeze();

      let mesh = BABYLON.SphereBuilder.CreateSphere(`sphere_${i}`,
        { segments: 16, diameter: 1 }, this.scene);
      mesh.position.y = -20;
      mesh.isVisible = false;
      mesh.receiveShadows = true;
      mesh.material = material;
      mesh.cullingStrategy = BABYLON.Mesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
      mesh.physicsImpostor = new BABYLON.PhysicsImpostor(mesh, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0, friction: 0.5, restitution: 0.9 }, this.scene);

      this.base_meshes.push(mesh);
    }

    let mesh_limit = 64;

    // detect mobile and tablet, reduce mesh count accordingly
    const mobile_detect = new MobileDetect(window.navigator.userAgent);
    if (mobile_detect.tablet()) {
      mesh_limit = 32;
    } else if (mobile_detect.mobile()) {
      mesh_limit = 16;
    }

    // spawn initial meshes
    for (let i = 0; i < mesh_limit; i++) {
      this.meshes.push(this.create_mesh());
    }

    // ground
    this.ground_mesh = BABYLON.DiscBuilder.CreateDisc('ground', { radius: 30 }, this.scene);
    this.ground_mesh.receiveShadows = true;
    this.ground_mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.ground_mesh, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 0, friction: 0.5, restitution: 0.75 }, this.scene);
    this.ground_mesh.rotate(new BABYLON.Vector3(1, 0, 0), Math.PI / 2);
    this.ground_mesh.position.y = -10;
    this.ground_mesh.freezeWorldMatrix();

    let ground_material = new MToonMaterial(`ground_material`, this.scene);
    this.ground_mesh.material = ground_material;

    // change ground color over time
    const ground_hue_shift_const = Math.random(); 
    const ground_hue_shift_framerate = 60;
    const ground_hue_shift_time = 100;
    this.ground_mesh.metadata = {
      'ground_hue_shift': 0.0,
    };
    this.ground_mesh_hue_shift = new BABYLON.Animation('ground_color_shift', 'metadata.ground_hue_shift', ground_hue_shift_framerate, BABYLON.Animation.ANIMATIONTYPE_FLOAT);
    this.ground_mesh_hue_shift.setKeys([
      {
        frame: 0,
        value: 0.0
      }, {
        frame: ground_hue_shift_framerate * ground_hue_shift_time,
        value: 1.0
      }
    ]);
    this.ground_mesh.animations.push(this.ground_mesh_hue_shift);
    this.scene.beginAnimation(this.ground_mesh, 0, ground_hue_shift_framerate * ground_hue_shift_time, true);

    // performance tracker
    let frame_count = 0;
    let frame_time_sum = 0;

    // update
    this.scene.registerBeforeRender(() => {
      let delta = this.engine.getDeltaTime();

      // keep track of performance
      frame_count++;
      frame_time_sum += Math.min(delta, 50);

      if (frame_count > 10) {
        // if performance doesn't meet target
        if (this.meshes.length > 8 && frame_time_sum / frame_count > 35) {
          this.destroy_mesh(this.meshes.pop());
        }

        frame_count = 0;
        frame_time_sum = 0;
      }

      // update ground color
      let ground_hue = this.ground_mesh.metadata.ground_hue_shift + ground_hue_shift_const;
      if (ground_hue > 1) {
        ground_hue -= 1;
      }
      ground_material.diffuseColor = new BABYLON.Color3(...hsl_to_rgb(ground_hue, 0.3, 0.7));
      ground_material.shadeColor = new BABYLON.Color3(...hsl_to_rgb(ground_hue, 0.3, 0.5));

      // keep track of which mesh to respawn
      let respawn_idx = [];

      for (let idx = 0; idx < this.meshes.length; idx++) {
        // check boundary
        if (
          this.meshes[idx].position.multiplyByFloats(1, 0, 1).length() > 40 ||
          this.meshes[idx].position.y < -15
        ) {
          // destroy mesh that is out of bound
          this.destroy_mesh(this.meshes[idx]);
          respawn_idx.push(idx);
          continue;
        }

        // nudge slow meshes
        if (this.meshes[idx].getPhysicsImpostor().getLinearVelocity().length() < 0.5 && this.meshes[idx].position.y < -5) {
          this.meshes[idx].getPhysicsImpostor().applyForce(this.meshes[idx].position.multiplyByFloats(1, 0, 1).normalize().scale(10), new BABYLON.Vector3(0, 1, 0));
        }

        // artificial terminal velocity
        if (this.meshes[idx].getPhysicsImpostor().getLinearVelocity().y < -12) {
          this.meshes[idx].getPhysicsImpostor().getLinearVelocity().y = -12;
        }
      }

      // recreate mesh
      for (let idx of respawn_idx) {
        this.meshes[idx] = this.create_mesh();
      }
    });
  }

  create_mesh(): BABYLON.Mesh {
    let mesh = this.base_meshes[Math.floor(Math.random() * this.base_meshes.length)].clone();

    mesh.isVisible = true;
    this.shadow.addShadowCaster(mesh);
    mesh.getPhysicsImpostor().setMass(Math.random() * 10 + 1);

    // initial position
    const spawn_pos_dist = Math.random() * 20;
    const spawn_pos_theta = Math.random() * Math.PI * 2;
    mesh.position.y = Math.random() * 50 + 10;
    mesh.position.x = spawn_pos_dist * Math.cos(spawn_pos_theta);
    mesh.position.z = spawn_pos_dist * Math.sin(spawn_pos_theta);

    // initial kinetic energy
    const spawn_spin_mag = 20 * Math.random() + 5;
    const spawn_spin_theta = Math.random() * Math.PI * 2;
    mesh.getPhysicsImpostor().setAngularVelocity(new BABYLON.Vector3(spawn_spin_mag * Math.cos(spawn_spin_theta), 0, spawn_spin_mag * Math.sin(spawn_spin_theta)));

    return mesh;
  }

  destroy_mesh(mesh: BABYLON.Mesh): void {
    this.shadow.removeShadowCaster(mesh);
    mesh.dispose();
  }

  render(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }
}

domready(() => {
  let interactive_scene = new InteractiveScene(document.getElementById('interactive-element') as HTMLCanvasElement);
  interactive_scene.create_scene();
  interactive_scene.render();
});
