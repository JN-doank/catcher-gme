class Game {
	constructor() {
		this.svg = document.getElementById('game')
		this.toastSymbolId = '#toast'
		this.scoreEl = document.getElementById('score')
		this.livesEl = document.getElementById('lives')
		this.finalScoreInfoEl = document.getElementById('final-score-info')
		this.gameOverScreenEl = document.getElementById('game-over-screen')
		this.toasts = []
		this.score = 0
		this.initialSpawnInterval = 2000 
		this.minSpawnInterval = 500 
		this.spawnInterval = this.initialSpawnInterval
		this.remainingLives = 5
		this.gameOver = false
		this.gameStartTime = performance.now()
		this.spawnTimer = null 

		this.loop = this.loop.bind(this)
		this.spawnToast()
		this.startSpawnTimer() 
		this.updateLives()
		requestAnimationFrame(this.loop)
	}

	startSpawnTimer() {
		if (this.spawnTimer) {
			clearInterval(this.spawnTimer)
		}

		
		const gameTimeSeconds = (performance.now() - this.gameStartTime) / 1000
		this.spawnInterval = Math.max(this.minSpawnInterval, this.initialSpawnInterval - Math.floor(gameTimeSeconds / 10) * 100)

		this.spawnTimer = setInterval(() => {
			if (!this.gameOver) {
				this.spawnToast()
			}
		}, this.spawnInterval)
	}

	spawnToast() {
		if (this.gameOver) return

		const startX = Math.random() * 350 + 25
		const endX = Math.random() * 350 + 25
		const peakY = 200 + Math.random() * 50

		const toast = document.createElementNS('http://www.w3.org/2000/svg', 'use')
		toast.setAttribute('href', this.toastSymbolId)
		toast.setAttribute('class', 'toast')
		toast.setAttribute('x', startX)
		toast.setAttribute('y', 600)
		this.svg.appendChild(toast)

		const toastObj = {
			el: toast,
			startX,
			endX,
			startY: 600, 
			peakY,
			startTime: performance.now(),
			duration: 3000,
			clicked: false,
			upwardSpeedY: -8, 
			upwardSpeedX: (Math.random() - 0.5) * 5,
			reachedBottom: false
		}

		toast.addEventListener('pointerdown', () => {
			if (!this.gameOver && !toastObj.clicked) {
				this.score += 1
				this.scoreEl.textContent = this.score.toString().padStart(8, '0')
				toastObj.clicked = true
				toastObj.el.setAttribute('pointer-events', 'none') 
				toastObj.el.classList.add('toast--clicked'); 
			}
		})

		this.toasts.push(toastObj)
	}

	checkGameOver() {
		if (this.remainingLives <= 0) {
			this.gameOver = true
			clearInterval(this.spawnTimer)
			this.gameOverScreenEl.setAttribute('visibility','visible')
			this.finalScoreInfoEl.textContent = `Final Score: ${this.score}`
		}
	}

	loop(timestamp) {
		if (this.gameOver) {
			
			return
		}

		this.toasts = this.toasts.filter(toast => {
			if (toast.clicked) {
				const currentY = parseFloat(toast.el.getAttribute('y'))
				const currentX = parseFloat(toast.el.getAttribute('x'))
				const newY = currentY + toast.upwardSpeedY
				const newX = currentX + toast.upwardSpeedX 

				toast.el.setAttribute('y', newY)
				toast.el.setAttribute('x', newX)

				if (newY < -100 || newX < -100 || newX > 550) { 
					toast.el.remove()
					return false
				}
			} else {
				const t = (timestamp - toast.startTime) / toast.duration

				if (t > 1) {
					if (!toast.reachedBottom) {
						this.remainingLives--
						this.updateLives()
						this.checkGameOver()
						toast.reachedBottom = true
					}
					toast.el.remove()
					return false
				}

				const x = toast.startX + (toast.endX - toast.startX) * t
				const y = toast.startY - (4 * t * (1 - t)) * (toast.startY - toast.peakY)

				toast.el.setAttribute('x', x)
				toast.el.setAttribute('y', y)
			}

			return true
		})

		

		requestAnimationFrame(this.loop)
	}

	updateLives(){
			this.livesEl.textContent = `${this.remainingLives}X`
	}

}


const game = new Game()
