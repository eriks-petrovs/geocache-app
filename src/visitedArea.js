import * as turf from '@turf/turf';

export class VisitedArea {
  constructor() {
    this.edgePoints = [];
    this._LATITUDE_CORRECTION = 1 / Math.cos(Math.PI / 180);
  }

  _getCircleEdgePoints(center, radius, numPoints) {
    const edgePoints = [];
    const angleStep = (2 * Math.PI) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const latitude = center.lat + radius * Math.cos(angle) * this._LATITUDE_CORRECTION;
      const longitude = center.lng + radius * Math.sin(angle);
      edgePoints.push(new google.maps.LatLng(latitude, longitude));
    }

    return edgePoints;
  }

  updateEdgePoints(center, radius) {
    const newCircleEdgePoints = this._getCircleEdgePoints(center, radius, 64);
  
    if (this.edgePoints.length === 0) {
      this.edgePoints = newCircleEdgePoints;
    } else {
      const allPoints = [...this.edgePoints, ...newCircleEdgePoints];
      const pointCollection = turf.points(allPoints.map(point => [point.lng(), point.lat()]));
      const convexHull = turf.convex(pointCollection);
  
      // Get the coordinates of the new area and remove the first element which is the same as the last element
      const newEdgePoints = convexHull.geometry.coordinates[0].slice(0, -1);
      this.edgePoints = newEdgePoints.map((point) => new google.maps.LatLng(point[1], point[0]));
    }
  }
  

  getEdgePoints() {
    return this.edgePoints;
  }
}