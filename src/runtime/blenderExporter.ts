import { AnimationProject } from '../types/animation';

/**
 * Generates an executable Blender Python script (.py)
 * Compatible with Blender 3.x, 4.x, and 4.2+ (Eevee / Cycles)
 */
export function generateBlenderPythonScript(project: AnimationProject): string {
  const fps = project.fps || 60;
  const totalFrames = Math.floor((project.duration || 10) * fps);
  const titleSafe = project.title.replace(/[^a-zA-Z0-9_]/g, '_');

  // Extract colors from parameters if available
  const params = project.parameters;
  const color1 = params.primaryColor?.value || params.neonColor1?.value || params.mechColor?.value || params.edgeGlow?.value || '#00f2fe';
  const color2 = params.secondaryColor?.value || params.neonColor2?.value || params.accentColor?.value || params.coreColor?.value || '#ff007f';

  // Hex to linear RGB helper
  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '');
    const bigint = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16) || 0x00f2fe;
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [
      Math.pow(r, 2.2), // gamma to linear
      Math.pow(g, 2.2),
      Math.pow(b, 2.2)
    ];
  };

  const [r1, g1, b1] = hexToRgb(color1);
  const [r2, g2, b2] = hexToRgb(color2);

  const isCharacter = project.tags.some(t => 
    ['Character', 'Mech', 'Robot', 'Rigging', 'Puppet', 'Ninja', 'Biped'].includes(t)
  );

  return `# ==============================================================================
# Anify Studio -> Blender Integration Exporter
# Generated for: "${project.title}"
# Engine: ${project.engine} | FPS: ${fps} | Duration: ${project.duration}s (${totalFrames} frames)
# Compatible with: Blender 3.6 LTS, Blender 4.0, 4.1, 4.2+
#
# INSTRUCTIONS:
# 1. Open Blender.
# 2. Go to the "Scripting" workspace tab.
# 3. Click "New" text data-block, paste this script, and click "Run Script".
#    Or run from terminal: blender --python anify_${titleSafe}.py
# ==============================================================================

import bpy
import math
import mathutils

def clear_existing_scene():
    """Clear default scene objects for a pristine studio setup"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def setup_render_settings():
    """Setup frame rate, resolution, and render engine"""
    scene = bpy.context.scene
    scene.render.fps = ${fps}
    scene.frame_start = 1
    scene.frame_end = ${totalFrames}
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100

    # Enable EEVEE Next or Cycles
    if "BLENDER_EEVEE_NEXT" in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys():
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    elif "BLENDER_EEVEE" in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys():
        scene.render.engine = 'BLENDER_EEVEE'
    else:
        scene.render.engine = 'CYCLES'

    # Dark studio world background
    if scene.world is None:
        scene.world = bpy.data.worlds.new("Anify_World")
    scene.world.use_nodes = True
    bg_node = scene.world.node_tree.nodes.get("Background")
    if bg_node:
        bg_node.inputs[0].default_value = (0.015, 0.018, 0.03, 1.0) # Dark navy space
        bg_node.inputs[1].default_value = 0.5

def create_materials():
    """Create emissive and metallic Principled BSDF materials"""
    # Material 1: Primary Neon Emission
    mat1 = bpy.data.materials.new(name="Anify_PrimaryGlow")
    mat1.use_nodes = True
    nodes1 = mat1.node_tree.nodes
    nodes1.clear()
    out1 = nodes1.new(type='ShaderNodeOutputMaterial')
    emit1 = nodes1.new(type='ShaderNodeEmission')
    emit1.inputs['Color'].default_value = (${r1.toFixed(3)}, ${g1.toFixed(3)}, ${b1.toFixed(3)}, 1.0)
    emit1.inputs['Strength'].default_value = 8.0
    mat1.node_tree.links.new(emit1.outputs['Emission'], out1.inputs['Surface'])

    # Material 2: Secondary Accent
    mat2 = bpy.data.materials.new(name="Anify_SecondaryGlow")
    mat2.use_nodes = True
    nodes2 = mat2.node_tree.nodes
    nodes2.clear()
    out2 = nodes2.new(type='ShaderNodeOutputMaterial')
    emit2 = nodes2.new(type='ShaderNodeEmission')
    emit2.inputs['Color'].default_value = (${r2.toFixed(3)}, ${g2.toFixed(3)}, ${b2.toFixed(3)}, 1.0)
    emit2.inputs['Strength'].default_value = 6.0
    mat2.node_tree.links.new(emit2.outputs['Emission'], out2.inputs['Surface'])

    # Material 3: Dark Cyber Metallic Chassis
    mat3 = bpy.data.materials.new(name="Anify_ChassisMetal")
    mat3.use_nodes = True
    nodes3 = mat3.node_tree.nodes
    bsdf3 = nodes3.get("Principled BSDF")
    if bsdf3:
        bsdf3.inputs['Base Color'].default_value = (0.04, 0.05, 0.08, 1.0)
        bsdf3.inputs['Metallic'].default_value = 0.85
        bsdf3.inputs['Roughness'].default_value = 0.25

    return mat1, mat2, mat3

def setup_camera_and_lights():
    """Setup cinematic camera orbit and key light rig"""
    # Camera
    cam_data = bpy.data.cameras.new(name="Anify_Camera")
    cam_data.lens = 50
    cam_data.clip_start = 0.1
    cam_data.clip_end = 1000
    cam_obj = bpy.data.objects.new("Anify_Camera", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Keyframe Camera 360 orbit
    total_f = ${totalFrames}
    cam_dist = 14.0
    for frame in range(1, total_f + 1, 10):
        angle = (frame / total_f) * (math.pi * 2)
        cam_obj.location = (
            math.sin(angle) * cam_dist,
            -math.cos(angle) * cam_dist,
            6.5 + math.sin(angle * 2) * 1.5
        )
        cam_obj.keyframe_insert(data_path="location", frame=frame)

        # Track to center
        direction = mathutils.Vector((0, 0, 2.5)) - cam_obj.location
        rot_quat = direction.to_track_quat('-Z', 'Y')
        cam_obj.rotation_euler = rot_quat.to_euler()
        cam_obj.keyframe_insert(data_path="rotation_euler", frame=frame)

    # Key directional light
    light_data = bpy.data.lights.new(name="Anify_KeyLight", type='SUN')
    light_data.energy = 3.5
    light_data.color = (${r1.toFixed(3)}, ${g1.toFixed(3)}, ${b1.toFixed(3)})
    light_obj = bpy.data.objects.new("Anify_KeyLight", light_data)
    light_obj.location = (8, -10, 15)
    light_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(30))
    bpy.context.collection.objects.link(light_obj)

    # Rim light
    rim_data = bpy.data.lights.new(name="Anify_RimLight", type='POINT')
    rim_data.energy = 500
    rim_data.color = (${r2.toFixed(3)}, ${g2.toFixed(3)}, ${b2.toFixed(3)})
    rim_obj = bpy.data.objects.new("Anify_RimLight", rim_data)
    rim_obj.location = (-6, 8, 4)
    bpy.context.collection.objects.link(rim_obj)

${isCharacter ? `
def build_character_armature(mat_glow, mat_accent, mat_metal):
    """Build rigged 3D character armature with keyframed walking / combat cycle"""
    # 1. Ground Grid Plane
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=30, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "Anify_GroundGrid"
    ground.data.materials.append(mat_metal)

    # 2. Armature Bone Hierarchy
    amt_data = bpy.data.armatures.new(name="Anify_Character_Rig")
    amt_obj = bpy.data.objects.new("Anify_Character", amt_data)
    bpy.context.collection.objects.link(amt_obj)
    bpy.context.view_layer.objects.active = amt_obj

    bpy.ops.object.mode_set(mode='EDIT')
    edit_bones = amt_data.edit_bones

    # Pelvis
    root = edit_bones.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 2.2)

    pelvis = edit_bones.new("Pelvis")
    pelvis.head = (0, 0, 2.2)
    pelvis.tail = (0, 0, 2.6)
    pelvis.parent = root

    # Spine & Torso
    spine = edit_bones.new("Spine")
    spine.head = (0, 0, 2.6)
    spine.tail = (0, 0, 3.8)
    spine.parent = pelvis

    # Head
    head = edit_bones.new("Head")
    head.head = (0, 0, 3.8)
    head.tail = (0, 0, 4.5)
    head.parent = spine

    # Left Leg
    thigh_l = edit_bones.new("Thigh_L")
    thigh_l.head = (0.5, 0, 2.4)
    thigh_l.tail = (0.55, 0, 1.2)
    thigh_l.parent = pelvis

    shin_l = edit_bones.new("Shin_L")
    shin_l.head = (0.55, 0, 1.2)
    shin_l.tail = (0.55, 0, 0.2)
    shin_l.parent = thigh_l

    # Right Leg
    thigh_r = edit_bones.new("Thigh_R")
    thigh_r.head = (-0.5, 0, 2.4)
    thigh_r.tail = (-0.55, 0, 1.2)
    thigh_r.parent = pelvis

    shin_r = edit_bones.new("Shin_R")
    shin_r.head = (-0.55, 0, 1.2)
    shin_r.tail = (-0.55, 0, 0.2)
    shin_r.parent = thigh_r

    # Left Arm
    arm_l = edit_bones.new("Arm_L")
    arm_l.head = (0.8, 0, 3.6)
    arm_l.tail = (1.2, 0, 2.5)
    arm_l.parent = spine

    # Right Arm
    arm_r = edit_bones.new("Arm_R")
    arm_r.head = (-0.8, 0, 3.6)
    arm_r.tail = (-1.2, 0, 2.5)
    arm_r.parent = spine

    bpy.ops.object.mode_set(mode='OBJECT')

    # Add Mech Geometry Parts
    # Torso Chassis
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 3.2))
    torso = bpy.context.active_object
    torso.scale = (0.9, 0.7, 1.1)
    torso.data.materials.append(mat_metal)

    # Core Glowing Visor
    bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.15, location=(0, 0.4, 3.4))
    visor = bpy.context.active_object
    visor.rotation_euler = (math.radians(90), 0, 0)
    visor.data.materials.append(mat_glow)

    # Shoulder Cannons
    for x_side in [-1.1, 1.1]:
        bpy.ops.mesh.primitive_cylinder_add(radius=0.18, depth=1.6, location=(x_side, 0.1, 3.9))
        cannon = bpy.context.active_object
        cannon.rotation_euler = (math.radians(85), 0, 0)
        cannon.data.materials.append(mat_accent)

    # Keyframe Walk Cycle on Armature Pose Bones
    total_f = ${totalFrames}
    step_rate = 35 # frames per step cycle
    bpy.ops.object.mode_set(mode='POSE')
    pose_bones = amt_obj.pose.bones

    for frame in range(1, total_f + 1, 4):
        cycle_phase = (frame / step_rate) * (math.pi * 2)

        # Left Leg swing
        leg_l_angle = math.sin(cycle_phase) * 0.45
        pose_bones["Thigh_L"].rotation_mode = 'XYZ'
        pose_bones["Thigh_L"].rotation_euler = (leg_l_angle, 0, 0)
        pose_bones["Thigh_L"].keyframe_insert(data_path="rotation_euler", frame=frame)

        # Right Leg swing (opposite phase)
        leg_r_angle = -math.sin(cycle_phase) * 0.45
        pose_bones["Thigh_R"].rotation_mode = 'XYZ'
        pose_bones["Thigh_R"].rotation_euler = (leg_r_angle, 0, 0)
        pose_bones["Thigh_R"].keyframe_insert(data_path="rotation_euler", frame=frame)

        # Torso vertical bob
        pelvis_bob = math.sin(cycle_phase * 2) * 0.12
        pose_bones["Pelvis"].location = (0, 0, pelvis_bob)
        pose_bones["Pelvis"].keyframe_insert(data_path="location", frame=frame)

        # Arm counter-swings
        pose_bones["Arm_L"].rotation_mode = 'XYZ'
        pose_bones["Arm_L"].rotation_euler = (-leg_l_angle * 0.8, 0, 0)
        pose_bones["Arm_L"].keyframe_insert(data_path="rotation_euler", frame=frame)

        pose_bones["Arm_R"].rotation_mode = 'XYZ'
        pose_bones["Arm_R"].rotation_euler = (-leg_r_angle * 0.8, 0, 0)
        pose_bones["Arm_R"].keyframe_insert(data_path="rotation_euler", frame=frame)

    bpy.ops.object.mode_set(mode='OBJECT')
` : `
def build_procedural_scene(mat_glow, mat_accent, mat_metal):
    """Build 3D procedural geometries with keyframed rotations"""
    # Central Core
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=32, radius=2.0, location=(0, 0, 2.5))
    core = bpy.context.active_object
    core.name = "Anify_CentralCore"
    core.data.materials.append(mat_glow)

    # Orbiting Rings
    for i in range(4):
        r = 3.5 + i * 1.5
        bpy.ops.mesh.primitive_torus_add(major_radius=r, minor_radius=0.08, location=(0, 0, 2.5))
        ring = bpy.context.active_object
        ring.name = f"Anify_Ring_{i}"
        ring.data.materials.append(mat_accent if i % 2 == 1 else mat_glow)

        # Animate rotation
        for frame in range(1, ${totalFrames} + 1, 10):
            speed = (0.5 + i * 0.3) * (1 if i % 2 == 0 else -1)
            t = (frame / ${fps}) * speed
            ring.rotation_euler = (
                math.sin(t) * 0.4 + (i * 0.3),
                math.cos(t) * 0.4,
                t * 1.5
            )
            ring.keyframe_insert(data_path="rotation_euler", frame=frame)
`}

def main():
    print(">> Initializing Anify -> Blender Exporter Pipeline...")
    clear_existing_scene()
    setup_render_settings()
    mat_glow, mat_accent, mat_metal = create_materials()
    setup_camera_and_lights()
    ${isCharacter ? 'build_character_armature(mat_glow, mat_accent, mat_metal)' : 'build_procedural_scene(mat_glow, mat_accent, mat_metal)'}
    print(">> Successfully constructed '${project.title}' in Blender!")
    print(f">> Total Frames: {${totalFrames}} @ {${fps}} FPS. Ready for playback or rendering.")

if __name__ == "__main__":
    main()
`;
}
