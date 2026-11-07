import { describe, expect, it } from "vitest";

import {
  buildMailtoHref,
  initialMailtoValues,
  validateMailtoForm,
  type MailtoFormLayout,
} from "@/lib/mailto-form";

const layout: MailtoFormLayout = [
  [
    { kind: "text", id: "name", name: "Name", label: "Name", required: true },
    { kind: "email", id: "email", name: "Email", label: "Email", required: true },
  ],
  {
    kind: "select",
    id: "country",
    name: "Country",
    label: "Country",
    options: [
      { value: "Ghana", label: "Ghana" },
      { value: "Kenya", label: "Kenya" },
    ],
  },
  {
    kind: "checkboxes",
    id: "interest",
    name: "Interest",
    label: "We'd like to",
    required: true,
    options: [
      { value: "Mentor", label: "Mentor" },
      { value: "Judge", label: "Judge" },
    ],
  },
  { kind: "consent", id: "consent", name: "Consent", label: "OK", value: "Yes", required: true },
];

describe("mailto form", () => {
  it("starts with empty answers and the first select option", () => {
    expect(initialMailtoValues(layout)).toEqual({
      name: "",
      email: "",
      country: "Ghana",
      interest: [],
      consent: false,
    });
  });

  it("flags every missing required answer", () => {
    expect(validateMailtoForm(layout, initialMailtoValues(layout))).toEqual({
      name: "Please fill this in.",
      email: "Please fill this in.",
      interest: "Choose at least one.",
      consent: "Please tick this box to continue.",
    });
  });

  it("rejects a malformed email", () => {
    const values = {
      ...initialMailtoValues(layout),
      name: "Ama",
      email: "ama@",
      interest: ["Mentor"],
      consent: true,
    };
    expect(validateMailtoForm(layout, values)).toEqual({
      email: "That email doesn’t look right — check for typos.",
    });
  });

  it("builds a mailto link with one line per answered field", () => {
    const href = buildMailtoHref("info@example.org", "Volunteer sign-up", layout, {
      name: " Ama ",
      email: "ama@example.org",
      country: "Kenya",
      interest: ["Mentor", "Judge"],
      consent: true,
    });

    expect(href.startsWith("mailto:info@example.org?subject=Volunteer%20sign-up&body=")).toBe(true);
    expect(decodeURIComponent(href.split("&body=")[1])).toBe(
      "Name: Ama\n\nEmail: ama@example.org\n\nCountry: Kenya\n\nInterest: Mentor, Judge\n\nConsent: Yes",
    );
  });
});
