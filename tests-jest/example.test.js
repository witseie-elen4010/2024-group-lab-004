const { parseObjectArray } = require('../src/public/js/history') // adjust the path as needed

describe('parseObjectArray', () => {
  it('should parse JSON strings in a nested array', () => {
    const array = [
      ['{"key1": "value1"}', '{"key2": "value2"}'],
      ['{"key3": "value3"}', '{"key4": "value4"}'],
    ]
    const expected = [
      [{ key1: 'value1' }, { key2: 'value2' }],
      [{ key3: 'value3' }, { key4: 'value4' }],
    ]

    const result = parseObjectArray(array)

    expect(result).toEqual(expected)
  })

  it('should return null for invalid JSON strings and log an error', () => {
    console.error = jest.fn()

    const array = [['{"key1": "value1"}', 'invalid JSON']]
    const expected = [[{ key1: 'value1' }, null]]

    const result = parseObjectArray(array)

    expect(result).toEqual(expected)
    expect(console.error).toHaveBeenCalled()
  })
})

// // Mock the socket and the fetchLeaderboard function
// // Mock the socket.io-client
// jest.mock('socket.io', () => {
//   return jest.fn(() => ({
//     on: jest.fn((event, callback) => {
//       if (event === 'votingResult') {
//         callback({
//           result: {
//             equalImposterVotes: false,
//             mostVotedUser: 'player1',
//             votes: 3,
//             isImposter: true,
//             imposter: 'player1',
//           },
//           membersCount: 4,
//         })
//       }
//     }),
//     emit: jest.fn(),
//   }))
// })

// // Mock the fetchLeaderboard function
// const fetchLeaderboard = jest.fn()
// const io = require('socket.io')
// jest.mock('../src/public/js/drawingBoard', () => ({
//   fetchLeaderboard: jest.fn(),
// }))

// test('votingResult event handler', () => {
//   // Set up the DOM elements that the event handler interacts with
//   document.body.innerHTML = `
//     <div id="votingPageMessage"></div>
//     <div id="votingPageCountdown"></div>
//   `

//   // Require the module that contains the event handler
//   // Make sure your event handler file properly uses the fetchLeaderboard function
//   require('../src/public/js/drawingBoard')

//   // Mock socket.io client instance
//   const socket = io()

//   // Trigger the votingResult event
//   socket.on.mock.calls.forEach(([event, callback]) => {
//     if (event === 'votingResult') {
//       callback({
//         result: {
//           equalImposterVotes: false,
//           mostVotedUser: 'player1',
//           votes: 3,
//           isImposter: true,
//           imposter: 'player1',
//         },
//         membersCount: 4,
//       })
//     }
//   })

//   // Check that the leaderboard was fetched
//   expect(fetchLeaderboard).toHaveBeenCalled()

//   // Check that the voting message was updated correctly
//   expect(document.getElementById('votingPageMessage').innerText).toBe(
//     'player1 was voted imposter with 3 votes. They were the imposter! Crewmate Victory!\nWaiting for the next round to start...'
//   )

//   // Check that the voting countdown element was hidden
//   expect(document.getElementById('votingPageCountdown').style.display).toBe(
//     'none'
//   )
// })

// const { getPrompt } = require('../src/public/js/drawingBoard') // adjust the path as needed

// jest.mock('../src/public/js/drawingBoard', () => ({
//   activateInputPrompt: jest.fn(),
//   setPrompt: jest.fn(),
// }))

// describe('getPrompt', () => {
//   it('should call activateInputPrompt and then setPrompt', async () => {
//     const {
//       activateInputPrompt,
//       setPrompt,
//     } = require('../src/public/js/drawingBoard')
//     const mockImage = 'mockImage'
//     const mockPrompt = 'mockPrompt'

//     activateInputPrompt.mockResolvedValueOnce(mockPrompt)

//     await getPrompt(mockImage)

//     expect(activateInputPrompt).toHaveBeenCalledWith(mockImage)
//     expect(setPrompt).toHaveBeenCalledWith(mockPrompt)
//   })

//   it('should call activateInputPrompt with no arguments and then setPrompt when no image is provided', async () => {
//     const {
//       activateInputPrompt,
//       setPrompt,
//     } = require('../src/public/js/drawingBoard')
//     const mockPrompt = 'mockPrompt'

//     activateInputPrompt.mockResolvedValueOnce(mockPrompt)

//     await getPrompt()

//     expect(activateInputPrompt).toHaveBeenCalledWith()
//     expect(setPrompt).toHaveBeenCalledWith(mockPrompt)
//   })
// })
// global.io = jest.fn().mockReturnValue({
//   emit: jest.fn(),
//   on: jest.fn(),
// })

// const { setPrompt } = require('../src/public/js/drawingBoard') // adjust the path as needed

// describe('setPrompt', () => {
//   it('should set innerText of prompt and call startDrawTimer', () => {
//     // Mock document.getElementById
//     document.getElementById = jest.fn().mockReturnValue({})

//     // Mock startDrawTimer
//     const startDrawTimer = jest.fn()
//     global.startDrawTimer = startDrawTimer

//     const prompt = 'Test prompt'

//     setPrompt(prompt)

//     expect(document.getElementById).toHaveBeenCalledWith('prompt')
//     expect(document.getElementById().innerText).toBe(prompt)
//     expect(startDrawTimer).toHaveBeenCalled()
//   })
// })
