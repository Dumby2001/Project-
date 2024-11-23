<?php
session_start();
if (isset($_SESSION['user'])) {
    echo json_encode([
        'loggedIn' => true,
        'role' => $_SESSION['user']['role'],
        'email' => $_SESSION['user']['email'],
        'company_name' => $_SESSION['user']['company_name'],
        'company_location' => $_SESSION['user']['company_location'],
        'zoom_meeting_id' => $_SESSION['user']['zoom_meeting_id']
    ]);
} else {
    echo json_encode(['loggedIn' => false]);
}
?>
