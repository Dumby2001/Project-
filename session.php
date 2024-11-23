<?php
session_start();
header('Content-Type: application/json');

$response = [
    'loggedIn' => isset($_SESSION['username']),
    'username' => $_SESSION['username'] ?? null
];

echo json_encode($response);
?>
