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
    console.log('game: ', gameId)
    try {
      let response = await fetch(`/fetchDrawings?gameId=${gameId}`)

      console.log(response.body)
      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }

      response = await response.blob()
      console.log(response)
      // console.log(response[0].data.data)
      return response //.data.data
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
    fetchDrawings(gameId).then((drawings) => {
      drawings.forEach((drawing) => {
        // const div = document.createElement('div')

        // // Create a new image element
        // const img = document.createElement('img')

        // // Convert buffer data to data URL and set it as the image source
        // img.src = 'data:image/png;base64,' + buffer.toString('base64');bufferToDataURL()

        // // Append the image to the div
        // div.appendChild(img)

        // // Append the div to the document body or any other container element
        // document.body.appendChild(div)
        console.log(drawing.data.data)
        var uint8Array = new Uint8Array(drawing.data.data)

        // Convert the Uint8Array to a Blob object
        var blob = new Blob([uint8Array])

        // Create an object URL from the Blob
        var url = URL.createObjectURL(blob)

        // Create an <img> element
        var img = document.createElement('img')

        // Set the src attribute of the <img> element to the object URL
        img.src = url

        // const base64Image = Buffer.from(new Uint8Array(drawing.data)).toString(
        //   'base64'
        // )

        // console.log(drawing)
        // console.log(drawing.data)
        // const drawingItem = document.createElement('img')
        // // Convert the Buffer to a base64 string
        // const base64Image = btoa(
        //   new Uint8Array(drawing.data).reduce(
        //     (data, byte) => data + String.fromCharCode(byte),
        //     ''
        //   )
        // )
        // drawingItem.src = `data:image/jpeg;base64,${base64Image}` // Assuming the image is in jpeg format
        gameListElement.appendChild(img)
      })
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
