// Mock the socket and the fetchLeaderboard function
// Mock the socket.io-client
jest.mock('socket.io', () => {
  return jest.fn(() => ({
    on: jest.fn((event, callback) => {
      if (event === 'votingResult') {
        callback({
          result: {
            equalImposterVotes: false,
            mostVotedUser: 'player1',
            votes: 3,
            isImposter: true,
            imposter: 'player1',
          },
          membersCount: 4,
        })
      }
    }),
    emit: jest.fn(),
  }))
})

// Mock the fetchLeaderboard function
const fetchLeaderboard = jest.fn()
const io = require('socket.io')
jest.mock('../src/public/js/drawingBoard', () => ({
  fetchLeaderboard: jest.fn(),
}))

test('votingResult event handler', () => {
  // Set up the DOM elements that the event handler interacts with
  document.body.innerHTML = `
    <div id="votingPageMessage"></div>
    <div id="votingPageCountdown"></div>
  `

  // Require the module that contains the event handler
  // Make sure your event handler file properly uses the fetchLeaderboard function
  require('../src/public/js/drawingBoard')

  // Mock socket.io client instance
  const socket = io()

  // Trigger the votingResult event
  socket.on.mock.calls.forEach(([event, callback]) => {
    if (event === 'votingResult') {
      callback({
        result: {
          equalImposterVotes: false,
          mostVotedUser: 'player1',
          votes: 3,
          isImposter: true,
          imposter: 'player1',
        },
        membersCount: 4,
      })
    }
  })

  // Check that the leaderboard was fetched
  expect(fetchLeaderboard).toHaveBeenCalled()

  // Check that the voting message was updated correctly
  expect(document.getElementById('votingPageMessage').innerText).toBe(
    'player1 was voted imposter with 3 votes. They were the imposter! Crewmate Victory!\nWaiting for the next round to start...'
  )

  // Check that the voting countdown element was hidden
  expect(document.getElementById('votingPageCountdown').style.display).toBe(
    'none'
  )
})

