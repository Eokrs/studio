
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// Minimal FormProvider replacement
const FormContext = React.createContext<object | undefined>(undefined);
const FormProvider = ({ children }: { children: React.ReactNode }) => {
  // In a real scenario with react-hook-form, this would pass down form methods.
  // For a stub, we just provide an empty context.
  return <FormContext.Provider value={{}}>{children}</FormContext.Provider>;
};
const Form = FormProvider; // Alias for convenience if Form was used directly

// Minimal FormFieldContext replacement
type FormFieldContextValue = {
  name: string; // Minimal requirement, actual RHF context is richer
};
const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

// Minimal FormItemContext replacement
type FormItemContextValue = {
  id: string;
};
const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

// Minimal FormField replacement (Controller replacement)
const FormField = <
  TName extends string = string
>({
  name,
  render,
}: {
  name: TName;
  render: (field: {
    value: any;
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    name: TName;
    ref: React.Ref<any>;
  }) => React.ReactElement;
}) => {
  // This is a highly simplified stub.
  // It doesn't manage state like react-hook-form's Controller.
  // It provides a basic structure to avoid breaking components that expect FormField.
  const [value, setValue] = React.useState<any>(undefined);
  const handleChange = (eventOrValue: any) => {
    if (eventOrValue && eventOrValue.target) {
      setValue(eventOrValue.target.value);
    } else {
      setValue(eventOrValue);
    }
  };
  const handleBlur = () => {}; // No-op
  const MOCK_FIELD_API = {
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    name,
    ref: React.createRef<any>(), // Mock ref
  };

  return (
    <FormFieldContext.Provider value={{ name }}>
      {render(MOCK_FIELD_API)}
    </FormFieldContext.Provider>
  );
};

// Minimal useFormField replacement
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  // Provide default/mock values to prevent runtime errors if components still try to use these.
  const id = itemContext?.id || "default-form-id";
  const name = fieldContext?.name || "default-form-name";

  return {
    id,
    name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: undefined, // No error state without RHF
    invalid: false,
    isDirty: false,
    isTouched: false,
    disabled: false,
    // Add other properties if your components deconstruct them, e.g. fieldState
  };
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String((error as any)?.message ?? "") : children; // Type assertion for error

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  useFormField,
  Form, // Exporting the aliased FormProvider
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
