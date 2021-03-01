#[cfg(bench)]
use crate::init::init_allocations;
use crate::screening_state::ScreeningState;
use crate::types::HeadLockConfidence::Stable;
use crate::types::{FaceInfo, HeatStats, Point, Quad, ThermalReference};
use crate::{
    detect_thermal_ref, extract_internal, extract_sensor_value_for_circle,
    get_extended_thermal_ref_rect, smooth_internal, temperature_c_for_raw_val, AnalysisResult,
    MEDIAN_SMOOTHED, RADIAL_SMOOTHED,
};
use safe_transmute::*;
use std::fs;
#[cfg(bench)]
use test::Bencher;

fn decode_frame(mut prev: Vec<f32>, mut next: Vec<f32>) -> Option<AnalysisResult> {
    // Do stuff
    smooth_internal(&mut next, &mut prev);

    let thermal_ref = detect_thermal_ref(None);
    if let Some(thermal_ref) = thermal_ref {
        let thermal_ref_rect = get_extended_thermal_ref_rect(thermal_ref.bounds(), 120, 160);
        let median_smoothed = next;
        let thermal_ref_raw =
            extract_sensor_value_for_circle(thermal_ref, &median_smoothed, 120).median;
        let calibrated_c = 36.7; // What did we calibrate the thermal reference as?
        let thermal_ref_c =
            temperature_c_for_raw_val(calibrated_c, thermal_ref_raw, thermal_ref_raw);
        assert_eq!(thermal_ref_c, 36.7);

        Some(extract_internal(
            16,
            thermal_ref_c,
            thermal_ref_raw,
            thermal_ref_rect,
            thermal_ref,
        ))
    } else {
        None
    }
}

#[bench]
fn run_pipeline(b: &mut Bencher) {
    init_allocations(120, 160);
    let frame_0 = &fs::read("frame_0").unwrap()[..];
    let frame_1 = &fs::read("frame_1").unwrap()[..];

    let frame_0 = transmute_many::<u16, SingleManyGuard>(frame_0).unwrap();
    let frame_1 = transmute_many::<u16, SingleManyGuard>(frame_1).unwrap();
    let mut frame_0: Vec<f32> = frame_0.iter().map(|x| *x as f32).collect();
    let frame_1: Vec<f32> = frame_1.iter().map(|x| *x as f32).collect();

    let prev_frame_radially_smoothed = RADIAL_SMOOTHED.with(|radial_smoothed| {
        let mut radial_smoothed_ref = radial_smoothed.borrow_mut();
        let radial_smoothed = radial_smoothed_ref.as_mut().unwrap();
        smooth_internal(&mut frame_0, radial_smoothed);
        radial_smoothed.clone()
    });

    b.iter(|| decode_frame(prev_frame_radially_smoothed.clone(), frame_1.clone()));
}

fn get_frames() -> (Vec<f32>, Vec<f32>) {
    let frame_0 = &fs::read("frame_0").unwrap()[..];
    let frame_1 = &fs::read("frame_1").unwrap()[..];

    let frame_0 = transmute_many::<u16, SingleManyGuard>(frame_0).unwrap();
    let frame_1 = transmute_many::<u16, SingleManyGuard>(frame_1).unwrap();
    let mut frame_0: Vec<f32> = frame_0.iter().map(|x| *x as f32).collect();
    let frame_1: Vec<f32> = frame_1.iter().map(|x| *x as f32).collect();

    let prev_frame_radially_smoothed = RADIAL_SMOOTHED.with(|radial_smoothed| {
        let mut radial_smoothed_ref = radial_smoothed.borrow_mut();
        let radial_smoothed = radial_smoothed_ref.as_mut().unwrap();
        smooth_internal(&mut frame_0, radial_smoothed);

        MEDIAN_SMOOTHED.with(|median_smoothed| {
            let mut median_smoothed_ref = median_smoothed.borrow_mut();
            let median_smoothed = median_smoothed_ref.as_mut().unwrap();
            median_smoothed.copy_from_slice(&frame_0);
        });

        radial_smoothed.clone()
    });
    let frame_1 = frame_1.clone();
    let prev = prev_frame_radially_smoothed.clone();
    (prev, frame_1)
}

#[test]
fn find_thermal_ref() {
    init_allocations(120, 160);
    let (mut prev, mut frame_1) = get_frames();
    smooth_internal(&mut frame_1, &mut prev);

    // Copy back radial_smoothed
    RADIAL_SMOOTHED.with(|radial_smoothed| {
        let mut radial_smoothed_ref = radial_smoothed.borrow_mut();
        let radial_smoothed = radial_smoothed_ref.as_mut().unwrap();
        radial_smoothed.copy_from_slice(&prev);
    });

    let thermal_ref = detect_thermal_ref(None);
    assert!(thermal_ref.is_some());
    if let Some(thermal_ref) = thermal_ref {
        let median_smoothed = frame_1;
        let thermal_ref_raw =
            extract_sensor_value_for_circle(thermal_ref, &median_smoothed, 120).median;
        let calibrated_c = 36.7; // What did we calibrate the thermal reference as?
        let thermal_ref_c =
            temperature_c_for_raw_val(calibrated_c, thermal_ref_raw, thermal_ref_raw);
        assert_eq!(thermal_ref_c, 36.7);
        assert_eq!(
            thermal_ref,
            Circle {
                center: Point::new(15, 91),
                radius: 6
            }
        );
    }
    // Try and find it again, using the previous as the starting point
    let thermal_ref = detect_thermal_ref(thermal_ref);
    assert!(thermal_ref.is_some());
    assert_eq!(
        thermal_ref.unwrap(),
        Circle {
            center: Point::new(15, 91),
            radius: 6
        }
    );
}

#[test]
fn find_face() {
    init_allocations(120, 160);
    let (mut prev, mut frame_1) = get_frames();
    smooth_internal(&mut frame_1, &mut prev);

    // Copy back radial_smoothed
    RADIAL_SMOOTHED.with(|radial_smoothed| {
        let mut radial_smoothed_ref = radial_smoothed.borrow_mut();
        let radial_smoothed = radial_smoothed_ref.as_mut().unwrap();
        radial_smoothed.copy_from_slice(&prev);
    });

    let thermal_ref = detect_thermal_ref(None);
    let motion_stats = if let Some(thermal_ref) = thermal_ref {
        let thermal_ref_rect = get_extended_thermal_ref_rect(thermal_ref.bounds(), 120, 160);
        let (thermal_ref_c, thermal_ref_raw) = MEDIAN_SMOOTHED.with(|median_smoothed| {
            let median_smoothed_ref = median_smoothed.borrow();
            let median_smoothed = median_smoothed_ref.as_ref().unwrap();
            let thermal_ref_raw =
                extract_sensor_value_for_circle(thermal_ref, &median_smoothed, 120).median;
            let calibrated_c = 38.7; // What did we calibrate the thermal reference as?
            let thermal_ref_c =
                temperature_c_for_raw_val(calibrated_c, thermal_ref_raw, thermal_ref_raw);
            assert_eq!(thermal_ref_c, 38.7);
            (thermal_ref_c, thermal_ref_raw)
        });

        assert_ne!(thermal_ref_raw, 0.0);
        Some(extract_internal(
            16,
            thermal_ref_c,
            thermal_ref_raw,
            thermal_ref_rect,
            thermal_ref,
        ))
    } else {
        None
    };
    assert!(motion_stats.is_some());
    println!("{:?}", motion_stats);
    assert_eq!(
        motion_stats.unwrap(),
        AnalysisResult {
            motion_sum: 4793,
            motion_threshold_sum: 4002,
            threshold_sum: 6713,
            frame_bottom_sum: 6259,
            has_body: false,
            heat_stats: HeatStats {
                min: 29318,
                max: 30461,
                threshold: 29532.313
            },
            face: FaceInfo {
                is_valid: true,
                halfway_ratio: 0.0,
                head_lock: Stable,
                head: Quad {
                    top_left: Point {
                        x: 45.001373,
                        y: 51.075718
                    },
                    top_right: Point {
                        x: 79.000916,
                        y: 50.04543
                    },
                    bottom_left: Point {
                        x: 46.000916,
                        y: 84.06058
                    },
                    bottom_right: Point {
                        x: 80.00046,
                        y: 83.03029
                    }
                },
                sample_point: Point { x: 63.0, y: 64.0 },
                sample_value: 30225.0,
                sample_temp: 0.0
            },
            next_state: ScreeningState::Ready,
            thermal_ref: ThermalReference::default()
        }
    )
}
