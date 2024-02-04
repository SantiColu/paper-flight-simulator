import { Send } from "lucide-react";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import Papa from "papaparse";

const l = 30;

function drawAxis(ctx, maxX, maxY) {
  const xScale = ctx.canvas.width / maxX;
  const yScale = ctx.canvas.height / maxY;

  // Set up the canvas properties
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1;

  const h = ctx.canvas.height - 5;
  const w = ctx.canvas.width;

  // Draw x-axis
  ctx.beginPath();
  ctx.moveTo(10, h - 5);
  ctx.lineTo(w, h - 5);
  ctx.stroke();

  let g = 0;
  // Draw tick marks on x-axis
  for (let i = 1; i < w / l; i++) {
    let x = l * i;

    if (g == 4) {
      ctx.font = "18px serif";
      ctx.fillText(`${(x / xScale).toFixed(2)}m`, x - 20, h - 20);
      g = 0;
      ctx.lineWidth = 3;
    }
    g++;

    ctx.beginPath();
    ctx.moveTo(x, h - 10);
    ctx.lineTo(x, h);
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  // arrows
  ctx.beginPath();
  ctx.moveTo(w - 15, h - 15);
  ctx.lineTo(w, h - 5);
  ctx.lineTo(w - 15, h + 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(10 + 10, 10);
  ctx.lineTo(10, 0);
  ctx.lineTo(5 - 10, 15);
  ctx.stroke();

  // Draw y-axis
  ctx.beginPath();
  ctx.moveTo(10, 0);
  ctx.lineTo(10, h - 5);
  ctx.stroke();

  g = 0;
  // Draw tick marks on y-axis
  for (let i = 1; i < h / l - 1; i++) {
    let y = h - i * l;

    if (g == 4) {
      ctx.font = "18px serif";
      ctx.fillText(
        `${((ctx.canvas.height - y) / yScale).toFixed(2)}m`,
        20,
        y + 5
      );
      g = 0;
      ctx.lineWidth = 3;
    }
    g++;

    ctx.beginPath();
    ctx.moveTo(5, y);
    ctx.lineTo(15, y);
    ctx.stroke();
    ctx.lineWidth = 1;
  }
}

// for (let i = 0; i < 1200; i++) {
//   const y = ((-(1 / 2) * 7 * i) ^ 2) + 5 * i;

//   data.push(y);
// }

function App() {
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data) return;
    const maxX =
      data.x.reduce(function (p, v) {
        if (isNaN(v)) return p;
        return p < v ? v : p;
      }) * 1.1;
    const maxY =
      data.h.reduce(function (p, v) {
        if (isNaN(v)) return p;
        return p < v ? v : p;
      }) * 2;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // draw axis
    let frameCount = 0;

    let animationFrameId;

    //Our draw came here
    ctx.canvas.width = containerRef.current.clientWidth - 20;
    ctx.canvas.height = 700; //containerRef.current.clientHeight;

    const fps = data.t.length / data.t[data.t.length - 1];

    const fpsInterval = 1000 / fps;
    let then = Date.now();
    let startTime = then;

    const render = () => {
      const now = Date.now();
      const elapsed = now - then;
      then = now - (elapsed % fpsInterval);

      if (elapsed > fpsInterval) {
        frameCount++;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const sinceStart = now - startTime;
        const currentFps =
          Math.round((1000 / (sinceStart / frameCount)) * 100) / 100;

        const xScale = ctx.canvas.width / maxX;
        const yScale = ctx.canvas.height / maxY;

        drawAxis(ctx, maxX, maxY);

        const tt = frameCount;
        if (tt >= data.t.length - 1) {
          frameCount = 0;
          startTime = now;
        }

        ctx.font = "28px Arial";
        ctx.fillText(
          `Tiempo: ${data.t[tt].toFixed(2)}s (${
            Math.round((sinceStart / 1000) * 100) / 100
          }s)`,
          ctx.canvas.width - 300,
          50
        );
        ctx.fillText(
          `Altura: ${data.h[tt].toFixed(2)}m`,
          ctx.canvas.width - 300,
          100
        );
        ctx.fillText(
          `Angulo: ${(data.y[tt] * (180 / Math.PI)).toFixed(2)}º`,
          ctx.canvas.width - 300,
          150
        );
        ctx.fillText(
          `Distancia: ${data.x[tt].toFixed(2)}m`,
          ctx.canvas.width - 300,
          200
        );
        ctx.fillText(`FPS: ${currentFps}`, ctx.canvas.width - 300, 250);

        ctx.fillStyle = "#FFF";

        var img = new Image();
        img.src =
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1zZW5kLWhvcml6b250YWwiPjxwYXRoIGQ9Im0zIDMgMyA5LTMgOSAxOS05WiIvPjxwYXRoIGQ9Ik02IDEyaDE2Ii8+PC9zdmc+";

        ctx.save();
        ctx.translate(
          data.x[tt] * xScale,
          ctx.canvas.height - data.h[tt] * yScale
        );
        ctx.rotate(-data.y[tt]);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        ctx.strokeStyle = "#FF0000";

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(100, 0);
        ctx.stroke();
        ctx.fillStyle = "#FFF";

        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(data.x[0] * xScale, ctx.canvas.height - data.h[0] * yScale);
        for (let i = 0; i <= tt; i++) {
          ctx.lineTo(
            data.x[i] * xScale,
            ctx.canvas.height - data.h[i] * yScale
          );
        }
        ctx.stroke();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [data]);

  return (
    <div className="flex  flex-col min-h-screen justify-between">
      <section className="bg-base-300 flex justify-center py-5">
        <div className="text-primary font-bold text-3xl flex justify-center items-center gap-2">
          <Send size={30} />
          <span>SIMULADOR AVION DE PAPEL</span>
          <Send size={30} />
        </div>
      </section>
      <div className="flex-grow">
        <section className="flex items-center  justify-center mt-3">
          <div className="max-w-7xl bg-base-200  w-full border-2 border-gray-600 rounded-md p-2 flex justify-center items-center h-20">
            {data ? (
              <div
                onClick={() => setData(null)}
                className="btn btn-error btn-wide"
              >
                DETENER SIMULACION
              </div>
            ) : (
              <>
                <input
                  className="csv-input"
                  type="file"
                  name="file"
                  placeholder={null}
                  onChange={(e) => setFile(e.target.files[0])}
                />
                {file && (
                  <div
                    onClick={() =>
                      Papa.parse(file, {
                        skipEmptyLines: true,
                        complete: (v) => {
                          setFile(null);
                          setData({
                            t: v.data
                              .map((d) => d[0])
                              .map((d) => parseFloat(d)),
                            v: v.data
                              .map((d) => d[1])
                              .map((d) => parseFloat(d)),
                            y: v.data
                              .map((d) => d[2])
                              .map((d) => parseFloat(d)),
                            h: v.data
                              .map((d) => d[3])
                              .map((d) => parseFloat(d)),
                            x: v.data
                              .map((d) => d[4])
                              .map((d) => parseFloat(d)),
                          });
                        },
                        header: false,
                      })
                    }
                    className="btn btn-primary"
                  >
                    CARGAR
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="flex items-center  justify-center my-2">
          <div
            hidden={!data}
            ref={containerRef}
            className="max-w-7xl bg-base-200  w-full border-2 border-gray-600 rounded-md p-2"
          >
            <canvas ref={canvasRef} className="bg-red" />
          </div>
        </section>
      </div>
      <footer className="min-h-fit w-full bg-base-200 flex justify-center">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-center px-4">
          Simulador creado para el TP final de IPAN (UNLP)
        </div>
      </footer>
    </div>
  );
}

export default App;
