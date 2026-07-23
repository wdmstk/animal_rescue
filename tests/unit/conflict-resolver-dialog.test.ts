import { describe, expect, it, vi } from "vitest";
import React from "react";
import { ConflictResolverDialog, ConflictResolverDialogProps } from "@/components/ui/conflict-resolver-dialog";

describe("ConflictResolverDialog Component Logic", () => {
  const defaultFields = [
    { key: "weight", label: "体重", serverValue: "5.2kg", localValue: "5.5kg" },
    { key: "allergy", label: "アレルギー", serverValue: "チキン", localValue: "なし" }
  ];

  it("returns null when isOpen is false", () => {
    const props: ConflictResolverDialogProps = {
      isOpen: false,
      fields: defaultFields,
      onKeepServer: vi.fn(),
      onUseLocal: vi.fn(),
      onClose: vi.fn()
    };
    const element = ConflictResolverDialog(props);
    expect(element).toBeNull();
  });

  it("returns React element with correct structure when isOpen is true", () => {
    const props: ConflictResolverDialogProps = {
      isOpen: true,
      entityName: "ココちゃんの健康記録",
      fields: defaultFields,
      onKeepServer: vi.fn(),
      onUseLocal: vi.fn(),
      onClose: vi.fn()
    };
    const element = ConflictResolverDialog(props);
    expect(element).not.toBeNull();
    expect(element?.type).toBe("div");
  });
});
