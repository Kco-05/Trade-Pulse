"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { register } from "@/lib/api/wallet";
import { mapAuthError } from "@/lib/auth/errors";
import {
  authCredentialsSchema,
  type AuthCredentials,
} from "@/lib/auth/schemas";
import { createSession } from "@/lib/session/client";
import { useSessionStore } from "@/lib/stores/session";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 4) score += 25;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 25;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 25;
  return score;
}

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useSessionStore((s) => s.setSession);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<AuthCredentials>({
    resolver: zodResolver(authCredentialsSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";
  const strength = useMemo(() => passwordStrength(password), [password]);
  const pending = form.formState.isSubmitting;

  async function onSubmit(values: AuthCredentials) {
    setFormError(null);
    try {
      const auth = await register(values.username, values.password);
      await createSession({
        userId: auth.userId,
        username: auth.username,
      });
      setSession({ userId: auth.userId, username: auth.username });
      toast.success(`Welcome to TradePulse, ${auth.username}`);
      const next = searchParams.get("next");
      const destination =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/market";
      router.push(destination);
      router.refresh();
    } catch (error) {
      const message = mapAuthError(error, "Sign up failed");
      setFormError(message);
      toast.error(message);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FieldGroup>
        <Controller
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signup-username">Username</FieldLabel>
              <Input
                {...field}
                id="signup-username"
                autoComplete="username"
                placeholder="Choose a username"
                disabled={pending}
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>3–50 characters.</FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="signup-password">Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="At least 4 characters"
                  disabled={pending}
                  aria-invalid={fieldState.invalid}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={pending}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              <div className="space-y-1.5 pt-1">
                <Progress value={strength} className="h-1.5" />
                <FieldDescription>
                  Strength hint only — backend requires 4+ characters.
                </FieldDescription>
              </div>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      {formError ? (
        <p className="text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Create account
      </Button>
    </form>
  );
}
