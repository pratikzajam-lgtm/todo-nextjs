"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { SignupApi } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
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

const Signup = () => {
  const router = useRouter();
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutate } = useMutation({
    mutationFn: SignupApi,

    onSuccess: (data) => {
      console.log("Response:", data);
      toast.success("Signup successful!");
      setTimeout(() => {
        router.push("/auth/login");
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

    if (password != confirmPassword) {
      toast.error("Password and confirm password do not match");
      return;
    }

    mutate({ name, email, password, confirmPassword });
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
          <Typography variant="h5" component="h2" fontWeight="bold" align="center">
            Signup
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => setname(e.target.value)}
              variant="outlined"
            />
            <TextField
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setemail(e.target.value)}
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
              onChange={(e) => setpassword(e.target.value)}
              variant="outlined"
            />
            <TextField
              required
              fullWidth
              id="confirmPassword"
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Sign Up
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Signup;
