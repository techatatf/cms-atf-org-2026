import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  MouseEventHandler,
  ReactNode,
} from "react";

import { AppLink } from "@/components/site/AppLink";
import { cn } from "@/lib/utils";

export type OpportunityButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "inverse"
  | "inverseOutline";

export type OpportunityButtonSize = "sm" | "md" | "lg";
export type OpportunityButtonDensity = "default" | "compact";

type OpportunityButtonGeometry = {
  className: string;
  cut: string;
  cutLine: string;
};

const opportunityButtonVariants: Record<OpportunityButtonVariant, string> = {
  primary:
    "bg-primary text-white [--opportunity-button-border-color:var(--primary)] hover:bg-atf-red-dark hover:[--opportunity-button-border-color:var(--atf-red-dark)] active:bg-[#9a0022] active:[--opportunity-button-border-color:#9a0022]",
  secondary:
    "bg-atf-black text-white [--opportunity-button-border-color:var(--atf-black)] hover:bg-atf-ink hover:[--opportunity-button-border-color:var(--atf-ink)] active:bg-atf-gray-800 active:[--opportunity-button-border-color:var(--atf-gray-800)]",
  outline:
    "bg-transparent text-atf-black [--opportunity-button-border-color:currentColor] hover:bg-atf-black hover:text-white active:bg-atf-ink",
  inverse:
    "bg-white text-primary [--opportunity-button-border-color:var(--atf-white)] hover:bg-transparent hover:text-white active:bg-white/10 active:text-white",
  inverseOutline:
    "bg-transparent text-white [--opportunity-button-border-color:currentColor] hover:bg-white hover:text-primary active:bg-white/90",
};

const opportunityButtonGeometries: Record<
  OpportunityButtonDensity,
  Record<OpportunityButtonSize, OpportunityButtonGeometry>
> = {
  default: {
    sm: {
      className: "min-h-8 px-3 text-[11px]",
      cut: "9px",
      cutLine: "13px",
    },
    md: {
      className: "min-h-10 px-5 text-xs",
      cut: "11px",
      cutLine: "16px",
    },
    lg: {
      className: "min-h-12 px-7 text-[13px]",
      cut: "14px",
      cutLine: "20px",
    },
  },
  compact: {
    sm: {
      className: "min-h-[22px] px-2.5 py-1 text-[10px] leading-none",
      cut: "6px",
      cutLine: "9px",
    },
    md: {
      className: "min-h-8 px-4 text-[11px]",
      cut: "9px",
      cutLine: "13px",
    },
    lg: {
      className: "min-h-10 px-5 text-xs",
      cut: "11px",
      cutLine: "16px",
    },
  },
};

const opportunityButtonShape =
  "polygon(0 0, calc(100% - var(--opportunity-button-cut)) 0, 100% var(--opportunity-button-cut), 100% 100%, 0 100%)";

type OpportunityButtonStyle = CSSProperties & {
  "--opportunity-button-cut": string;
  "--opportunity-button-cut-line": string;
  "--opportunity-button-shape": string;
};

function opportunityButtonStyle(
  size: OpportunityButtonSize,
  density: OpportunityButtonDensity,
  style?: CSSProperties,
): OpportunityButtonStyle {
  const geometry = opportunityButtonGeometries[density][size];

  return {
    ...style,
    "--opportunity-button-cut": geometry.cut,
    "--opportunity-button-cut-line": geometry.cutLine,
    "--opportunity-button-shape": opportunityButtonShape,
  };
}

function opportunityButtonClass({
  variant = "primary",
  size = "md",
  density = "default",
  disabled = false,
  className,
}: {
  variant?: OpportunityButtonVariant;
  size?: OpportunityButtonSize;
  density?: OpportunityButtonDensity;
  disabled?: boolean;
  className?: string;
}) {
  const geometry = opportunityButtonGeometries[density][size];

  return cn(
    "atf-opportunity-button inline-flex items-center justify-center gap-2 whitespace-nowrap font-display font-bold uppercase transition-colors",
    opportunityButtonVariants[variant],
    geometry.className,
    disabled && "pointer-events-none cursor-not-allowed opacity-55",
    className,
  );
}

type OpportunityButtonBaseProps = {
  children: ReactNode;
  variant?: OpportunityButtonVariant;
  size?: OpportunityButtonSize;
  density?: OpportunityButtonDensity;
  className?: string;
  disabled?: boolean;
};

type OpportunityButtonLinkProps = OpportunityButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string;
  };

type OpportunityButtonNativeProps = OpportunityButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
    href?: never;
  };

export type OpportunityButtonProps =
  | OpportunityButtonLinkProps
  | OpportunityButtonNativeProps;

export function OpportunityButton({
  children,
  variant = "primary",
  size = "md",
  density = "default",
  className,
  disabled = false,
  style,
  ...props
}: OpportunityButtonProps) {
  const buttonClassName = opportunityButtonClass({
    variant,
    size,
    density,
    disabled,
    className,
  });
  const buttonStyle = opportunityButtonStyle(size, density, style);
  const stableAttributes = {
    "data-slot": "opportunity-button",
    "data-variant": variant,
    "data-size": size,
    "data-density": density,
  } as const;

  if ("href" in props && props.href) {
    const { href, onClick, ...linkProps } = props as OpportunityButtonLinkProps;
    const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
      if (disabled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      onClick?.(event);
    };

    return (
      <AppLink
        href={href}
        className={buttonClassName}
        style={buttonStyle}
        {...linkProps}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : linkProps.tabIndex}
        onClick={handleClick}
        {...stableAttributes}
      >
        {children}
      </AppLink>
    );
  }

  const { type = "button", ...buttonProps } =
    props as OpportunityButtonNativeProps;

  return (
    <button
      type={type}
      className={buttonClassName}
      style={buttonStyle}
      disabled={disabled}
      {...buttonProps}
      {...stableAttributes}
    >
      {children}
    </button>
  );
}
