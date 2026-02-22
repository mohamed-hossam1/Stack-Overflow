"use client"

import AuthForm from "@/components/forms/AuthForm";
import { SignInSchema } from "@/lib/validations";
import React from "react";

export default function page() {
  return (
    <AuthForm
      formType="SIGN_IN"
      schema={SignInSchema}
      defaultValues={{ email: "", password: "" }}
      // onSubmit={(signInWithCredentials)}
    />
  );
}
