import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import chai from 'chai';

let expect = chai.expect;

describe('', () => {
  describe('', () => {
    let point = new Feature({
      geometry: new Point([1,1])
    })
    it('', () => {
      expect(point.getGeometry().getClosestPoint()[0]).to.be.equal
    })
  })
})