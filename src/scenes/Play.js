class Play extends Phaser.Scene {
    constructor() {
        super({ key: 'Play' });
    }

    init(data) {
        this.seed = data.seed || "default";
    }

    create() {
        this.gridSize = 4;
        this.cellSize = 100;

        // Center grid
        this.offsetX = (this.sys.game.config.width - this.gridSize * this.cellSize) / 2;
        this.offsetY = (this.sys.game.config.height - this.gridSize * this.cellSize) / 2;

        // Seeded RNG
        this.rng = new Phaser.Math.RandomDataGenerator([this.seed]);

        this.board = [];
        this.tiles = [];

        // Tile colors
        this.colors = {
            2: 0xeee4da, 4: 0xede0c8, 8: 0xf2b179, 16: 0xf59563,
            32: 0xf67c5f, 64: 0xf65e3b, 128: 0xedcf72, 256: 0xedcc61,
            512: 0xedc850, 1024: 0xedc53f, 2048: 0xedc22e
        };

        // Initialize board and background
        for (let row = 0; row < this.gridSize; row++) {
            this.board[row] = [];
            this.tiles[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                this.board[row][col] = 0;   // logical empty
                this.tiles[row][col] = null;

                // Background tile
                this.add.rectangle(
                    this.offsetX + col * this.cellSize,
                    this.offsetY + row * this.cellSize,
                    this.cellSize - 10,
                    this.cellSize - 10,
                    0x444444
                ).setOrigin(0);
            }
        }

        // Spawn initial tiles
        this.spawnNumber();
        this.spawnNumber();

        this.isMoving = false; // flag to block input during movement

        this.input.keyboard.on("keydown", (event) => {
            if (this.isMoving) return; // ignore input while moving

            let moved = false;
            if (event.code === "ArrowUp") moved = this.move(0, -1);
            if (event.code === "ArrowDown") moved = this.move(0, 1);
            if (event.code === "ArrowLeft") moved = this.move(-1, 0);
            if (event.code === "ArrowRight") moved = this.move(1, 0);

            if (moved) {
                this.isMoving = true;
                this.time.delayedCall(11, () => { // wait for tweens to finish
                    this.spawnNumber();
                    this.isMoving = false;
                });
            }
        });
    }

    createTile(row, col, value) {
        const x = this.offsetX + col * this.cellSize + this.cellSize / 2;
        const y = this.offsetY + row * this.cellSize + this.cellSize / 2;

        const bg = this.add.rectangle(0, 0, this.cellSize - 20, this.cellSize - 20, this.colors[value] || 0x3c3a32);
        const text = this.add.text(0, 0, value, { fontSize: "32px", color: "#000" }).setOrigin(0.5);

        const container = this.add.container(x, y, [bg, text]);
        container.value = value;

        this.board[row][col] = value;
        this.tiles[row][col] = container;

        // pop animation
        this.tweens.add({
            targets: container,
            scaleX: { from: 0, to: 1 },
            scaleY: { from: 0, to: 1 },
            duration: 150,
            ease: "Back.Out"
        });
    }

    spawnNumber() {
        const empty = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 0) empty.push({ row, col });
            }
        }
        if (empty.length === 0) return;

        const { row, col } = this.rng.pick(empty);
        const value = this.rng.between(1, 10) > 1 ? 2 : 4;
        this.createTile(row, col, value);
    }

    move(dx, dy) {
        let moved = false;
        const merged = [];
        let range = [...Array(this.gridSize).keys()];
        if (dx === 1 || dy === 1) range = range.reverse();

        for (let i of range) {
            for (let j of range) {
                const row = dy !== 0 ? i : j;
                const col = dx !== 0 ? i : j;

                if (this.board[row][col] === 0) continue;

                let tile = this.tiles[row][col];
                let newRow = row;
                let newCol = col;

                while (true) {
                    const nextRow = newRow + dy;
                    const nextCol = newCol + dx;

                    if (nextRow < 0 || nextRow >= this.gridSize || nextCol < 0 || nextCol >= this.gridSize) break;

                    if (this.board[nextRow][nextCol] === 0) {
                        this.board[nextRow][nextCol] = this.board[newRow][newCol];
                        this.board[newRow][newCol] = 0;

                        this.tiles[nextRow][nextCol] = this.tiles[newRow][newCol];
                        this.tiles[newRow][newCol] = null;

                        if (this.tiles[nextRow][nextCol]) {
                            this.tweens.add({
                                targets: this.tiles[nextRow][nextCol],
                                x: this.offsetX + nextCol * this.cellSize + this.cellSize / 2,
                                y: this.offsetY + nextRow * this.cellSize + this.cellSize / 2,
                                duration: 150
                            });
                        }

                        newRow = nextRow;
                        newCol = nextCol;
                        moved = true;
                    } else if (
                        this.board[nextRow][nextCol] === this.board[newRow][newCol] &&
                        !merged.includes(nextRow + "-" + nextCol)
                    ) {
                        this.board[nextRow][nextCol] *= 2;
                        this.board[newRow][newCol] = 0;

                        const oldTile = this.tiles[newRow][newCol];
                        const mergeTile = this.tiles[nextRow][nextCol];

                        if (oldTile) {
                            this.tweens.add({
                                targets: oldTile,
                                x: this.offsetX + nextCol * this.cellSize + this.cellSize / 2,
                                y: this.offsetY + nextRow * this.cellSize + this.cellSize / 2,
                                duration: 10,
                                onComplete: () => {
                                    oldTile.destroy();
                                    if (mergeTile) {
                                        mergeTile.list[0].setFillStyle(this.colors[this.board[nextRow][nextCol]] || 0x3c3a32);
                                        mergeTile.list[1].setText(this.board[nextRow][nextCol]);
                                    }
                                }
                            });
                        }

                        this.tiles[newRow][newCol] = null;
                        merged.push(nextRow + "-" + nextCol);
                        moved = true;
                        break;
                    } else {
                        break;
                    }
                }
            }
        }

        return moved;
    }
}
