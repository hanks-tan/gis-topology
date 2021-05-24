import assert from 'assert'
import Feature from 'ol/Feature.js'
import Point from 'ol/geom/Point.js'
import olt from '../../lib/ol/index.js'

describe('getGeomMaxGeohash', () => {
  it('point', () => {
    let pt = new Point([1,1])
    let code = olt.getGeomMaxGeohash(pt)
    assert.ok(code === '',)
  })
})