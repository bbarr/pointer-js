
var assert = require('assert')
var Pointer = require('./pointer')

describe('Pointer()', function() {

  var data
  var root
  var pointer
  beforeEach(function() {
    data = { a: { b: [ { c: 1 } ] } }
    root = Pointer(data)
    pointer = root.refine('a.b') 
  })

  describe('root pointer', function() {

    describe('.swap', function() {

      it ('should replace .data property', function() {
        root.swap({ a: 1 })
        assert(root.data.a == 1)
      })

      it ('should trigger ._refresh on root', function() {
        assert.deepEqual(root._current, data)
        root.swap({ a: 1 })
        assert.deepEqual(root._current, { a: 1 })
      })

      it ('should trigger ._refresh on all sub pointers', function() {
        var sub = root.refine('a.b')
        assert.deepEqual(sub.deref(), [ { c: 1 } ])
        root.swap({ a: 1 })
        assert(sub.deref() == undefined)
      })

      it ('should call callback', function() {
        var called = false
        var root = Pointer(data, function() { called = true })
        assert(!called)
        root.swap({ a: 1 })
        assert(called)
      })
    })
  })
    
  describe('any pointer', function() {

    describe('._refresh', function() {
      
      it ('should set _previous to _current and replace _current with current value', function() {
        assert.deepEqual(pointer._current, [ { c: 1 } ])
        assert(pointer._previous == null)
        pointer._refresh()
        assert(pointer._current, [ { c: 1 } ])
        assert(pointer._previous, [ { c: 1 } ])
      })
    })

    describe('.isChanged', function() {

      it ('should return whether or not _current is !== _previous', function() {
        assert(pointer.isChanged() == true)
        pointer._refresh()
        assert(pointer.isChanged() == false)
      })
    })

    describe('.refine', function() {

      it ('should return new pointer with extended path', function() {
        var sub = pointer.refine('0')
        assert.deepEqual(sub.deref(), { c: 1 })
      })
    })

    describe('.fromRoot', function() {

      it ('should allow refining from the root, with assumptions about data structure', function() {
        var c = pointer.fromRoot('a.b.0.c')
        assert(c.deref() == 1)
      })
    })

    describe('.deref', function() {
      it ('should return whatever is at _current', function() {
        var c = pointer.fromRoot('a.b.0.c')
        c._current = 2
        assert(c.deref() == 2)
      })
    })

    describe('.update', function() {
      it ('should pass through to React.addons.update', function() {
        pointer.update({ $push: [ { d: 2 } ] })
        assert.deepEqual(root.data.a.b[1], { d: 2 })
      })
    })

    describe('.get', function() {
      it ('should try to pick path off current pointer', function() {
        assert(pointer.get('0.c') == 1)
      })
    })

    describe('.set', function() {
      it ('should use $set on current pointer', function() {
        pointer.update({ $set: 'abc' })
        assert(root.data.a.b == 'abc')
      })
    })
  })

  describe('util', function() {

    describe('.pick', function() {

      it ('should work with array path', function() {
        assert(Pointer.util.pick({ a: { b: 1 } }, [ 'a', 'b' ]) == 1)
      })

      it ('should work with string path', function() {
        assert(Pointer.util.pick({ a: { b: 1 } }, 'a.b') == 1)
      })

      it ('should return root when given empty path array', function() {
        var data = { a: { b: 1 } }
        assert(Pointer.util.pick(data, []) == data)
      })

      it ('should return root when given empty path string', function() {
        var data = { a: { b: 1 } }
        assert(Pointer.util.pick(data, '') == data)
      })

      it ('should accept and use default if data is falsy', function() {
        assert(Pointer.util.pick(null, 'a.b', 'default value') == 'default value')
      })
    })

    describe('.nest', function() {

      it ('should work with array path', function() {
        assert.deepEqual(Pointer.util.nest([ 'a' ], { b: 1 }), { a: { b: 1 } })
      })

      it ('should work with string path', function() {
        assert.deepEqual(Pointer.util.nest('a', { b: 1 }), { a: { b: 1 } })
      })

      it ('should just return nestee if given empty path array', function() {
        assert.deepEqual(Pointer.util.nest([], { b: 1 }), { b: 1 })
      })

      it ('should just return nestee if given empty path string', function() {
        assert.deepEqual(Pointer.util.nest('', { b: 1 }), { b: 1 })
      })
    })
  })

})
