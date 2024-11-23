<?php
session_start();
session_unset();  // Unset all session variables
session_stop();  // Stop the session
echo json_encode(["message" => "Logged out successfully"]);
?>
