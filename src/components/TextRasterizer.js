export class TextRasterizer {

  constructor(font = "900 190px 'Space Grotesk'") {

    this.canvas =
      document.createElement("canvas");

    this.ctx =
      this.canvas.getContext("2d", {
        willReadFrequently: true,
      });

    this.canvas.width = 1600;
    this.canvas.height = 600;

    this.font = font;
  }

  getPoints(text) {

    const ctx = this.ctx;

    ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    ctx.fillStyle = "#fff";

    ctx.font = this.font;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      text,
      this.canvas.width / 2,
      this.canvas.height / 2
    );

    const image =
      ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      ).data;

    const points = [];

    const gap =
      window.innerWidth < 700
        ? 8
        : 6;

    for (
      let y = 0;
      y < this.canvas.height;
      y += gap
    ) {

      for (
        let x = 0;
        x < this.canvas.width;
        x += gap
      ) {

        const index =
          (y * this.canvas.width + x) * 4;

        if (
          image[index + 3] > 20
        ) {

          points.push({
            x,
            y,
          });

        }

      }

    }

    return points;
  }

}