import { RawPoint } from "@/geom";

const DBScan = ({
  dataset,
  epsilon,
  epsilonCompare,
  minimumPoints,
  distanceFunction
}: {
  dataset: RawPoint[];
  epsilon: number;
  epsilonCompare: (a: any, b: any) => boolean;
  minimumPoints: number;
  distanceFunction: (a: any, b: any) => number;
}): { clusters: number[][]; noise: number[] } => {
  epsilon = epsilon || 1; // aka maxDistance
  epsilonCompare =
    epsilonCompare || ((dist: number, e: number): boolean => dist < e);
  minimumPoints = minimumPoints || 2;
  distanceFunction =
    distanceFunction || ((a: number, b: number): number => Math.abs(a - b));

  const visitedIndices: Record<number, boolean> = {};
  const isVisited = (i: number): boolean => visitedIndices[i],
    markVisited = (i: number) => {
      visitedIndices[i] = true;
    };

  const clusteredIndices: Record<number, boolean> = {};
  const isClustered = (i: number): boolean => clusteredIndices[i],
    markClustered = (i: number) => {
      clusteredIndices[i] = true;
    };

  const uniqueMerge = (targetArray: number[], sourceArray: number[]) => {
    for (let i = 0; i < sourceArray.length; i += 1) {
      const item = sourceArray[i];
      if (targetArray.indexOf(item) < 0) {
        targetArray.push(item);
      }
    }
  };

  const findNeighbors = (index: number): number[] => {
    const neighbors = [];
    for (let other = 0; other < dataset.length; other += 1) {
      const distance = distanceFunction(dataset[index], dataset[other]);
      if (epsilonCompare(distance, epsilon)) {
        neighbors.push(other);
      }
    }
    return neighbors;
  };

  const noise: number[] = [],
    addNoise = (i: number) => noise.push(i);

  const clusters: number[][] = [],
    createCluster = () => clusters.push([]) - 1,
    addIndexToCluster = (c: number, i: number) => {
      clusters[c].push(i);
      markClustered(i);
    };

  const expandCluster = (c: number, neighbors: number[]) => {
    for (let i = 0; i < neighbors.length; i += 1) {
      const neighborIndex = neighbors[i];
      if (!isVisited(neighborIndex)) {
        markVisited(neighborIndex);

        const secondaryNeighbors = findNeighbors(neighborIndex);
        if (secondaryNeighbors.length >= minimumPoints) {
          uniqueMerge(neighbors, secondaryNeighbors);
        }
      }

      if (!isClustered(neighborIndex)) {
        addIndexToCluster(c, neighborIndex);
      }
    }
  };

  dataset.forEach((unused: number[], index: number) => {
    if (!isVisited(index)) {
      markVisited(index);

      const neighbors: number[] = findNeighbors(index);
      if (neighbors.length < minimumPoints) {
        noise.push(index);
      } else {
        const clusterIndex = createCluster();
        addIndexToCluster(clusterIndex, index);
        expandCluster(clusterIndex, neighbors);
      }
    }
  });

  return { clusters, noise };
};
export default DBScan;
