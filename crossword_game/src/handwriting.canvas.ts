class HandwritingCanvas {
  public canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private strokeColor: string = "black";
  private lineWidth: number;
  private allowUndo: boolean;
  private allowRedo: boolean;
  private drawing: boolean = false;
  private trace: number[][][] = [];
  private step: string[] = [];
  private redoStep: string[] = [];
  private redoTrace: number[][][] = [];
  public i: number = 0;
  public j: number = 0;
  private isDragging: boolean = false;
  public onRecognize?: (results: string[] | undefined, error?: Error) => void;
  public onClick?: () => void;

  constructor(
    canvas: HTMLCanvasElement,
    options?: {
      lineWidth?: number;
      allowUndo?: boolean;
      allowRedo?: boolean;
      strokeColor?: string,
      onRecognize?: (results: string[] | undefined, error?: Error) => void;
      onClick?: () => void
    }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.strokeColor = options?.strokeColor || 'black';
    this.lineWidth = options?.lineWidth || 4;
    this.allowUndo = options?.allowUndo || false;
    this.allowRedo = options?.allowRedo || false;
    this.onRecognize = options?.onRecognize;
    this.onClick = options?.onClick;
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = this.lineWidth;

    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  destroy() {
    // Remove event listeners
    this.canvas.removeEventListener("mousedown", this.handleMouseDown);
    this.canvas.removeEventListener("mousemove", this.handleMouseMove);
    this.canvas.removeEventListener("mouseup", this.handleMouseUp);
  }

  private handleMouseDown(e: MouseEvent) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.drawing = true;
    this.isDragging = false;
    this.trace.push([[x], [y], []]);
  }

  private handleMouseMove(e: MouseEvent) {
    if (!this.drawing) return;
    this.isDragging = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.strokeStyle = this.strokeColor;
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.trace[this.trace.length - 1][0].push(x);
    this.trace[this.trace.length - 1][1].push(y);
  }

  private handleMouseUp() {
    this.drawing = false;
    if (!this.isDragging) {
      this.trace.pop();
      if (this.onClick) this.onClick();
    }
    if (this.allowUndo) this.step.push(this.canvas.toDataURL());
  }

  eraseCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.trace = [];
    this.step = [];
    this.redoStep = [];
    this.redoTrace = [];
  }

  undo() {
    if (!this.allowUndo || this.step.length === 0) return;
    const lastStep = this.step.pop();
    this.redoStep.push(lastStep!);
    this.redoTrace.push(this.trace.pop()!);
    this.loadFromUrl(this.step[this.step.length - 1] || "");
  }

  redo() {
    if (!this.allowRedo || this.redoStep.length === 0) return;
    const lastRedo = this.redoStep.pop();
    this.step.push(lastRedo!);
    this.trace.push(this.redoTrace.pop()!);
    this.loadFromUrl(lastRedo!);
  }

  private loadFromUrl(url: string) {
    const img = new Image();
    img.onload = () => this.ctx.drawImage(img, 0, 0);
    img.src = url;
  }

  async recognize() {
    if (!this.onRecognize) return;
    try {
      const response = await fetch(
        "https://www.google.com.tw/inputtools/request?ime=handwriting&app=mobilesearch&cs=1&oe=UTF-8",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            options: "enable_pre_space",
            requests: [
              {
                writing_guide: {
                  writing_area_width: this.canvas.width,
                  writing_area_height: this.canvas.height,
                },
                ink: this.trace,
                language: "en",
              },
            ],
          }),
        }
      );
      const data = await response.json();
      const results = data[1][0][1];
      this.onRecognize(results);
    } catch (error) {
      this.onRecognize(undefined, error as Error);
    }
  }
}

export default HandwritingCanvas;
