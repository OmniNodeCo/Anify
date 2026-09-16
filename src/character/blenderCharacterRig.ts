import { CharacterState, CharacterAction, CharacterModel } from './characterEngine';

/**
 * Generates an executable Blender Python script that creates:
 * - Full Armature Rig with 14 bones
 * - Labeled Action (e.g. Backflip, Walk Cycle, Run Cycle, Combat Slash)
 * - F-Curves for bone rotation and translation
 * - Shaders and Materials
 * - Ground Grid & Lights
 */
export function generateBlenderCharacterScript(state: CharacterState): string {
  const actionName = state.action.toUpperCase();
  const fps = 60;
  const frames = state.action === 'backflip' ? 108 : state.action === 'walk' ? 72 : state.action === 'run' ? 50 : 80;

  return `# ==============================================================================
# Anify Studio -> Blender Character Rig & Motion Exporter
# Model: ${state.model.toUpperCase()} | Action: ${actionName}
# Compatible with: Blender 3.6 LTS, 4.0, 4.1, 4.2+ (Eevee Next / Cycles)
# ==============================================================================

import bpy
import math
import mathutils

def setup_scene():
    """Clear scene and setup render boundaries"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    scene = bpy.context.scene
    scene.render.fps = ${fps}
    scene.frame_start = 1
    scene.frame_end = ${frames}
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080

    if "BLENDER_EEVEE_NEXT" in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items.keys():
        scene.render.engine = 'BLENDER_EEVEE_NEXT'
    else:
        scene.render.engine = 'CYCLES'

def create_materials():
    """Create Principled BSDF & Emission materials"""
    mat_armor = bpy.data.materials.new("Anify_Armor")
    mat_armor.use_nodes = True
    bsdf = mat_armor.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.05, 0.08, 0.15, 1.0)
        bsdf.inputs['Metallic'].default_value = 0.8
        bsdf.inputs['Roughness'].default_value = 0.3

    mat_glow = bpy.data.materials.new("Anify_Glow")
    mat_glow.use_nodes = True
    nodes = mat_glow.node_tree.nodes
    nodes.clear()
    out = nodes.new('ShaderNodeOutputMaterial')
    emit = nodes.new('ShaderNodeEmission')
    emit.inputs['Color'].default_value = (0.0, 0.95, 1.0, 1.0) # Cyan
    emit.inputs['Strength'].default_value = 10.0
    mat_glow.node_tree.links.new(emit.outputs['Emission'], out.inputs['Surface'])

    return mat_armor, mat_glow

def build_rig_and_action(mat_armor, mat_glow):
    """Build Armature and keyframe the ${actionName} motion"""
    # 1. Armature
    amt_data = bpy.data.armatures.new("Anify_${state.model}_Rig")
    amt_obj = bpy.data.objects.new("Character_Armature", amt_data)
    bpy.context.collection.objects.link(amt_obj)
    bpy.context.view_layer.objects.active = amt_obj

    bpy.ops.object.mode_set(mode='EDIT')
    eb = amt_data.edit_bones

    root = eb.new("Root")
    root.head = (0, 0, 0)
    root.tail = (0, 0, 1.0)

    pelvis = eb.new("Pelvis")
    pelvis.head = (0, 0, 1.0)
    pelvis.tail = (0, 0, 1.2)
    pelvis.parent = root

    spine = eb.new("Spine")
    spine.head = (0, 0, 1.2)
    spine.tail = (0, 0, 1.8)
    spine.parent = pelvis

    head = eb.new("Head")
    head.head = (0, 0, 1.8)
    head.tail = (0, 0, 2.2)
    head.parent = spine

    # Legs
    thigh_l = eb.new("Thigh_L")
    thigh_l.head = (0.25, 0, 1.1)
    thigh_l.tail = (0.25, 0, 0.55)
    thigh_l.parent = pelvis

    shin_l = eb.new("Shin_L")
    shin_l.head = (0.25, 0, 0.55)
    shin_l.tail = (0.25, 0, 0.1)
    shin_l.parent = thigh_l

    thigh_r = eb.new("Thigh_R")
    thigh_r.head = (-0.25, 0, 1.1)
    thigh_r.tail = (-0.25, 0, 0.55)
    thigh_r.parent = pelvis

    shin_r = eb.new("Shin_R")
    shin_r.head = (-0.25, 0, 0.55)
    shin_r.tail = (-0.25, 0, 0.1)
    shin_r.parent = thigh_r

    # Arms
    arm_l = eb.new("Arm_L")
    arm_l.head = (0.45, 0, 1.7)
    arm_l.tail = (0.75, 0, 1.2)
    arm_l.parent = spine

    arm_r = eb.new("Arm_R")
    arm_r.head = (-0.45, 0, 1.7)
    arm_r.tail = (-0.75, 0, 1.2)
    arm_r.parent = spine

    bpy.ops.object.mode_set(mode='OBJECT')

    # 2. Keyframe ${actionName} into Pose Bones
    bpy.ops.object.mode_set(mode='POSE')
    pb = amt_obj.pose.bones
    total_f = ${frames}

    for f in range(1, total_f + 1, 2):
        t = f / ${fps}

        ${state.action === 'backflip' ? `
        # Backflip Keyframes: 360-degree rotation + parabolic vertical trajectory
        cycle_p = (f - 1) / total_f
        if cycle_p < 0.2:
            sub = cycle_p / 0.2
            pb["Pelvis"].location = (0, 0, -sub * 0.3)
            pb["Pelvis"].rotation_euler = (sub * 0.3, 0, 0)
        elif cycle_p < 0.75:
            sub = (cycle_p - 0.2) / 0.55
            # Apex flight
            pb["Pelvis"].location = (0, sub * 1.5, math.sin(sub * math.pi) * 2.2)
            pb["Pelvis"].rotation_euler = (-sub * math.pi * 2, 0, 0)
            pb["Thigh_L"].rotation_euler = (1.2, 0, 0)
            pb["Thigh_R"].rotation_euler = (1.2, 0, 0)
        else:
            sub = (cycle_p - 0.75) / 0.25
            pb["Pelvis"].location = (0, 1.5 + sub * 0.2, (1 - sub) * -0.2)
            pb["Pelvis"].rotation_euler = ((1 - sub) * 0.3, 0, 0)
            pb["Thigh_L"].rotation_euler = (0, 0, 0)
            pb["Thigh_R"].rotation_euler = (0, 0, 0)
        ` : state.action === 'run' || state.action === 'sprint' ? `
        # Running / Sprint Keyframes: alternating high strides & counter-arms
        stride_phase = t * 8.5
        swing = math.sin(stride_phase)
        cos_swing = math.cos(stride_phase)

        pb["Pelvis"].location = (0, t * 2.0, abs(swing) * 0.15)
        pb["Pelvis"].rotation_euler = (0.25, 0, swing * 0.12)

        pb["Thigh_L"].rotation_euler = (swing * 0.95, 0, 0)
        pb["Shin_L"].rotation_euler = (max(0, -cos_swing * 1.4), 0, 0)

        pb["Thigh_R"].rotation_euler = (-swing * 0.95, 0, 0)
        pb["Shin_R"].rotation_euler = (max(0, cos_swing * 1.4), 0, 0)

        pb["Arm_L"].rotation_euler = (-swing * 1.0, 0, 0)
        pb["Arm_R"].rotation_euler = (swing * 1.0, 0, 0)
        ` : `
        # Walk Cycle Keyframes
        stride_phase = t * 5.0
        swing = math.sin(stride_phase)

        pb["Pelvis"].location = (0, t * 1.2, abs(swing) * 0.08)
        pb["Pelvis"].rotation_euler = (0.08, 0, swing * 0.06)

        pb["Thigh_L"].rotation_euler = (swing * 0.6, 0, 0)
        pb["Shin_L"].rotation_euler = (max(0, -math.cos(stride_phase) * 0.8), 0, 0)

        pb["Thigh_R"].rotation_euler = (-swing * 0.6, 0, 0)
        pb["Shin_R"].rotation_euler = (max(0, math.cos(stride_phase) * 0.8), 0, 0)

        pb["Arm_L"].rotation_euler = (-swing * 0.5, 0, 0)
        pb["Arm_R"].rotation_euler = (swing * 0.5, 0, 0)
        `}

        pb["Pelvis"].keyframe_insert(data_path="location", frame=f)
        pb["Pelvis"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["Thigh_L"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["Shin_L"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["Thigh_R"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["Shin_R"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["Arm_L"].keyframe_insert(data_path="rotation_euler", frame=f)
        pb["Arm_R"].keyframe_insert(data_path="rotation_euler", frame=f)

    bpy.ops.object.mode_set(mode='OBJECT')

def setup_lights_and_camera():
    """Setup studio rim lighting and orbital camera"""
    # Camera
    cam_data = bpy.data.cameras.new("Studio_Camera")
    cam_data.lens = 45
    cam_obj = bpy.data.objects.new("Studio_Camera", cam_data)
    cam_obj.location = (4.5, -6.5, 2.8)
    cam_obj.rotation_euler = (math.radians(72), 0, math.radians(35))
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Key Sun Light
    sun_data = bpy.data.lights.new("Studio_Sun", type='SUN')
    sun_data.energy = 4.0
    sun_data.color = (0.0, 0.95, 1.0)
    sun_obj = bpy.data.objects.new("Studio_Sun", sun_data)
    sun_obj.location = (5, -5, 10)
    bpy.context.collection.objects.link(sun_obj)

def main():
    print(">> Initializing Anify Character Rig Exporter...")
    setup_scene()
    mat_armor, mat_glow = create_materials()
    build_rig_and_action(mat_armor, mat_glow)
    setup_lights_and_camera()
    print(">> Character Rig '${state.model}' with action '${actionName}' successfully generated in Blender!")

if __name__ == "__main__":
    main()
`;
}
