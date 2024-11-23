<?php
// updateUserDetails.php

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

// Get the updated details from the POST request
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$companyName = $input['companyName'] ?? '';
$companyLocation = $input['companyLocation'] ?? '';
$zoomMeetingId = $input['zoomMeetingId'] ?? '';
$role = $input['role'] ?? '';

if (!$email || !$companyName || !$companyLocation || !$zoomMeetingId || !$role) {
    echo json_encode(["success" => false, "message" => "All fields are required."]);
    exit;
}

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$userId = $_SESSION['user_id'];
$table = ($role === 'seller') ? 'register_sellers' : 'register_details';

// Update user details
$sql = "UPDATE $table SET email = ?, company_name = ?, company_location = ?, zoom_meeting_id = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param('ssssi', $email, $companyName, $companyLocation, $zoomMeetingId, $userId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Details updated successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to update details."]);
}

$stmt->close();
$conn->close();
