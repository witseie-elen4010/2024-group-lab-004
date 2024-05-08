document.addEventListener('DOMContentLoaded', function () {
  let currentGames = []
  let currentPage = 0
  const gamesPerPage = 10

  const gameListElement = document.getElementById('gameList')
  const prevButton = document.getElementById('prevButton')
  const nextButton = document.getElementById('nextButton')
  const backButton = document.getElementById('backButton')

  async function fetchGames() {
    try {
      const response = await fetch('/fetchGames')
      if (!response.ok) {
        throw new Error('Failed to fetch games')
      }
      const games = await response.json()
      return games
    } catch (error) {
      console.error('Error fetching games:', error)
      return []
    }
  }

  async function fetchPrompts(gameId) {
    try {
      const response = await fetch(`/fetchPrompts?gameId=${gameId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const prompts = await response.json()
      return prompts
    } catch (error) {
      console.error('Error fetching prompts:', error)
      return []
    }
  }

  async function fetchDrawings(gameId) {
    try {
      const response = await fetch(`/fetchDrawings?gameId=${gameId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }
      const prompts = await response.json()
      return prompts
    } catch (error) {
      console.error('Error fetching prompts:', error)
      return []
    }
  }

  function renderGames() {
    // Clear current list
    gameListElement.innerHTML = ''

    // Get slice of games for current page
    const start = currentPage * gamesPerPage
    const end = start + gamesPerPage
    const gamesToShow = currentGames.slice(start, end)

    // Create list items for each game
    gamesToShow.forEach((game) => {
      const listItem = document.createElement('li')
      listItem.innerHTML = `<strong>${game.gameName}</strong> - <em>${new Date(
        game.gameDate
      ).toLocaleDateString()}</em>`
      listItem.onclick = () => viewPrompts(game.gameID)
      gameListElement.appendChild(listItem)
    })

    // Update pagination visibility
    prevButton.style.visibility = currentPage > 0 ? 'visible' : 'hidden'
    nextButton.style.visibility =
      end < currentGames.length ? 'visible' : 'hidden'
  }

  function viewPrompts(gameId) {
    prevButton.style.visibility = 'hidden'
    nextButton.style.visibility = 'hidden'
    fetchPrompts(gameId).then((prompts) => {
      gameListElement.innerHTML = '' // Clear current list
      prompts.forEach((prompt) => {
        const promptItem = document.createElement('li')
        promptItem.textContent = prompt.prompt // Assuming the prompt object has a description property
        gameListElement.appendChild(promptItem)
      })
      // Add a back button to return to game list
      const backButton = document.createElement('button')
      backButton.textContent = 'Back to Games'
      backButton.onclick = () => renderGames() // Render games again when clicked
      gameListElement.appendChild(backButton)
    })
  }

  prevButton.addEventListener('click', () => {
    if (currentPage > 0) {
      currentPage--
      renderGames()
    }
  })

  nextButton.addEventListener('click', () => {
    if ((currentPage + 1) * gamesPerPage < currentGames.length) {
      currentPage++
      renderGames()
    }
  })

  backButton.addEventListener('click', () => {
    window.location.href = '/draw'
  })

  fetchGames().then((games) => {
    currentGames = games
    renderGames()
  })
})
