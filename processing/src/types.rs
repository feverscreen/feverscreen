use crate::screening_state::ScreeningState;
use geo_types::MultiPoint;
#[allow(unused)]
use log::{info, trace, warn};
use std::collections::VecDeque;
use std::hash::{Hash, Hasher};
use std::ops::{Add, Sub};
use wasm_bindgen::__rt::core::ops::Range;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub struct HeatStats {
    pub min: u16,
    pub max: u16,
    pub threshold: u16,
}

#[derive(PartialEq, Eq, Hash, Debug, Copy, Clone)]
pub struct Rect {
    pub x0: usize,
    pub x1: usize,
    pub y0: usize,
    pub y1: usize,
}

impl Rect {
    pub fn new(x: usize, y: usize, width: usize, height: usize) -> Rect {
        Rect {
            x0: x,
            y0: y,
            x1: x + width,
            y1: y + height,
        }
    }

    pub fn width(&self) -> usize {
        self.x1 - self.x0
    }

    pub fn height(&self) -> usize {
        self.y1 - self.y0
    }

    pub fn area(&self) -> usize {
        (self.x1 - self.x0) * (self.y1 - self.y0)
    }

    pub fn top_left(&self) -> Point {
        Point::new(self.x0, self.y0)
    }
    pub fn bottom_left(&self) -> Point {
        Point::new(self.x0, self.y1)
    }
    pub fn bottom_right(&self) -> Point {
        Point::new(self.x1, self.y1)
    }
    pub fn top_right(&self) -> Point {
        Point::new(self.x1, self.y0)
    }

    pub fn centroid(&self) -> Point {
        Point {
            x: self.x0 as f32 + (self.width() as f32 / 2.0),
            y: self.y0 as f32 + (self.height() as f32 / 2.0),
        }
    }

    pub fn contains(&self, p: Point) -> bool {
        let x = p.x as usize;
        let y = p.y as usize;
        !(x < self.x0 || y < self.y0 || x > self.x0 || y > self.y1)
    }

    pub fn distance_to(&self, other: &Rect) -> f32 {
        let mut least_d = f32::MAX;
        let self_p = [
            self.top_left(),
            self.top_right(),
            self.bottom_left(),
            self.bottom_right(),
        ];
        let other_p = [
            other.top_left(),
            other.top_right(),
            other.bottom_left(),
            other.bottom_right(),
        ];
        for p in &self_p {
            for pp in &other_p {
                least_d = f32::min(least_d, p.distance_sq_to(*pp));
            }
        }
        let least_corner = f32::sqrt(least_d);

        least_corner
    }
}

impl Default for Rect {
    fn default() -> Self {
        Rect::new(0, 0, 0, 0)
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub enum HeadLockConfidence {
    Bad = 0,
    Partial = 1,
    Stable = 2,
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub struct Quad {
    #[wasm_bindgen(js_name=topLeft)]
    pub top_left: Point,
    #[wasm_bindgen(js_name=topRight)]
    pub top_right: Point,
    #[wasm_bindgen(js_name=bottomLeft)]
    pub bottom_left: Point,
    #[wasm_bindgen(js_name=bottomRight)]
    pub bottom_right: Point,
}

impl Default for Quad {
    fn default() -> Self {
        Quad {
            top_left: Default::default(),
            top_right: Default::default(),
            bottom_left: Default::default(),
            bottom_right: Default::default(),
        }
    }
}

impl Quad {
    pub fn aa_bounds(&self) -> Rect {
        Rect {
            x0: f32::floor(f32::min(self.top_left.x, self.bottom_left.x)) as usize,
            x1: f32::ceil(f32::max(self.top_right.x, self.bottom_right.x)) as usize,
            y0: f32::floor(f32::min(self.top_left.y, self.top_right.y)) as usize,
            y1: f32::ceil(f32::max(self.bottom_left.y, self.bottom_right.y)) as usize,
        }
    }

    pub fn area(&self) -> f32 {
        let a = self.top_left.distance_to(self.top_right);
        let b = self.bottom_left.distance_to(self.bottom_right);
        //info!("W {}, H {}", a, b);
        a * b
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub enum InvalidReason {
    Unknown,
    Valid,
    TooMuchTilt,
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub struct FaceInfo {
    #[wasm_bindgen(js_name=isValid)]
    pub is_valid: bool,
    #[wasm_bindgen(js_name=halfwayRatio)]
    pub halfway_ratio: f32,
    #[wasm_bindgen(js_name=headLock)]
    pub head_lock: HeadLockConfidence,
    pub head: Quad,
    #[wasm_bindgen(js_name=samplePoint)]
    pub sample_point: Point,
    #[wasm_bindgen(js_name=sampleValue)]
    pub sample_value: f32,
    #[wasm_bindgen(js_name=sampleTemp)]
    pub sample_temp: f32,
    pub reason: InvalidReason,
}

impl Default for FaceInfo {
    fn default() -> Self {
        FaceInfo {
            is_valid: false,
            halfway_ratio: 0.0,
            head_lock: HeadLockConfidence::Bad,
            head: Default::default(),
            sample_point: Default::default(),
            sample_value: 0.0,
            sample_temp: 0.0,
            reason: InvalidReason::Unknown,
        }
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub struct Point {
    pub x: f32,
    pub y: f32,
}

impl Into<MultiPoint<f32>> for Point {
    fn into(self) -> MultiPoint<f32> {
        self.as_tuple().into()
    }
}

impl Point {
    pub fn new_from_u8(x: u8, y: u8) -> Point {
        Point {
            x: x as f32,
            y: y as f32,
        }
    }

    pub fn new(x: usize, y: usize) -> Point {
        Point {
            x: x as f32,
            y: y as f32,
        }
    }

    #[inline]
    pub fn cross(&self, other: Point) -> f32 {
        self.x * other.y - self.y * other.x
    }

    pub fn distance_sq_to(&self, other: Point) -> f32 {
        let dx: f32 = self.x as f32 - other.x as f32;
        let dy: f32 = self.y as f32 - other.y as f32;
        dx * dx + dy * dy
    }

    pub fn as_raw(&self) -> Vec<f32> {
        vec![self.x, self.y]
    }

    pub fn from_raw(raw: &[f32]) -> Point {
        assert_eq!(raw.len(), 2);
        unsafe {
            Point {
                x: *raw.get_unchecked(0),
                y: *raw.get_unchecked(1),
            }
        }
    }

    pub fn from_tuple(raw: (f32, f32)) -> Point {
        Point { x: raw.0, y: raw.1 }
    }

    pub fn as_tuple(&self) -> (f32, f32) {
        (self.x, self.y)
    }

    pub fn is_left_of_segment(&self, segment: LineSegment) -> bool {
        let det = (segment.end.x - segment.start.x) * (self.y - segment.start.y)
            - (segment.end.y - segment.start.y) * (self.x - segment.start.x);
        det < 0.0
    }

    pub fn magnitude(&self) -> f32 {
        f32::sqrt(self.x * self.x + self.y * self.y)
    }

    pub fn norm(&self) -> Point {
        self.scale(1.0 / self.magnitude())
    }

    pub fn distance_to(&self, other: Point) -> f32 {
        f32::sqrt(self.distance_sq_to(other))
    }

    pub fn scale(&self, scalar: f32) -> Point {
        Point {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    pub fn perp(&self) -> Point {
        Point {
            x: self.y,
            y: -self.x,
        }
    }
}

impl Sub for Point {
    type Output = Point;

    fn sub(self, rhs: Self) -> Self::Output {
        Point {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}

impl Add for Point {
    type Output = Point;

    fn add(self, rhs: Self) -> Self::Output {
        Point {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
}

impl Default for Point {
    fn default() -> Self {
        Point { x: 0.0, y: 0.0 }
    }
}

#[derive(Debug, Copy, Clone)]
pub struct LineSegment {
    pub start: Point,
    pub end: Point,
}

impl LineSegment {
    pub fn norm(&self) -> Point {
        (self.end - self.start).norm()
    }

    pub fn len(&self) -> f32 {
        self.start.distance_to(self.end)
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub struct ThermalReference {
    pub geom: Circle,
    pub val: u16,
    pub temp: f32,
}

impl Default for ThermalReference {
    fn default() -> Self {
        ThermalReference {
            geom: Circle {
                center: Point::new(0, 0),
                radius: 0.0,
            },
            val: 0,
            temp: 0.0,
        }
    }
}

#[wasm_bindgen]
#[derive(Copy, Clone, Debug, PartialEq)]
pub struct AnalysisResult {
    #[wasm_bindgen(js_name=motionSum)]
    pub motion_sum: u16,
    #[wasm_bindgen(js_name=motionThresholdSum)]
    pub motion_threshold_sum: u16,
    #[wasm_bindgen(js_name=thresholdSum)]
    pub threshold_sum: u16,
    #[wasm_bindgen(js_name=frameBottomSum)]
    pub frame_bottom_sum: u16,
    #[wasm_bindgen(js_name=hasBody)]
    pub has_body: bool,
    #[wasm_bindgen(js_name=heatStats)]
    pub heat_stats: HeatStats,
    pub face: FaceInfo,
    #[wasm_bindgen(js_name=nextState)]
    pub next_state: ScreeningState,
    #[wasm_bindgen(js_name=thermalReference)]
    pub thermal_ref: ThermalReference,
}

impl Default for AnalysisResult {
    fn default() -> Self {
        AnalysisResult {
            motion_sum: 0,
            motion_threshold_sum: 0,
            threshold_sum: 0,
            frame_bottom_sum: 0,
            has_body: false,
            heat_stats: HeatStats {
                min: 0,
                max: 0,
                threshold: 0,
            },
            face: Default::default(),
            next_state: ScreeningState::Ready,
            thermal_ref: ThermalReference::default(),
        }
    }
}

#[derive(Clone, Debug)]
pub struct SolidShape {
    pub inner: Vec<Span>,
}

impl SolidShape {
    pub fn new() -> SolidShape {
        SolidShape { inner: Vec::new() }
    }

    pub fn from_vec(v: Vec<Span>) -> SolidShape {
        SolidShape { inner: v }
    }

    pub fn area(&self) -> u32 {
        let mut a = 0;
        for span in &self.inner {
            a += span.area() as u32;
        }
        a
    }
    pub fn add_span(&mut self, span: Span) {
        self.inner.push(span);
    }
    pub fn len(&self) -> usize {
        self.inner.len()
    }

    #[allow(unused)]
    pub fn bounds(&self) -> Rect {
        let mut min_y = u8::MAX;
        let mut max_y = 0;
        let mut min_x = u8::MAX;
        let mut max_x = 0;
        for span in self.inner.iter() {
            min_y = u8::min(span.y, min_y);
            max_y = u8::max(span.y, max_y);
            min_x = u8::min(span.x0, min_x);
            max_x = u8::max(span.x1, max_x);
        }
        Rect {
            x0: min_x as usize,
            x1: max_x as usize,
            y0: min_y as usize,
            y1: max_y as usize,
        }
    }

    pub fn merge_with(&mut self, other: SolidShape) {
        for span in other.inner {
            self.add_span(span);
        }
        self.resort();
    }

    pub fn resort(&mut self) {
        self.inner.sort_by(|a, b| a.y.cmp(&b.y));
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Span {
    pub x0: u8,
    pub x1: u8,
    pub y: u8,
}

impl Span {
    pub fn new() -> Span {
        Span { x0: 0, x1: 0, y: 0 }
    }

    pub fn area(&self) -> u8 {
        self.x1 - self.x0
    }

    pub fn overlaps_span(&self, span: &Span) -> bool {
        !(span.x1 < self.x0 || span.x0 >= self.x1)
    }

    pub fn overlapping_range(&self, other: &Span) -> Option<Range<u8>> {
        if self.overlaps_span(other) {
            Some(u8::max(self.x0, other.x0)..u8::min(self.x1, other.x1))
        } else {
            None
        }
    }

    pub fn width(&self) -> u8 {
        self.area()
    }

    pub fn start(&self) -> Point {
        Point {
            x: self.x0 as f32,
            y: self.y as f32,
        }
    }

    pub fn contains(&self, x: u8) -> bool {
        x >= self.x0 && x < self.x1
    }

    pub fn end(&self) -> Point {
        Point {
            x: self.x1 as f32,
            y: self.y as f32,
        }
    }

    pub fn overlaps_shape(&self, shape: &RawShape) -> bool {
        if self.y > 0 && self.y < 159 {
            if let Some(upper_spans) = &shape.inner[(self.y - 1) as usize] {
                //info!("check upper");
                for span in upper_spans {
                    if self.overlaps_span(span) {
                        return true;
                    }
                }
            }
            if let Some(lower_spans) = &shape.inner[(self.y + 1) as usize] {
                //info!("check lower");
                for span in lower_spans {
                    if self.overlaps_span(span) {
                        return true;
                    }
                }
            }
        }
        false
    }

    pub fn assign_to_shape(self, shapes: &mut VecDeque<RawShape>) {
        let mut n = shapes.len();
        let mut assigned_span = false;
        let mut assigned_shape = None;
        while n > 0 {
            if let Some(mut shape) = shapes.pop_front() {
                if self.overlaps_shape(&shape) {
                    if !assigned_span {
                        assigned_span = true;
                        if shape.inner[self.y as usize].is_none() {
                            shape.inner[self.y as usize] = Some(Vec::with_capacity(4));
                        }
                        let width = self.width();
                        if let Some(row) = &mut shape.inner[self.y as usize] {
                            row.push(self);
                        }
                        shape.area += width as u16;
                        assigned_shape = Some(shape);
                    } else {
                        // Span is already assigned to a shape, so merge any other shapes that the span overlaps with that.
                        if let Some(assigned_shape) = &mut assigned_shape {
                            //info!("merging shapes");
                            assigned_shape.merge_with(shape);
                        }
                    }
                } else {
                    shapes.push_back(shape);
                }
            }
            n -= 1;
        }
        if let Some(assigned_shape) = assigned_shape.take() {
            //("pushing back assigned shape");
            shapes.push_back(assigned_shape);
        } else if !assigned_span {
            //info!("adding new shape");
            let mut new_shape = RawShape::new();
            new_shape.add_span(self);
            shapes.push_back(new_shape);
        }
    }
}

#[derive(Debug)]
pub struct RawShape {
    pub inner: Vec<Option<Vec<Span>>>, //HashMap<u8, Vec<Span>>,
    area: u16,
}

impl RawShape {
    pub fn new() -> RawShape {
        RawShape {
            area: 0,
            inner: vec![None; 160],
        }
    }

    pub fn add_span(&mut self, span: Span) {
        self.area += span.width() as u16;
        self.inner[span.y as usize] = Some(vec![span]);
    }

    pub fn point_cloud(&self) -> Vec<Point> {
        // TODO(jon): Could optimise as an iterator, don't allocate
        self.inner
            .iter()
            .filter(|x| x.is_some())
            .flat_map(|x| {
                let row = x.as_ref().unwrap();
                let first = row.first().unwrap();
                let last = row.last().unwrap();
                vec![
                    Point::new(first.x0 as usize, first.y as usize),
                    Point::new(last.x1 as usize - 1, last.y as usize),
                ]
            })
            .collect::<Vec<_>>()
    }

    pub fn centroid(&self) -> Point {
        let point_cloud = self.point_cloud();
        let total = point_cloud
            .iter()
            .fold(Point::new(0, 0), |acc, &point| acc + point);
        Point {
            x: total.x / point_cloud.len() as f32,
            y: total.y / point_cloud.len() as f32,
        }
    }

    pub fn add_or_extend_span(&mut self, span: Span) {
        self.area += span.width() as u16;
        let y = span.y as usize;
        if self.inner[y].is_none() {
            self.inner[y] = Some(Vec::new());
        }
        let spans = self.inner[y].as_mut().unwrap();
        match spans.first_mut() {
            Some(mut existing_span) => {
                existing_span.x0 = u8::min(span.x0, existing_span.x0);
                existing_span.x1 = u8::max(span.x1, existing_span.x1);
            }
            None => spans.push(span),
        }
    }

    pub fn merge_with(&mut self, mut shape: RawShape) {
        for row in &mut shape.inner {
            if let Some(row) = row {
                if self.inner[row[0].y as usize].is_none() {
                    self.inner[row[0].y as usize] = Some(Vec::new());
                }
                if let Some(s) = &mut self.inner[row[0].y as usize] {
                    while row.len() != 0 {
                        let span = row.pop().unwrap();
                        self.area += span.width() as u16;
                        s.push(span);
                    }
                }
            }
        }
    }

    pub fn overlaps_shape(&self, other: &RawShape) -> bool {
        for (y, row_a) in self.inner.iter().enumerate() {
            if let Some(row_a) = row_a {
                if let Some(row_b) = &other.inner[y] {
                    for span_b in row_b {
                        for span_a in row_a {
                            if !(span_a.x1 < span_b.x0 || span_a.x0 >= span_b.x1) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        false
    }

    pub fn outline_points(&self) -> Vec<Point> {
        // TODO(jon): This can return an iterator over the points and maybe save the allocation?
        let points = self
            .inner
            .windows(3)
            .enumerate()
            .flat_map(|(index, rows)| {
                // TODO(jon): Can we do this more lazily?

                let prev = &rows[0];
                let curr = &rows[1];
                let next = &rows[2];
                let mut points = Vec::new();
                if let Some(curr) = curr {
                    for &span in curr {
                        points.push(Point::new(span.x0 as usize, span.y as usize));
                        for x in span.x0 + 1..span.x1 - 1 {
                            if index == 0
                                || index == self.inner.len() - 1
                                || !prev
                                    .as_ref()
                                    .unwrap_or(&Vec::new())
                                    .iter()
                                    .flat_map(|upper_span| upper_span.overlapping_range(&span))
                                    .any(|overlap| overlap.contains(&x))
                                || !next
                                    .as_ref()
                                    .unwrap_or(&Vec::new())
                                    .iter()
                                    .flat_map(|lower_span| lower_span.overlapping_range(&span))
                                    .any(|overlap| overlap.contains(&x))
                            {
                                points.push(Point::new(x as usize, span.y as usize));
                            }
                        }
                        points.push(Point::new(span.x1 as usize, span.y as usize));
                    }
                }
                points
            })
            .collect();
        points
    }

    pub fn area(&self) -> u16 {
        self.area
        // self.inner
        //     .iter()
        //     .filter(|x| x.is_some())
        //     .fold(0, |acc, spans| {
        //         if let Some(spans) = spans {
        //             acc + spans.iter().fold(0, |acc, span| acc + span.area() as u32)
        //         } else {
        //             acc
        //         }
        //     })
    }

    pub fn bounds(&self) -> Rect {
        let mut min_y = u8::MAX;
        let mut max_y = 0;
        let mut min_x = u8::MAX;
        let mut max_x = 0;
        for row in self.inner.iter() {
            if let Some(row) = row {
                for span in row {
                    min_y = u8::min(span.y, min_y);
                    max_y = u8::max(span.y + 1, max_y);
                    min_x = u8::min(span.x0, min_x);
                    max_x = u8::max(span.x1, max_x);
                }
            }
        }
        Rect {
            x0: min_x as usize,
            x1: max_x as usize,
            y0: min_y as usize,
            y1: max_y as usize,
        }
    }
}

impl PartialEq for RawShape {
    fn eq(&self, other: &Self) -> bool {
        self.bounds() == other.bounds() && self.area() == other.area()
    }
}
impl Eq for RawShape {}

impl Hash for RawShape {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.area().hash(state);
        self.bounds().hash(state);
    }
}

#[wasm_bindgen]
#[derive(Debug, Copy, Clone, PartialEq)]
pub struct Circle {
    pub center: Point,
    pub radius: f32,
}
//
// #[wasm_bindgen]
impl Circle {
    pub fn r(&self) -> f32 {
        self.radius
    }

    pub fn c(&self) -> Point {
        self.center
    }

    pub fn bounds(&self) -> Rect {
        let r = f32::ceil(self.radius) as usize;
        Rect {
            x0: self.center.x as usize - r,
            x1: self.center.x as usize + r,
            y0: self.center.y as usize - r,
            y1: self.center.y as usize + r,
        }
    }

    pub fn contains_point(&self, p: Point) -> bool {
        self.center.distance_to(p) <= self.radius as f32
    }
}

#[derive(Debug)]
pub struct ThermalRefStats {
    pub p: Point,
    pub mean: f32,
    pub median: f32,
    pub min: f32,
    pub max: f32,
    pub count: usize,
}
