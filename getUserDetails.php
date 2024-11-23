<?php
// getUserDetails.php

header('Content-Type: application/json');

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "dialdeal";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

// Get the role from the POST request
$input = json_decode(file_get_contents('php://input'), true);
$role = $input['role'] ?? '';

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['user_id'];
$table = ($role === 'seller') ? 'register_sellers' : 'register_details';

// Fetch user details
$sql = "SELECT email, company_name, company_location, zoom_meeting_id FROM $table WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $details = $result->fetch_assoc();
    echo json_encode(["success" => true, "details" => $details]);
} else {
    echo json_encode(["success" => false, "message" => "No details found."]);
}

$stmt->close();
$conn->close();
