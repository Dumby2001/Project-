<?php
// Database connection parameters
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dialdeal";

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Retrieve and sanitize form data
    $email = isset($_POST['email']) ? trim($_POST['email']) : null;
    $contact = isset($_POST['contact']) ? trim($_POST['contact']) : null;
    $password = isset($_POST['password']) ? trim($_POST['password']) : null;
    $confirm_password = isset($_POST['confirm_password']) ? trim($_POST['confirm_password']) : null;
    $company_name = isset($_POST['company_name']) ? trim($_POST['company_name']) : null;
    $company_location = isset($_POST['company_location']) ? trim($_POST['company_location']) : null;
    $zoom_meeting_id = isset($_POST['zoom_meeting_id']) ? trim($_POST['zoom_meeting_id']) : null;

    // Validate required fields
    if (empty($email) || empty($contact) || empty($password) || empty($confirm_password) || empty($company_name) || empty($company_location) || empty($zoom_meeting_id)) {
        die("All fields are required.");
    }

    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        die("Invalid email format.");
    }

    // Password validation
    $password_regex = '/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/';
    if (!preg_match($password_regex, $password)) {
        die("Password must be at least 8 characters long, include at least one letter, one number, and one special character.");
    }

    // Validate passwords match
    if ($password !== $confirm_password) {
        die("Passwords do not match.");
    }

    // Check if email already exists in register_sellers table
    $check_email_stmt = $conn->prepare("SELECT email FROM register_sellers WHERE email = ?");
    $check_email_stmt->bind_param("s", $email);
    $check_email_stmt->execute();
    $check_email_stmt->store_result();

    if ($check_email_stmt->num_rows > 0) {
        die("This email is already registered. Please use a different email.");
    }
    $check_email_stmt->close();

    // Hash the password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Prepare and bind SQL query for inserting the new seller
    $stmt = $conn->prepare("INSERT INTO register_sellers (email, contact, password, company_name, company_location, zoom_meeting_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssss", $email, $contact, $hashed_password, $company_name, $company_location, $zoom_meeting_id);

    // Execute the query
    if ($stmt->execute()) {
        echo "New seller registered successfully.";
        // Redirect to login page or another appropriate page
        echo "<script>window.location.href = 'loginPage.html';</script>";
    } else {
        echo "Error: " . $stmt->error;
    }

    // Close statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request method.";
}
?>
