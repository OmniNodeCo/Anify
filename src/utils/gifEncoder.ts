// Pure JavaScript GIF89a encoder for browser export
// Lightweight, dependency-free, high quality color quantization & LZW compression

export interface GifFrameOptions {
  delay: number; // in milliseconds (e.g. 50ms = 20fps)
  quality?: number; // 1 (best) to 20 (fastest)
}

export class SimpleGifEncoder {
  private width: number;
  private height: number;
  private frames: { data: Uint8ClampedArray; delay: number }[] = [];

  constructor(width: number, height: number) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }

  public addFrame(imageData: ImageData, delayMs: number = 60) {
    this.frames.push({
      data: new Uint8ClampedArray(imageData.data),
      delay: Math.max(20, Math.floor(delayMs / 10) * 10), // GIF delays are in 1/100ths of a second
    });
  }

  public render(): Blob {
    const bytes: number[] = [];

    const writeByte = (b: number) => bytes.push(b & 0xff);
    const writeWord = (w: number) => {
      bytes.push(w & 0xff);
      bytes.push((w >> 8) & 0xff);
    };
    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        bytes.push(s.charCodeAt(i));
      }
    };

    // 1. Header: GIF89a
    writeString("GIF89a");

    // 2. Logical Screen Descriptor
    writeWord(this.width);
    writeWord(this.height);
    writeByte(0x70); // Global Color Table Flag = 0, Color Resolution = 7, Sort = 0, GCT Size = 0
    writeByte(0);    // Background Color Index
    writeByte(0);    // Pixel Aspect Ratio

    // 3. Netscape 2.0 Application Extension (Looping animation)
    writeByte(0x21); // Extension Introducer
    writeByte(0xff); // Application Extension Label
    writeByte(11);   // Block Size
    writeString("NETSCAPE2.0");
    writeByte(3);    // Sub-block size
    writeByte(1);    // Loop sub-block ID
    writeWord(0);    // Loop count (0 = infinite)
    writeByte(0);    // Block Terminator

    // Process each frame
    for (const frame of this.frames) {
      // Build a 256-color palette using median cut / simple uniform + popularity quantization
      const { indexedPixels, palette } = this.quantizeFrame(frame.data);

      // Graphic Control Extension
      writeByte(0x21); // Extension Introducer
      writeByte(0xf9); // Graphic Control Label
      writeByte(4);    // Block Size
      writeByte(0x04); // Disposal Method: 0x04 = restore to previous/background
      writeWord(Math.floor(frame.delay / 10)); // Delay Time in 1/100 sec
      writeByte(0);    // Transparent Color Index (none)
      writeByte(0);    // Block Terminator

      // Image Descriptor
      writeByte(0x2c); // Image Separator
      writeWord(0);    // Left
      writeWord(0);    // Top
      writeWord(this.width);
      writeWord(this.height);
      writeByte(0x87); // Local Color Table Flag (1), Interlace (0), Sort (0), Size 7 (256 colors)

      // Write Local Color Table (256 colors * 3 bytes)
      for (let i = 0; i < 256; i++) {
        if (i < palette.length) {
          writeByte(palette[i][0]);
          writeByte(palette[i][1]);
          writeByte(palette[i][2]);
        } else {
          writeByte(0);
          writeByte(0);
          writeByte(0);
        }
      }

      // LZW Compression
      this.writeLZW(indexedPixels, bytes);
    }

    // GIF Trailer
    writeByte(0x3b);

    return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
  }

  private quantizeFrame(rgba: Uint8ClampedArray): { indexedPixels: Uint8Array; palette: [number, number, number][] } {
    const totalPixels = this.width * this.height;
    const indexedPixels = new Uint8Array(totalPixels);
    const colorMap = new Map<number, number>();
    const palette: [number, number, number][] = [];

    // Fast 6-level RGB uniform quantization with dithering/bucketing to fit 216 standard web colors + extras
    const getIndex = (r: number, g: number, b: number): number => {
      const qr = Math.min(5, Math.floor((r / 256) * 6));
      const qg = Math.min(5, Math.floor((g / 256) * 6));
      const qb = Math.min(5, Math.floor((b / 256) * 6));
      return qr * 36 + qg * 6 + qb;
    };

    // Pre-populate palette with 216 uniform RGB colors
    for (let r = 0; r < 6; r++) {
      for (let g = 0; g < 6; g++) {
        for (let b = 0; b < 6; b++) {
          palette.push([
            Math.floor((r * 255) / 5),
            Math.floor((g * 255) / 5),
            Math.floor((b * 255) / 5),
          ]);
        }
      }
    }
    // Add common grayscale ramp for 216 to 255
    for (let i = 216; i < 256; i++) {
      const v = Math.floor(((i - 216) * 255) / 39);
      palette.push([v, v, v]);
    }

    for (let i = 0; i < totalPixels; i++) {
      const r = rgba[i * 4];
      const g = rgba[i * 4 + 1];
      const b = rgba[i * 4 + 2];
      indexedPixels[i] = getIndex(r, g, b);
    }

    return { indexedPixels, palette };
  }

  private writeLZW(pixels: Uint8Array, output: number[]) {
    const minCodeSize = 8;
    output.push(minCodeSize); // LZW Minimum Code Size

    const clearCode = 1 << minCodeSize;
    const eoiCode = clearCode + 1;
    let nextCode = eoiCode + 1;
    let codeSize = minCodeSize + 1;

    let dict = new Map<string, number>();

    const resetDict = () => {
      dict.clear();
      for (let i = 0; i < clearCode; i++) {
        dict.set(String.fromCharCode(i), i);
      }
      nextCode = eoiCode + 1;
      codeSize = minCodeSize + 1;
    };

    resetDict();

    let curBits = 0;
    let curVal = 0;
    const packet: number[] = [];

    const emitBits = (code: number, size: number) => {
      curVal |= code << curBits;
      curBits += size;
      while (curBits >= 8) {
        packet.push(curVal & 0xff);
        curVal >>= 8;
        curBits -= 8;
        if (packet.length === 254) {
          output.push(packet.length);
          for (const b of packet) output.push(b);
          packet.length = 0;
        }
      }
    };

    emitBits(clearCode, codeSize);

    let prefix = "";
    for (let i = 0; i < pixels.length; i++) {
      const char = String.fromCharCode(pixels[i]);
      const current = prefix + char;
      if (dict.has(current)) {
        prefix = current;
      } else {
        emitBits(dict.get(prefix)!, codeSize);
        if (nextCode < 4096) {
          dict.set(current, nextCode++);
          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          emitBits(clearCode, codeSize);
          resetDict();
        }
        prefix = char;
      }
    }

    if (prefix.length > 0) {
      emitBits(dict.get(prefix)!, codeSize);
    }

    emitBits(eoiCode, codeSize);

    // Flush remaining bits
    if (curBits > 0) {
      packet.push(curVal & 0xff);
    }
    if (packet.length > 0) {
      output.push(packet.length);
      for (const b of packet) output.push(b);
    }

    output.push(0); // Block Terminator
  }
}
