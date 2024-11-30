import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { supabase } from "../utils/supabase";

const Account = () => {
  const [userData, setUserData] = useState(null);
  const [username, setUsername] = useState(""); // New state for username
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [initialValues, setInitialValues] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const fetchUserData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setUserData(data);
          setUsername(data.username || "");
          setFirstName(data.firstname || "");
          setLastName(data.lastname || "");
          setEmail(data.email || "");
          setInitialValues({
            username: data.username || "",
            firstName: data.firstname || "",
            lastName: data.lastname || "",
            email: data.email || "",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to fetch user data. Please try again.");
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const isButtonDisabled =
    username === initialValues.username &&
    firstName === initialValues.firstName &&
    lastName === initialValues.lastName &&
    email === initialValues.email;

  const handleUpdateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update auth email if it changed
        if (email !== initialValues.email) {
          const { error: updateAuthError } = await supabase.auth.updateUser({
            email: email,
          });
          if (updateAuthError) throw updateAuthError;
        }

        // Update profile data
        const { error: updateProfileError } = await supabase
          .from('users')
          .update({
            username,
            firstname: firstName,
            lastname: lastName,
            email,
          })
          .eq('id', user.id);

        if (updateProfileError) throw updateProfileError;

        Alert.alert(
          "Account Updated",
          "Your account has been updated successfully!",
          [{ text: "OK" }]
        );

        await fetchUserData();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm",
      "Warning: This will delete your account! Are you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                // Delete user data from the database
                const { error: deleteDataError } = await supabase
                  .from('users')
                  .delete()
                  .eq('id', user.id);

                if (deleteDataError) throw deleteDataError;

                // Delete the authentication account
                const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
                  user.id
                );

                if (deleteAuthError) throw deleteAuthError;

                await supabase.auth.signOut();
                Alert.alert("Success", "Your account has been deleted successfully.");
              }
            } catch (error) {
              console.error("Error deleting account: ", error);
              Alert.alert(
                "Error",
                "Failed to delete your account. Please try again later."
              );
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.headerText}>Account</Text>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionHeader}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="grey"
          autoCapitalize="none"
        />
        <Text style={styles.sectionHeader}>First Name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor="grey"
        />
        <Text style={styles.sectionHeader}>Last Name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor="grey"
        />
        <Text style={styles.sectionHeader}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="grey"
        />
      </View>

      <TouchableOpacity
        style={[styles.updateButton, isButtonDisabled && styles.disabledButton]}
        disabled={isButtonDisabled}
        onPress={handleUpdateProfile}
      >
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton]}
        onPress={handleDeleteAccount}
      >
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "black",
    paddingHorizontal: 20,
  },
  headerText: {
    fontSize: 30,
    color: "white",
    fontWeight: "bold",
    marginBottom: 15,
  },
  sectionContainer: {
    marginVertical: 15,
  },
  sectionHeader: {
    fontSize: 20,
    color: "grey",
    marginBottom: 15,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "grey",
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    color: "white",
  },
  updateButton: {
    backgroundColor: "lightgrey",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "grey",
    opacity: 0.3,
  },
  buttonText: {
    fontSize: 18,
    color: "black",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "darkred",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 20,
  },
});

export default Account;
