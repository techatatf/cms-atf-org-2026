import { useId, useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import { OpportunityButton } from "@/components/site/OpportunityButton";
import {
  buildMailtoHref,
  initialMailtoValues,
  validateMailtoForm,
  type MailtoField,
  type MailtoFormLayout,
  type MailtoValues,
} from "@/lib/mailto-form";
import { cn } from "@/lib/utils";

const controlClass =
  "w-full border border-atf-gray-200 bg-white px-3 py-2.5 text-sm text-atf-ink placeholder:text-atf-gray-500/70 focus:border-primary focus:outline-none aria-[invalid=true]:border-primary";
const labelClass = "mb-2 block font-display text-[11px] font-bold uppercase tracking-[0.08em] text-atf-ink";

/**
 * A form that validates locally, then opens the visitor's email app with
 * their answers filled in.
 */
export function MailtoForm({
  to,
  subject,
  layout,
  submitLabel,
  openMailto = (href) => {
    window.location.href = href;
  },
}: {
  to: string;
  subject: string;
  layout: MailtoFormLayout;
  submitLabel: string;
  openMailto?: (href: string) => void;
}) {
  const [values, setValues] = useState<MailtoValues>(() => initialMailtoValues(layout));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const formId = useId();

  function setValue(id: string, value: MailtoValues[string]) {
    setValues((current) => ({ ...current, [id]: value }));
    setErrors((current) => {
      if (!(id in current)) return current;
      const { [id]: _removed, ...rest } = current;
      return rest;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateMailtoForm(layout, values);
    setErrors(nextErrors);
    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      event.currentTarget
        .querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`)
        ?.focus();
      return;
    }
    openMailto(buildMailtoHref(to, subject, layout, values));
    setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="border border-atf-gray-200 bg-white p-8 text-atf-ink">
        <h3 className="font-display text-2xl font-black uppercase">Ready to send.</h3>
        <p className="atf-body mt-3">
          Your email app should have opened with your details filled in — press send
          there. If nothing opened, write to{" "}
          <a className="text-primary underline" href={`mailto:${to}`}>
            {to}
          </a>
          .
        </p>
        <OpportunityButton variant="outline" className="mt-6" onClick={() => setSent(false)}>
          Edit my answers
        </OpportunityButton>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5 bg-white p-6 text-atf-ink md:p-8">
      {layout.map((row, index) =>
        Array.isArray(row) ? (
          <div key={index} className="grid gap-5 sm:grid-cols-2">
            {row.map((field) => (
              <Field key={field.id} formId={formId} field={field} value={values[field.id]} error={errors[field.id]} onChange={setValue} />
            ))}
          </div>
        ) : (
          <Field key={row.id} formId={formId} field={row} value={values[row.id]} error={errors[row.id]} onChange={setValue} />
        ),
      )}
      <OpportunityButton type="submit" size="lg" className="w-full">
        {submitLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </OpportunityButton>
      <p className="text-xs text-atf-gray-500">Sends to {to} from your email app.</p>
    </form>
  );
}

function Field({
  formId,
  field,
  value,
  error,
  onChange,
}: {
  formId: string;
  field: MailtoField;
  value: MailtoValues[string];
  error?: string;
  onChange: (id: string, value: MailtoValues[string]) => void;
}) {
  const id = `${formId}-${field.id}`;
  const errorId = `${id}-error`;
  const invalidProps = {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    "data-field": field.id,
  } as const;
  const errorText = error ? (
    <span id={errorId} className="mt-1.5 block text-xs font-semibold text-primary">
      {error}
    </span>
  ) : null;

  if (field.kind === "checkboxes") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <fieldset aria-describedby={error ? errorId : undefined}>
        <legend className={labelClass}>{field.label}</legend>
        <div className="flex flex-wrap gap-2">
          {field.options.map((option, index) => {
            const checked = selected.includes(option.value);
            return (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer border px-3 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary",
                  checked
                    ? "border-atf-black bg-atf-black text-white"
                    : "border-atf-gray-200 text-atf-gray-500 hover:border-atf-black hover:text-atf-black",
                )}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  name={field.name}
                  value={option.value}
                  checked={checked}
                  data-field={index === 0 ? field.id : undefined}
                  onChange={() =>
                    onChange(
                      field.id,
                      checked ? selected.filter((item) => item !== option.value) : [...selected, option.value],
                    )
                  }
                />
                {option.label}
              </label>
            );
          })}
        </div>
        {errorText}
      </fieldset>
    );
  }

  if (field.kind === "consent") {
    return (
      <div>
        <label className="flex items-start gap-3 text-sm text-atf-gray-500">
          <input
            type="checkbox"
            className="mt-0.5 size-4 accent-primary"
            name={field.name}
            checked={value === true}
            onChange={(event) => onChange(field.id, event.target.checked)}
            {...invalidProps}
          />
          <span>{field.label}</span>
        </label>
        {errorText}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {field.label}
        {field.kind !== "select" && field.kind !== "textarea" && field.optional ? (
          <span className="ml-2 font-sans text-[11px] font-normal normal-case tracking-normal text-atf-gray-500">
            Optional
          </span>
        ) : null}
      </label>
      {field.kind === "select" ? (
        <select
          id={id}
          name={field.name}
          className={controlClass}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.id, event.target.value)}
          {...invalidProps}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : field.kind === "textarea" ? (
        <textarea
          id={id}
          name={field.name}
          rows={4}
          className={controlClass}
          placeholder={field.placeholder}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.id, event.target.value)}
          {...invalidProps}
        />
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.kind}
          className={controlClass}
          placeholder={field.placeholder}
          autoComplete={field.autoComplete}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.id, event.target.value)}
          {...invalidProps}
        />
      )}
      {errorText}
    </div>
  );
}
