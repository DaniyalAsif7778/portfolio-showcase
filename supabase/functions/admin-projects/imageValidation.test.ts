import { describe, expect, it } from "vitest";
import { matchesImageSignature } from "./imageValidation";

const bytes = (...values: number[]) => new Uint8Array(values);
const validImages: Array<[string, Uint8Array]> = [
  ["image/png", bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)],
  ["image/jpeg", bytes(0xff, 0xd8, 0xff, 0x00)],
  ["image/gif", bytes(0x47, 0x49, 0x46, 0x38, 0x39, 0x61)],
  ["image/webp", bytes(0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50)],
  ["image/avif", bytes(0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66)],
];

describe("matchesImageSignature", () => {
  it.each(validImages)("accepts a %s signature", (mime, imageBytes) => {
    expect(matchesImageSignature(imageBytes, mime)).toBe(true);
  });

  it("rejects a declared image type that does not match the bytes", () => {
    expect(matchesImageSignature(bytes(0x3c, 0x68, 0x74, 0x6d, 0x6c), "image/png")).toBe(false);
    expect(matchesImageSignature(bytes(0x89, 0x50, 0x4e, 0x47), "image/png")).toBe(false);
    expect(matchesImageSignature(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a), "image/svg+xml")).toBe(false);
  });
});
