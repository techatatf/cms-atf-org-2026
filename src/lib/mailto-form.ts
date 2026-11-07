// Logic for forms that open the visitor's email app with their answers
// filled in. There is no backend submission.

type FieldBase = {
  /** Label used in the email body, e.g. "Name". */
  name: string;
  id: string;
  label: string;
  required?: boolean;
};

export type MailtoField =
  | (FieldBase & {
      kind: "text" | "email" | "url";
      placeholder?: string;
      autoComplete?: string;
      optional?: boolean;
    })
  | (FieldBase & { kind: "textarea"; placeholder?: string })
  | (FieldBase & {
      kind: "select";
      options: { value: string; label: string }[];
    })
  | (FieldBase & {
      kind: "checkboxes";
      options: { value: string; label: string }[];
    })
  | (FieldBase & { kind: "consent"; value: string });

/** Fields render one per row, or side by side when grouped in an array. */
export type MailtoFormLayout = (MailtoField | MailtoField[])[];

export type MailtoValues = Record<string, string | string[] | boolean>;

const emailShape = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function flattenLayout(layout: MailtoFormLayout): MailtoField[] {
  return layout.flatMap((row) => (Array.isArray(row) ? row : [row]));
}

export function initialMailtoValues(layout: MailtoFormLayout): MailtoValues {
  const values: MailtoValues = {};
  for (const field of flattenLayout(layout)) {
    if (field.kind === "checkboxes") values[field.id] = [];
    else if (field.kind === "consent") values[field.id] = false;
    else if (field.kind === "select") values[field.id] = field.options[0]?.value ?? "";
    else values[field.id] = "";
  }
  return values;
}

/** Returns a map of field id to error message. Empty when the form is valid. */
export function validateMailtoForm(
  layout: MailtoFormLayout,
  values: MailtoValues,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of flattenLayout(layout)) {
    const value = values[field.id];

    if (field.kind === "checkboxes") {
      if (field.required && (!Array.isArray(value) || value.length === 0)) {
        errors[field.id] = "Choose at least one.";
      }
      continue;
    }

    if (field.kind === "consent") {
      if (field.required && value !== true) {
        errors[field.id] = "Please tick this box to continue.";
      }
      continue;
    }

    const text = typeof value === "string" ? value.trim() : "";
    if (field.required && !text) {
      errors[field.id] = "Please fill this in.";
    } else if (field.kind === "email" && text && !emailShape.test(text)) {
      errors[field.id] = "That email doesn’t look right — check for typos.";
    }
  }

  return errors;
}

export function buildMailtoHref(
  to: string,
  subject: string,
  layout: MailtoFormLayout,
  values: MailtoValues,
) {
  const lines: string[] = [];

  for (const field of flattenLayout(layout)) {
    const value = values[field.id];
    let text = "";
    if (field.kind === "checkboxes") text = Array.isArray(value) ? value.join(", ") : "";
    else if (field.kind === "consent") text = value === true ? field.value : "";
    else text = typeof value === "string" ? value.trim() : "";
    if (text) lines.push(`${field.name}: ${text}`);
  }

  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n\n"))}`;
}
