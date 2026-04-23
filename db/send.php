<?php
include 'db.php';

if($_SERVER["REQUEST_METHOD"] == "POST") {
    $message = $_POST["message"];
    $rating = $_POST["rating"];

    $stmt = $conn->prepare("INSERT INTO messages (message, rating) VALUES (?, ?)");
    $stmt->bind_param("si", $message, $rating);

    if($stmt->execute()) {
        header("Location: /greetings.html");
        exit();
    } else {
        echo "Error: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();
}
?>