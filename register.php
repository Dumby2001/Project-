<?php
// Start session
session_start();

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dialdeal";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve and validate form data
$user = isset($_POST['username']) ? trim($_POST['username']) : null;
$address = isset($_POST['address']) ? trim($_POST['address']) : null;
$email = isset($_POST['email']) ? trim($_POST['email']) : null;
$pass = isset($_POST['password']) ? trim($_POST['password']) : null;
$confirm_pass = isset($_POST['confirm_password']) ? trim($_POST['confirm_password']) : null;

// Password validation pattern
$pattern = '/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/';

// Check for empty fields, password confirmation, and password pattern
if ($user && $address && $email && $pass && $confirm_pass) {
    if ($pass !== $confirm_pass) {
        echo "Passwords do not match.";
    } elseif (!preg_match($pattern, $pass)) {
        echo "Password must be at least 8 characters long, contain at least 1 alphabet, 1 number, and 1 special character.";
    } else {
        // Store password as entered (not hashed)
        $sql = "INSERT INTO register_details (username, address, email, password) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $user, $address, $email, $pass);

        if ($stmt->execute()) {
            // Successful registration, now log in the user
            $_SESSION['username'] = $user;
            $_SESSION['email'] = $email;
            echo "Registration successful!";
            echo "<script>window.location.href = 'index.html';</script>";
        } else {
            echo "Error: " . $stmt->error;
        }
        $stmt->close();
    }
} else {
    echo "All fields are required.";
}

$conn->close();
?>
