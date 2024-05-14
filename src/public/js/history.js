document.addEventListener('DOMContentLoaded', function () {
  let currentGames = []
  let currentPage = 0
  let setIndex = 0
  let imageIndex = 0
  let submissionUpper = null
  let submissionMiddle = null
  let submissionLower = null
  let PlayerCount = 0
  let CurrentGrid = null
  const gamesPerPage = 10

  const gameListElement = document.getElementById('gameList')
  const prevButton = document.getElementById('prevButton')
  const nextButton = document.getElementById('nextButton')
  const backButton = document.getElementById('backButton')
  const gameScreen = document.getElementById('gameScreen')
  const gridOverlay = document.getElementById('gridOverlay')
  const upButton = document.getElementById('upButton')
  const downButton = document.getElementById('downButton')
  const prevSetButton = document.getElementById('prevSetButton')
  const nextSetButton = document.getElementById('nextSetButton')
  const leaveGridButton = document.getElementById('leaveGrid')

  leaveGridButton.addEventListener('click', () => {
    const imagecontainer = document.getElementById('roundGridContainer')
    imagecontainer.src =
      'https://upload.wikimedia.org/wikipedia/commons/1/15/No_image_available_600_x_450.svg'
    gridOverlay.style.display = 'none'
    gameScreen.style.display = 'block'
    setIndex = 0
    imageIndex = 0
  })

  upButton.addEventListener('click', () => {
    if (imageIndex > 0) {
      imageIndex -= 2
    }
    showRoundOver(CurrentGrid, setIndex, imageIndex)
  })

  downButton.addEventListener('click', () => {
    if (CurrentImageIndex < PlayerCount - 3) {
      CurrentImageIndex += 2
    }
    showRoundOver(CurrentGrid, setIndex, imageIndex)
  })

  prevSetButton.addEventListener('click', () => {
    if (setIndex > 0) {
      setIndex -= 1
      const setbuttoncaption = document.getElementById('CurrentSet')
      setbuttoncaption.textContent = `Set ${setIndex + 1}`
    }
    imageIndex = 0
    showRoundOver(CurrentGrid, setIndex, imageIndex)
  })

  nextSetButton.addEventListener('click', () => {
    if (setIndex < PlayerCount - 1) {
      setIndex += 1
      const setbuttoncaption = document.getElementById('CurrentSet')
      setbuttoncaption.textContent = `Set ${setIndex + 1}`
    }
    imageIndex = 0
    showRoundOver(CurrentGrid, setIndex, imageIndex)
  })

  function showRoundOver(grid, setIndex, imageIndex) {
    const gridContainer = document.getElementById('gridOverlay')
    // Loop through each row and render them into separate columns
    submissionUpper = grid[imageIndex][setIndex]
    submissionMiddle = grid[imageIndex + 1][setIndex]
    if (imageIndex + 2 < PlayerCount) {
      submissionLower = grid[imageIndex + 2][setIndex]
      const enablelower = document.getElementById('EndScreenLowerPrompt')
      enablelower.style.display = 'block'
    } else {
      submissionLower = { member: 'No one', content: 'No one' }
      const disablelower = document.getElementById('EndScreenLowerPrompt')
      disablelower.style.display = 'none'
    }

    const memberInfo = document.getElementById('UpperPrompt')
    memberInfo.textContent = `Submitted by: ${submissionUpper.member}`
    const memberInfoContainer = document.getElementById('upperPromptContainer')
    memberInfoContainer.textContent = ` ${submissionUpper.content} `

    const imagecontainer = document.getElementById('roundGridContainer')

    imagecontainer.src = submissionMiddle.content

    // set the image height to 400px, and set the width such that the image is not stretched
    imagecontainer.style.height = `400px`
    imagecontainer.style.width = `auto`

    imagecontainer.alt = `Drawing ${imageIndex + 1}`

    const DrawnByPrompt = document.getElementById('DrawnByPrompt')
    DrawnByPrompt.textContent = `Drawn by: ${submissionMiddle.member}`
    //imagecontainer.style.height = `60%`

    const prompt = document.getElementById('EndScreenLowerPromptAlter')
    prompt.textContent = `What ${submissionLower.member} thought it was: `

    const lowerPrompt = document.getElementById('lowerPrompt')
    lowerPrompt.textContent = ` ${submissionLower.content} `

    gridContainer.style.display = 'flex'
  }

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

  function parseObjectArray(array) {
    return array.map((innerArray) =>
      innerArray.map((item) => {
        try {
          return JSON.parse(item)
        } catch (e) {
          console.error('Failed to parse JSON:', e)
          return null // or handle the error as needed
        }
      })
    )
  }

  async function fetchGrid(gameID) {
    try {
      let response = await fetch(`/fetchGrid?gameID=${gameID}`)
      if (!response.ok) {
        throw new Error('Failed to fetch grid')
      }
      const grid = await response.json()
      const parsedArray = parseObjectArray(grid[0].grid)
      return parsedArray
    } catch (error) {
      console.error('Error fetching grid:', error)
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
      listItem.innerHTML = `<strong>${game.game_name}</strong> - <em>${new Date(
        game.game_date
      ).toLocaleDateString()}</em>`
      listItem.onclick = () => {
        setIndex = 0
        imageIndex = 0
        const setbuttoncaption = document.getElementById('CurrentSet')
        setbuttoncaption.textContent = `Set ${setIndex + 1}`

        gameScreen.style.display = 'none'
        gridOverlay.style.display = 'flex'
        fetchGrid(game.game_id).then((grid) => {
          PlayerCount = grid.length
          CurrentGrid = grid
          showRoundOver(grid, setIndex, imageIndex)
        })
      }
      gameListElement.appendChild(listItem)
    })

    // Update pagination visibility
    prevButton.style.visibility = currentPage > 0 ? 'visible' : 'hidden'
    nextButton.style.visibility =
      end < currentGames.length ? 'visible' : 'hidden'
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
    window.location.href = '/landing'
  })

  fetchGames().then((games) => {
    currentGames = games
    renderGames()
  })
})
