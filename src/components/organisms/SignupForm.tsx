import React from "react";
import styled from "styled-components";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface SignupFormProps {
  onSubmit?: (data: { name: string; email: string; password: string }) => void;
}

export const SignupForm = ({ onSubmit }: SignupFormProps) => (
  <Form
    onSubmit={(event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      onSubmit?.({
        name: String(formData.get("name")),
        email: String(formData.get("email")),
        password: String(formData.get("password")),
      });
    }}
  >
    <Input name="name" placeholder="Nom complet" required />
    <Input name="email" placeholder="Email" type="email" required />
    <Input name="password" placeholder="Mot de passe" type="password" required />
    <Button $fullWidth type="submit">
      S'inscrire
    </Button>
  </Form>
);
