"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { login } from "@/lib/api/wallet";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function LoginForm() {
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

  const pending = form.formState.isSubmitting;

  async function onSubmit(values: AuthCredentials) {
    setFormError(null);
    try {
      const auth = await login(values.username, values.password);
      await createSession({
        userId: auth.userId,
        username: auth.username,
      });
      setSession({ userId: auth.userId, username: auth.username });
      toast.success(`Welcome back, ${auth.username}`);
      const next = searchParams.get("next");
      const destination =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/portfolio";
      router.push(destination);
      router.refresh();
    } catch (error) {
      const message = mapAuthError(error, "Login failed");
      setFormError(message);
      toast.error(message);
    }
  }

  function fillDemo() {
    form.setValue("username", "demo", { shouldValidate: true });
    form.setValue("password", "demo123", { shouldValidate: true });
    setFormError(null);
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
              <FieldLabel htmlFor="login-username">Username</FieldLabel>
              <Input
                {...field}
                id="login-username"
                autoComplete="username"
                placeholder="demo"
                disabled={pending}
                aria-invalid={fieldState.invalid}
              />
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
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
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
        Log in
      </Button>

      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={fillDemo}
        disabled={pending}
      >
        Use demo account
      </Button>
    </form>
  );
}
