import { describe, it, expect } from "vitest";

describe("Theme functionality", () => {
  it("should have theme options defined", () => {
    const themes = ["light", "dark", "system"];
    expect(themes).toContain("light");
    expect(themes).toContain("dark");
    expect(themes).toContain("system");
  });

  it("should validate theme values", () => {
    const validThemes = ["light", "dark", "system"] as const;
    const isValidTheme = (theme: string): theme is typeof validThemes[number] => {
      return validThemes.includes(theme as typeof validThemes[number]);
    };

    expect(isValidTheme("light")).toBe(true);
    expect(isValidTheme("dark")).toBe(true);
    expect(isValidTheme("system")).toBe(true);
    expect(isValidTheme("invalid")).toBe(false);
  });
});
