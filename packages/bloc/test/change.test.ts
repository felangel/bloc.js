import { Change } from '../lib/src/change'

describe('Change Tests', () => {
  describe('constructor', () => {
    test('should return normally when initialized with all required parameters', () => {
      expect(() => new Change<number>(0, 1)).not.toThrowError()
    })
  })

  describe('equal', () => {
    test('should return true if 2 Changes are equal', () => {
      const changeA = new Change<number>(0, 1)
      const changeB = new Change<number>(0, 1)
      expect(changeA.equal(changeB)).toEqual(true)
    })
    test('should return false if 2 Changes are not equal', () => {
      const changeA = new Change<number>(0, 1)
      const changeB = new Change<number>(0, 2)
      expect(changeA.equal(changeB)).toEqual(false)
    })
  })

  describe('toString', () => {
    test('should return correct string representation of Change', () => {
      const change = new Change<number>(0, 1)
      expect(change.toString())
        .toEqual(`Change { currentState: ${change.currentState}, nextState: ${change.nextState} }`)
    })
  })
})
