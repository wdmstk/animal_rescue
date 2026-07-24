import { describe, expect, it } from "vitest";
import React from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

describe("Logo Component", () => {
  it("renders image with default props", () => {
    const element = Logo({});
    expect(element).not.toBeNull();
    expect(element.type).not.toBe(Link);
  });

  it("calculates height based on width aspect ratio (3.6212)", () => {
    const element = Logo({ width: 140 });
    const imgProps = element.props;
    expect(imgProps.src).toBe("/anilink-logo.png");
    expect(imgProps.alt).toBe("AniLink");
    expect(imgProps.width).toBe(140);
    expect(imgProps.height).toBe(39); // 140 / 3.6212 ≈ 38.66 -> 39
  });

  it("renders wrapped in a Link when href is provided", () => {
    const element = Logo({ href: "/lp", width: 160 });
    expect(element.type).toBe(Link);
    expect(element.props.href).toBe("/lp");
    
    const childImage = element.props.children;
    expect(childImage.props.src).toBe("/anilink-logo.png");
    expect(childImage.props.width).toBe(160);
  });
});
