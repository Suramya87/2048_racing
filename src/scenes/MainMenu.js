 class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'Menu' });
    }

    create() {
        this.add.text(590, 150, "2048", { fontSize: "48px", fill: "#ffffff" }).setOrigin(0.5);
        this.add.text(590, 220, "Enter Seed:", { fontSize: "24px", fill: "#ffffff" }).setOrigin(0.5);

        this.seed = "";


        this.seedText = this.add.text(590, 260, this.seed, { fontSize: "24px", fill: "#ffff00" }).setOrigin(0.5);


        this.add.text(590, 320, "Type a seed and press ENTER", { fontSize: "18px", fill: "#aaa" }).setOrigin(0.5);

        this.input.keyboard.on("keydown", (event) => {
            if (event.key === "Backspace") {
                this.seed = this.seed.slice(0, -1);
            } else if (event.key === "Enter") {
                if (this.seed.length === 0) this.seed = "default"; // fallback
                this.scene.start("Play", { seed: this.seed });
            } else if (event.key.length === 1) {
                this.seed += event.key;
            }
            this.seedText.setText(this.seed);
        });
    }
}
