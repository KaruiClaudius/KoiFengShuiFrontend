import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Box,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import api from "../../config/axios";
import AppHeader from "../../components/Header/Header";
import FooterComponent from "../../components/Footer/Footer";
import "./UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    setPasswordsMatch(passwords.new === passwords.confirm);
  }, [passwords.new, passwords.confirm]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");
      const response = await api.get(`api/Account/email/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      setOriginalUser(response.data);
      localStorage.setItem("user", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching user data:", error);
      setSnackbar({
        open: true,
        message: "Error fetching user data",
        severity: "error",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const dataToSend = {
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        dob: user.dob,
        gender: user.gender,
      };
      console.log("Data being sent:", dataToSend);
      const response = await api.put(
        `api/Account/${user.accountId}`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Server response:", response.data);
      setEditing(false);
      setSnackbar({
        open: true,
        message: "Profile updated successfully",
        severity: "success",
      });
      localStorage.setItem("user", JSON.stringify(user));
      setOriginalUser(user);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message: `Error updating profile: ${
          error.response?.data?.message || error.message
        }`,
        severity: "error",
      });
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwords.new !== passwords.confirm) {
      setSnackbar({
        open: true,
        message: "New passwords do not match",
        severity: "error",
      });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const dataToSend = {
        currentPassword: passwords.current,
        newPassword: passwords.new,
      };
      console.log("Data being sent:", dataToSend);
      const response = await api.put(
        `api/Account/${user.accountId}/change-password`,
        dataToSend,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Server response:", response.data);
      setPasswordDialog(false);
      setPasswords({ current: "", new: "", confirm: "" });
      setSnackbar({
        open: true,
        message: "Password changed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error(
        "Error changing password:",
        error.response?.data || error.message
      );
      setSnackbar({
        open: true,
        message: `Error changing password: ${
          error.response?.data?.message || error.message
        }`,
        severity: "error",
      });
    }
  };

  const handleCancelEdit = () => {
    setUser(originalUser);
    setEditing(false);
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader />
      <Container maxWidth="md" sx={{ flexGrow: 1, py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <Avatar
                src={`https://api.dicebear.com/8.x/pixel-art/svg?seed=${encodeURIComponent(
                  user.fullName
                )}`}
                alt={user.fullName}
                sx={{ width: 150, height: 150, mx: "auto" }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <Typography variant="h4" gutterBottom>
                {user.fullName}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Full Name"
                  name="fullName"
                  value={user.fullName}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Email"
                  name="email"
                  value={user.email}
                  disabled
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Phone"
                  name="phone"
                  value={user.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                />
                <TextField
                  fullWidth
                  margin="normal"
                  label="Date of Birth"
                  name="dob"
                  type="date"
                  value={user.dob ? user.dob.split("T")[0] : ""}
                  onChange={handleInputChange}
                  disabled={!editing}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    name="gender"
                    value={user.gender}
                    onChange={handleInputChange}
                    disabled={!editing}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {editing ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        startIcon={<SaveIcon />}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancelEdit}
                        startIcon={<CancelIcon />}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setOriginalUser({ ...user });
                        setEditing(true);
                      }}
                      startIcon={<EditIcon />}
                    >
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setPasswordDialog(true)}
                    startIcon={<LockIcon />}
                  >
                    Change Password
                  </Button>
                </Box>
              </form>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <FooterComponent />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {["current", "new", "confirm"].map((field) => (
            <TextField
              key={field}
              margin="dense"
              name={field}
              label={`${
                field.charAt(0).toUpperCase() + field.slice(1)
              } Password`}
              type={showPasswords[field] ? "text" : "password"}
              fullWidth
              variant="standard"
              value={passwords[field]}
              onChange={handlePasswordChange}
              error={field === "confirm" && !passwordsMatch}
              helperText={
                field === "confirm" && !passwordsMatch
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility(field)}
                    edge="end"
                  >
                    {showPasswords[field] ? (
                      <VisibilityOffIcon />
                    ) : (
                      <VisibilityIcon />
                    )}
                  </IconButton>
                ),
              }}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button onClick={handlePasswordSubmit} disabled={!passwordsMatch}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProfile;
