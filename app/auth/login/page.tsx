"use client";
import React, { useState } from "react";
import { SignInAPi, saveSession } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getApiErrorMessage } from "@/app/lib/api";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
} from "@mui/material";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate } = useMutation({
    mutationFn: SignInAPi,
    onSuccess: (data) => {
      console.log("Response:", data);
      saveSession(data.data);
      toast.success("Login successful!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    },

    onError: (error) => {
      const message = getApiErrorMessage(error);
      toast.error(message);
      console.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate({ email, password });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        bgcolor: "grey.100",
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            borderRadius: 2,
          }}
        >
          <Typography variant="h5" component="h1" fontWeight="bold" align="center">
            Login
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            <TextField
              required
              fullWidth
              id="password"
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 1, fontWeight: "bold" }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
