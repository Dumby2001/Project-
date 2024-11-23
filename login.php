<?php
// Start session
session_start();

// Database configuration
$servername = "localhost";
$email = "root";
$password = "";
$dbname = "dialdeal";

// Create connection
$conn = new mysqli($servername, $email, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve login credentials
$username = isset($_POST['email']) ? trim($_POST['email']) : null;
$password = isset($_POST['password']) ? trim($_POST['password']) : null;

if ($email && $password) {
    // Check if user exists
    $sql = "SELECT * FROM register_details WHERE email = ? AND password = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ss", $email, $password);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Valid login, set session variables
        $_SESSION['email'] = $email;
        $_SESSION['password'] = $password;
        echo "<script>window.location.href = 'index.html';</script>";
    } else {
        echo "Invalid email or password.";
    }
    $stmt->close();
} else {
    echo "email and password are required.";
}

$conn->close();
?>
